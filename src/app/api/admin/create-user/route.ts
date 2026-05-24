import * as admin from 'firebase-admin';

/**
 * Initializes the Firebase Admin SDK lazily to avoid build-time errors
 * when environment variables are not present during page data collection.
 */
function getAdminApp() {
  if (admin.apps.length > 0) {
    return admin.apps[0];
  }

  const serviceAccountVar = process.env.FIREBASE_SERVICE_ACCOUNT;
  
  if (!serviceAccountVar) {
    return null;
  }

  try {
    const serviceAccount = JSON.parse(serviceAccountVar);

    // Explicitly validate project_id to prevent "Service account object must contain a string 'project_id' property" error
    if (!serviceAccount || typeof serviceAccount.project_id !== 'string') {
      return null;
    }

    return admin.initializeApp({
      credential: admin.credential.cert(serviceAccount),
    });
  } catch (error) {
    console.error('Firebase Admin lazy initialization failed:', error);
    return null;
  }
}

export async function POST(req: Request) {
  const app = getAdminApp();

  if (!app) {
    return new Response(
      JSON.stringify({ error: 'Server configuration error: Firebase Admin failed to initialize.' }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    );
  }

  try {
    const { name, email, role, active } = await req.json();

    const userRecord = await admin.auth(app).createUser({
      email,
      emailVerified: true,
      displayName: name,
    });

    await admin.firestore(app).collection('user_roles').doc(userRecord.uid).set({
      uid: userRecord.uid,
      email,
      name,
      role,
      active,
      createdAt: admin.firestore.FieldValue.serverTimestamp(),
      updatedAt: admin.firestore.FieldValue.serverTimestamp(),
      lastLogin: null,
    });

    return new Response(
      JSON.stringify({ uid: userRecord.uid }),
      { status: 201, headers: { 'Content-Type': 'application/json' } }
    );
  } catch (error: any) {
    console.error('Error in create-user API:', error);
    return new Response(
      JSON.stringify({ error: error.message || 'Internal server error' }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    );
  }
}
