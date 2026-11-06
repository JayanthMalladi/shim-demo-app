import { generateText, isStepCount } from 'ai';

declare const model: any;
declare const tools: any;

// Keep v6 semantics: bill only the FINAL step's usage. In AI SDK 7, `result.usage`
// is the TOTAL across all steps, so `tsc` would not catch the over-count.
export function tokensToBill(result: Awaited<ReturnType<typeof generateText>>) {
  return result.finalStep.usage.totalTokens;
}

export async function invoice(prompt: string) {
  // Multi-step call (tool loop up to 3 steps): where the over-count bites.
  const result = await generateText({ model, tools, prompt, stopWhen: isStepCount(3) });
  return { charged: tokensToBill(result), text: result.text };
}
