/**
 * @fileOverview The core Wave Score algorithm for AstroWave.
 * WS = [(Rating / 5) * 0.6] + [Min(Events / 20, 1) * 0.2] + (RecencyFactor * 0.2) * 5
 */

export function calculateWaveScore(
  avgRating: number,
  totalEvents: number,
  lastEventDate: Date | null
): number {
  // 1. Rating Component (60%)
  const ratingFactor = (avgRating / 5) * 0.6;

  // 2. Volume Component (20%) - Caps at 20 events for full score
  const volumeFactor = Math.min(totalEvents / 20, 1) * 0.2;

  // 3. Recency Component (20%)
  let recencyFactor = 0.2; // Default lowest
  if (lastEventDate) {
    const now = new Date();
    const daysSince = Math.floor((now.getTime() - lastEventDate.getTime()) / (1000 * 60 * 60 * 24));
    
    if (daysSince <= 30) recencyFactor = 1.0;
    else if (daysSince <= 60) recencyFactor = 0.8;
    else if (daysSince <= 90) recencyFactor = 0.5;
  }
  const recencyWeighted = recencyFactor * 0.2;

  // Final Wave Score (0.0 - 5.0)
  const score = (ratingFactor + volumeFactor + recencyWeighted) * 5;
  return parseFloat(score.toFixed(2));
}

export function getWaveRank(score: number): { label: string; emoji: string; color: string } {
  if (score >= 4.5) return { label: 'Wave Master', emoji: '🌊', color: '#00FF87' };
  if (score >= 4.0) return { label: 'Rising Star', emoji: '⭐', color: '#A855F7' };
  if (score >= 3.0) return { label: 'Performer', emoji: '🎵', color: '#0EA5E9' };
  return { label: 'Newcomer', emoji: '🌱', color: '#6B8CAE' };
}