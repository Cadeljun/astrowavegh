import { NextResponse } from 'next/server'

// Check credentials exist before 
// attempting to initialize
const projectId = 
  process.env.FIREBASE_PROJECT_ID
const clientEmail = 
  process.env.FIREBASE_CLIENT_EMAIL
const privateKey = 
  process.env.FIREBASE_PRIVATE_KEY

let adminApp: any = null

async function getAdminApp() {
  if (adminApp) return adminApp
  
  // Fail gracefully if no credentials
  if (!projectId || !clientEmail || 
      !privateKey) {
    throw new Error(
      'Firebase Admin credentials not configured. ' +
      'Add FIREBASE_PROJECT_ID, ' +
      'FIREBASE_CLIENT_EMAIL and ' +
      'FIREBASE_PRIVATE_KEY to environment variables.'
    )
  }
  
  const admin = await import('firebase-admin')
  
  if (!admin.apps.length) {
    adminApp = admin.initializeApp({
      credential: admin.credential.cert({
        projectId,
        clientEmail,
        privateKey: privateKey
          .replace(/\\n/g, '\n')
      })
    })
  } else {
    adminApp = admin.apps[0]
  }
  
  return adminApp
}

export async function POST(
  request: Request
) {
  try {
    // This will throw clear error if 
    // credentials missing
    await getAdminApp()
    
    const admin = await import('firebase-admin')
    const { email, password, name } = 
      await request.json()
    
    if (!email || !password) {
      return NextResponse.json(
        { error: 'Email and password required' },
        { status: 400 }
      )
    }
    
    const user = await admin.auth()
      .createUser({
        email,
        password,
        displayName: name || ''
      })
    
    return NextResponse.json({ 
      success: true,
      uid: user.uid 
    })
    
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message },
      { status: 500 }
    )
  }
}
