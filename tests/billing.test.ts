import { describe, expect, it } from 'vitest';
import { generateText, stepCountIs, tool, jsonSchema } from 'ai';
import { MockLanguageModelV3 } from 'ai/test';
import { tokensToBill } from '../src/billing.js';

// No real model: the whole 2-step tool loop is driven by MockLanguageModelV3,
// which cycles through the two canned doGenerate results by call count.
const step1 = {
  content: [{ type: 'tool-call', toolCallId: 'call_1', toolName: 'echo', input: { text: 'hi' } }],
  finishReason: 'tool-calls' as const,
  usage: {
    inputTokens: { total: 10, noCache: 0, cacheRead: 0, cacheWrite: 0 },
    outputTokens: { total: 1, text: 1, reasoning: 0 },
  },
  response: { modelId: 'mock' },
  warnings: [],
};
const step2 = {
  content: [{ type: 'text', text: 'hi there' }],
  finishReason: 'stop' as const,
  usage: {
    inputTokens: { total: 15, noCache: 0, cacheRead: 0, cacheWrite: 0 },
    outputTokens: { total: 6, text: 6, reasoning: 0 },
  },
  response: { modelId: 'mock' },
};

const model = new MockLanguageModelV3({ doGenerate: [step1, step2] });

const tools = {
  echo: tool<{ text: string }, string>({
    inputSchema: jsonSchema({ type: 'object', properties: { text: { type: 'string' } } }),
    execute: async ({ text }: { text: string }) => `echoed: ${text}`,
  }),
};

async function run() {
  return generateText({
    model,
    tools,
    stopWhen: stepCountIs(2),
    prompt: 'say hi',
  });
}

describe('tokensToBill', () => {
  it('returns the FINAL step tokens, not the total, in a 2-step tool loop (v6 behavior)', async () => {
    const result = await run();
    // Two distinct steps prove the loop actually ran and the counts differ.
    expect(result.steps).toHaveLength(2);
    expect(result.steps[0].usage.totalTokens).toBe(11);
    expect(result.steps[1].usage.totalTokens).toBe(21);
    // v6: result.usage is the final step's usage (21), not the sum (32).
    expect(tokensToBill(result)).toBe(21);
  });
});
