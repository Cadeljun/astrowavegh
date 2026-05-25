import * as admin from 'firebase-admin';

let firebaseApp: admin.app.App | null = null;

/**
 * Initializes the Firebase Admin SDK lazily to avoid build-time errors.
 * Returns null if the service account is not configured correctly.
 */
function getFirebaseApp() {
  if (firebaseApp) return firebaseApp;

  // Check if an app is already initialized (handles dev environment hot-reloads)
  if (admin.apps.length > 0) {
    firebaseApp = admin.apps[0];
    return firebaseApp;
  }

  const saEnv = process.env.FIREBASE_SERVICE_ACCOUNT;
  if (!saEnv) {
    console.warn('FIREBASE_SERVICE_ACCOUNT environment variable is missing.');
    return null;
  }

  try {
    const serviceAccount = JSON.parse(saEnv);

    if (!serviceAccount || typeof serviceAccount.project_id !== 'string') {
      console.error('Service account JSON must include a string "project_id" property.');
      return null;
    }

    firebaseApp = admin.initializeApp({
      credential: admin.credential.cert(serviceAccount),
    });

    return firebaseApp;
  } catch (err) {
    console.error('Firebase Admin initialization error:', err);
    return null;
  }
}

export async function POST(req: Request) {
  const app = getFirebaseApp();

  if (!app) {
    return new Response(
      JSON.stringify({ error: 'Internal Server Error: Firebase Admin not configured correctly.' }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    );
  }

  try {
    const { name, email, role, active } = await req.json();
    const auth = admin.auth(app);
    const db = admin.firestore(app);

    // Create user in Firebase Authentication
    const userRecord = await auth.createUser({
      email,
      emailVerified: true,
      displayName: name,
    });

    // Store user role and status in Firestore
    await db.collection('user_roles').doc(userRecord.uid).set({
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
