import { describe, expect, it } from 'vitest';

// P4 import-smoke: evaluating these modules is the point. A broken named import
// (e.g. registerTelemetry pulled from the wrong package) throws at link time, so
// the gate now actually loads agent.ts and typed.ts instead of only billing.ts.
import { streaming } from '../src/agent.js';
import { viaResultType, tracked } from '../src/typed.js';

describe('import-smoke', () => {
  it('links the agent/typed modules and exposes their exports', () => {
    expect(typeof streaming).toBe('function');
    expect(typeof viaResultType).toBe('function');
    expect(typeof tracked).toBe('function');
  });
});
