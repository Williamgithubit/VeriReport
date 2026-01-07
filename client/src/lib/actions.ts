'use server';

import { z } from 'zod';
import { generateVerificationId } from '@/ai/flows/generate-verification-id';
import { revalidatePath } from 'next/cache';
import { getFirestore, FieldValue } from 'firebase-admin/firestore';
import { initializeFirebaseAdmin } from '@/lib/firebase/firebase-admin';
import crypto from 'crypto';


export async function verifyReportId(id: string): Promise<{ status: 'valid' | 'invalid' | 'pending'; data: any }> {
  const adminApp = initializeFirebaseAdmin();
  const db = getFirestore(adminApp);

  const snap = await db
    .collection('reports')
    .where('verificationId', '==', id)
    .limit(1)
    .get();

  if (snap.empty) {
    return { status: 'invalid', data: null };
  }

  const report = snap.docs[0].data();
  const rawStatus = String(report.verificationStatus ?? report.status ?? 'Pending');
  const normalizedStatus = rawStatus.toLowerCase();

  const status: 'valid' | 'invalid' | 'pending' =
    normalizedStatus === 'valid'
      ? 'valid'
      : normalizedStatus === 'invalid'
        ? 'invalid'
        : 'pending';

  if (status !== 'valid') {
    return { status, data: null };
  }

  return {
    status,
    data: {
      studentName: report.studentName ?? undefined,
      class: report.class ?? undefined,
      status: report.status ?? undefined,
      year: report.year ?? undefined,
    },
  };
}

const ReportSchema = z.object({
  studentId: z.string().min(1, "Student ID is required."),
  studentName: z.string().min(1, "Student name is required."),
  class: z.string().min(1, "Class is required."),
  status: z.enum([
    'Passed',
    'Failed',
    'Passed Under Condition',
    'Summer School',
  ], { required_error: 'Status is required.' }),
  year: z.coerce.number().min(2000, "Invalid year."),
  reportFile: z.any(),
});


export async function handleReportUpload(prevState: any, formData: FormData) {
  const validatedFields = ReportSchema.safeParse({
    studentId: formData.get('studentId'),
    studentName: formData.get('studentName'),
    class: formData.get('class'),
    status: formData.get('status'),
    year: formData.get('year'),
    reportFile: formData.get('reportFile'),
  });

  if (!validatedFields.success) {
    return {
      message: 'Invalid form data.',
      errors: validatedFields.error.flatten().fieldErrors,
    };
  }

  const { studentId, studentName, class: studentClass, status, year, reportFile } = validatedFields.data;

  try {
    // 1. Generate unique verification ID using GenAI flow
    const metadata = JSON.stringify({ ...validatedFields.data, timestamp: new Date().toISOString() });
    const { verificationId } = await generateVerificationId({ reportCardMetadata: metadata });

    const adminApp = initializeFirebaseAdmin();
    const db = getFirestore(adminApp);

    const cloudName = process.env.CLOUDINARY_CLOUD_NAME;
    const cloudApiKey = process.env.CLOUDINARY_API_KEY;
    const cloudApiSecret = process.env.CLOUDINARY_API_SECRET;

    if (!cloudName || !cloudApiKey || !cloudApiSecret) {
      return {
        message: 'Missing Cloudinary configuration.',
        success: false,
      };
    }

    const file = reportFile as unknown as File | null;
    if (!file || typeof (file as any).arrayBuffer !== 'function') {
      return {
        message: 'Report file is required.',
        success: false,
      };
    }

    const fileSize = typeof (file as any).size === 'number' ? (file as any).size : 0;
    const maxSizeBytes = 10 * 1024 * 1024;
    if (fileSize > maxSizeBytes) {
      return {
        message: 'File is too large. Maximum size is 10MB.',
        success: false,
      };
    }

    const mimeType = String((file as any).type || '').toLowerCase();
    const isPdf = mimeType === 'application/pdf';
    const isImage = mimeType.startsWith('image/');
    if (!isPdf && !isImage) {
      return {
        message: 'Invalid file type. Please upload a PDF or an image.',
        success: false,
      };
    }

    const safeName = (file.name || 'report').replace(/[^a-zA-Z0-9._-]/g, '_');
    const timestamp = Math.floor(Date.now() / 1000);
    const folder = `verireport/reports/${verificationId}`;

    const paramsToSign = {
      folder,
      timestamp,
    };

    const signatureBase = Object.entries(paramsToSign)
      .sort(([a], [b]) => a.localeCompare(b))
      .map(([k, v]) => `${k}=${v}`)
      .join('&');

    const signature = crypto
      .createHash('sha1')
      .update(signatureBase + cloudApiSecret)
      .digest('hex');

    const fileArrayBuffer = await file.arrayBuffer();
    const blob = new Blob([fileArrayBuffer], { type: file.type || 'application/octet-stream' });
    const uploadForm = new FormData();
    uploadForm.append('file', blob, safeName);
    uploadForm.append('api_key', cloudApiKey);
    uploadForm.append('timestamp', String(timestamp));
    uploadForm.append('folder', folder);
    uploadForm.append('signature', signature);

    const uploadRes = await fetch(`https://api.cloudinary.com/v1_1/${cloudName}/auto/upload`, {
      method: 'POST',
      body: uploadForm,
    });

    if (!uploadRes.ok) {
      const errText = await uploadRes.text().catch(() => '');
      console.error('Cloudinary upload failed:', errText);
      return {
        message: 'File upload failed. Please try again.',
        success: false,
      };
    }

    const uploadJson: any = await uploadRes.json();
    const fileUrl = uploadJson.secure_url as string | undefined;
    const cloudinaryPublicId = uploadJson.public_id as string | undefined;
    const cloudinaryResourceType = uploadJson.resource_type as string | undefined;

    if (!fileUrl || !cloudinaryPublicId) {
      return {
        message: 'File upload failed. Please try again.',
        success: false,
      };
    }

    // Map status to verification status
    let verificationStatus: 'Valid' | 'Pending' | 'Invalid';
    if (status === 'Passed' || status === 'Passed Under Condition') {
      verificationStatus = 'Valid';
    } else if (status === 'Failed' || status === 'Summer School') {
      verificationStatus = 'Invalid';
    } else {
      verificationStatus = 'Pending';
    }

    const docRef = await db.collection('reports').add({
      studentId,
      studentName,
      class: studentClass,
      year,
      status,
      verificationStatus,
      verificationId,
      fileUrl,
      cloudinaryPublicId,
      cloudinaryResourceType: cloudinaryResourceType ?? 'auto',
      uploadedFileUrl: fileUrl,
      createdAt: FieldValue.serverTimestamp(),
      updatedAt: FieldValue.serverTimestamp(),
    });

    // In a real app, you would revalidate the path of the reports list
    revalidatePath('/dashboard');
    
    return {
      message: 'Report uploaded successfully!',
      verificationId,
      reportId: docRef.id,
      fileUrl,
      success: true,
    };
  } catch (error) {
    console.error('Upload failed:', error);
    return {
      message: 'Upload failed. Please try again.',
      success: false,
    };
  }
}
