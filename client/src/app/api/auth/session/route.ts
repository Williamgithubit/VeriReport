import { NextResponse } from 'next/server';
import { getAuth } from 'firebase-admin/auth';
import { initializeFirebaseAdmin } from '@/lib/firebase/firebase-admin';
import { SignJWT } from 'jose';

// Initialize Firebase Admin
const adminApp = initializeFirebaseAdmin();
const auth = getAuth(adminApp);

export async function POST(request: Request) {
  try {
    // Check if request has a body
    if (!request.body) {
      console.error('No request body received');
      return NextResponse.json(
        { error: 'No request body provided' },
        { status: 400 }
      );
    }

    // Parse the request body
    let requestBody;
    try {
      requestBody = await request.json();
    } catch (error) {
      console.error('Error parsing request body:', error);
      return NextResponse.json(
        { error: 'Invalid JSON in request body' },
        { status: 400 }
      );
    }

    const { idToken } = requestBody;

    if (!idToken) {
      console.error('No ID token provided in request body');
      return NextResponse.json(
        { error: 'No ID token provided' },
        { status: 400 }
      );
    }

    // Verify the ID token
    let decodedToken;
    try {
      console.log('Verifying ID token...');
      console.log('Token length:', idToken.length);
      console.log('Token prefix:', idToken.substring(0, 20) + '...');
      
      decodedToken = await auth.verifyIdToken(idToken);
      console.log('Token verified successfully');
      console.log('Decoded token:', {
        uid: decodedToken.uid,
        email: decodedToken.email,
        expires: new Date(decodedToken.exp * 1000).toISOString(),
        issuedAt: new Date(decodedToken.iat * 1000).toISOString(),
      });
    } catch (error: any) {
      console.error('Error verifying ID token:', {
        message: error.message,
        code: error.code,
        stack: error.stack,
        tokenLength: idToken?.length,
        tokenPrefix: idToken?.substring(0, 20) + '...',
      });
      return NextResponse.json(
        { 
          error: 'Invalid or expired ID token', 
          details: error.message,
          code: error.code,
        },
        { status: 401 }
      );
    }

    const uid = decodedToken.uid;

    try {
      // Get the user's custom claims (if any)
      const user = await auth.getUser(uid);
      
      // Create a JWT token
      const secret = new TextEncoder().encode(process.env.JWT_SECRET || 'your-secret-key');
      const token = await new SignJWT({ 
        email: user.email,
        name: user.displayName,
        picture: user.photoURL
      })
        .setProtectedHeader({ alg: 'HS256' })
        .setSubject(user.uid)
        .setIssuedAt()
        .setExpirationTime('1h')
        .sign(secret);

      return NextResponse.json({
        success: true,
        user: {
          uid: user.uid,
          email: user.email,
          displayName: user.displayName,
          emailVerified: user.emailVerified,
          photoURL: user.photoURL,
        },
        token,
      });
    } catch (error: any) {
      console.error('Error getting user or creating custom token:', error);
      return NextResponse.json(
        { error: 'Failed to create session', details: error.message },
        { status: 500 }
      );
    }
  } catch (error: any) {
    console.error('Unexpected error in session creation:', error);
    return NextResponse.json(
      { error: 'Internal server error', details: error.message },
      { status: 500 }
    );
  }
}
