# Specs

This folder provides a minimal spec-driven workflow for the interview repo.

The goal is not heavy process. The goal is to keep the next change small, explicit, and easy to explain before code is written, while also keeping the active spec synchronized with what implementation discovers.

## Structure

```text
specs/
  active/                 specs for work in progress
  done/                   completed specs kept for reference
  templates/
    feature-spec.md       default spec template
```

## Workflow

1. Create or pick one spec from `specs/active/` before starting a relevant code change.
2. Keep the scope to one reviewable change.
3. Fill in acceptance criteria, expected file changes, and initial status before writing code.
4. Implement against the spec.
5. If implementation changes the plan, update the same active spec before continuing.
6. Record validation results and remaining limitations in that spec.
7. Move the spec from `active/` to `done/` when the feature is complete.

## Active Spec Loop

Active specs are living documents.

When something relevant changes during implementation, update the active spec:

- `Status`: where the work stands now
- `Changed Files`: which files are expected or already modified
- `Decisions`: concrete choices made during implementation
- `Discoveries During Implementation`: things learned that changed scope, risk, or approach
- `Validation`: what was run and the result

This means the spec should describe the real state of the task, not just the original intention.

## Commands

- `npm run spec:new -- short-feature-name`
- `npm run spec:list`
- `npm run spec:check`

`spec:new` creates a dated file in `specs/active/`.

`spec:check` verifies that the scaffold files exist and that any active specs include the required headings from the template.

## Notes

- Keep specs short enough to discuss in a live interview.
- Prefer one spec per feature or behavior change.
- Do not use specs as a substitute for implementation notes in code when code comments are clearer.
- Prefer updating the existing active spec over creating multiple overlapping active specs for the same task.
