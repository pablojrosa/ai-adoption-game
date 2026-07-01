# AI Adoption Game

A small React + TypeScript browser game built with Vite. The current MVP is a timed grid-collection game: the player moves around a 10x10 board, collects coins, and tries to maximize score before the 30-second timer ends.

This document covers:

- what the game currently does
- how the code is structured
- how to run and test it
- current limitations
- the recommended next steps for new features

## Product Summary

The game is intentionally simple:

- The player starts in the top-left cell.
- A single coin spawns in a random cell that is not occupied by the player.
- The player moves with arrow keys or `WASD`.
- Each collected coin increases the score by 1 and respawns the next coin in another random cell.
- The game ends when the countdown reaches `0`.
- The player can restart at any time.

This is a good interview MVP because it already demonstrates:

- explicit game state
- keyboard interaction
- timer-based gameplay
- deterministic movement rules
- a complete playable loop in a very small codebase

## Current Gameplay Rules

### Board

- Grid size: `10 x 10`
- Total cells: `100`
- Player start position: row `0`, column `0`

### Movement

- Supported inputs:
  - `ArrowUp`, `ArrowDown`, `ArrowLeft`, `ArrowRight`
  - `W`, `A`, `S`, `D`
- Movement is clamped to the board boundaries.
- Invalid keys do nothing.
- When the game is over, movement is disabled.

### Scoring

- Collecting a coin gives `+1` point.
- Only one coin exists at a time.
- A new coin appears immediately after the current one is collected.

### Timer

- Match duration: `30` seconds
- The timer decreases once per second.
- The timer never goes below `0`.
- When the timer reaches `0`, the game enters the game-over state.

### Restart

Restarting resets:

- player position
- score
- remaining time
- coin position

## UI Overview

The app is a single screen with four parts:

1. Header copy
2. Status bar
3. Game board
4. Footer with contextual message and restart button

### Status Bar

The status bar shows:

- current score
- current player coordinates
- time left

### Board Rendering

The board is rendered as a flat array of `100` cells. For each index:

- the row is `Math.floor(index / GRID_SIZE)`
- the column is `index % GRID_SIZE`
- the cell conditionally renders:
  - a coin token
  - a player token

### Visual Style

The current UI uses:

- a light gradient page background
- a centered card layout
- simple colored circular tokens for player and coin
- responsive stacking on smaller screens

The design is intentionally lightweight and easy to iterate on during an interview.

## Code Structure

The app is currently organized as a minimal Vite frontend:

```text
src/
  App.tsx       main game logic and UI
  App.css       game-specific styles
  index.css     global styles
  main.tsx      React entry point
```

### `src/main.tsx`

Responsible for:

- bootstrapping React
- rendering `<App />` inside `#root`
- loading global styles

### `src/App.tsx`

This is the core of the project. It contains:

- game constants
- the `Position` type
- helper functions
- all game state
- keyboard handling
- timer lifecycle
- board rendering

#### Constants

- `GRID_SIZE = 10`
- `GAME_DURATION_SECONDS = 30`
- `START_POSITION = { row: 0, col: 0 }`

These make the current rules easy to understand and change.

#### Types

`Position` is the main domain type:

```ts
type Position = {
  row: number
  col: number
}
```

This keeps the board model explicit and readable.

#### Helper Functions

`getRandomCoinPosition(player)`

- builds a list of all valid cells except the player's current cell
- picks one random position

`movePlayer(player, key)`

- maps keyboard input to a new position
- clamps movement to the grid boundaries
- returns the same position object when the key is unsupported

These helpers are pure and are good candidates to keep extracting as the game grows.

#### React State

The current component uses four pieces of state:

- `player`
- `score`
- `timeLeft`
- `coin`

Derived state:

- `isGameOver = timeLeft === 0`

This is a good MVP pattern because the state is explicit and easy to inspect.

#### Effects

There are two `useEffect` hooks:

1. Timer effect
   - starts a 1-second interval while the game is active
   - decrements the timer
   - clears itself on cleanup

2. Keyboard effect
   - subscribes to `keydown`
   - computes the next player position
   - prevents page scrolling for valid movement keys
   - checks coin collection
   - updates player, score, and coin

## Technical Decisions

The current implementation favors simplicity over abstraction:

- Single-screen app
- No external state library
- No router
- No backend
- No persistence
- No custom hooks yet
- No test suite yet

This is appropriate for the current scope and aligns well with interview constraints.

### Why This Approach Works Well for an MVP

- The entire game loop is easy to explain in one file.
- Rules are visible without jumping through many abstractions.
- The code is small enough to refactor safely if a new feature is requested.
- Most future features can be added incrementally.

## How To Run

### Install

```bash
npm install
```

### Start the dev server

```bash
npm run dev
```

Then open the local Vite URL in the browser.

