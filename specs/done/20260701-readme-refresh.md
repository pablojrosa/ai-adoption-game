# README Refresh

## Status

- State: `done`
- Owner: Codex
- Last updated: 2026-07-01

## Summary

Replace the oversized README with a concise, professional document focused on local setup, development commands, and the minimal deployment context needed for this repository.

## Problem

The current README is much longer than necessary for day-to-day use and mixes gameplay details, architecture notes, and planning context into what should be a fast onboarding document.

## Scope

- In scope:
  - rewrite `README.md`
  - prioritize local machine setup and usage
  - keep a short GitHub Pages note
- Out of scope:
  - gameplay changes
  - code changes outside docs
  - broader product documentation cleanup

## Changed Files

- Expected:
  - `README.md`
  - `specs/done/20260701-readme-refresh.md`
- Updated during implementation:
  - `README.md`
  - `specs/done/20260701-readme-refresh.md`

## Requirements

- The README must explain how to install, run, test, and build the project locally.
- The README should be professional and compact.
- The README should preserve the key persistence and GitHub Pages behavior at a high level.

## Acceptance Criteria

- [x] A new developer can run the project locally using only the README.
- [x] The README is materially shorter and easier to scan than the current version.
- [x] The document still explains the local server mode and static Pages mode.

## Implementation Notes

- Prefer a standard OSS structure: overview, stack, quick start, scripts, project structure, deployment note.
- Keep examples concrete and brief.

## Decisions

- Center the README on local usage rather than full product documentation.

## Discoveries During Implementation

- The existing README could be cut aggressively without losing the commands and behavior a local developer actually needs.
- A short deployment note is enough; the rest of the Pages detail belongs in workflow/config files rather than the top-level README.

## Test Plan

- Manual:
  - Review the README for clarity and completeness.
- Build/typecheck:
  - `npm run spec:check`

## Validation

- `npm run spec:check` passed
- Manual review completed

## Risks / Open Questions

- A shorter README will intentionally drop some of the gameplay detail that is currently duplicated elsewhere in the repo.
