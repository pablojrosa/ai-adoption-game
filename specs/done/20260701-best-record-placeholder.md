# Best Record Placeholder

## Status

- State: `done`
- Owner: Codex
- Last updated: 2026-07-01

## Summary

Simplify the empty-state best-record label so the status card uses a compact placeholder instead of a longer sentence.

## Problem

When no record exists yet, the best-record display uses `No record yet`, which is verbose in the compact status UI.

## Scope

- In scope:
  - update the empty best-record display text
  - record and validate the change
- Out of scope:
  - gameplay changes
  - record persistence logic
  - broader UI copy revisions

## Changed Files

- Expected:
  - `src/App.tsx`
  - `specs/done/20260701-best-record-placeholder.md`
- Updated during implementation:
  - `src/App.tsx`
  - `specs/done/20260701-best-record-placeholder.md`

## Requirements

- The empty best-record value should use a short placeholder.
- Existing record formatting should remain unchanged for real values.

## Acceptance Criteria

- [x] When no best record exists, the status card shows `-`.
- [x] Time and coin record values still render as before when present.

## Implementation Notes

- Keep the change isolated to the existing formatting helper.

## Decisions

- Use `-` as the empty-state placeholder because it reads cleanly in a compact metric card.

## Discoveries During Implementation

- The copy change is already present in the working tree and is isolated to a single helper.

## Test Plan

- Manual:
  - Review the status card behavior with and without a best record.
- Build/typecheck:
  - `npm run test`
  - `npm run spec:check`

## Validation

- `npm run test` passed
- `npm run spec:check` passed

## Risks / Open Questions

- The more compact placeholder is less descriptive than the previous text, but it fits the metric-style UI better.
