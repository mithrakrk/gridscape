---
name: test-feature
description: Create missing tests, expand manual scenarios, record QA findings, update docs/qa.md.
trigger: /test-feature
steps:
  - 1. Read the feature docs and relevant code
  - 2. Review current test coverage for this feature
  - 3. Create missing automated tests
  - 4. Expand manual scenarios in docs/test-cases.md
  - 5. Run all tests and record results
  - 6. Log any bugs in docs/qa.md
  - 7. Update docs/tasks.md if test gaps revealed implementation gaps
---

# Workflow: Test Feature

Use this workflow when a feature exists but needs comprehensive test coverage.

## Steps

### 1. Read feature docs
- Read the relevant section of `docs/user-flows.md`
- Read related functional requirements in `docs/product-requirements.md`
- Read existing test cases in `docs/test-cases.md`

### 2. Review current coverage
- Check `tests/unit/`, `tests/integration/`, `tests/api/` for existing tests
- Identify gaps: which test cases in `docs/test-cases.md` have no corresponding automated test?

### 3. Create missing tests
For each gap:
- Write the automated test (unit for logic, integration for flows, api for endpoints)
- Use synthetic fixtures from `tests/fixtures/`
- Follow testing rules in `.agents/rules/testing-rules.md`

### 4. Expand manual scenarios
In `docs/test-cases.md`:
- Add missing edge case scenarios
- Add at least one security test case per auth/PHI-touching flow
- Reference test case IDs in workflow comments

### 5. Run tests
- `npm test` or scoped equivalent
- Record: passed, failed, skipped counts

### 6. Log bugs
For any failure or unexpected behaviour:
- Add to `docs/qa.md` using the issue log template
- Assign severity per the severity definitions

### 7. Update tasks
If test gaps revealed implementation gaps:
- Add implementation tasks to `docs/tasks.md`
- Flag in `docs/handoff.md` if blocking
