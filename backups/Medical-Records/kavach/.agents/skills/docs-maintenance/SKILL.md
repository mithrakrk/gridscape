---
name: docs-maintenance
description: Reading relevant docs before work, updating progress/tasks/handoff/changelog/decisions, resolving docs drift, preserving concise project memory.
use_when:
  - Before starting any significant work
  - After completing any meaningful implementation
  - When docs and code are found to disagree
  - When preparing a session handoff
outputs:
  - Updated docs/progress.md
  - Updated docs/tasks.md
  - Updated docs/changelog.md
  - Updated docs/handoff.md
  - Updated docs/decisions.md (if architecture changed)
---

# Skill: Docs Maintenance

## When to Apply
Apply this skill before starting work (to read context) and after completing work (to update docs).

## Before Work: Read Sequence
1. `docs/progress.md` — current status and blockers
2. `docs/tasks.md` — what is in scope for this session
3. `docs/handoff.md` — context from the previous session
4. Domain-specific docs based on task:
   - Architecture task → `docs/architecture.md`
   - Pipeline task → `docs/ai-pipeline.md`
   - Compliance task → `docs/compliance.md`
   - Summary task → `docs/doctor-summary.md`
   - Portal task → `docs/portal-access.md`

## After Work: Update Sequence

### Always Update
- `docs/changelog.md` — dated entry for every meaningful change
- `docs/progress.md` — what was done, new status, blockers
- `docs/tasks.md` — mark completed items, add next steps
- `docs/handoff.md` — what was done, what comes next, risks

### Update When Applicable
- `docs/decisions.md` — if any architectural or product decision was made
- `docs/architecture.md` — if module structure or tech stack changed
- `docs/data-model.md` — if Prisma schema changed
- `docs/ai-pipeline.md` — if pipeline design changed
- `docs/compliance.md` — if compliance posture changed or new legal review items found
- `docs/test-cases.md` — if new test cases were defined

## Resolving Docs Drift
If code and docs disagree:
1. Determine which is correct (usually code, unless the code is wrong)
2. Update the doc to match reality
3. If the doc was correct and the code is wrong, fix the code
4. Add a changelog entry noting the drift was resolved
5. Never leave disagreement unresolved and undocumented

## Docs Quality Rules
- Keep entries concise and dated
- Preserve history — summarise instead of deleting useful context
- Keep "Current status", "Blockers", and "Next steps" easy to find in every doc
- Prefer updating existing markdown over creating new files
