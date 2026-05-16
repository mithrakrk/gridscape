# Product Requirements — Kavach

> Last updated: 2026-05-16

---

## Functional Requirements

### FR-01: Account and Authentication
- Caregiver creates account with phone number
- OTP sent to phone for verification
- Account persists across sessions via secure cookie
- Caregiver can update phone number (requires re-verification)

### FR-02: Patient Profile Management
- Caregiver can create, edit, and delete patient profiles
- Each profile stores: name, date of birth, blood group, weight, known allergies
- Multiple patients per account (no limit in v1)
- Patient profiles are private to the account

### FR-03: Consent Capture
- Consent presented at account creation
- Explicit acceptance required before any data processing
- Consent record stored with version, timestamp, and IP address
- Caregiver can view consent history in account settings

### FR-04: WhatsApp Ingestion
- Bot receives JPEG, PNG, and PDF attachments
- Bot asks for patient attribution and record type
- Documents stored as raw files in S3 (permanently)
- Ingestion pipeline runs after classification
- Bot sends confirmation or clarification request

### FR-05: OCR and Extraction
- OCR extracts text from images and PDFs
- LLM extracts structured fields from OCR text
- LLM-as-judge validates extraction and scores confidence
- All fields have per-field confidence scores

### FR-06: Caregiver Correction Flow
- Low-confidence fields trigger WhatsApp notification with specific questions
- Caregiver can reply with text correction or re-upload clearer photo
- Corrections preserved with audit trail (before + after)
- Caregiver can also correct fields via PWA record detail view

### FR-07: Patient Record Browser (PWA)
- Caregiver sees list of records per patient
- Records show type, date, confidence tier (HIGH/LOW/PENDING)
- Caregiver can view extracted fields per record
- Caregiver can open/download original file
- Caregiver can edit extracted fields

### FR-08: Summary Generation
- Caregiver triggers summary for a patient
- System generates 7-section structured summary using RAG
- Summary previewed in PWA before sharing
- PDF rendered with patient snapshot, conditions, medications, lab trends, visits, portal link

### FR-09: Doctor Summary Sharing
- Caregiver shares PDF via WhatsApp (bot sends PDF to caregiver)
- Caregiver can copy portal link from PWA
- Portal link has 8-hour TTL
- AccessToken created and stored on share

### FR-10: Doctor Portal
- Doctor opens time-limited link in browser
- OTP sent to caregiver's phone for verification
- Doctor enters OTP to gain read-only access
- Doctor can view summary and open individual records
- Doctor cannot modify data

### FR-11: Erasure and Deletion
- Caregiver can delete individual records (soft delete)
- Caregiver can delete patient profiles (tombstone + related record deletion)
- S3 lifecycle policy applies to deleted raw files
- Audit event created for all deletion requests

---

## Non-Functional Requirements

### NFR-01: Performance
- Page load time < 3 seconds on 4G mobile connection
- PDF generation < 30 seconds
- OCR/extraction pipeline < 60 seconds per document
- WhatsApp bot response within 5 seconds (acknowledgement) and 90 seconds (processing complete)

### NFR-02: Security
- All data encrypted in transit (TLS 1.2+) and at rest (S3 SSE, RDS encryption)
- No PHI in logs
- OTP brute-force protection (max 3 attempts)
- Time-limited tokens for all sharing

### NFR-03: Compliance
- DPDP Act 2023 compliant design (consent, correction, erasure)
- Data stored in AWS Mumbai (ap-south-1)
- Audit log for all significant data events
- AI provider DPA required before processing real data

### NFR-04: Availability
- MVP target: 99% uptime (excludes scheduled maintenance)
- Ingestion pipeline failures must not result in data loss (retry with backoff)
- Raw files never lost (S3 versioning enabled)

### NFR-05: Usability
- Doctor summary readable in < 60 seconds by a doctor unfamiliar with Kavach
- WhatsApp bot interaction completable in < 5 messages per document upload
- PWA usable on Android and iOS without app store installation
- Doctor portal usable without Kavach account or app

---

## MVP Success Criteria

| Metric | Target |
|---|---|
| First document successfully ingested and extracted | Yes (any user) |
| Doctor summary generated from ≥3 verified records | Yes |
| Doctor portal accessed via OTP successfully | Yes |
| End-to-end latency (upload → WhatsApp confirmation) | < 2 minutes |
| LLM-as-judge catches intentional extraction error in test | Yes |
| Correction flow updates field and audit trail | Yes |
| Erasure flow marks records as deleted | Yes |

---

## Operational Assumptions

- No SMS provider selection finalised — twilio or AWS SNS are candidates
- WhatsApp Business API registered and approved by Meta before launch
- LLM provider DPA signed before processing real health data
- AWS Mumbai infrastructure provisioned before first real user
- No production deployment checklist yet — to be created before beta
