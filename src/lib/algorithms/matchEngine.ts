/**
 * @fileOverview The core AstroWave Talent Matching Engine.
 * Calculates match percentages based on Location, Category, and Wave Score.
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
// Max 30 pts: Same City (30), Same Region (15), Other (0)

export function calculateLocationScore(
  talentCity: string,
  talentRegion: string,
  eventCity: string,
  eventRegion: string
): { score: number; reason: string } {
  const talentCityNorm = talentCity?.toLowerCase().trim() || '';
  const eventCityNorm = eventCity?.toLowerCase().trim() || '';
  const talentRegionNorm = talentRegion?.toLowerCase().trim() || '';
  const eventRegionNorm = eventRegion?.toLowerCase().trim() || '';

  if (talentCityNorm && talentCityNorm === eventCityNorm) {
    return { 
      score: 30, 
      reason: `Same city (${talentCity})` 
    };
  }

  if (talentRegionNorm && talentRegionNorm === eventRegionNorm) {
    return { 
      score: 15, 
      reason: `Same region (${talentRegion})` 
    };
  }

  return { 
    score: 0, 
    reason: 'Outside primary location' 
  };
}

// ─── CATEGORY SCORE ─────────────────
// Max 40 pts: Exact match (40), No match (0)

export function calculateCategoryScore(
  talentCategory: string,
  requiredCategory: string
): { score: number; reason: string } {
  const match = talentCategory?.toLowerCase() === requiredCategory?.toLowerCase();

  return {
    score: match ? 40 : 0,
    reason: match
      ? `Exact category match: ${talentCategory}`
      : `Specialty mismatch (${talentCategory} vs ${requiredCategory})`
  };
}

// ─── WAVE SCORE CONTRIBUTION ────────
// Max 30 pts: (Wave Score / 5) * 30

export function calculateWaveContribution(
  waveScore: number
): { score: number; reason: string } {
  const contribution = parseFloat(((waveScore / 5) * 30).toFixed(2));
  return {
    score: contribution,
    reason: `Wave Performance: ${waveScore}/5.0`
  };
}

// ─── FULL MATCH CALCULATION ─────────

export function calculateMatchPercentage(
  talent: TalentProfile,
  event: PlatformEvent
): MatchBreakdown {
  const location = calculateLocationScore(
    talent.city,
    talent.region,
    event.city,
    event.region
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
    `Wave Score: ${wave.score.toFixed(1)}/30 — ${wave.reason}`,
    `Total Sync: ${matchPercentage}%`
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
      waveScore: talent.waveScore,
      matchPercentage: breakdown.matchPercentage,
      locationScore: breakdown.locationScore,
      categoryScore: breakdown.categoryScore,
      waveScoreContribution: breakdown.waveContribution,
      basePrice: talent.basePrice,
      currency: talent.currency,
      available: talent.available,
      // Store breakdown for UI rendering
      explanation: breakdown.explanation
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
