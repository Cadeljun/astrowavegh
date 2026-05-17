'use client';

import { initializeApp, getApps, getApp, FirebaseApp } from 'firebase/app';
import { getFirestore, Firestore } from 'firebase/firestore';
import { getAuth, Auth } from 'firebase/auth';

/**
 * PRODUCTION FIREBASE CONFIGURATION
 * Connected to: studio-9129689546-ca9f2
 */
const firebaseConfig = {
  apiKey: "AIzaSyAyTaxmsONXftJd6Tp-cLYq2sjR0yqI61c",
  authDomain: "studio-9129689546-ca9f2.firebaseapp.com",
  projectId: "studio-9129689546-ca9f2",
  storageBucket: "studio-9129689546-ca9f2.firebasestorage.app",
  messagingSenderId: "722453105018",
  appId: "1:722453105018:web:4a16b3fb2f954cb1cd6ec3"
};

// Next.js SSR Safety Check
const isBrowser = typeof window !== 'undefined';

let app: FirebaseApp;
let auth: Auth;
let db: Firestore;

if (isBrowser) {
  // Initialize Firebase for the browser
  app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApp();
  auth = getAuth(app);
  db = getFirestore(app);
} else {
  // Safe stubs for server-side pre-rendering
  app = {} as FirebaseApp;
  auth = {
    onAuthStateChanged: () => () => {},
    signOut: async () => {},
  } as unknown as Auth;
  db = {
    type: 'firestore',
    toJSON: () => ({}),
  } as unknown as Firestore;
}

export { app, auth, db, firebaseConfig };
export default app;
