import { generateText, stepCountIs } from 'ai';

declare const model: any;
declare const tools: any;

// Seeded silent break: `result.usage` is the FINAL step's usage in AI SDK 6,
// but becomes the TOTAL across all steps in AI SDK 7. This over-counts tokens
// in a multi-step run, and `tsc` will not catch it.
export function tokensToBill(result: Awaited<ReturnType<typeof generateText>>) {
  return result.usage.totalTokens;
}

export async function invoice(prompt: string) {
  // Multi-step call (tool loop up to 3 steps): where the over-count bites.
  const result = await generateText({ model, tools, prompt, stopWhen: stepCountIs(3) });
  return { charged: tokensToBill(result), text: result.text };
}
