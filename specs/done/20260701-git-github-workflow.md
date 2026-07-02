# Git And GitHub Workflow

## Status

- State: `done`
- Owner: Codex
- Last updated: 2026-07-01

## Summary

Define a consistent Git and GitHub workflow for agent-driven work in this repository.

## Problem

Without an explicit workflow, code changes can be made on the wrong branch, grouped into unclear commits, pushed without validation, or merged automatically when the human should make the final decision.

## Scope

- In scope:
  - Branch strategy
  - Commit hygiene
  - PR expectations
  - Validation before push
  - Merge responsibility
- Out of scope:
  - Repo hosting configuration
  - CI policy details
  - Release management

## Changed Files

- Expected:
  - `AGENTS.md`
  - `specs/done/20260701-git-github-workflow.md`
- Updated during implementation:
  - `AGENTS.md`
  - `specs/done/20260701-git-github-workflow.md`

## Requirements

- Never work directly on `main`.
- For each clear requirement, create a dedicated branch.
- Commit only the relevant files needed for that requirement.
- Use short, clear commit descriptions.
- Validate the work before pushing.
- Open a clear PR description.
- Never merge anything automatically; the human performs the merge.

## Acceptance Criteria

- [x] The workflow states that work must not happen on `main`.
- [x] The workflow states that each clear requirement gets its own branch.
- [x] The workflow states that commits should include only relevant files.
- [x] The workflow states that commit messages should be short and clear.
- [x] The workflow states that testing or validation must happen before push.
- [x] The workflow states that PRs must have clear descriptions.
- [x] The workflow states that the agent must never merge.

## Implementation Notes

- Keep this as a durable process spec rather than a feature spec.
- Mirror the most important rules into `AGENTS.md` so the workflow is visible at task start.

## Decisions

- Store the Git/GitHub rules as a completed spec in `specs/done/` because it is a standing repo policy.
- Duplicate the core rules in `AGENTS.md` so they are enforceable during normal task execution.

## Discoveries During Implementation

- The repo already had behavior rules for specs, but not for branch and PR hygiene.
- A process spec is a better fit than putting all of this only in a template.

## Test Plan

- Manual:
  - Read `AGENTS.md` and confirm the Git/GitHub rules are visible there.
  - Read this spec and confirm the branch, commit, PR, push, and merge rules are explicit.
- Build/typecheck:
  - `npm run spec:check`
  - `npm run build`

## Validation

- `npm run spec:check` pending
- `npm run build` pending

## Risks / Open Questions

- This workflow is instruction-level enforcement, not a Git hook or CI enforcement layer.
- If stricter enforcement is needed later, the next step would be a script or CI check for branch naming and required validation notes.
