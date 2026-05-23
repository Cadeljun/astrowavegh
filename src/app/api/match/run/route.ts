import { NextResponse } from 'next/server';
import { db } from '@/firebase';
import { 
  doc, 
  getDoc, 
  setDoc, 
  collection, 
  getDocs,
  query, 
  where, 
  Timestamp,
  serverTimestamp
} from 'firebase/firestore';
import { runMatchingEngine } from '@/lib/algorithms/matchEngine';
import type { 
  PlatformEvent,
  TalentProfile
} from '@/types/platform';

export async function POST(request: Request) {
  try {
    const { eventId } = await request.json();

    if (!eventId) {
      return NextResponse.json({ error: 'eventId required' }, { status: 400 });
    }

    // 1. Fetch the event brief
    const eventSnap = await getDoc(doc(db, 'platform_events', eventId));
    if (!eventSnap.exists()) {
      return NextResponse.json({ error: 'Event not found' }, { status: 404 });
    }
    const event = { id: eventSnap.id, ...eventSnap.data() } as PlatformEvent;

    // 2. Fetch all active talent profiles
    const talentsSnap = await getDocs(
      query(collection(db, 'talent_profiles'), where('active', '==', true))
    );
    const talents = talentsSnap.docs.map(d => ({ uid: d.id, ...d.data() })) as TalentProfile[];

    // 3. Execute matching algorithm
    const results = await runMatchingEngine(event, talents);

    // 4. Cache results in matches collection (expires in 24h)
    const expiresAt = new Date();
    expiresAt.setHours(expiresAt.getHours() + 24);

    await setDoc(doc(db, 'matches', eventId), {
      eventId,
      organizerId: event.organizerId,
      eventTitle: event.title,
      results: results.slice(0, 20), // Store top 20 candidates
      generatedAt: serverTimestamp(),
      expiresAt: Timestamp.fromDate(expiresAt),
      evaluatedCount: talents.length
    });

    // 5. Update event status to 'matched' and store top matches reference
    await setDoc(doc(db, 'platform_events', eventId), {
      matchedTalents: results.slice(0, 10).map(r => r.talentId),
      status: results.length > 0 ? 'matched' : 'open',
      updatedAt: serverTimestamp()
    }, { merge: true });

    return NextResponse.json({
      success: true,
      matchCount: results.length,
      topScore: results[0]?.matchPercentage || 0
    });

  } catch (error: any) {
    console.error('Match Engine Error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
