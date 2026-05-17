'use client';

import { initializeApp, getApps, getApp } from 'firebase/app';
import { getFirestore } from 'firebase/firestore';
import { getAuth } from 'firebase/auth';
import { firebaseConfig } from './config';

// Initialize Firebase idempotently to ensure singletons across the client
const firebaseApp = getApps().length === 0 ? initializeApp(firebaseConfig) : getApp();
const firestore = getFirestore(firebaseApp);
const auth = getAuth(firebaseApp);

// Export instances for use in non-hook functions and components
export { firebaseApp as default, firebaseApp as app, firestore as db, auth };

/**
 * Standardized initialization for client-side Firebase services.
 * Primarily used by the FirebaseClientProvider.
 */
export function initializeFirebase() {
  return {
    app: firebaseApp,
    firestore,
    auth,
  };
}

// Re-export hooks and providers for centralized access
export { useCollection, useMemoFirebase } from './firestore/use-collection';
export { useDoc } from './firestore/use-doc';
export { useUser } from './auth/use-user';
export { 
  FirebaseProvider, 
  useFirebaseApp, 
  useFirestore, 
  useAuth,
  getFirebaseApp,
  getFirestore,
  getAuth 
} from './provider';
export { FirebaseClientProvider } from './client-provider';
