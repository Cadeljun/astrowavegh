'use client';

import { db } from '@/firebase';
import {
  doc,
  updateDoc,
  getDoc,
  serverTimestamp,
  increment,
  Timestamp
} from 'firebase/firestore';
import { createNotification } from '@/lib/firebase/platform';
import { recordCompletedEvent } from '@/lib/algorithms/updateWaveScore';

/**
 * Talent accepts a pending booking request.
 */
export async function acceptBooking(
  bookingId: string,
  talentId: string,
  response: string = ''
): Promise<void> {
  const bookingRef = doc(db, 'bookings', bookingId);
  const bookingSnap = await getDoc(bookingRef);

  if (!bookingSnap.exists()) {
    throw new Error('Booking not found');
  }

  const booking = bookingSnap.data();

  if (booking.talentId !== talentId) {
    throw new Error('Unauthorized');
  }
  if (booking.status !== 'pending') {
    throw new Error('Booking is no longer pending');
  }

  // 1. Update Booking status
  await updateDoc(bookingRef, {
    status: 'accepted',
    talentResponse: response,
    respondedAt: serverTimestamp(),
    updatedAt: serverTimestamp()
  });

  // 2. Confirm the event as booked
  await updateDoc(doc(db, 'platform_events', booking.eventId), {
    status: 'booked',
    bookedTalentId: talentId,
    bookedTalentName: booking.talentStageName,
    bookedTalentPhoto: booking.talentPhoto,
    bookedTalentWaveScore: booking.waveScore || 0,
    updatedAt: serverTimestamp()
  });

  // 3. Notify the organizer
  await createNotification(
    booking.organizerId,
    'booking_accepted',
    'Booking Accepted! 🎉',
    `${booking.talentStageName} accepted your request for ${booking.eventTitle}`,
    `/bookings/${bookingId}`,
    bookingId
  );
}

/**
 * Talent declines a pending booking request.
 */
export async function declineBooking(
  bookingId: string,
  talentId: string,
  reason: string = ''
): Promise<void> {
  const bookingRef = doc(db, 'bookings', bookingId);
  const bookingSnap = await getDoc(bookingRef);
  
  if (!bookingSnap.exists()) {
    throw new Error('Booking not found');
  }
  
  const booking = bookingSnap.data();

  if (booking.talentId !== talentId) {
    throw new Error('Unauthorized');
  }

  // 1. Update Booking status
  await updateDoc(bookingRef, {
    status: 'declined',
    talentResponse: reason,
    respondedAt: serverTimestamp(),
    updatedAt: serverTimestamp()
  });

  // 2. Revert event to matched (or open if no other matches)
  await updateDoc(doc(db, 'platform_events', booking.eventId), {
    status: 'matched',
    bookedTalentId: null,
    updatedAt: serverTimestamp()
  });

  // 3. Notify the organizer
  await createNotification(
    booking.organizerId,
    'booking_declined',
    'Booking Declined',
    `${booking.talentStageName} is unavailable for ${booking.eventTitle}. Explore other matches.`,
    `/match/${booking.eventId}`,
    bookingId
  );
}

/**
 * Organizer cancels a booking (can be done if status is pending or accepted).
 */
export async function cancelBooking(
  bookingId: string,
  organizerId: string
): Promise<void> {
  const bookingRef = doc(db, 'bookings', bookingId);
  const bookingSnap = await getDoc(bookingRef);
  
  if (!bookingSnap.exists()) {
    throw new Error('Booking not found');
  }
  
  const booking = bookingSnap.data();

  if (booking.organizerId !== organizerId) {
    throw new Error('Unauthorized');
  }

  // 1. Update Booking status
  await updateDoc(bookingRef, {
    status: 'cancelled',
    updatedAt: serverTimestamp()
  });

  // 2. Revert event status
  await updateDoc(doc(db, 'platform_events', booking.eventId), {
    status: 'open',
    bookedTalentId: null,
    updatedAt: serverTimestamp()
  });

  // 3. Notify talent if they were already accepted or it was pending
  await createNotification(
    booking.talentId,
    'booking_cancelled',
    'Booking Cancelled',
    `${booking.organizerName} has cancelled the booking for ${booking.eventTitle}`,
    `/talent/bookings`,
    bookingId
  );

  // 4. Update talent stats (cancelled bookings tracking)
  await updateDoc(doc(db, 'talent_profiles', booking.talentId), {
    cancelledBookings: increment(1),
    updatedAt: serverTimestamp()
  });
}

/**
 * Organizer marks the booking/event as completed after it occurs.
 */
export async function completeBooking(
  bookingId: string,
  organizerId: string
): Promise<void> {
  const bookingRef = doc(db, 'bookings', bookingId);
  const bookingSnap = await getDoc(bookingRef);
  
  if (!bookingSnap.exists()) {
    throw new Error('Booking not found');
  }
  
  const booking = bookingSnap.data();

  if (booking.organizerId !== organizerId) {
    throw new Error('Unauthorized');
  }

  // 1. Update Booking status
  await updateDoc(bookingRef, {
    status: 'completed',
    completedAt: serverTimestamp(),
    updatedAt: serverTimestamp()
  });

  // 2. Mark event as completed
  await updateDoc(doc(db, 'platform_events', booking.eventId), {
    status: 'completed',
    updatedAt: serverTimestamp()
  });

  // 3. Record for Talent Wave Score (increments count and updates recency)
  if (booking.eventDate) {
    await recordCompletedEvent(booking.talentId, booking.eventDate);
  }

  // 4. Notify both parties
  await createNotification(
    booking.talentId,
    'booking_completed',
    'Event Complete! 🌊',
    `The event "${booking.eventTitle}" is now complete. Great work!`,
    `/talent/dashboard`,
    bookingId
  );

  await createNotification(
    organizerId,
    'rating_reminder',
    'Rate Your Talent',
    `How was ${booking.talentStageName} at ${booking.eventTitle}? Leave a review!`,
    `/organizer/bookings`,
    bookingId
  );
}
