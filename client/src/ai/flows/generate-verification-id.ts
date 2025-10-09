'use server';

/**
 * @fileOverview Verification ID generation flow.
 *
 * - generateVerificationId - Generates a unique verification ID.
 * - GenerateVerificationIdInput - The input type for the generateVerificationId function.
 * - GenerateVerificationIdOutput - The return type for the generateVerificationId function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';
import { v4 as uuidv4 } from 'uuid';

const GenerateVerificationIdInputSchema = z.object({
  reportCardMetadata: z.string().describe('Report card metadata to create a unique ID based on it.'),
});
export type GenerateVerificationIdInput = z.infer<typeof GenerateVerificationIdInputSchema>;

const GenerateVerificationIdOutputSchema = z.object({
  verificationId: z.string().describe('The generated unique verification ID.'),
});
export type GenerateVerificationIdOutput = z.infer<typeof GenerateVerificationIdOutputSchema>;

export async function generateVerificationId(input: GenerateVerificationIdInput): Promise<GenerateVerificationIdOutput> {
  return generateVerificationIdFlow(input);
}

const generateVerificationIdFlow = ai.defineFlow(
  {
    name: 'generateVerificationIdFlow',
    inputSchema: GenerateVerificationIdInputSchema,
    outputSchema: GenerateVerificationIdOutputSchema,
  },
  async input => {
    // Generate a UUID (v4) for the verification ID.
    const verificationId = uuidv4();
    return { verificationId };
  }
);
