
import app, { db, auth, storage } from './config';

export { db, auth, storage };
export default app;

/**
 * Initializes Firebase services for client-side usage.
 * Strictly uses production instances (no emulators).
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
