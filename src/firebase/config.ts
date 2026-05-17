
import { initializeApp, getApps, getApp } from 'firebase/app';
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

// Check if we're in the browser environment to prevent SSR errors
const isBrowser = typeof window !== 'undefined';

/**
 * Initialize Firebase safely for Next.js.
 * Ensures the snippet requested is present but wrapped for idempotency and SSR.
 */
const app = !getApps().length ? initializeApp(firebaseConfig) : getApp();
const auth = isBrowser ? getAuth(app) : {} as Auth;
const db = isBrowser ? getFirestore(app) : {} as Firestore;
const storage = isBrowser ? getStorage(app) : {} as FirebaseStorage;

export { app, auth, db, storage };
export default app;
