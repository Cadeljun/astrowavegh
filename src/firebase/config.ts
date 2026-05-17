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

// Ensure keys exist and we are in a browser environment to avoid SSR crashes
const isConfigValid = !!firebaseConfig.apiKey && typeof window !== 'undefined';

function getSafeApp(): FirebaseApp {
  if (getApps().length > 0) return getApp();
  
  if (!isConfigValid) {
    return {
      name: '[DEFAULT]',
      options: {},
      automaticDataCollectionEnabled: false,
    } as FirebaseApp;
  }
  
  try {
    return initializeApp(firebaseConfig);
  } catch (e) {
    return getApp();
  }
}

const app = getSafeApp();

// Export stub objects if config is missing to prevent top-level crashes
export const db = isConfigValid ? getFirestore(app) : {} as Firestore;
export const auth = isConfigValid ? getAuth(app) : {} as Auth;
export const storage = isConfigValid ? getStorage(app) : {} as FirebaseStorage;

export default app;
