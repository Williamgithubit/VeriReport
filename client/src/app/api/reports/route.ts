import { NextResponse } from 'next/server';
import { getFirestore } from 'firebase-admin/firestore';
import { initializeFirebaseAdmin } from '@/lib/firebase/firebase-admin';

const adminApp = initializeFirebaseAdmin();
const db = getFirestore(adminApp);

export async function GET() {
  try {
    const toIsoStringOrNull = (value: any) => {
      if (!value) return null;
      if (typeof value === 'string') return value;
      if (typeof value?.toDate === 'function') {
        const d = value.toDate();
        return d instanceof Date && !Number.isNaN(d.getTime()) ? d.toISOString() : null;
      }
      return null;
    };

    const reportsSnap = await db
      .collection('reports')
      .orderBy('createdAt', 'desc')
      .limit(50)
      .get();

    const reports = reportsSnap.docs.map((doc) => {
      const data = doc.data();
      return {
        id: doc.id,
        studentId: data.studentId ?? '',
        studentName: data.studentName ?? '',
        class: data.class ?? '',
        year: data.year ?? null,
        status: data.status ?? 'Pending',
        verificationStatus: data.verificationStatus ?? undefined,
        verificationId: data.verificationId ?? '',
        fileUrl: data.fileUrl ?? data.uploadedFileUrl ?? undefined,
        createdAt: toIsoStringOrNull(data.createdAt),
        updatedAt: toIsoStringOrNull(data.updatedAt),
      };
    });

    const tryCount = async (query: any) => {
      try {
        const snap = await query.count().get();
        const data = typeof snap?.data === 'function' ? snap.data() : undefined;
        const count = typeof data?.count === 'number' ? data.count : undefined;
        if (typeof count === 'number') return count;
      } catch {
        // ignore
      }
      try {
        const snap = await query.select().get();
        return snap.size;
      } catch {
        const snap = await query.get();
        return snap.size;
      }
    };

    const total = await tryCount(db.collection('reports'));
    const pending =
      (await tryCount(db.collection('reports').where('verificationStatus', '==', 'Pending')))
      + (await tryCount(
        db
          .collection('reports')
          .where('verificationStatus', '==', null)
          .where('status', '==', 'Pending')
      ));

    return NextResponse.json({
      reports,
      total,
      pending,
    });
  } catch (error: any) {
    console.error('GET /api/reports failed:', error);
    return NextResponse.json(
      { error: 'Failed to fetch reports' },
      { status: 500 }
    );
  }
}
