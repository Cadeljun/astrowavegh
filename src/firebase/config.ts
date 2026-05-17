'use client';

import { initializeApp, getApps, getApp, FirebaseApp } from 'firebase/app';
import { getFirestore, Firestore } from 'firebase/firestore';
import { getAuth, Auth } from 'firebase/auth';
import { getStorage, FirebaseStorage } from 'firebase/storage';

const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
};

// Check if we are in the browser and if config is valid
const isBrowser = typeof window !== 'undefined';
const hasConfig = !!process.env.NEXT_PUBLIC_FIREBASE_API_KEY;

let app: FirebaseApp;
let auth: Auth;
let db: Firestore;
let storage: FirebaseStorage;

if (isBrowser && hasConfig) {
  // Initialize Firebase for the client
  app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApp();
  auth = getAuth(app);
  db = getFirestore(app);
  storage = getStorage(app);
} else {
  // Provide safe stubs for SSR to prevent pre-rendering crashes
  app = {} as FirebaseApp;
  auth = {
    onAuthStateChanged: () => () => {},
    signOut: async () => {},
  } as unknown as Auth;
  db = {
    type: 'firestore',
    toJSON: () => ({}),
  } as unknown as Firestore;
  storage = {} as FirebaseStorage;
}

export { app, auth, db, storage, firebaseConfig };
export default app;
