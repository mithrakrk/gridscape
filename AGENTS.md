# Project Mission
Build this project in small, testable increments with persistent markdown documentation that stays current at all times. To build robust, scalable, and delightful applications while maintaining a continuous and coherent AI-assisted development workflow.

## Working Rules
- Always read `docs/project-brief.md`, `docs/architecture.md`, `docs/progress.md`, `docs/tasks.md`, and `docs/decisions.md` before making changes.
- Always plan before coding.
- Prefer the smallest viable change that advances the current task.
- Do not make architectural changes without recording them in `docs/decisions.md`.
- Do not leave important context only in chat; persist it to markdown.
- After meaningful work, update `docs/progress.md`, `docs/tasks.md`, and `docs/handoff.md`.
- After code changes, update `docs/changelog.md`.
- After design or architecture changes, update `docs/architecture.md` and `docs/decisions.md`.
- Treat documentation maintenance as part of the definition of done.
- If docs and code disagree, reconcile them immediately.
- Ask before destructive actions such as deleting files, dropping data, or replacing major flows.

## Coding Standards
- Write clean, maintainable, and modular code.
- Follow the established design patterns and conventions of the project.
- Ensure all tests pass before considering a task complete.

## Definition of Done
A task is only done when:
- implementation is complete
- validation or testing is complete
- affected markdown files are updated
- next steps are recorded in `docs/tasks.md` or `docs/handoff.md`

## Documentation Conventions
- Keep entries concise and dated.
- Use clear headings and bullets.
- Preserve history; summarize instead of deleting useful context.
- Keep “Current status”, “Blockers”, and “Next steps” easy to find.

## Priority Order
1. Safety and correctness
2. Clarity of project docs
3. Small, reversible implementation steps
4. Speed
