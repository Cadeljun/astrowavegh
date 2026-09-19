import { TalentProfile, PlatformEvent } from '@/types/platform'

export interface MatchResult {
  talentId: string
  stageName: string
  matchPercentage: number
  locationScore: number
  categoryScore: number
  waveContribution: number
  explanation: string
}

export function calculateMatchPercentage(
  talent: TalentProfile,
  event: Pick<PlatformEvent, 'city' | 'region' | 'talentCategory'>
): MatchResult {
  const locationScore = talent.city === event.city ? 30 : talent.region === event.region ? 15 : 0
  const categoryScore = talent.category === event.talentCategory ? 40 : 0
  const waveContribution = Math.max(0, Math.min(5, talent.waveScore || 0)) * 6
  const matchPercentage = Math.min(Math.round(locationScore + categoryScore + waveContribution), 100)
  const reasons = [
    locationScore === 30 ? 'same city' : locationScore === 15 ? 'same region' : 'different location',
    categoryScore ? 'category match' : 'different category',
    `wave score ${Number(talent.waveScore || 0).toFixed(1)}/5`,
  ]

  return {
    talentId: talent.uid,
    stageName: talent.stageName || talent.displayName || 'Unnamed talent',
    matchPercentage,
    locationScore,
    categoryScore,
    waveContribution,
    explanation: reasons.join(' · '),
  }
}

export async function runMatchingEngine(event: PlatformEvent, talents: TalentProfile[]): Promise<MatchResult[]> {
  return talents
    .map((talent) => calculateMatchPercentage(talent, event))
    .sort((a, b) => b.matchPercentage - a.matchPercentage)
}
