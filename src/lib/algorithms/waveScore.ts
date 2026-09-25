export interface WaveScoreBreakdown {
  waveScore: number
  averageRating: number
  ratingComponent: number
  experienceComponent: number
  recencyComponent: number
  recencyFactor: number
  recencyLabel: string
  formula: string
}

type DateLike = Date | { toDate: () => Date }

export function calculateRecencyFactor(lastEventDate: DateLike | null) {
  if (!lastEventDate) return { factor: 0.2, label: 'No recent event' }
  const date = lastEventDate instanceof Date ? lastEventDate : lastEventDate.toDate()
  const daysSince = Math.max(0, Math.floor((Date.now() - date.getTime()) / (1000 * 60 * 60 * 24)))
  if (daysSince <= 30) return { factor: 1, label: 'Active in the last 30 days' }
  if (daysSince <= 60) return { factor: 0.8, label: 'Active in the last 60 days' }
  if (daysSince <= 90) return { factor: 0.5, label: 'Active in the last 90 days' }
  return { factor: 0.2, label: 'More than 90 days since last event' }
}

export function calculateWaveScore(
  avgRating: number,
  totalEvents: number,
  lastEventDate: DateLike | null
): WaveScoreBreakdown {
  const averageRating = Math.max(0, Math.min(5, Number(avgRating) || 0))
  const ratingComponent = (averageRating / 5) * 3
  const experienceComponent = Math.min(Math.max(totalEvents, 0) / 20, 1)
  const recency = calculateRecencyFactor(lastEventDate)
  const recencyComponent = recency.factor
  const waveScore = Number((ratingComponent + experienceComponent + recencyComponent).toFixed(2))

  return {
    waveScore,
    averageRating,
    ratingComponent,
    experienceComponent,
    recencyComponent,
    recencyFactor: recency.factor,
    recencyLabel: recency.label,
    formula: '(Rating / 5 × 3) + (Min(Events / 20, 1) × 1) + (Recency × 1)',
  }
}

export function getWaveRank(score: number): { label: string; emoji: string; color: string } {
  if (score >= 4.5) return { label: 'Wave Master', emoji: '🌊', color: '#00FF87' }
  if (score >= 4.0) return { label: 'Rising Star', emoji: '⭐', color: '#A855F7' }
  if (score >= 3.0) return { label: 'Performer', emoji: '🎵', color: '#0EA5E9' }
  return { label: 'Newcomer', emoji: '🌱', color: '#6B8CAE' }
}
