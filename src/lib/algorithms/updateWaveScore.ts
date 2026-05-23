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
import { calculateWaveScore, calculateRecencyFactor } from './waveScore';

/**
 * Recalculates a talent's Wave Score based on their current ratings and activity.
 */
export async function updateTalentWaveScore(talentId: string): Promise<void> {
  // 1. Get all ratings for this talent
  const ratingsQuery = query(
    collection(db, 'ratings'),
    where('talentId', '==', talentId)
  );
  
  const ratingsSnap = await getDocs(ratingsQuery);
  const ratings = ratingsSnap.docs.map(d => d.data());
  
  // 2. Calculate new average rating
  const ratingCount = ratings.length;
  const averageRating = ratingCount > 0
    ? parseFloat((ratings.reduce((sum, r) => sum + (r.averageScore || r.overall || 0), 0) / ratingCount).toFixed(2))
    : 0;

  // 3. Get talent profile for event count and last event date
  const talentRef = doc(db, 'talent_profiles', talentId);
  const talentSnap = await getDoc(talentRef);
  
  if (!talentSnap.exists()) return;
  const talent = talentSnap.data();
  
  // 4. Calculate new Wave Score
  const breakdown = calculateWaveScore(
    averageRating,
    talent.eventCount || 0,
    talent.lastEventDate || null
  );

  // 5. Update talent profile
  await updateDoc(talentRef, {
    waveScore: breakdown.waveScore,
    averageRating: breakdown.averageRating,
    ratingCount: ratingCount,
    recencyFactor: breakdown.recencyFactor,
    updatedAt: serverTimestamp()
  });

  console.log(`Wave Score updated for ${talentId}:`, breakdown.waveScore);
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
