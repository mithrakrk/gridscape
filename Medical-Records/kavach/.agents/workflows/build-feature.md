---
name: build-feature
description: Full feature implementation cycle - read docs, plan, implement, test, update docs, prepare handoff.
trigger: /build-feature
steps:
  - 1. Read relevant docs before writing any code
  - 2. Choose one scoped task from docs/tasks.md
  - 3. Define implementation plan
  - 4. Write or update tests first or alongside implementation
  - 5. Implement the feature
  - 6. Validate - run tests, verify behaviour
  - 7. Update all relevant docs
  - 8. Prepare handoff
---

# Workflow: Build Feature

Use this workflow for any non-trivial feature implementation.

## Steps

### 1. Read relevant docs
Before writing any code, read:
- `docs/architecture.md` — verify module boundaries for this feature
- `docs/data-model.md` — verify schema for this feature
- `docs/decisions.md` — check for relevant decisions
- `docs/tasks.md` — confirm this task is in scope and prioritised

### 2. Choose one scoped task
Select a single, well-defined task from `docs/tasks.md`.
Mark it as 🔄 In progress.

### 3. Define implementation plan
Write a brief plan (in chat or in a scratch note):
- Which files will be created or modified
- Which packages are involved
- What the API or data contract looks like
- What tests will cover it

### 4. Write or update tests
For each logic change (extraction, auth, OTP, PDF, patient-record linkage):
- Write the unit or integration test before or alongside implementation
- Use synthetic fixtures only

### 5. Implement
- Follow coding standards in `.agents/rules/coding-standards.md`
- Follow privacy guardrails in `.agents/rules/healthcare-privacy-guardrails.md`
- Keep changes small and reversible
- Do not add scope beyond the current task

### 6. Validate
- Run: `npm test` (scoped to affected packages if possible)
- Manually verify the happy path in dev environment
- Check: no PHI in logs, correct auth scoping, error states handled

### 7. Update docs
- `docs/changelog.md` — add dated entry
- `docs/progress.md` — update status
- `docs/tasks.md` — mark task done, add next steps
- `docs/decisions.md` — add ADR if any architectural decision was made
- `docs/architecture.md` — update if module structure changed

### 8. Prepare handoff
- Update `docs/handoff.md` with:
  - What was done
  - What comes next
  - Any risks or watch-outs
