import { initializeApp, getApps, getApp, FirebaseOptions, FirebaseApp } from 'firebase/app'
import { getFirestore, Firestore } from 'firebase/firestore'
import { getAuth, Auth } from 'firebase/auth'
import { getStorage, FirebaseStorage } from 'firebase/storage'

const firebaseConfig: FirebaseOptions = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
}

// Minimum required fields for Firebase to not throw on initialization
const isConfigValid = !!firebaseConfig.apiKey;

function getSafeApp(): FirebaseApp {
  if (getApps().length > 0) return getApp();
  
  if (!isConfigValid) {
    // Return a dummy app object for SSR or missing config environments
    return {
      name: '[DEFAULT]',
      options: {},
      automaticDataCollectionEnabled: false,
    } as FirebaseApp;
  }
  
  return initializeApp(firebaseConfig);
}

const app = getSafeApp();

// Only initialize services if we have a valid app instance with config
export const db = isConfigValid ? getFirestore(app) : {} as Firestore;
export const auth = isConfigValid ? getAuth(app) : {} as Auth;
export const storage = isConfigValid ? getStorage(app) : {} as FirebaseStorage;

export default app;
