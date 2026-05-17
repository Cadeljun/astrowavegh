import * as admin from 'firebase-admin'

if (!admin.apps.length) {
  admin.initializeApp({
    credential: admin.credential.cert({
      project_id: 
        process.env.FIREBASE_PROJECT_ID,
      client_email: 
        process.env.FIREBASE_CLIENT_EMAIL,
      private_key: 
        process.env.FIREBASE_PRIVATE_KEY
          ?.replace(/\\n/g, '\n')
    })
  })
}

export async function POST(req: Request) {
    const { name, email, role, active } = await req.json();

    try {
        const userRecord = await admin.auth().createUser({
            email,
            emailVerified: true,
            displayName: name
        });

        await admin.firestore().collection('user_roles').doc(userRecord.uid).set({
            uid: userRecord.uid,
            email,
            name,
            role,
            active,
            createdAt: admin.firestore.FieldValue.serverTimestamp(),
            updatedAt: admin.firestore.FieldValue.serverTimestamp(),
            lastLogin: null
        });

        return new Response(JSON.stringify({ uid: userRecord.uid }), { status: 201 });
    } catch (error) {
        return new Response(JSON.stringify({ error: (error as Error).message }), { status: 500 });
    }
}