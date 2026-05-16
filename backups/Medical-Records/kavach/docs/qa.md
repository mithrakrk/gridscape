# QA — Kavach

> Last updated: 2026-05-16

---

## QA Checklist Template

Use this checklist before marking any feature as done.

```
## QA Checklist — [Feature Name] — [Date]

### Automated Tests
- [ ] Unit tests written and passing for core logic
- [ ] Integration test covers happy path
- [ ] Edge cases covered (empty state, error state, boundary values)
- [ ] Test fixture uses synthetic data only (no real PHI)

### Manual Verification
- [ ] Happy path manually verified in local dev environment
- [ ] Error states tested (invalid input, API failure, expired token)
- [ ] PHI not visible in browser network tab responses (error responses)
- [ ] Console clear of unexpected errors

### Security Checks
- [ ] No PHI logged to console or server logs
- [ ] Auth/session validation on all relevant API routes
- [ ] Relevant test cases in docs/test-cases.md covered

### Docs
- [ ] docs/progress.md updated
- [ ] docs/tasks.md updated
- [ ] docs/changelog.md updated
- [ ] docs/handoff.md ready for next session
```

---

## Issue Log Template

```
## Bug: [Short title]

**Date found:** YYYY-MM-DD
**Found by:** [Name or agent]
**Severity:** Critical | High | Medium | Low
**Status:** Open | In Progress | Resolved

### Description
[What happens and when]

### Steps to reproduce
1.
2.
3.

### Expected behaviour
[What should happen]

### Actual behaviour
[What actually happens]

### Fix applied
[Link to commit or PR, or description of fix]

### Test added
[Yes — test case reference | No — reason]
```

---

## Severity Definitions

| Severity | Definition | Example |
|---|---|---|
| **Critical** | Data loss, PHI exposure, security breach, system down | PHI visible in logs; record lost after upload |
| **High** | Feature completely broken, blocking core flow | Summary generation fails for all users; OTP verification broken |
| **Medium** | Feature partially broken, workaround exists | Low-confidence detection threshold too aggressive; portal loads slowly |
| **Low** | Minor UX issue, cosmetic bug, non-blocking | Button label incorrect; typo in bot message |

---

## Regression Guidance

Before any significant change to:
- Extraction pipeline → run `tests/integration/extraction.test.ts`
- OTP flow → run `tests/integration/portal-otp.test.ts` and `tests/api/otp.test.ts`
- Summary generation → run `tests/integration/summary-generation.test.ts`
- Caregiver auth → run `tests/api/patients.test.ts` (auth checks)
- WhatsApp webhook → run `tests/integration/whatsapp-ingestion.test.ts`
- Consent/erasure flows → run `tests/unit/consent.test.ts`

Always run the full test suite before merging a feature branch.

---

## Issue Log

_No issues logged yet. Add entries using the template above as bugs are found._
