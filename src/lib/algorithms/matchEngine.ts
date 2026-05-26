/**
 * @fileOverview Vibe Sync Algorithm for AstroWave.
 * Match % = Location (30%) + Category (40%) + Wave Score (30%)
 */

import { TalentProfile, PlatformEvent } from '@/types/platform';

export function calculateMatchPercentage(
  talent: TalentProfile,
  event: PlatformEvent
): { percentage: number; breakdown: any } {
  // 1. Location Score (Max 30)
  let locationScore = 0;
  if (talent.city === event.city) locationScore = 30;
  else if (talent.region === event.region) locationScore = 15;

  // 2. Category Score (Max 40)
  let categoryScore = 0;
  if (talent.category === event.talentCategory) categoryScore = 40;

  // 3. Wave Score Contribution (Max 30)
  const waveContribution = (talent.waveScore / 5) * 30;

  const total = locationScore + categoryScore + waveContribution;

  return {
    percentage: Math.min(Math.round(total), 100),
    breakdown: {
      location: locationScore,
      category: categoryScore,
      wave: waveContribution
    }
  };
}