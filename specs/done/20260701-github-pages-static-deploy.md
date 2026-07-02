# GitHub Pages Static Deploy

## Status

- State: `done`
- Owner: Codex
- Last updated: 2026-07-01

## Summary

Make the game playable as a static GitHub Pages deployment by preserving the current local server flow while adding a browser-side records fallback and automated Pages publishing.

## Problem

The current app depends on a local Node + SQLite API for records, which means the built frontend cannot run correctly on GitHub Pages by itself.

## Scope

- In scope:
  - static-hosting-friendly records behavior
  - Vite build configuration for a repository Pages path
  - GitHub Actions workflow for Pages deployment
  - light documentation updates for the new deployment path
- Out of scope:
  - hosting the Node + SQLite backend on GitHub Pages
  - redesigning gameplay or persistence beyond a simple fallback

## Changed Files

- Expected:
  - `src/App.tsx`
  - `src/App.test.tsx`
  - `src/records.ts`
  - `src/records.test.ts`
  - `src/test/setup.ts`
  - `vite.config.ts`
  - `.github/workflows/deploy-pages.yml`
  - `README.md`
  - `specs/done/20260701-github-pages-static-deploy.md`
- Updated during implementation:
  - `src/App.tsx`
  - `src/App.test.tsx`
  - `src/records.ts`
  - `src/records.test.ts`
  - `src/test/setup.ts`
  - `vite.config.ts`
  - `.github/workflows/deploy-pages.yml`
  - `README.md`
  - `specs/done/20260701-github-pages-static-deploy.md`

## Requirements

- The game must remain playable when served as a static build with no backend.
- Local development with the existing Node + SQLite server should keep working.
- Records should still be shown and saved in static hosting, using a simple browser-only fallback.
- The repo should include a clear GitHub Pages deployment path.

## Acceptance Criteria

- [x] A GitHub Pages build can load the game without calling a required backend.
- [x] Records continue to work locally and fall back to browser storage when the API is unavailable.
- [x] The Vite build produces asset URLs that work for the repository Pages path.
- [x] The repo includes an automated Pages deployment workflow.
- [x] Validation covers build, tests, and spec checks.

## Implementation Notes

- Keep the fallback logic explicit and easy to explain.
- Prefer a small records helper over embedding transport and fallback logic directly in the component.

## Decisions

- Use `localStorage` as the static-hosting fallback because it requires no new service and preserves a working MVP.
- Keep the existing backend-first behavior so local server persistence still works without configuration changes.
- Use a `PAGES_BASE_PATH` build variable instead of hardcoding the repo path in Vite so local builds keep root-relative paths by default.

## Discoveries During Implementation

- The app currently only calls `/api/records`, so a focused records abstraction kept the diff small and preserved component behavior.
- The test environment exposed an incomplete `localStorage` implementation, so the test setup needed a small in-memory shim for stable fallback tests.
- A Pages-ready build does not require changing local development because Vite can read the base path from an environment variable at build time.

## Test Plan

- Manual:
  - Run the app locally and confirm existing gameplay still loads records.
  - Confirm the app can still show/save records when the API is unavailable.
- Build/typecheck:
  - `npm run test`
  - `npm run build`
  - `npm run spec:check`

## Validation

- `npm run spec:check` passed
- `npm run test` passed
- `npm run build` passed
- `npm run preview -- --host 127.0.0.1` could not bind a local port in the sandbox (`EPERM`)

## Risks / Open Questions

- GitHub Pages project-site paths depend on the repository name; if the repo is renamed later, the Pages base path will need to change.
- Static-hosted records are browser-local and device-specific, so they are not shared like the SQLite-backed local server records.
