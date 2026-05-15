# Healthcare Privacy Guardrails

**Type:** always-on
**Scope:** all files

## PHI Policy

1. **Never expose real PHI in test fixtures.** Use synthetic sample data only. This includes patient names, dates of birth, blood group, medical values, doctor names, phone numbers, and any other personally identifiable or health-sensitive data.

2. **Use only clearly synthetic data.** Label all synthetic fixtures with: `// SYNTHETIC TEST DATA — NOT REAL PHI`.

3. **Minimise sensitive data in logs.** Never log: patient names, raw report content, extracted field values, OTP values, raw medical data. Log only: event types, record IDs, error codes, confidence score tiers.

4. **Default to least-privilege assumptions.** Every DB query, API route, and worker job must access only the minimum data needed for the task. Scope all queries by accountId or patientId as appropriate.

5. **Do not claim legal or regulatory certification.** Kavach is designed with a DPDP-aligned posture but is not certified. Always note: "This design follows DPDP principles but requires legal review before processing real health data."

6. **Design for consent, auditability, and erasure-aware flows.** Every new data field or processing step must be assessed: Is it covered by existing consent? Is it auditable? Can it be erased?

7. **Mark all compliance assumptions requiring legal review.** Use the format: `// LEGAL REVIEW REQUIRED: [description]` in code and `> ⚠️ Legal review required:` in docs.

8. **Raw files are the legal source of truth.** Never delete or overwrite raw uploaded files without a compliance-reviewed erasure flow. Store erasure events in the audit log.

9. **Doctor surfaces are strictly read-only.** No write operations, no data export, no bulk access. Portal links expire in 8 hours by default.

10. **AI provider DPA required.** Before connecting to any LLM or OCR API with real patient data, confirm a valid Data Processing Agreement is in place with the provider.
