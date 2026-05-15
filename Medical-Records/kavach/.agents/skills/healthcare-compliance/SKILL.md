---
name: healthcare-compliance
description: Consent modeling, erasure and retention workflows, privacy-aware design review, audit and access assumptions, legal-review flags.
use_when:
  - Designing or reviewing consent capture flows
  - Designing or reviewing erasure/deletion workflows
  - Reviewing any new data field or processing step for privacy implications
  - Flagging items that require legal review
outputs:
  - Updated docs/compliance.md
  - New compliance-related test cases in docs/test-cases.md
  - Legal review flags in code and docs
---

# Skill: Healthcare Compliance

## When to Apply
Apply this skill when designing any feature that touches personal health data, consent, erasure, or audit logging.

## Key Principles

### Consent Modeling
- Consent must be explicit, informed, and purpose-specific
- Consent record must capture: account ID, consent version, consent text, timestamp, IP address
- Never process data without a valid consent record
- Purpose limitation: data collected for summary generation cannot be used for other purposes without new consent

### Erasure and Retention
- Erasure = tombstoning: PHI fields nulled, `deletedAt` set, audit log shell retained
- Never physically delete records without a compliance-reviewed retention period
- S3 lifecycle policy must be applied to raw files on erasure
- Erasure flow: ERASURE_REQUESTED audit event → tombstone → S3 lifecycle → confirmation

### Privacy-Aware Design Review
For any new data field, ask:
1. Is this data necessary for the stated purpose? (data minimisation)
2. Is it covered by existing consent?
3. Can it be erased when requested?
4. Can it be corrected when wrong?
5. Is it auditable?

### Audit Logging
Every significant data event must create an AuditEvent:
- RECORD_UPLOADED, RECORD_DELETED, FIELD_CORRECTED
- PORTAL_ACCESSED, PORTAL_OTP_LOCKOUT
- CONSENT_GIVEN, CONSENT_WITHDRAWN
- ERASURE_REQUESTED, ERASURE_COMPLETED

Audit events must never contain PHI field values — only record IDs, event types, and non-PHI metadata.

### Legal Review Flags
Mark items requiring legal review with:
- In code: `// LEGAL REVIEW REQUIRED: [description]`
- In docs: `> ⚠️ Legal review required: [description]`
- In docs/compliance.md: add to the "Assumptions Requiring Legal Review" table

Current open legal review items: L-01 through L-07 in `docs/compliance.md`.
