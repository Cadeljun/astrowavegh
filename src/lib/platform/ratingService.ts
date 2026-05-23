'use client';

import { db } from '@/firebase';
import {
  collection,
  addDoc,
  doc,
  updateDoc,
  serverTimestamp,
  getDoc,
  Timestamp
} from 'firebase/firestore';
import { updateTalentWaveScore } from '@/lib/algorithms/updateWaveScore';
import { createNotification, logActivity } from '@/lib/firebase/platform';

export interface RatingFormData {
  overall: number;        // 1-5
  performance: number;    // 1-5
  professionalism: number; // 1-5
  communication: number;  // 1-5
  valueForMoney: number;  // 1-5
  review: string;         // text
}

export function validateRating(
  data: Partial<RatingFormData>
): Record<string, string> {
  const errors: Record<string, string> = {};
  
  if (!data.overall || data.overall < 1) {
    errors.overall = 'Please rate your overall experience';
  }
  if (!data.performance || data.performance < 1) {
    errors.performance = 'Please rate performance';
  }
  if (!data.professionalism || data.professionalism < 1) {
    errors.professionalism = 'Please rate professionalism';
  }
  if (!data.communication || data.communication < 1) {
    errors.communication = 'Please rate communication';
  }
  if (!data.valueForMoney || data.valueForMoney < 1) {
    errors.valueForMoney = 'Please rate value for money';
  }
  if (!data.review?.trim() || data.review.trim().length < 20) {
    errors.review = 'Please write at least 20 characters';
  }
  
  return errors;
}

export async function submitRating(
  bookingId: string,
  organizerId: string,
  organizerName: string,
  talentId: string,
  eventId: string,
  eventDate: Timestamp,
  data: RatingFormData
): Promise<void> {
  
  // 1. Verify eligibility
  const bookingRef = doc(db, 'bookings', bookingId);
  const bookingSnap = await getDoc(bookingRef);
  
  if (!bookingSnap.exists()) {
    throw new Error('Booking not found');
  }
  const booking = bookingSnap.data();
  
  if (booking.status !== 'completed') {
    throw new Error('Can only rate completed bookings');
  }
  if (booking.rated) {
    throw new Error('Already rated');
  }
  if (booking.organizerId !== organizerId) {
    throw new Error('Unauthorized');
  }
  
  // 2. Calculate average score for the engagement
  const scores = [
    data.overall,
    data.performance,
    data.professionalism,
    data.communication,
    data.valueForMoney
  ];
  const averageScore = parseFloat(
    (scores.reduce((a, b) => a + b, 0) / scores.length).toFixed(2)
  );
  
  // 3. Create the rating document
  await addDoc(collection(db, 'ratings'), {
    bookingId,
    eventId,
    organizerId,
    organizerName,
    talentId,
    overall: data.overall,
    performance: data.performance,
    professionalism: data.professionalism,
    communication: data.communication,
    valueForMoney: data.valueForMoney,
    averageScore,
    review: data.review.trim(),
    eventDate,
    submittedAt: serverTimestamp()
  });
  
  // 4. Update the booking and event
  await updateDoc(bookingRef, {
    rated: true,
    ratingSubmitted: true,
    updatedAt: serverTimestamp()
  });

  const eventRef = doc(db, 'platform_events', eventId);
  await updateDoc(eventRef, {
    rated: true,
    updatedAt: serverTimestamp()
  });
  
  // 5. Trigger Wave Score recalculation
  await updateTalentWaveScore(talentId);
  
  // 6. Notify talent
  await createNotification(
    talentId,
    'rating_received',
    'New Review Received! ⭐',
    `${organizerName} left you a ${data.overall}-star review. Your Wave Score has been updated!`,
    '/talent/reviews',
    bookingId
  );
  
  // 7. System Log
  await logActivity(
    'ratings',
    'created',
    bookingId,
    organizerName,
    `Rating: ${averageScore}/5 submitted for talent ID: ${talentId}`
  );
}
