# Testing Rules

**Type:** always-on
**Scope:** all source and test files

## Placement
- **Automated tests** → `tests/` (unit/, integration/, workflows/, api/)
- **Manual scenarios and acceptance criteria** → `docs/test-cases.md`
- **QA observations and bug logs** → `docs/qa.md`
- **Test fixtures** → `tests/fixtures/` (synthetic data only)

## When Tests Are Required
Any meaningful change to the following MUST include test updates:
- Extraction pipeline (OCR, LLM extraction, judge step)
- Portal access and OTP verification flow
- Consent capture logic
- PDF generation
- Patient-record linkage and multi-patient scoping
- Erasure and soft-delete workflows
- WhatsApp webhook handler

## Test Data Policy
- **NEVER use real patient names, dates, medical values, or any PHI in test fixtures.**
- Use clearly synthetic names (e.g., "Arjun Mehta (Test)", "Priya Sharma (Synthetic)").
- Mark all fixtures with a header comment: `// SYNTHETIC TEST DATA — NOT REAL PHI`.

## Before Marking a Task Done
- All automated tests pass: `npm test` (or scoped equivalent).
- Relevant manual scenarios in `docs/test-cases.md` are updated.
- No new test uses real PHI.
- QA checklist in `docs/qa.md` is completed for the feature.
