# Coin Game

Arcade-style grid game built with React, TypeScript, and Vite. The current playable app ships as `Grid Collector` with two modes:

- `Time mode`: collect as many coins as possible before the timer ends
- `Coin mode`: reach the target coin count as fast as possible

The project also includes a small optional Node + SQLite server for local record persistence.

## Tech Stack

- React 19
- TypeScript
- Vite
- Vitest + Testing Library
- Node.js server with SQLite for local records

## Quick Start

### Requirements

- Node.js 22 or newer
- npm

### Install

```bash
npm install
```

### Run Locally

Start the full local app, including the frontend and the local records server:

```bash
npm run dev
```

Default local URLs:

- App: `http://localhost:5173`
- API: `http://localhost:3001`

## Local Usage

### Development Commands

```bash
npm run dev         # frontend + local server
npm run dev:client  # frontend only
npm run dev:server  # local API only
npm run test        # run tests once
npm run build       # typecheck and production build
npm run preview     # preview the production build
```

### How Records Work

There are two persistence modes:

- Local server mode:
  - records are stored in `data/game.db`
  - the frontend reads and writes `/api/records`
- Static mode:
  - if `/api/records` is unavailable, the app falls back to browser `localStorage`
  - this is what allows the GitHub Pages version to stay playable

`Time mode` records keep the highest score for the selected duration. `Coin mode` records keep the fastest completion time for the selected target.

## Project Structure

```text
src/
  App.tsx       game UI and round flow
  game.ts       game rules and pure helpers
  records.ts    record loading and fallback logic
server/
  server.mjs    local API and SQLite persistence
  dev.mjs       local dev runner
```

## GitHub Pages

The repository includes a GitHub Pages deployment workflow in `.github/workflows/deploy-pages.yml`.

Important behavior:

- Pages hosts only the static frontend
- the Pages build uses `PAGES_BASE_PATH=/coin-game/`
- the public site uses browser `localStorage` for records, not SQLite

If the repository name changes, update the Pages base path in the workflow.

## Validation

Before pushing changes, run:

```bash
npm run test
npm run build
npm run spec:check
```
