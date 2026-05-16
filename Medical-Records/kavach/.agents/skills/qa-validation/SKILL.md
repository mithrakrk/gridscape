---
name: qa-validation
description: Test strategy, API validation, user-flow validation, bug triage, regression planning.
use_when:
  - Planning test coverage for a feature
  - Reviewing and expanding the test suite
  - Triaging and logging bugs
  - Planning regression testing before a release
outputs:
  - New/updated tests in tests/
  - Updated docs/test-cases.md
  - Bug entries in docs/qa.md
  - Completed QA checklist in docs/qa.md
---

# Skill: QA Validation

## When to Apply
Apply this skill when writing tests, validating features, triaging bugs, or planning regression runs.

## Test Strategy

### Coverage Priority
In order of priority:
1. Auth and access control (any breach = critical)
2. PHI exposure paths (logging, error responses, cross-patient scoping)
3. Core flow: upload → extract → correct → summarise → share → portal access
4. Confidence handling and correction queue
5. Erasure and soft-delete flows
6. Edge cases (empty states, timeouts, rate limits)

### Test Placement
- Unit tests: `tests/unit/` — pure logic, no DB or network
- Integration tests: `tests/integration/` — DB + queue + multi-step flows
- API tests: `tests/api/` — HTTP endpoints, auth, response shapes
- Workflow tests: `tests/workflows/` — end-to-end scenario runs
- Fixtures: `tests/fixtures/` — synthetic data only, labelled as such

### API Validation Checklist
For any new API endpoint:
- [ ] Auth validation: does the route reject unauthenticated requests (401)?
- [ ] Authorisation: does the route reject cross-account access (403)?
- [ ] Input validation: does it reject malformed requests (400)?
- [ ] PHI in error response: does it avoid exposing PHI in errors?
- [ ] Response shape: does it match the documented `{ data, error }` contract?

### Bug Triage
Severity levels (from `docs/qa.md`):
- **Critical:** PHI exposure, data loss, auth bypass
- **High:** Core flow broken, no workaround
- **Medium:** Partial functionality, workaround exists
- **Low:** Cosmetic, non-blocking

Always log bugs in `docs/qa.md` using the issue log template.

### Regression Planning
Before any significant change to extraction, OTP, or summary generation:
1. Identify all test cases in `docs/test-cases.md` related to the changed area
2. Verify each has a corresponding automated test
3. Run the test suite and confirm all pass
4. Add any missing test before merging
