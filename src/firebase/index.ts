'use client';

import app, { db, auth } from './config';

/**
 * Standardized initialization for client-side Firebase services.
 * Production only.
 */
export function initializeFirebase() {
  return {
    app,
    firestore: db,
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

export { db, auth };
export default app;
