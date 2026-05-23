/**
 * @fileOverview The core AstroWave Talent Matching Engine.
 * Implements the Match % formula: Location (30) + Category (40) + Wave Score Contribution (30).
 */

import type { 
  TalentProfile, 
  PlatformEvent,
  MatchResult 
} from '@/types/platform';

export interface MatchBreakdown {
  matchPercentage: number;
  locationScore: number;
  locationReason: string;
  categoryScore: number;
  categoryReason: string;
  waveContribution: number;
  waveReason: string;
  explanation: string;
}

// ─── LOCATION SCORE ─────────────────
// Max 30 pts: Same City (30), Same Region (15), Different (0)

export function calculateLocationScore(
  talentCity: string,
  talentRegion: string,
  eventCity: string,
  eventRegion: string
): { score: number; reason: string } {
  const tCity = talentCity.toLowerCase().trim();
  const eCity = eventCity.toLowerCase().trim();
  const tRegion = talentRegion.toLowerCase().trim();
  const eRegion = eventRegion.toLowerCase().trim();

  if (tCity === eCity && tCity !== '') {
    return { 
      score: 30, 
      reason: `Same city (${talentCity})` 
    };
  }

  if (tRegion === eRegion && tRegion !== '') {
    return { 
      score: 15, 
      reason: `Same region (${talentRegion})` 
    };
  }

  return { 
    score: 0, 
    reason: 'Different location' 
  };
}

// ─── CATEGORY SCORE ─────────────────
// Max 40 pts: Exact match (40), No match (0)

export function calculateCategoryScore(
  talentCategory: string,
  requiredCategory: string
): { score: number; reason: string } {
  const match = talentCategory.toLowerCase() === requiredCategory.toLowerCase();

  return {
    score: match ? 40 : 0,
    reason: match
      ? `Exact match: ${talentCategory}`
      : `No match: ${talentCategory} vs ${requiredCategory}`
  };
}

// ─── WAVE SCORE CONTRIBUTION ────────
// Max 30 pts: (Talent Wave Score ÷ 5) × 30

export function calculateWaveContribution(
  waveScore: number
): { score: number; reason: string } {
  const contribution = parseFloat(((waveScore / 5) * 30).toFixed(2));
  return {
    score: contribution,
    reason: `(${waveScore} ÷ 5) × 30`
  };
}

// ─── FULL MATCH CALCULATION ─────────

export function calculateMatchPercentage(
  talent: TalentProfile,
  event: PlatformEvent
): MatchBreakdown {
  const location = calculateLocationScore(
    talent.city,
    talent.region || '',
    event.city,
    event.region || ''
  );

  const category = calculateCategoryScore(
    talent.category,
    event.talentCategory
  );

  const wave = calculateWaveContribution(
    talent.waveScore || 0
  );

  const matchPercentage = parseFloat(
    (location.score + category.score + wave.score).toFixed(1)
  );

  const explanation = [
    `Location: ${location.score}/30 — ${location.reason}`,
    `Category: ${category.score}/40 — ${category.reason}`,
    `Wave Score: ${wave.score.toFixed(1)}/30 — Wave Score ${talent.waveScore || 0}/5`,
    `Total: ${matchPercentage}%`
  ].join('\n');

  return {
    matchPercentage,
    locationScore: location.score,
    locationReason: location.reason,
    categoryScore: category.score,
    categoryReason: category.reason,
    waveContribution: wave.score,
    waveReason: wave.reason,
    explanation
  };
}

// ─── RUN FULL MATCHING FOR AN EVENT ──

export async function runMatchingEngine(
  event: PlatformEvent,
  allTalents: TalentProfile[]
): Promise<MatchResult[]> {
  // Only evaluate active and available talent
  const eligibleTalents = allTalents.filter(t => t.active && t.available);

  const results: MatchResult[] = eligibleTalents.map(talent => {
    const breakdown = calculateMatchPercentage(talent, event);

    return {
      talentId: talent.uid,
      talentName: talent.displayName,
      stageName: talent.stageName,
      photoURL: talent.photoURL,
      category: talent.category,
      city: talent.city,
      region: talent.region,
      waveScore: talent.waveScore,
      matchPercentage: breakdown.matchPercentage,
      locationScore: breakdown.locationScore,
      categoryScore: breakdown.categoryScore,
      waveScoreContribution: breakdown.waveContribution,
      basePrice: talent.basePrice,
      currency: talent.currency,
      available: talent.available,
      breakdown
    };
  });

  // Sort by match percentage (highest first)
  // Ties broken by Wave Score
  results.sort((a, b) => {
    if (b.matchPercentage !== a.matchPercentage) {
      return b.matchPercentage - a.matchPercentage;
    }
    return (b.waveScore || 0) - (a.waveScore || 0);
  });

  return results;
}
