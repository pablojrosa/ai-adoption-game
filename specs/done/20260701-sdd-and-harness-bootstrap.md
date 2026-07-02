# SDD And Harness Bootstrap

## Summary

Introduce a lightweight spec-driven workflow and a small automated harness for the current browser game.

## Problem

The repo had gameplay code but no explicit spec workflow and no repeatable automated harness around the main rules and UI behavior.

## Scope

- In scope:
  - Minimal `specs/` workflow
  - Validation scripts for spec files
  - Unit tests for `src/game.ts`
  - UI harness tests for `src/App.tsx`
- Out of scope:
  - End-to-end browser automation
  - Server-side test coverage
  - Gameplay redesign

## Requirements

- Add a simple place to write feature specs before coding.
- Make the workflow runnable from npm scripts.
- Add a lightweight harness that covers game rules and basic UI flows.
- Keep the implementation small enough for an interview codebase.

## Acceptance Criteria

- [x] `npm run spec:new -- <name>` creates a spec in `specs/active/`.
- [x] `npm run spec:check` validates the scaffold and active specs.
- [x] `npm test` runs unit and UI harness tests.
- [x] The harness covers movement/rule helpers plus keyboard and fetch-driven UI flows.

## Implementation Notes

- Use markdown specs rather than adding a process-heavy tool.
- Use Vitest and Testing Library because they fit the existing Vite app with minimal configuration.
- Keep the gameplay implementation unchanged unless the harness exposes a real defect.

## Test Plan

- Manual:
  - Start both modes in the browser and confirm existing gameplay still works.
- Build/typecheck:
  - `npm run spec:check`
  - `npm test`
  - `npm run build`

## Risks / Open Questions

- The UI harness mocks `fetch` and randomness, so it validates the app contract rather than the live server.
- Interval-driven end-state coverage is not included in this first pass because it became brittle under React timer testing; that should be the next harness improvement if deeper coverage is needed.
- If the project grows, it may need a second layer of integration or E2E coverage later.
