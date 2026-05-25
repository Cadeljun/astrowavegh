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
import { createNotification, logActivity } from '@/lib/firebase/platform';
import { recordCompletedEvent } from '@/lib/algorithms/updateWaveScore';
import { errorEmitter } from '@/firebase/error-emitter';
import { FirestorePermissionError, type SecurityRuleContext } from '@/firebase/errors';

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

  const updateData = {
    status: 'accepted',
    talentResponse: response,
    respondedAt: serverTimestamp(),
    updatedAt: serverTimestamp()
  };

  // 1. Update Booking status (Non-blocking)
  updateDoc(bookingRef, updateData)
    .then(async () => {
      // 2. Confirm the event as booked
      const eventRef = doc(db, 'platform_events', booking.eventId);
      const eventUpdate = {
        status: 'booked',
        bookedTalentId: talentId,
        bookedTalentName: booking.talentStageName,
        bookedTalentPhoto: booking.talentPhoto,
        bookedTalentWaveScore: booking.waveScore || 0,
        updatedAt: serverTimestamp()
      };
      
      updateDoc(eventRef, eventUpdate).catch(async (serverError) => {
        errorEmitter.emit('permission-error', new FirestorePermissionError({
          path: eventRef.path,
          operation: 'update',
          requestResourceData: eventUpdate
        }));
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

      // 4. Log activity
      await logActivity(
        'bookings',
        'updated',
        bookingId,
        booking.talentName,
        'Booking accepted'
      );
    })
    .catch(async (serverError) => {
      errorEmitter.emit('permission-error', new FirestorePermissionError({
        path: bookingRef.path,
        operation: 'update',
        requestResourceData: updateData
      }));
    });
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

  const updateData = {
    status: 'declined',
    talentResponse: reason,
    respondedAt: serverTimestamp(),
    updatedAt: serverTimestamp()
  };

  // 1. Update Booking status
  updateDoc(bookingRef, updateData)
    .then(async () => {
      // 2. Revert event to open/matched status
      const eventRef = doc(db, 'platform_events', booking.eventId);
      const eventUpdate = {
        status: 'matched',
        bookedTalentId: null,
        updatedAt: serverTimestamp()
      };

      updateDoc(eventRef, eventUpdate).catch(async (serverError) => {
        errorEmitter.emit('permission-error', new FirestorePermissionError({
          path: eventRef.path,
          operation: 'update',
          requestResourceData: eventUpdate
        }));
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
    })
    .catch(async (serverError) => {
      errorEmitter.emit('permission-error', new FirestorePermissionError({
        path: bookingRef.path,
        operation: 'update',
        requestResourceData: updateData
      }));
    });
}

/**
 * Organizer cancels a booking.
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

  const updateData = {
    status: 'cancelled',
    updatedAt: serverTimestamp()
  };

  // 1. Update Booking status
  updateDoc(bookingRef, updateData)
    .then(async () => {
      // 2. Revert event status
      const eventRef = doc(db, 'platform_events', booking.eventId);
      const eventUpdate = {
        status: 'open',
        bookedTalentId: null,
        updatedAt: serverTimestamp()
      };

      updateDoc(eventRef, eventUpdate).catch(async (serverError) => {
        errorEmitter.emit('permission-error', new FirestorePermissionError({
          path: eventRef.path,
          operation: 'update',
          requestResourceData: eventUpdate
        }));
      });

      // 3. Notify talent
      await createNotification(
        booking.talentId,
        'booking_cancelled',
        'Booking Cancelled',
        `${booking.organizerName} has cancelled the booking for ${booking.eventTitle}`,
        `/talent/bookings`,
        bookingId
      );

      // 4. Update talent stats
      const talentRef = doc(db, 'talent_profiles', booking.talentId);
      updateDoc(talentRef, {
        cancelledBookings: increment(1),
        updatedAt: serverTimestamp()
      }).catch(async (serverError) => {
        errorEmitter.emit('permission-error', new FirestorePermissionError({
          path: talentRef.path,
          operation: 'update'
        }));
      });
    })
    .catch(async (serverError) => {
      errorEmitter.emit('permission-error', new FirestorePermissionError({
        path: bookingRef.path,
        operation: 'update',
        requestResourceData: updateData
      }));
    });
}

/**
 * Organizer marks the booking/event as completed.
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

  const updateData = {
    status: 'completed',
    completedAt: serverTimestamp(),
    updatedAt: serverTimestamp()
  };

  // 1. Update Booking status
  updateDoc(bookingRef, updateData)
    .then(async () => {
      // 2. Mark event as completed
      const eventRef = doc(db, 'platform_events', booking.eventId);
      const eventUpdate = {
        status: 'completed',
        updatedAt: serverTimestamp()
      };

      updateDoc(eventRef, eventUpdate).catch(async (serverError) => {
        errorEmitter.emit('permission-error', new FirestorePermissionError({
          path: eventRef.path,
          operation: 'update',
          requestResourceData: eventUpdate
        }));
      });

      // 3. Record for Talent Wave Score
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
    })
    .catch(async (serverError) => {
      errorEmitter.emit('permission-error', new FirestorePermissionError({
        path: bookingRef.path,
        operation: 'update',
        requestResourceData: updateData
      }));
    });
}
