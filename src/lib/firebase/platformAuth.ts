'use client';

import { db } from '@/firebase';
import {
  doc,
  getDoc,
  setDoc,
  serverTimestamp
} from 'firebase/firestore';

/**
 * Handles the creation or retrieval of a platform user document in Firestore.
 * This links the Firebase Auth user to their custom AstroWave metadata.
 */
export async function getOrCreatePlatformUser(
  uid: string,
  email: string,
  displayName: string,
  photoURL: string,
  provider: 'google' | 'email'
): Promise<{
  isNew: boolean;
  onboarded: boolean;
  role: string | null;
}> {
  const ref = doc(db, 'users', uid);
  const snap = await getDoc(ref);

  if (snap.exists()) {
    const data = snap.data();
    return {
      isNew: false,
      onboarded: data.onboarded || false,
      role: data.role || null
    };
  }

  // Create new user document skeleton for new registrations
  const newUser = {
    uid,
    email,
    displayName,
    photoURL,
    role: null,
    onboarded: false,
    provider,
    active: true,
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
    lastLogin: serverTimestamp()
  };

  await setDoc(ref, newUser);

  return {
    isNew: true,
    onboarded: false,
    role: null
  };
}

/**
 * Simple audit log helper for user activity.
 */
export async function updateLastLogin(uid: string): Promise<void> {
  const ref = doc(db, 'users', uid);
  await setDoc(ref, {
    lastLogin: serverTimestamp(),
    updatedAt: serverTimestamp()
  }, { merge: true });
}
