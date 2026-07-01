# Roadmap

This roadmap turns the current MVP into a more complete game without losing the simplicity that makes it interview-friendly.

## Guiding Principles

- Keep the game playable after every step.
- Prefer features that reuse the existing board and movement model.
- Add mechanics incrementally instead of redesigning the whole app.
- Keep game rules explicit and testable.

## Current Baseline

The project currently has:

- one playable game mode
- one player
- one collectible coin
- one score metric
- one timer
- keyboard-only input
- no persistence
- no automated tests

## Priority Roadmap

## 1. Polish The Existing Loop

### 1.1 Add high score persistence

Why it matters:

- Gives players a reason to replay
- Easy to implement with very low risk

Implementation notes:

- Read best score from `localStorage` on mount
- Update best score when the game ends or when the current score exceeds it
- Show it in the status bar

Acceptance criteria:

- Best score remains after refresh
- Best score updates only when exceeded

### 1.2 Add explicit game phases

Why it matters:

- Makes the loop feel complete
- Makes future features easier to place

Suggested phases:

- `ready`
- `playing`
- `gameOver`

Implementation notes:

- Replace implicit start-on-load behavior with a Start button
- Keep restart available from the game-over screen

Acceptance criteria:

- Game does not start until the player begins
- Timer only runs during `playing`

### 1.3 Improve feedback

Why it matters:

- Moment-to-moment feedback increases perceived quality

Ideas:

- animate coin collection
- flash score after a point
- show low-time warning below 10 seconds
- slightly emphasize the player's current position

Acceptance criteria:

- Feedback is visible but does not interfere with controls

## 2. Expand Input Support

### 2.1 Touch controls

Why it matters:

- Makes the game usable on mobile

Implementation notes:

- Add four on-screen directional buttons
- Reuse the same movement helper used by keyboard controls

Acceptance criteria:

- Mobile users can fully play without a keyboard

### 2.2 Accessibility improvements

Why it matters:

- Clarifies state for more users

Ideas:

- announce score updates for screen readers
- improve board and control labeling
- add focus-visible states where needed

Acceptance criteria:

- Main interactions are understandable without relying only on visuals

## 3. Add One Strong New Mechanic

This is the most important design choice after polishing the MVP. Pick one mechanic first and do it well.

### Option A: Moving coin

Effect:

- The coin relocates every few seconds if not collected

Benefits:

- Matches the current headline text
- Increases urgency without changing the board model

Risks:

- Can feel unfair if it moves too frequently

### Option B: Obstacles

Effect:

- Some cells become blocked

Benefits:

- Adds pathing and planning

Risks:

- Requires spawn rules that avoid impossible states

### Option C: Time bonus pickups

Effect:

- Some collectibles add time instead of score

Benefits:

- Adds short-term decision making
- Works well with the current timer loop

Risks:

- Needs careful balance to avoid infinite play

Recommendation:

- Build `Moving coin` first if the goal is stronger arcade feel.
- Build `Time bonus pickups` first if the goal is stronger risk/reward decisions.

## 4. Add Difficulty and Balance

Once the core loop is fun, expose tuning options.

Suggested settings:

- grid size
- starting time
- coin move frequency
- obstacle count
- bonus spawn rate

Recommended UX:

- `Easy`, `Normal`, `Hard`
- Avoid fully custom settings until the game has more stable mechanics

## 5. Align With The "AI Adoption" Theme

If the product should reflect the repository name, re-skin and reframe the mechanics rather than rebuilding them.

## Theme mapping ideas

- Player: change agent / project lead
- Coin: AI opportunity
- Obstacles: compliance blockers, bad data, resistance to change
- Bonus time: executive sponsorship
- Combo system: successful rollout momentum

This is the lowest-cost way to make the game feel conceptually coherent.

## 6. Improve Code Structure When Needed

Do not refactor too early, but once new mechanics arrive, the following split will help:

- `src/game/types.ts`
- `src/game/constants.ts`
- `src/game/rules.ts`
- `src/components/Board.tsx`
- `src/components/StatusBar.tsx`
- `src/components/Controls.tsx`

Refactor trigger:

- If `App.tsx` becomes hard to explain in under a few minutes, split it.

## 7. Add Automated Tests

Recommended order:

1. Pure rule tests
2. Component interaction tests
3. Regression tests for restart and end-of-game flow

High-value tests:

- boundary movement
- valid random spawn behavior
- coin collection updates
- timer stops at zero
- restart resets state

## 8. Longer-Term Features

These are lower priority, but useful once the core is stable:

- persistent leaderboard
- multiple levels
- enemy AI
- unlockable skins or themes
- session analytics
- sound effects and music
- animated tutorial

## Suggested Milestones

### Milestone 1: Interview-ready MVP+

Scope:

- high score
- game phases
- better feedback
- copy cleanup

Outcome:

- stronger presentation with minimal complexity increase

### Milestone 2: Mobile-ready arcade version

Scope:

- touch controls
- accessibility improvements
- one new mechanic

Outcome:

- more complete and broadly playable game

### Milestone 3: Themed product version

Scope:

- AI adoption reskin
- reworded UI
- new visual identity
- tuned scoring and difficulty

Outcome:

- game becomes more distinct and better matched to the project name

## Recommended Immediate Next Feature

If only one feature should be built next, choose:

`High score persistence`

Why:

- very small diff
- easy to explain
- instantly improves replay value
- creates a foundation for game-over polish
