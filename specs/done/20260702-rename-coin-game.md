# Rename Coin Game

## Status

- State: `done`
- Owner: Codex
- Last updated: 2026-07-02

## Summary

Rename the previous project references to `coin-game` across the repository's user-facing and package-facing files, and remove the README gameplay gif.

## Problem

The repository branding still refers to the previous project name, which no longer matches the desired product name.

## Scope

- In scope:
  - update repository-facing naming in tracked files
  - update the Pages base path reference
  - remove the GIF from `README.md`
- Out of scope:
  - renaming the GitHub repository itself
  - gameplay or logic changes

## Changed Files

- Expected:
  - `README.md`
  - `index.html`
  - `package.json`
  - `package-lock.json`
  - `.github/workflows/deploy-pages.yml`
  - `specs/done/20260702-rename-coin-game.md`
- Updated during implementation:
  - `README.md`
  - `index.html`
  - `package.json`
  - `package-lock.json`
  - `.github/workflows/deploy-pages.yml`
  - `specs/done/20260702-rename-coin-game.md`

## Requirements

- Replace previous project-name references with `coin-game` in repository files.
- Update the main README title and copy to use `Coin Game`.
- Remove the GIF from the README.
- Keep the documentation concise and consistent with the new name.

## Acceptance Criteria

- [x] No tracked repo file still refers to the previous project name where the project name is intended.
- [x] The README no longer embeds the GIF.
- [x] The Pages configuration references the new `coin-game` path.

## Implementation Notes

- Use targeted text replacement rather than broader content rewrites.
- Validate with a search pass plus `npm run spec:check`.

## Decisions

- Use `coin-game` for slug/package/path values and `Coin Game` for display title text.

## Discoveries During Implementation

- Initial search shows the current name in `README.md`, `index.html`, `package.json`, and `package-lock.json`.
- The Pages workflow also needed the slug update because the configured base path matched the old repository name.

## Test Plan

  - Manual:
  - Review the renamed files for consistency.
  - Search the repo for any remaining previous-name references.
- Build/typecheck:
  - `npm run spec:check`

## Validation

- Repo-wide search for previous project-name variants returned no remaining project-name matches outside the spec before closure
- `npm run spec:check` passed

## Risks / Open Questions

- If the GitHub repository itself is not renamed, the Pages URL path on GitHub will still depend on the actual repo name.
