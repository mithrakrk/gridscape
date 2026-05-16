---
name: add-user-flow
description: Add or refine a product journey - update user flows, requirements, test cases, tasks, and handoff.
trigger: /add-user-flow
steps:
  - 1. Read docs/user-flows.md and docs/product-requirements.md
  - 2. Define the new or revised user journey
  - 3. Update docs/user-flows.md
  - 4. Update docs/product-requirements.md with any new functional requirements
  - 5. Add test cases to docs/test-cases.md
  - 6. Add implementation tasks to docs/tasks.md
  - 7. Update docs/handoff.md
---

# Workflow: Add User Flow

Use this workflow when adding a new user journey or refining an existing one.

## Steps

### 1. Read existing flows and requirements
- `docs/user-flows.md` — understand all current journeys
- `docs/product-requirements.md` — understand existing FRs and NFRs
- `docs/decisions.md` — check for relevant constraints

### 2. Define the journey
Write the new or revised journey as a numbered step sequence:
- Who is the actor?
- What is the trigger?
- What are the steps?
- What are the failure paths?
- What are the success conditions?

### 3. Update user-flows.md
Add the journey in the standard format:
- Journey title
- Step sequence
- Test case references

### 4. Update product-requirements.md
Add or update functional requirements (FR-XX) for:
- New UI interactions
- New API behaviours
- New data requirements

### 5. Add test cases
Add to `docs/test-cases.md`:
- Happy path test case
- At least one error/edge case
- At least one security case if the flow involves auth or PHI

### 6. Add implementation tasks
Add to `docs/tasks.md` under the appropriate milestone:
- Backend tasks (API, DB)
- Frontend tasks (UI, routes)
- Test tasks

### 7. Update handoff
Update `docs/handoff.md` with the new flow and any open implementation questions.
