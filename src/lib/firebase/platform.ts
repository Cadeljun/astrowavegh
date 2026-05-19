
'use client';

import { db } from '@/firebase';
import {
  doc,
  getDoc,
  setDoc,
  updateDoc,
  addDoc,
  collection,
  query,
  where,
  orderBy,
  limit,
  getDocs,
  serverTimestamp
} from 'firebase/firestore';
import type { 
  User,
  UserRole,
  TalentProfile,
  OrganizerProfile,
  PlatformEvent,
  Booking,
  BookingStatus,
  Rating,
  Notification
} from '@/types/platform';
import { errorEmitter } from '@/firebase/error-emitter';
import { FirestorePermissionError } from '@/firebase/errors';

// ─── USER HELPERS ───────────────────

export async function createUserDocument(
  uid: string,
  data: Partial<User>
): Promise<void> {
  const docRef = doc(db, 'users', uid);
  const userData = {
    ...data,
    uid,
    onboarded: false,
    active: true,
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
    lastLogin: serverTimestamp()
  };

  setDoc(docRef, userData)
    .catch(async (error) => {
      const permissionError = new FirestorePermissionError({
        path: docRef.path,
        operation: 'create',
        requestResourceData: userData
      });
      errorEmitter.emit('permission-error', permissionError);
    });
}

export async function getUserDocument(
  uid: string
): Promise<User | null> {
  try {
    const snap = await getDoc(doc(db, 'users', uid));
    return snap.exists() ? snap.data() as User : null;
  } catch (error: any) {
    if (error.code === 'permission-denied') {
      const permissionError = new FirestorePermissionError({
        path: `users/${uid}`,
        operation: 'get'
      });
      errorEmitter.emit('permission-error', permissionError);
    }
    return null;
  }
}

export async function updateUserRole(
  uid: string,
  role: UserRole
): Promise<void> {
  const docRef = doc(db, 'users', uid);
  const updateData = {
    role,
    onboarded: true,
    updatedAt: serverTimestamp()
  };

  updateDoc(docRef, updateData)
    .catch(async (error) => {
      const permissionError = new FirestorePermissionError({
        path: docRef.path,
        operation: 'update',
        requestResourceData: updateData
      });
      errorEmitter.emit('permission-error', permissionError);
    });
}

// ─── TALENT HELPERS ─────────────────

export async function getTalentProfile(
  uid: string
): Promise<TalentProfile | null> {
  try {
    const snap = await getDoc(doc(db, 'talent_profiles', uid));
    return snap.exists() ? snap.data() as TalentProfile : null;
  } catch (error: any) {
    return null;
  }
}

export async function createTalentProfile(
  uid: string,
  data: Partial<TalentProfile>
): Promise<void> {
  const docRef = doc(db, 'talent_profiles', uid);
  const profileData = {
    ...data,
    uid,
    waveScore: 0,
    averageRating: 0,
    ratingCount: 0,
    eventCount: 0,
    lastEventDate: null,
    recencyFactor: 1.0,
    totalBookings: 0,
    completedBookings: 0,
    cancelledBookings: 0,
    verified: false,
    featured: false,
    active: true,
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp()
  };

  setDoc(docRef, profileData)
    .catch(async (error) => {
      const permissionError = new FirestorePermissionError({
        path: docRef.path,
        operation: 'create',
        requestResourceData: profileData
      });
      errorEmitter.emit('permission-error', permissionError);
    });
}

export async function getAllTalents(
  filters?: {
    category?: string
    city?: string
    available?: boolean
    minWaveScore?: number
  }
): Promise<TalentProfile[]> {
  const constraints: any[] = [where('active', '==', true)];
  
  if (filters?.category) constraints.push(where('category', '==', filters.category));
  if (filters?.city) constraints.push(where('city', '==', filters.city));
  if (filters?.available !== undefined) constraints.push(where('available', '==', filters.available));
  
  constraints.push(orderBy('waveScore', 'desc'));

  try {
    const q = query(collection(db, 'talent_profiles'), ...constraints);
    const snap = await getDocs(q);
    return snap.docs.map(d => d.data() as TalentProfile);
  } catch (error: any) {
    return [];
  }
}

// ─── ORGANIZER HELPERS ──────────────

