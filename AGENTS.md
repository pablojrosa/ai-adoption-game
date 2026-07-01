# Interview Coding Guidelines

We are in a timed live-coding interview.

Priorities:

1. Build a working, playable MVP first.
2. Keep the implementation simple and easy to explain.
3. Avoid overengineering, unnecessary libraries, backend code, complex architecture, or premature abstractions.
4. Prefer small, reviewable diffs.
5. Use React + TypeScript idioms.
6. Validate changes by running the app and checking for TypeScript/build errors.
7. When adding features, preserve existing behavior unless explicitly asked.
8. After each change, summarize:
  - what changed
  - how to test it
  - any known limitations

Coding style:

- Prefer clear names over clever abstractions.
- Keep game state explicit.
- Use pure helper functions for game rules when possible.
- Avoid global mutable state.
- Keep UI simple but usable.

