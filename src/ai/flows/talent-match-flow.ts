'use server';
/**
 * @fileOverview A Genkit flow for matching event organizers with the most relevant talent.
 *
 * - calculateTalentMatch - A function that ranks talent based on event vibe.
 * - TalentMatchInput - Input containing event details and available roster.
 * - TalentMatchOutput - A ranked list of talent with match scores and reasoning.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const TalentMatchInputSchema = z.object({
  event: z.object({
    name: z.string(),
    description: z.string(),
    category: z.string(),
    venue: z.string(),
  }),
  roster: z.array(z.object({
    id: z.string(),
    name: z.string(),
    stageName: z.string(),
    role: z.string(),
    bio: z.string(),
  })),
});
export type TalentMatchInput = z.infer<typeof TalentMatchInputSchema>;

const TalentMatchOutputSchema = z.object({
  matches: z.array(z.object({
    talentId: z.string(),
    matchPercentage: z.number().min(0).max(100),
    waveScore: z.number().describe('A score from 1-10 representing the energy synergy.'),
    reasoning: z.string().describe('Why this artist is a good fit for this specific event.'),
  })),
});
export type TalentMatchOutput = z.infer<typeof TalentMatchOutputSchema>;

export async function calculateTalentMatch(input: TalentMatchInput): Promise<TalentMatchOutput> {
  return talentMatchFlow(input);
}

const prompt = ai.definePrompt({
  name: 'talentMatchPrompt',
  input: { schema: TalentMatchInputSchema },
  output: { schema: TalentMatchOutputSchema },
  prompt: `You are the AstroWave Matching Engine, an expert at pairing event organizers with creative talent in Ghana.

Event Details:
- Name: {{{event.name}}}
- Category: {{{event.category}}}
- Description: {{{event.description}}}
- Venue: {{{event.venue}}}

Available Talent Roster:
{{#each roster}}
- [ID: {{id}}] {{stageName}} ({{role}}): {{bio}}
{{/each}}

Analyze the event's "vibe" and compare it to each artist's role and bio. 
1. Calculate a matchPercentage (0-100) based on role relevance and energy synergy.
2. Assign a waveScore (1-10) representing how much "AstroWave energy" this artist brings to this specific event.
3. Provide a brief, professional 'reasoning' (1-2 sentences) for the recommendation.

Return the matches sorted by matchPercentage descending.`,
});

const talentMatchFlow = ai.defineFlow(
  {
    name: 'talentMatchFlow',
    inputSchema: TalentMatchInputSchema,
    outputSchema: TalentMatchOutputSchema,
  },
  async (input) => {
    const { output } = await prompt(input);
    return output!;
  }
);
