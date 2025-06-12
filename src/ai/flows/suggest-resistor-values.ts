// src/ai/flows/suggest-resistor-values.ts
'use server';
/**
 * @fileOverview Uses AI to suggest possible resistor values if the user-entered value is unlikely to exist in real-world resistors.
 *
 * - suggestResistorValues - A function that suggests possible resistor values.
 * - SuggestResistorValuesInput - The input type for the suggestResistorValues function.
 * - SuggestResistorValuesOutput - The return type for the suggestResistorValues function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const SuggestResistorValuesInputSchema = z.object({
  resistance: z
    .number()
    .describe('The resistance value entered by the user.'),
});
export type SuggestResistorValuesInput = z.infer<typeof SuggestResistorValuesInputSchema>;

const SuggestResistorValuesOutputSchema = z.object({
  suggestion: z.string().describe('A suggestion for a valid resistor value and which band to modify.'),
});
export type SuggestResistorValuesOutput = z.infer<typeof SuggestResistorValuesOutputSchema>;

export async function suggestResistorValues(input: SuggestResistorValuesInput): Promise<SuggestResistorValuesOutput> {
  return suggestResistorValuesFlow(input);
}

const prompt = ai.definePrompt({
  name: 'suggestResistorValuesPrompt',
  input: {schema: SuggestResistorValuesInputSchema},
  output: {schema: SuggestResistorValuesOutputSchema},
  prompt: `You are an expert in electronics and resistor values.

  The user has entered a resistance value of {{resistance}} ohms. Determine if this value is likely to exist in real-world resistors.
  If the value is unlikely to exist, provide a suggestion for a valid resistor value that is close to the user's input.
  Explain which band should be modified and by how much to achieve a valid resistor configuration.
  Be as specific as possible.
  `,
});

const suggestResistorValuesFlow = ai.defineFlow(
  {
    name: 'suggestResistorValuesFlow',
    inputSchema: SuggestResistorValuesInputSchema,
    outputSchema: SuggestResistorValuesOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
