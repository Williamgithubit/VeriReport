'use server';

import { z } from 'zod';
import { generateVerificationId } from '@/ai/flows/generate-verification-id';
import { revalidatePath } from 'next/cache';

// Mock database simulation
const mockDatabase: { [key: string]: any } = {
    'a1b2c3d4-e5f6-7890-1234-567890abcdef': {
        status: 'valid',
        data: {
            studentName: 'Alice Johnson',
            class: '10th Grade',
            term: 'Fall',
            year: 2023,
        }
    },
    'b2c3d4e5-f6a7-8901-2345-67890abcdef1': {
        status: 'pending',
        data: null
    },
     'd4e5f6a7-b8c9-0123-4567-890abcdef123': {
        status: 'invalid',
        data: null
    }
};


export async function verifyReportId(id: string): Promise<{ status: 'valid' | 'invalid' | 'pending'; data: any }> {
  // Simulate network delay
  await new Promise(resolve => setTimeout(resolve, 1000));

  const record = mockDatabase[id];
  if (record) {
    return { status: record.status, data: record.data };
  }
  
  // To make it more realistic, sometimes return pending for unknown IDs
  if (Math.random() > 0.9) {
      return { status: 'pending', data: null };
  }

  return { status: 'invalid', data: null };
}

const ReportSchema = z.object({
  studentId: z.string().min(1, "Student ID is required."),
  studentName: z.string().min(1, "Student name is required."),
  class: z.string().min(1, "Class is required."),
  term: z.string().min(1, "Term is required."),
  year: z.coerce.number().min(2000, "Invalid year."),
  reportFile: z.any(),
});


export async function handleReportUpload(prevState: any, formData: FormData) {
  const validatedFields = ReportSchema.safeParse({
    studentId: formData.get('studentId'),
    studentName: formData.get('studentName'),
    class: formData.get('class'),
    term: formData.get('term'),
    year: formData.get('year'),
    reportFile: formData.get('reportFile'),
  });

  if (!validatedFields.success) {
    return {
      message: 'Invalid form data.',
      errors: validatedFields.error.flatten().fieldErrors,
    };
  }

  const { studentName, class: studentClass, term, year } = validatedFields.data;

  try {
    // 1. Generate unique verification ID using GenAI flow
    const metadata = JSON.stringify({ ...validatedFields.data, timestamp: new Date().toISOString() });
    const { verificationId } = await generateVerificationId({ reportCardMetadata: metadata });

    // 2. Simulate storing file in Firebase Storage and metadata in Firestore
    console.log(`Uploading file for ${studentName}...`);
    console.log(`Storing metadata in Firestore with verification ID: ${verificationId}`);
    console.log({
        ...validatedFields.data,
        verificationId,
        status: 'pending' // new reports are pending by default
    });
    
    // Simulate network delay
    await new Promise(resolve => setTimeout(resolve, 1500));

    // In a real app, you would revalidate the path of the reports list
    revalidatePath('/dashboard');
    
    return {
      message: 'Report uploaded successfully!',
      verificationId,
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
