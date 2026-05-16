---
name: ship-check
description: Pre-ship verification - docs freshness, blockers, open tasks, security/compliance assumptions, MVP readiness, highest-risk gaps.
trigger: /ship-check
steps:
  - 1. Verify all docs are current and consistent with code
  - 2. Review open blockers in docs/progress.md
  - 3. Review open tasks in docs/tasks.md
  - 4. Review security assumptions in docs/security.md
  - 5. Review compliance assumptions in docs/compliance.md
  - 6. Verify all automated tests pass
  - 7. Verify no real PHI in any fixture, log, or documentation example
  - 8. List highest-risk gaps before shipping
---

# Workflow: Ship Check

Use this workflow before any feature release, beta launch, or major handoff.

## Steps

### 1. Verify docs freshness
Check each doc for staleness:
- `docs/progress.md` — does current status match reality?
- `docs/tasks.md` — are completed items marked, next items clear?
- `docs/changelog.md` — does it have an entry for every meaningful recent change?
- `docs/handoff.md` — is it ready for the next session?
- `docs/architecture.md` — does it match the actual code structure?
- `docs/data-model.md` — does it match the actual Prisma schema?

### 2. Review blockers
List all current blockers from `docs/progress.md`.
For each: is it resolved? If not, is it documented?

### 3. Review open tasks
From `docs/tasks.md`:
- What is in the current milestone and not yet done?
- What is blocking the next milestone?

### 4. Review security assumptions
From `docs/security.md`:
- OTP flow implemented as documented?
- Token scoping correct?
- No PHI in logs or error responses?
- Secrets managed via Secrets Manager, not `.env` files?

### 5. Review compliance assumptions
From `docs/compliance.md`:
- Consent capture implemented?
- Erasure workflow implemented?
- Audit logging implemented for all significant events?
- Legal review items (L-01 through L-07) — which are resolved, which are still open?

### 6. Run all tests
- `npm test` — all tests must pass
- No skipped tests without documented reason

### 7. PHI audit
- Check `tests/fixtures/` — any real PHI? (Must be zero)
- Check server logs from dev run — any PHI values logged? (Must be zero)
- Check error response payloads — any PHI? (Must be zero)

### 8. List highest-risk gaps
Document in `docs/handoff.md` or as a ship-check report:
- Unresolved legal review items
- Unresolved security assumptions
- Test coverage gaps
- Unconfirmed external dependencies (WhatsApp API, LLM DPA, AWS setup)
