---
name: start-project
description: Initialise core docs from the brief, define MVP boundaries, create first backlog, note assumptions, prepare architecture starter plan.
trigger: /start-project
steps:
  - 1. Read docs/project-brief.md fully
  - 2. Read docs/architecture.md fully
  - 3. Read docs/decisions.md to understand resolved constraints
  - 4. Define MVP boundaries - list what is in scope and what is explicitly out of scope
  - 5. Create or update docs/tasks.md with a prioritised first backlog
  - 6. Note all assumptions made and record them in docs/decisions.md
  - 7. Update docs/progress.md to reflect current state
  - 8. Update docs/handoff.md so next session has full context
---

# Workflow: Start Project

Use this workflow when initialising a new project or re-grounding a stalled project.

## Steps

### 1. Read core docs
Read the following in order:
- `docs/project-brief.md` — understand the product problem and users
- `docs/architecture.md` — understand the technical approach
- `docs/decisions.md` — understand what has already been decided (do not re-decide)
- `docs/tasks.md` — understand the current backlog state

### 2. Define MVP boundaries
Write a clear list of:
- What is **in scope** for the current milestone
- What is **explicitly out of scope** (with reference to decisions log)
- What is **uncertain** (needs discovery or decision)

### 3. Create first backlog
Update `docs/tasks.md`:
- Group tasks by milestone
- Mark each as: 🔲 Not started | 🔄 In progress | ✅ Done
- Prioritise by: safety/correctness → core flow → polish

### 4. Note assumptions
For every assumption made while planning:
- Add to `docs/decisions.md` with today's date and rationale
- Flag items requiring external validation (HCP interviews, legal review, API access)

### 5. Prepare architecture plan
If architecture is not yet defined or needs updating:
- Update `docs/architecture.md` with the current understanding
- Note open technical questions in the architecture doc

### 6. Update progress and handoff
- Update `docs/progress.md` with current status
- Update `docs/handoff.md` with immediate next actions
