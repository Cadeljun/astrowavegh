import app, { db, auth, storage } from './config';

export { db, auth, storage };
export default app;

/**
 * Initializes Firebase services for client-side usage.
 */
export function initializeFirebase() {
  return {
    app,
    firestore: db,
    auth,
  };
}

export { useCollection, useMemoFirebase } from './firestore/use-collection';
export { useDoc } from './firestore/use-doc';
export { useFirebaseApp, useFirestore, FirebaseProvider } from './provider';
