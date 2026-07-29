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
      'Server configuration error.'
    )
  }
  
  const admin = await import('firebase-admin')
  
  if (!admin.apps.length) {
    adminApp = admin.initializeApp({
      credential: admin.credential.cert({
        projectId,
        clientEmail,
        privateKey: privateKey
          .replace(/\\\\n/g, '\n')
      })
    })
  } else {
    adminApp = admin.apps[0]
  }
  
  return adminApp
}

// Verify Firebase ID token
async function verifyAuth(request: Request): Promise<{ uid: string; email: string } | null> {
  try {
    const authHeader = request.headers.get('authorization')
    if (!authHeader?.startsWith('Bearer ')) {
      return null
    }

    const token = authHeader.split('Bearer ')[1]
    const admin = await import('firebase-admin')
    const app = await getAdminApp()
    const decodedToken = await admin.auth(app).verifyIdToken(token)
    
    return {
      uid: decodedToken.uid,
      email: decodedToken.email || ''
    }
  } catch (error) {
    return null
  }
}

export async function POST(
  request: Request
) {
  try {
    // Verify authentication first
    const authUser = await verifyAuth(request)
    if (!authUser) {
      return NextResponse.json(
        { error: 'Unauthorized. Please log in.' },
        { status: 401 }
      )
    }

    // Check if user is admin
    const adminEmails = process.env.ADMIN_EMAILS?.split(',').map(e => e.trim()) || []
    const superAdminEmail = 'junioraquils143@gmail.com'
    
    if (!adminEmails.includes(authUser.email) && authUser.email !== superAdminEmail) {
      return NextResponse.json(
        { error: 'Forbidden. Admin access required.' },
        { status: 403 }
      )
    }

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

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(email)) {
      return NextResponse.json(
        { error: 'Invalid email format' },
        { status: 400 }
      )
    }

    // Validate password strength
    if (password.length < 8) {
      return NextResponse.json(
        { error: 'Password must be at least 8 characters' },
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
    // Don't leak internal errors
    console.error('Create user error:', error)
    return NextResponse.json(
      { error: 'Failed to create user. Please try again.' },
      { status: 500 }
    )
  }
}
