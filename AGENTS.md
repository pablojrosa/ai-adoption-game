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
9. Use subagents in case the task is too complex
10. For any relevant code change, create or pick one spec in `specs/active/` before editing code.
11. If implementation changes scope, files, decisions, or discoveries, update that active spec before continuing.
12. Before closing the task, update the active spec with validation results and move it to `specs/done/` if the work is complete.
13. Follow the Git/GitHub workflow in `specs/done/20260701-git-github-workflow.md` for branch, commit, PR, and push behavior.

Coding style:

- Prefer clear names over clever abstractions.
- Keep game state explicit.
- Use pure helper functions for game rules when possible.
- Avoid global mutable state.
- Keep UI simple but usable.

Specs loop:

- Active specs are living documents, not one-time proposals.
- Each active spec must track:
  - status
  - changed files
  - decisions
  - discoveries during implementation
  - validation
- If a change is relevant enough to affect behavior, scope, or implementation approach, the spec must be updated in the same task.

Git and GitHub workflow:

- Never work directly on `main`.
- For each clear requirement, create a dedicated branch.
- Commit only the relevant files needed for that requirement.
- Keep commit messages short and clear.
- Run tests or validation before pushing changes.
- Open a clear PR description summarizing scope, testing, and limitations.
- Never merge PRs as the agent; the human reviewer performs the merge.
