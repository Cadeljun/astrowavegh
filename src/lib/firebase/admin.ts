import { cert, getApps, initializeApp, type App } from 'firebase-admin/app'
import { getAuth, type Auth } from 'firebase-admin/auth'
import { getFirestore, type Firestore } from 'firebase-admin/firestore'

let app: App | null = null
let firestore: Firestore | null = null
let adminAuth: Auth | null = null

function getAdminApp() {
  if (app) return app

  const projectId = process.env.FIREBASE_PROJECT_ID || process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID
  const clientEmail = process.env.FIREBASE_CLIENT_EMAIL
  const privateKey = process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, '\n')

  if (!projectId || !clientEmail || !privateKey) {
    throw new Error('Firebase Admin credentials are not configured')
  }

  app = getApps().length
    ? getApps()[0]
    : initializeApp({
        credential: cert({ projectId, clientEmail, privateKey }),
      })

  return app
}

export function getAdminDb() {
  if (!firestore) firestore = getFirestore(getAdminApp())
  return firestore
}

export function getAdminAuth() {
  if (!adminAuth) adminAuth = getAuth(getAdminApp())
  return adminAuth
}
