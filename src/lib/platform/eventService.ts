import { db } from '@/firebase';
import { 
  collection, 
  addDoc, 
  updateDoc, 
  doc, 
  serverTimestamp, 
  getDoc, 
  Timestamp,
  increment 
} from 'firebase/firestore';
import { recordCompletedEvent } from '@/lib/algorithms/updateWaveScore';
import { createNotification } from '@/lib/firebase/platform';
import { errorEmitter } from '@/firebase/error-emitter';
import { FirestorePermissionError, type SecurityRuleContext } from '@/firebase/errors';

export interface EventFormData {
  title: string;
  category: string;
  date: string;
  startTime: string;
  endTime: string;
  venue: string;
  city: string;
  region: string;
  guestCount: number;
  description: string;
  imageUrl: string;
  talentCategory: string;
  talentBudget: number;
  currency: 'GHS' | 'USD';
  priceNegotiable: boolean;
  requirements: string;
  additionalNotes: string;
}

/**
 * Validates the event form data based on the current step.
 */
export function validateEventForm(
  data: Partial<EventFormData>,
  step: number
): Record<string, string> {
  const errors: Record<string, string> = {};
  
  if (step === 1) {
    if (!data.title?.trim()) {
      errors.title = 'Event title is required';
    }
    if (!data.category) {
      errors.category = 'Please select an event category';
    }
    if (!data.date) {
      errors.date = 'Event date is required';
    } else {
      const eventDate = new Date(data.date);
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      if (eventDate < today) {
        errors.date = 'Event date must be in the future';
      }
    }
    if (!data.venue?.trim()) {
      errors.venue = 'Venue is required';
    }
    if (!data.city) {
      errors.city = 'City is required';
    }
    if (!data.guestCount || data.guestCount < 1) {
      errors.guestCount = 'Please enter expected guest count';
    }
  }
  
  if (step === 2) {
    if (!data.talentCategory) {
      errors.talentCategory = 'Please select talent type needed';
    }
    if (!data.talentBudget || data.talentBudget < 1) {
      errors.talentBudget = 'Please enter your budget';
    }
  }
  
  return errors;
}

/**
 * Posts a new event to the platform.
 */
export async function postEvent(
  organizerId: string,
  organizerName: string,
  organizerPhoto: string,
  data: EventFormData
): Promise<string> {
  const eventDate = new Date(data.date);
  
  const eventData = {
    organizerId,
    organizerName,
    organizerPhoto,
    title: data.title.trim(),
    category: data.category,
    date: Timestamp.fromDate(eventDate),
    startTime: data.startTime,
    endTime: data.endTime || '',
    venue: data.venue.trim(),
    city: data.city,
    region: data.region || '',
    country: 'Ghana',
    guestCount: Number(data.guestCount),
    description: data.description || '',
    imageUrl: data.imageUrl || '',
    talentCategory: data.talentCategory,
    talentBudget: Number(data.talentBudget),
    currency: data.currency,
    priceNegotiable: data.priceNegotiable || false,
    requirements: data.requirements || '',
    additionalNotes: data.additionalNotes || '',
    status: 'open',
    matchedTalents: [],
    bookedTalentId: null,
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp()
  };

  try {
    // 1. Create the event document
    const ref = await addDoc(collection(db, 'platform_events'), eventData);
    
    // 2. Increment organizer event count (Non-blocking)
    const orgRef = doc(db, 'organizer_profiles', organizerId);
    updateDoc(orgRef, { 
      eventCount: increment(1),
      updatedAt: serverTimestamp()
    }).catch(async (serverError) => {
      errorEmitter.emit('permission-error', new FirestorePermissionError({
        path: orgRef.path,
        operation: 'update'
      }));
    });
    
    return ref.id;
  } catch (serverError: any) {
    if (serverError.code === 'permission-denied') {
      const permissionError = new FirestorePermissionError({
        path: 'platform_events',
        operation: 'create',
        requestResourceData: eventData
      });
      errorEmitter.emit('permission-error', permissionError);
    }
    throw serverError;
  }
}

/**
 * Marks an event as completed.
 */
export async function completeEvent(
  eventId: string,
  talentId: string
): Promise<void> {
  const eventRef = doc(db, 'platform_events', eventId);
  const snap = await getDoc(eventRef);
  
  if (!snap.exists()) throw new Error('Event not found');
  const eventData = snap.data();

  updateDoc(eventRef, {
    status: 'completed',
    updatedAt: serverTimestamp()
  })
    .then(async () => {
      // Record completion for talent metrics
      if (talentId && eventData.date) {
        await recordCompletedEvent(talentId, eventData.date);
      }
      
      // Notify talent
      await createNotification(
        talentId,
        'booking_completed',
        'Event Completed! 🌊',
        `The event "${eventData.title}" has been marked complete. Great work!`,
        '/talent/bookings',
        eventId
      );
    })
    .catch(async (serverError) => {
      errorEmitter.emit('permission-error', new FirestorePermissionError({
        path: eventRef.path,
        operation: 'update'
      }));
    });
}

/**
 * Cancels an event.
 */
export async function cancelEvent(
  eventId: string,
  organizerId: string
): Promise<void> {
  const ref = doc(db, 'platform_events', eventId);
  const snap = await getDoc(ref);
  
  if (!snap.exists()) throw new Error('Event not found');
  if (snap.data().organizerId !== organizerId) throw new Error('Unauthorized');
  if (snap.data().status === 'booked') throw new Error('Cannot cancel a booked event. Please contact talent first.');
  
  updateDoc(ref, {
    status: 'cancelled',
    updatedAt: serverTimestamp()
  }).catch(async (serverError) => {
    errorEmitter.emit('permission-error', new FirestorePermissionError({
      path: ref.path,
      operation: 'update'
    }));
  });
}
