---
name: planning
description: PRD shaping, backlog creation, milestone planning, scope control.
use_when:
  - Defining or refining product requirements
  - Creating or prioritising a task backlog
  - Planning milestones or sprints
  - Evaluating scope decisions
outputs:
  - Updated docs/product-requirements.md
  - Updated docs/tasks.md (prioritised backlog)
  - Updated docs/decisions.md (any new scope decisions)
  - Updated docs/progress.md (milestone status)
---

# Skill: Planning

## When to Apply
Apply this skill when the task is about product definition, backlog management, or milestone planning — not implementation.

## Process

### Read Before Planning
1. `docs/project-brief.md` — product definition and v1 scope
2. `docs/decisions.md` — resolved constraints
3. `docs/tasks.md` — current backlog state
4. `docs/progress.md` — what is done and what is blocked

### PRD Shaping
When shaping or updating requirements:
- Ground every requirement in a specific user need from the project brief
- Map each requirement to a user journey in `docs/user-flows.md`
- Flag requirements that conflict with scope discipline rules

### Backlog Creation
When creating or updating the backlog:
- Group tasks by milestone (1: Foundation, 2: Ingestion, 3: Summary + Portal, 4: Compliance + Hardening)
- Within each milestone, order by: safety/correctness → core flow → polish
- Each task should be completable in a single focused session

### Scope Control
Before adding any item to the v1 backlog:
- Verify it is in the v1 scope list in `AGENTS.md`
- If not in scope: add to "Backlog (Later Phases)" section, not the current milestone
- Document any scope exception in `docs/decisions.md`

### Milestone Planning
For each milestone:
- Define the milestone goal (one sentence)
- List the key deliverables
- List the acceptance criteria
- Identify blockers and external dependencies