export async function getOrganizerProfile(
  uid: string
): Promise<OrganizerProfile | null> {
  try {
    const snap = await getDoc(doc(db, 'organizer_profiles', uid));
    return snap.exists() ? snap.data() as OrganizerProfile : null;
  } catch (error) {
    return null;
  }
}

export async function createOrganizerProfile(
  uid: string,
  data: Partial<OrganizerProfile>
): Promise<void> {
  const docRef = doc(db, 'organizer_profiles', uid);
  const profileData = {
    ...data,
    uid,
    eventCount: 0,
    totalSpent: 0,
    verified: false,
    rating: 0,
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp()
  };

  setDoc(docRef, profileData)
    .catch(async (error) => {
      const permissionError = new FirestorePermissionError({
        path: docRef.path,
        operation: 'create',
        requestResourceData: profileData
      });
      errorEmitter.emit('permission-error', permissionError);
    });
}

// ─── EVENT HELPERS ──────────────────

export async function createPlatformEvent(
  data: Partial<PlatformEvent>
): Promise<void> {
  const colRef = collection(db, 'platform_events');
  const eventData = {
    ...data,
    status: 'open',
    matchedTalents: [],
    bookedTalentId: null,
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp()
  };

  addDoc(colRef, eventData)
    .catch(async (error) => {
      const permissionError = new FirestorePermissionError({
        path: colRef.path,
        operation: 'create',
        requestResourceData: eventData
      });
      errorEmitter.emit('permission-error', permissionError);
    });
}

export async function getOrganizerEvents(
  organizerId: string
): Promise<PlatformEvent[]> {
  try {
    const q = query(
      collection(db, 'platform_events'),
      where('organizerId', '==', organizerId),
      orderBy('createdAt', 'desc')
    );
    const snap = await getDocs(q);
    return snap.docs.map(d => ({ id: d.id, ...d.data() } as PlatformEvent));
  } catch (error) {
    return [];
  }
}

// ─── BOOKING HELPERS ────────────────

export async function createBooking(
  data: Partial<Booking>
): Promise<void> {
  const colRef = collection(db, 'bookings');
  const bookingData = {
    ...data,
    status: 'pending',
    ratingSubmitted: false,
    rated: false,
    requestedAt: serverTimestamp(),
    respondedAt: null,
    completedAt: null,
    updatedAt: serverTimestamp()
  };

  addDoc(colRef, bookingData)
    .catch(async (error) => {
      const permissionError = new FirestorePermissionError({
        path: colRef.path,
        operation: 'create',
        requestResourceData: bookingData
      });
      errorEmitter.emit('permission-error', permissionError);
    });
}

export async function updateBookingStatus(
  bookingId: string,
  status: BookingStatus,
  response?: string
): Promise<void> {
  const docRef = doc(db, 'bookings', bookingId);
  const updateData = {
    status,
    ...(response && { talentResponse: response }),
    respondedAt: serverTimestamp(),
    updatedAt: serverTimestamp()
  };

  updateDoc(docRef, updateData)
    .catch(async (error) => {
      const permissionError = new FirestorePermissionError({
        path: docRef.path,
        operation: 'update',
        requestResourceData: updateData
      });
      errorEmitter.emit('permission-error', permissionError);
    });
}

// ─── NOTIFICATION HELPERS ───────────

export async function createNotification(
  userId: string,
  type: string,
  title: string,
  message: string,
  actionUrl: string,
  relatedId: string
): Promise<void> {
  const colRef = collection(db, 'notifications');
  const notifyData = {
    userId,
    type,
    title,
    message,
    read: false,
    actionUrl,
    relatedId,
    createdAt: serverTimestamp()
  };

  addDoc(colRef, notifyData)
    .catch(async (error) => {
      const permissionError = new FirestorePermissionError({
        path: colRef.path,
        operation: 'create',
        requestResourceData: notifyData
      });
      errorEmitter.emit('permission-error', permissionError);
    });
}

export async function markNotificationRead(
  notificationId: string
): Promise<void> {
  const docRef = doc(db, 'notifications', notificationId);
  updateDoc(docRef, { read: true })
    .catch(async (error) => {
      const permissionError = new FirestorePermissionError({
        path: docRef.path,
        operation: 'update',
        requestResourceData: { read: true }
      });
      errorEmitter.emit('permission-error', permissionError);
    });
}
