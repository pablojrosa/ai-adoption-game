# Feature Plan

The current game is a very small MVP: one screen, one mechanic, one goal, 30-second session. That is useful because it makes the next step clear: add features that create decisions, progression, and theme before adding complexity.

## Plan

1. Define the game's intended fantasy in one sentence.

   Example: "You are a team lead trying to drive AI adoption across a company while managing risk, budget, and skepticism."

   This matters because "interesting features" depend on whether the game is meant to feel arcade, strategy, satire, or educational.

2. Evaluate the current MVP against 4 lenses.

   Ask for each feature idea:

   - Does it add player decisions?
   - Does it make runs feel different?
   - Does it reinforce the AI-adoption theme?
   - Can it be explained in under 30 seconds?

3. Add features in this order, from highest value to lowest risk.

   - First: make the existing loop deeper.
   - Second: add light progression between moments.
   - Third: add theme-specific systems.
   - Last: add polish and content variety.

## Best Feature Candidates

1. Obstacles and tradeoffs.

   Add blockers on the grid like "legacy systems", "security review", or "skeptical manager" tiles.

   Why: this is the fastest way to turn movement into decision-making.

2. Different pickup types instead of one coin.

   Examples:

   - `Quick win`: easy points
   - `High impact AI project`: more points, harder to reach
   - `Risky shortcut`: gives points but removes time

   Why: creates prioritization instead of pure collection.

3. Limited-use abilities.

   Examples:

   - `Automation sprint`: move twice
   - `Executive buy-in`: clear one blocker
   - `Training session`: temporary bonus on pickups

   Why: adds meaningful choices without heavy architecture.

4. Simple progression during a run.

   Examples:

   - Score thresholds unlock more opportunities
   - Grid difficulty increases over time
   - New blockers appear every 10 seconds

   Why: makes the 30-second run escalate instead of staying flat.

5. AI-adoption stats replacing raw score-only gameplay.

   Track:

   - `Adoption`
   - `Trust`
   - `Budget`
   - `Time`

   Why: this fits the repo theme and gives room for tradeoffs.

6. Events/cards every few seconds.

   Examples:

   - "Legal asks for review"
   - "CEO wants a demo tomorrow"
   - "Employee discovers a useful prompt workflow"

   Why: adds surprise and narrative variety cheaply.

7. Win/lose states beyond timer.

   Examples:

   - Win if adoption reaches target
   - Lose if trust hits zero
   - Survive until quarter-end

   Why: gives players a clearer objective than "get a high score".

## Recommended MVP Expansion Path

1. Replace the coin with 2-3 opportunity types.
2. Add 3-5 blocker tiles.
3. Add one extra stat besides score, ideally `trust` or `budget`.
4. Add one ability with a cooldown or limited charges.
5. Re-theme text/UI around AI adoption decisions.

That path stays small, preserves the current code shape, and should still be easy to explain in an interview.

## Concrete Feature Sets You Could Choose

1. Arcade version

   Fast movement, hazards, combo scoring, difficulty ramp.

   Best if you want something immediately playable.

2. Strategy-lite version

   Multiple resources, tradeoffs, event cards, clearer outcomes.

   Best if you want the "AI adoption" theme to actually matter.

3. Educational/satirical version

   Funny corporate events, approval chains, hype vs reality mechanics.

   Best if the goal is memorable theme over deep mechanics.

My recommendation is the strategy-lite version, but built on the current arcade loop.

## How to Use This Plan

Pick one target fantasy first, then choose only 2 features from the list below for the next iteration:

- Multiple pickup types
- Blocker tiles
- One secondary stat
- One player ability

Known limitation: until the game fantasy is defined, it is easy to add features that are mechanically fine but thematically disconnected from "AI adoption."
