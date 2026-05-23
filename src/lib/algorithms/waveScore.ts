import { Timestamp } from 'firebase/firestore';

/**
 * @fileOverview The core Wave Score algorithm for the AstroWave platform.
 * Evaluates talent based on Rating (60%), Experience (20%), and Recency (20%).
 */

export function calculateRecencyFactor(lastEventDate: Timestamp | Date | null): number {
  if (!lastEventDate) return 0.2; // No events = lowest recency

  const lastDate = lastEventDate instanceof Timestamp ? lastEventDate.toDate() : lastEventDate;
  const now = new Date();
  const daysDiff = Math.floor((now.getTime() - lastDate.getTime()) / (1000 * 60 * 60 * 24));

  if (daysDiff <= 30) return 1.0;
  if (daysDiff <= 60) return 0.8;
  if (daysDiff <= 90) return 0.5;
  return 0.2;
}

export interface WaveScoreBreakdown {
  waveScore: number;
  averageRating: number;
  ratingComponent: number;
  eventCount: number;
  experienceComponent: number;
  recencyFactor: number;
  recencyComponent: number;
  recencyLabel: string;
  formula: string;
}

export function calculateWaveScore(
  averageRating: number,
  eventCount: number,
  lastEventDate: Timestamp | Date | null
): WaveScoreBreakdown {
  const recencyFactor = calculateRecencyFactor(lastEventDate);

  // Component calculations (scaled to a 5.0 max score)
  // Rating: 60% weight (max 3.0 pts)
  const ratingComponent = (averageRating / 5) * 0.6;
  
  // Experience: 20% weight (max 1.0 pts, caps at 20 events)
  const experienceComponent = Math.min(eventCount / 20, 1) * 0.2;
  
  // Recency: 20% weight (max 1.0 pts)
  const recencyComponent = recencyFactor * 0.2;

  // Final Score (0.0 - 5.0)
  const rawScore = (ratingComponent + experienceComponent + recencyComponent) * 5;
  const waveScore = parseFloat(rawScore.toFixed(2));

  const recencyLabel = 
    recencyFactor === 1.0 ? 'Active in last 30 days' :
    recencyFactor === 0.8 ? 'Active in last 31-60 days' :
    recencyFactor === 0.5 ? 'Active in last 61-90 days' :
    'Inactive 90+ days';

  const formula = `[(${averageRating}÷5)×0.6] + [Min(${eventCount}÷20,1)×0.2] + (${recencyFactor}×0.2) × 5`;

  return {
    waveScore,
    averageRating,
    ratingComponent: parseFloat((ratingComponent * 5).toFixed(2)),
    eventCount,
    experienceComponent: parseFloat((experienceComponent * 5).toFixed(2)),
    recencyFactor,
    recencyComponent: parseFloat((recencyComponent * 5).toFixed(2)),
    recencyLabel,
    formula
  };
}

export function getWaveRank(waveScore: number): { label: string; emoji: string; color: string } {
  if (waveScore >= 4.5) return { label: 'Wave Master', emoji: '🌊', color: '#FFD166' };
  if (waveScore >= 4.0) return { label: 'Rising Star', emoji: '⭐', color: '#A855F7' };
  if (waveScore >= 3.0) return { label: 'Performer', emoji: '🎵', color: '#06B6D4' };
  if (waveScore >= 2.0) return { label: 'Newcomer', emoji: '🎤', color: '#7B7B9A' };
  return { label: 'Just Started', emoji: '🌱', color: '#7B7B9A' };
}
