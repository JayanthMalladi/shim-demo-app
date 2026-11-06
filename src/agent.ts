import { generateText, streamText, isStepCount, registerTelemetry } from 'ai';
import * as ai from 'ai';
import { OpenTelemetry } from '@ai-sdk/otel';

registerTelemetry(new OpenTelemetry());

declare const model: any;
declare const tools: any;
declare function bill(n: number): void;

export async function multiStep() {
  const result = await generateText({
    model,
    tools,
    stopWhen: isStepCount(5),
    onFinish(event) {
      bill(event.finalStep.usage.totalTokens);
    },
  });
  bill(result.finalStep.usage.totalTokens);
  const calls = result.finalStep.toolCalls;
  const history = result.finalStep.response.messages;
  const total = result.usage;
  return { calls, history, total };
}

export async function singleStep() {
  // Single step: usage means the same thing in v6 and v7. Must not be flagged.
  const result = await generateText({ model, prompt: 'hi' });
  return result.usage;
}

export async function destructured() {
  const result = await ai.generateText({ model, stopWhen: isStepCount(3) });
  return { usage: result.finalStep.usage, text: result.text };
}

export async function streaming() {
  const result = streamText({
    model,
    stopWhen: isStepCount(2),
    messages: [
      { role: 'system', content: 'You are terse.' },
      { role: 'user', content: 'Hello' },
    ],
    allowSystemInMessages: true,
  });
  return (await result.finalStep).toolCalls;
}

export async function spreadOptions(opts: { stopWhen?: any }) {
  // Options come from a spread, so the call may be multi-step: flag for the agent, never rewrite.
  const result = await generateText({ model, ...opts, allowSystemInMessages: true });
  return result.finalStep.toolCalls;
}

declare const billing: { totalUsage: number };
export function ownTotalUsage() {
  // The repo's own field, not an AI SDK result: must not be flagged or rewritten.
  return billing.totalUsage;
}

export function conditionalSpreads(system?: string) {
  // Spreads of inline literals are transparent: no stopWhen, so single step. Must not be flagged.
  const result = streamText({ model, ...(system ? { system } : {}), ...{ maxRetries: 2 } });
  return result.toolCalls;
}