### Production build

```bash
npm run build
```

### Lint

```bash
npm run lint
```

## How To Play

1. Start the app.
2. Use arrow keys or `WASD` to move.
3. Move onto the coin to collect it.
4. Keep collecting coins before the timer reaches zero.
5. Press `Restart` or `Play again` to start over.

## Manual Test Checklist

Use this checklist after gameplay changes:

1. Confirm the player starts in the top-left corner.
2. Confirm the coin never spawns on the player's current cell.
3. Confirm arrow keys move exactly one cell.
4. Confirm `WASD` also move exactly one cell.
5. Confirm the player cannot move outside the board.
6. Confirm collecting a coin increments the score.
7. Confirm a new coin appears immediately after collection.
8. Confirm the timer decreases once per second.
9. Confirm movement stops when time reaches `0`.
10. Confirm restart resets the whole game state.

## Current Limitations

These are the main gaps in the current version:

- No mobile touch controls
- No audio feedback
- No difficulty settings
- No obstacle or enemy mechanics
- No combo, streak, or bonus scoring
- No start screen or end screen beyond inline text
- No persisted high score
- No pause/resume
- No tests
- All gameplay logic lives in one component

There is also a small product mismatch in the current headline text:

- The heading says, "Collect the coin before it jumps again."
- In the actual implementation, the coin only moves when collected or when the game restarts.

If the game evolves, either the copy or the mechanic should be updated so they match.

## Recommended Next Steps

The best next features are the ones that improve gameplay without forcing a rewrite.

### Phase 1: Stronger MVP

These features give the biggest value for the least complexity:

1. High score
   - Store best score in `localStorage`
   - Show current score vs best score

2. Start and game-over screens
   - Add a clearer game loop
   - Improve replayability and presentation

3. Touch controls
   - Add on-screen directional buttons
   - Makes the game playable on phones and tablets

4. Better feedback
   - Add a short collection animation
   - Add score pulse or timer warning states

5. Copy cleanup
   - Align messaging with actual mechanics

### Phase 2: Better Game Design

These features make the game more strategic:

1. Difficulty modes
   - Easy: larger timer, slower pace
   - Normal: current settings
   - Hard: shorter timer or larger grid

2. Obstacles
   - Block movement through some cells
   - Makes pathing more interesting

3. Moving coin
   - Respawn or shift the coin on a timer
   - Makes the headline mechanic real

4. Bonus pickups
   - Extra time
   - Double-score pickup
   - Temporary speed pickup

5. Combo system
   - Reward consecutive fast collections

### Phase 3: More Depth

These features move the game from a coding exercise toward a fuller arcade game:

1. Multiple levels
2. Enemy hazards
3. Procedural board layouts
4. Missions or goals
5. Leaderboard backed by an API
6. Player profiles or unlockables

## Implementation Roadmap

If continuing development, this is the recommended order:

1. Extract pure game helpers into a small `game.ts`
2. Add high score with `localStorage`
3. Add start/game-over screen states
4. Add touch controls
5. Add at least one new mechanic such as moving coins or obstacles
6. Add tests for movement, spawning, and scoring rules
7. Split UI into small components if the screen grows

This order keeps the game playable at every step.

## Suggested Refactor Plan

The current code does not need a refactor yet, but the first clean extraction would likely be:

- `src/game.ts`
  - constants
  - `Position`
  - `movePlayer`
  - `getRandomCoinPosition`

- `src/components/StatusBar.tsx`
- `src/components/Board.tsx`
- `src/components/Footer.tsx`

Only do this once new features start making `App.tsx` harder to explain.

## Testing Strategy For Future Features

When tests are added, start with pure rule tests first:

- movement boundaries
- unsupported key behavior
- coin spawn validity
- score increase on collection
- timer edge conditions

After that, add a few UI tests for:

- keyboard interaction
- restart flow
- game-over behavior

Keep the first test pass small. The goal is confidence, not heavy infrastructure.

## Product Ideas For "AI Adoption" Direction

If the goal is to align the game more closely with the repository name, the project can evolve from a generic collector game into a thematic "AI adoption" game.

Possible directions:

1. Collect AI opportunities
   - Coins become "automation wins" or "use cases"

2. Avoid adoption risks
   - Add hazards such as compliance blockers or bad data

3. Resource management
   - Add budget, team trust, and implementation capacity

4. Department-based map
   - Different board zones represent teams like Sales, Ops, Support, and Finance

5. Upgrade system
   - Better tools unlock stronger movement or scoring bonuses

This would preserve the existing grid gameplay while making the theme more distinctive.

## Additional Planning

The repo already includes [FEATURE_PLAN.md](./FEATURE_PLAN.md), which contains extra theme and design ideas. A more structured delivery roadmap lives in [docs/ROADMAP.md](./docs/ROADMAP.md).
