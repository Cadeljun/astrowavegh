
import { initializeApp, getApps, getApp, FirebaseApp } from 'firebase/app';
import { getFirestore, Firestore } from 'firebase/firestore';
import { getAuth, Auth } from 'firebase/auth';
import { getStorage, FirebaseStorage } from 'firebase/storage';

const firebaseConfig = {
  apiKey: "AIzaSyAyTaxmsONXftJd6Tp-cLYq2sjR0yqI61c",
  authDomain: "studio-9129689546-ca9f2.firebaseapp.com",
  projectId: "studio-9129689546-ca9f2",
  storageBucket: "studio-9129689546-ca9f2.firebasestorage.app",
  messagingSenderId: "722453105018",
  appId: "1:722453105018:web:4a16b3fb2f954cb1cd6ec3"
};

// Check if we're in the browser environment
const isBrowser = typeof window !== 'undefined';

// Safe app initialization
function getSafeApp(): FirebaseApp {
  if (getApps().length > 0) return getApp();
  return initializeApp(firebaseConfig);
}

const app = getSafeApp();

/**
 * Export services safely. On the server, these will return placeholders
 * to prevent crashes during Next.js pre-rendering.
 */
export const db = isBrowser ? getFirestore(app) : {} as Firestore;
export const auth = isBrowser ? getAuth(app) : {} as Auth;
export const storage = isBrowser ? getStorage(app) : {} as FirebaseStorage;

export default app;
