# shim-demo-app

Demo target for Shim Desk. This small app sits on Vercel AI SDK 6 and is seeded
with the kinds of findings — break, silent, and manual — that a real
`ai` 6 → 7 upgrade would surface. Run `npm install --ignore-scripts`, then
`npm run typecheck` and `npm test`.

## Gates

- **Typecheck (`npm run typecheck`)** is scoped to the v6-valid modules
  (`src/billing.ts`, `src/messages.ts`). The other seeded files
  (`src/agent.ts`, `src/tools.ts`, `src/typed.ts`) are deliberately
  written against the AI SDK 7 type surface — that is exactly what makes
  them Scanner findings — so they do not typecheck on any `ai@6` release.
  On the current `ai@^6.0.0` (6.0.323), typechecking the whole `src/`
  reports ~17 errors, all in those three files. That is the expected
  "v7-shaped code" state, not a baseline failure.
- **Test (`npm test`)** runs a real 2-step tool loop through
  `MockLanguageModelV3` from `ai/test` — no real model is called. It
  asserts that `tokensToBill` (`src/billing.ts`, the seeded silent
  over-count) returns the final step's tokens, the v6 behavior. A naive
  `ai` 6 → 7 upgrade keeps the types green but breaks this value, which
  is the proof the fix preserved behavior.

## CI

`.github/workflows/ci.yml` runs both gates on Node 22.
