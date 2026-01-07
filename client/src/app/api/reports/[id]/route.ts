import { NextResponse } from 'next/server';
import { getFirestore } from 'firebase-admin/firestore';
import { getStorage } from 'firebase-admin/storage';
import { initializeFirebaseAdmin } from '@/lib/firebase/firebase-admin';
import crypto from 'crypto';

const adminApp = initializeFirebaseAdmin();
const db = getFirestore(adminApp);
const storage = getStorage(adminApp);

export async function PATCH(
  request: Request,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await context.params;
    const body = await request.json().catch(() => ({} as any));

    const docRef = db.collection('reports').doc(id);
    const docSnap = await docRef.get();
    if (!docSnap.exists) {
      return NextResponse.json({ error: 'Report not found' }, { status: 404 });
    }

    const updates: Record<string, any> = {};

    if (typeof body.studentName === 'string') updates.studentName = body.studentName;
    if (typeof body.class === 'string') updates.class = body.class;
    if (body.year === null || typeof body.year === 'number') updates.year = body.year;
    if (typeof body.status === 'string') updates.status = body.status;
    if (typeof body.verificationStatus === 'string') updates.verificationStatus = body.verificationStatus;

    updates.updatedAt = new Date();

    await docRef.update(updates);

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error('PATCH /api/reports/[id] failed:', error);
    return NextResponse.json({ error: 'Failed to update report' }, { status: 500 });
  }
}

export async function DELETE(
  _request: Request,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await context.params;

    const docRef = db.collection('reports').doc(id);
    const docSnap = await docRef.get();

    if (!docSnap.exists) {
      return NextResponse.json({ error: 'Report not found' }, { status: 404 });
    }

    const data = docSnap.data() || {};
    const filePath = typeof data.filePath === 'string' ? data.filePath : undefined;
    const cloudinaryPublicId = typeof data.cloudinaryPublicId === 'string' ? data.cloudinaryPublicId : undefined;
    const cloudinaryResourceType = typeof data.cloudinaryResourceType === 'string' ? data.cloudinaryResourceType : 'auto';

    await docRef.delete();

    if (cloudinaryPublicId) {
      const cloudName = process.env.CLOUDINARY_CLOUD_NAME;
      const cloudApiKey = process.env.CLOUDINARY_API_KEY;
      const cloudApiSecret = process.env.CLOUDINARY_API_SECRET;

      if (cloudName && cloudApiKey && cloudApiSecret) {
        const timestamp = Math.floor(Date.now() / 1000);
        const signatureBase = `public_id=${cloudinaryPublicId}&timestamp=${timestamp}`;
        const signature = crypto
          .createHash('sha1')
          .update(signatureBase + cloudApiSecret)
          .digest('hex');

        const destroyForm = new FormData();
        destroyForm.append('public_id', cloudinaryPublicId);
        destroyForm.append('api_key', cloudApiKey);
        destroyForm.append('timestamp', String(timestamp));
        destroyForm.append('signature', signature);

        await fetch(
          `https://api.cloudinary.com/v1_1/${cloudName}/${cloudinaryResourceType}/destroy`,
          {
            method: 'POST',
            body: destroyForm,
          }
        );
      }
    }

    if (filePath) {
      const bucketName = process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET;
      if (bucketName) {
        const bucket = storage.bucket(bucketName);
        await bucket.file(filePath).delete({ ignoreNotFound: true });
      }
    }

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error('DELETE /api/reports/[id] failed:', error);
    return NextResponse.json({ error: 'Failed to delete report' }, { status: 500 });
  }
}
