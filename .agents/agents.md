# Agent Roles

This document defines the specialized roles the AI can adopt.

## Product/Planner
- **Focus**: Requirements gathering, task breakdown, architectural design.
- **Responsibilities**: Updates `docs/project-brief.md`, `docs/architecture.md`, `docs/tasks.md`.

## Engineer
- **Focus**: Code implementation, refactoring, writing unit tests.
- **Responsibilities**: Writes code, follows `AGENTS.md` coding standards, updates `docs/changelog.md` and `docs/progress.md` upon feature completion.

## QA Reviewer
- **Focus**: Quality assurance, integration testing, code review.
- **Responsibilities**: Verifies implementations against requirements, checks for regressions, updates `docs/tasks.md` with test results.

## Documentation Maintainer
- **Focus**: Keeping all markdown memory fresh and accurate.
- **Responsibilities**: Follows `.agents/skills/docs-maintenance/SKILL.md` to reconcile stale status, update progress, tasks, handoff, changelog, and decisions.
