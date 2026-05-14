'use server';
/**
 * @fileOverview A Genkit flow for recommending AstroWave content (events, music, artists) 
 * based on a user's current mood or desired vibe.
 *
 * - getUserVibeRecommendation - A function to get personalized recommendations.
 * - UserVibeInput - The input type for the getUserVibeRecommendation function.
 * - UserVibeOutput - The return type for the getUserVibeRecommendation function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const UserVibeInputSchema = z.object({
  moodOrVibe: z
    .string()
    .describe('The user\u0027s current mood or desired vibe (e.g., "chill", "energetic", "reflective").'),
});
export type UserVibeInput = z.infer<typeof UserVibeInputSchema>;

const UserVibeOutputSchema = z.object({
  events: z
    .array(
      z.object({
        name: z.string().describe('The name of the AstroWave event.'),
        description: z.string().describe('A brief description of the event.'),
        category: z.string().describe('The category of the event (e.g., "Party", "Concert", "Nightlife").'),
        vibeMatchScore: z
          .number()
          .min(0)
          .max(100)
          .describe('A score from 0 to 100 indicating how well this event matches the requested vibe.'),
      })
    )
    .describe('Recommended AstroWave events that match the user\u0027s vibe.'),
  music: z
    .array(
      z.object({
        title: z.string().describe('The title of the music track or album.'),
        artist: z.string().describe('The artist who created the music.'),
        genre: z.string().describe('The genre of the music (e.g., "Afrobeats", "Amapiano", "Hip-hop").'),
        vibeMatchScore: z
          .number()
          .min(0)
          .max(100)
          .describe('A score from 0 to 100 indicating how well this music matches the requested vibe.'),
      })
    )
    .describe('Recommended music or genres that match the user\u0027s vibe.'),
  artists: z
    .array(
      z.object({
        name: z.string().describe('The name of the AstroWave artist or DJ.'),
        role: z.string().describe('The role of the artist (e.g., "DJ", "Artist", "Producer").'),
        description: z.string().describe('A brief description of the artist\u0027s style or contributions.'),
        vibeMatchScore: z
          .number()
          .min(0)
          .max(100)
          .describe('A score from 0 to 100 indicating how well this artist matches the requested vibe.'),
      })
    )
    .describe('Recommended AstroWave artists or DJs that match the user\u0027s vibe.'),
});
export type UserVibeOutput = z.infer<typeof UserVibeOutputSchema>;

export async function getUserVibeRecommendation(input: UserVibeInput): Promise<UserVibeOutput> {
  return userVibeRecommendationFlow(input);
}

const prompt = ai.definePrompt({
  name: 'userVibeRecommendationPrompt',
  input: { schema: UserVibeInputSchema },
  output: { schema: UserVibeOutputSchema },
  prompt: `You are an AI assistant for AstroWave, a Ghanaian entertainment powerhouse. 
Your goal is to recommend AstroWave events, music, and artists based on a user's desired vibe.

The user's desired vibe is: "{{{moodOrVibe}}}"

Generate recommendations in the following JSON format. For each recommendation, provide a 'vibeMatchScore' (0-100) indicating how well it aligns with the user's vibe.

Here's some context about AstroWave to help you formulate recommendations:
- AstroWave Events: Known for immersive parties, concerts, and nightlife experiences like 'Mask Mirage' (mysterious, exclusive, vibrant) and 'Splash and Seduction All Day Party' (energetic, social, summery).
- AstroWave Management: Manages DJs and artists who often play Afrobeats, Amapiano, Hip-hop, and R&B, contributing to Ghana's vibrant music scene.
- AstroWave Records & Cares: These divisions are coming soon, so focus recommendations on existing events and managed artists, but you can suggest music styles or potential future artists that fit the vibe.

Provide 1-3 recommendations for each category (events, music, artists) that best fit the vibe requested.`,
});

const userVibeRecommendationFlow = ai.defineFlow(
  {
    name: 'userVibeRecommendationFlow',
    inputSchema: UserVibeInputSchema,
    outputSchema: UserVibeOutputSchema,
  },
  async (input) => {
    const { output } = await prompt(input);
    return output!;
  }
);
