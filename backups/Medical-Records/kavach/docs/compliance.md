# Compliance — Kavach

> Last updated: 2026-05-16
> **Important:** This document describes the compliance posture Kavach is designed for. It is not a legal certification. Consult a qualified legal advisor before processing real patient health data.

---

## Regulatory Context

Kavach targets compliance with the **Digital Personal Data Protection (DPDP) Act, 2023** (India). This Act governs the processing of personal data of Indian citizens.

Key requirements relevant to Kavach:
- **Consent:** Explicit, informed consent must be obtained before processing personal data
- **Purpose limitation:** Data may only be processed for the purpose for which consent was given
- **Data minimisation:** Collect only what is necessary for the stated purpose
- **Right to correction:** Data principals may request correction of inaccurate data
- **Right to erasure:** Data principals may request erasure of personal data
- **Grievance redressal:** A mechanism must exist for complaints and concerns
- **Data fiduciary obligations:** Kavach as data fiduciary must implement reasonable security safeguards

---

## Privacy Assumptions

1. **The caregiver is the data principal.** They provide consent on behalf of the account. For minors or incapacitated patients, additional consent considerations apply — **legal review required.**
2. **The patient is the beneficiary, not the account holder.** Patient health data is processed under the caregiver's consent, for the patient's benefit. The legal relationship between caregiver consent and patient rights requires legal review.
3. **Kavach is not a healthcare provider.** It is a data organisation tool. It does not provide diagnosis, treatment, or medical advice.
4. **Doctors are data consumers, not data fiduciaries.** Their read-only portal access is gated by caregiver consent (OTP flow).

---

## Consent Expectations

### At Onboarding
- Caregiver reads and accepts:
  - Data processing purpose (medical record organisation and summary sharing)
  - Storage location (AWS Mumbai, India)
  - Sharing conditions (doctor portal access is caregiver-controlled)
  - Right to correction and erasure
- Consent record stored: `ConsentRecord` with consent text version, timestamp, IP address

### When Enabling Doctor Portal Sharing
- Explicit confirmation that a time-limited link will be generated and shared
- OTP verification required to activate portal access

### When Adding a New Patient Profile
- Caregiver acknowledges they have authority to manage health records for this person
- **Legal review required:** What constitutes adequate authority in the Indian context?

---

## Correction Expectations

- Caregivers may correct any extracted field via the PWA correction interface or WhatsApp reply
- Corrections are preserved with `correctedAt`, `correctedBy`, and original value in `rawValue`
- AuditEvent records both original extraction and correction
- Caregiver may request correction of account-level data (phone number, email) via account settings

---

## Erasure Expectations

### Erasure Workflow (Scaffold)
1. Caregiver requests erasure (patient profile deletion or specific record removal)
2. `ERASURE_REQUESTED` AuditEvent created
3. System applies tombstoning: PHI fields nulled/cleared, `deletedAt` set
4. S3 lifecycle policy triggers raw file deletion after retention period
5. Summary artifacts associated with the patient marked for deletion
6. AuditEvent shell preserved for legal audit continuity (no PHI retained in audit log)

### Retention Placeholders
- **Default retention period:** [NEEDS LEGAL REVIEW — placeholder: 30 days post-erasure request]
- **Minimum retention for audit continuity:** [NEEDS LEGAL REVIEW]
- **Raw file retention after account deletion:** [NEEDS LEGAL REVIEW]

> ⚠️ **Legal review required:** Specific retention periods, tombstoning mechanics, and audit trail preservation requirements under DPDP Act 2023 must be confirmed with a qualified legal advisor.

---

## Data Minimisation

- Collect only: phone number (required), email (optional), patient demographics needed for summary
- Do not collect: Aadhaar, financial data, insurance IDs (not needed for MVP)
- Extracted fields: only extract fields relevant to the doctor summary sections
- Log metadata only (file type, size, confidence score tier) — never log raw PHI content

---

## AWS Mumbai Region Note

All data storage and processing infrastructure is provisioned in **AWS ap-south-1 (Mumbai)**:
- RDS PostgreSQL instance: Mumbai
- S3 bucket: Mumbai (with versioning and SSE-S3 encryption)
- ElastiCache Redis: Mumbai
- CloudFront: nearest edge to India

AI processing (OpenAI / Gemini API calls) involves data leaving India momentarily. This requires:
- A Data Processing Agreement (DPA) with the AI provider
- Confirmation that the provider's DPA is compatible with DPDP Act 2023 requirements
- **Legal review required:** Whether transient AI processing in foreign jurisdiction is permissible under DPDP for health data

---

## Security Assumptions (See also `docs/security.md`)

- OTP gating for doctor portal access
- httpOnly session cookies for caregiver auth
- Time-limited access tokens (8 hours for doctor portal)
- Secrets managed via AWS Secrets Manager
- No PHI in logs or error messages
- Role-based access: caregiver (read/write own data), doctor (read-only portal), system worker (least-privilege)

---

## Assumptions Requiring Legal Review

| # | Assumption | Risk if Wrong |
|---|---|---|
| L-01 | Caregiver consent covers processing patient health data | Consent may be invalid for third-party health data |
| L-02 | Tombstoning satisfies DPDP erasure requirement | Physical deletion may be required |
| L-03 | Transient AI processing (API calls) outside India is permissible | May require India-based AI processing only |
| L-04 | 8-hour portal link is adequate OTP consent scope | Consent scope may need to be narrower |
| L-05 | Audit log shell retention after erasure is permissible | May not be allowed to retain any record |
| L-06 | Data retention period after deletion request | Specific period must be compliant |
| L-07 | What constitutes adequate caregiver authority over a patient's records | Especially relevant for elderly patients who can consent themselves |
