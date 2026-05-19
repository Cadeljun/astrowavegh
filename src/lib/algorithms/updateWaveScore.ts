import { db } from '@/firebase';
import { 
  doc, 
  getDoc, 
  updateDoc, 
  collection, 
  query, 
  where, 
  getDocs, 
  serverTimestamp,
  increment,
  Timestamp
} from 'firebase/firestore';
import { calculateWaveScore } from './waveScore';

/**
 * Recalculates a talent's Wave Score based on their current ratings and activity.
 */
export async function updateTalentWaveScore(talentId: string): Promise<number> {
  // 1. Get all ratings for this talent
  const ratingsQuery = query(
    collection(db, 'bookings'),
    where('talentId', '==', talentId),
    where('rating', '>', 0)
  );
  
  const ratingsSnap = await getDocs(ratingsQuery);
  const ratings = ratingsSnap.docs.map(d => d.data());
  
  // 2. Calculate average rating
  const ratingCount = ratings.length;
  const averageRating = ratingCount > 0
    ? ratings.reduce((sum, r) => sum + (r.rating || 0), 0) / ratingCount
    : 0;

  // 3. Get profile for event count and recency
  const profileSnap = await getDoc(doc(db, 'talent_profiles', talentId));
  if (!profileSnap.exists()) return 0;
  
  const profile = profileSnap.data();
  
  // 4. Run calculation
  const breakdown = calculateWaveScore(
    averageRating,
    profile.eventCount || 0,
    profile.lastEventDate || null
  );

  // 5. Update profile
  await updateDoc(doc(db, 'talent_profiles', talentId), {
    waveScore: breakdown.waveScore,
    averageRating: parseFloat(averageRating.toFixed(2)),
    ratingCount: ratingCount,
    recencyFactor: breakdown.recencyFactor,
    updatedAt: serverTimestamp()
  });

  return breakdown.waveScore;
}

/**
 * Specialized helper to update recency and volume when an event is finished.
 */
export async function recordCompletedEvent(talentId: string, eventDate: Timestamp): Promise<void> {
  const talentRef = doc(db, 'talent_profiles', talentId);
  const talentSnap = await getDoc(talentRef);
  
  if (!talentSnap.exists()) return;
  const talent = talentSnap.data();

  // Increment volume
  const newEventCount = (talent.eventCount || 0) + 1;
  
  // Recalculate score with new date and count
  const breakdown = calculateWaveScore(
    talent.averageRating || 0,
    newEventCount,
    eventDate
  );

  await updateDoc(talentRef, {
    eventCount: newEventCount,
    completedBookings: increment(1),
    lastEventDate: eventDate,
    recencyFactor: breakdown.recencyFactor,
    waveScore: breakdown.waveScore,
    updatedAt: serverTimestamp()
  });
}
