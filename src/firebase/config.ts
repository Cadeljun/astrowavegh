import { initializeApp, getApps, getApp, FirebaseOptions, FirebaseApp } from 'firebase/app';
import { getFirestore, Firestore } from 'firebase/firestore';
import { getAuth, Auth } from 'firebase/auth';
import { getStorage, FirebaseStorage } from 'firebase/storage';

const firebaseConfig: FirebaseOptions = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
};

// Check if we're in the browser and config is complete
const isBrowser = typeof window !== 'undefined';
const isConfigComplete = !!firebaseConfig.apiKey && !!firebaseConfig.projectId;

function getSafeApp(): FirebaseApp {
  if (getApps().length > 0) return getApp();
  
  if (!isConfigComplete) {
    // Return a dummy app object for SSR/pre-rendering to prevent crashes
    return {
      name: '[DEFAULT]',
      options: {},
      automaticDataCollectionEnabled: false,
    } as FirebaseApp;
  }
  
  return initializeApp(firebaseConfig);
}

const app = getSafeApp();

// Export services only if config is valid to prevent SDK internal errors
export const db = isConfigComplete && isBrowser ? getFirestore(app) : {} as Firestore;
export const auth = isConfigComplete && isBrowser ? getAuth(app) : {} as Auth;
export const storage = isConfigComplete && isBrowser ? getStorage(app) : {} as FirebaseStorage;

export default app;
