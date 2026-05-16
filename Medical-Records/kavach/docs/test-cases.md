# Test Cases — Kavach

> Last updated: 2026-05-16
> Automated executable tests → `tests/`
> Manual scenarios and acceptance criteria → this file
> QA observations and bug logs → `docs/qa.md`

---

## Onboarding Cases

### TC-001: New caregiver account creation
- **Given:** User opens PWA for the first time
- **When:** Enters valid India mobile number, receives OTP, enters OTP
- **Then:** Account created, consent screen shown, first patient prompt shown
- **Checks:** ConsentRecord stored, Account.phoneNumber set, session cookie issued

### TC-002: Consent flow
- **Given:** New account, consent screen shown
- **When:** Caregiver reads and accepts consent
- **Then:** ConsentRecord saved with consent version, timestamp, IP
- **Checks:** Caregiver cannot proceed without accepting; consent text matches displayed version

### TC-003: Duplicate phone number
- **Given:** Phone number already registered
- **When:** Same number entered on signup
- **Then:** Existing account login flow, not duplicate account creation

---

## Patient Profile Cases

### TC-004: Add patient profile
- **Given:** Authenticated caregiver, no patients yet
- **When:** Fills name + date of birth (required fields)
- **Then:** PatientProfile created, caregiver lands on patient detail page

### TC-005: Multi-patient switcher
- **Given:** Account with 3 patients
- **When:** Caregiver opens dashboard
- **Then:** All 3 patients shown in switcher; selecting one scopes all records to that patient

---

## Ingestion Cases

### TC-006: WhatsApp PDF upload — single patient account
- **Given:** Account with 1 patient; caregiver sends PDF to bot
- **When:** Bot receives PDF
- **Then:** Bot skips patient attribution (auto-attributes); asks for record type only
- **Checks:** Record created with correct patientId; rawFileUrl in S3

### TC-007: WhatsApp image upload — multi-patient account
- **Given:** Account with 2 patients; caregiver sends JPEG
- **When:** Bot receives image
- **Then:** Bot shows patient selection buttons (Patient A / Patient B)
- **Checks:** State machine moves to AWAITING_PATIENT

### TC-008: Unsupported file type rejection
- **Given:** Caregiver sends a .docx file to bot
- **When:** Bot receives the file
- **Then:** Bot replies "Only photos (JPG/PNG) and PDFs are supported." No record created.

### TC-009: Oversized file rejection
- **Given:** Caregiver sends a file > 16MB
- **When:** Bot receives the file
- **Then:** Bot replies with size error. No record created.

---

## Extraction Cases

### TC-010: High-confidence extraction auto-acceptance
- **Given:** Clear lab report PDF with legible text
- **When:** Extraction + judge run
- **Then:** Overall confidence ≥ 0.85; record marked as judgeVerified=true; bot sends success message
- **Checks:** All ExtractedFields have correct values from fixture

### TC-011: Low-confidence field triggers clarification
- **Given:** Blurry prescription image; dosage field partially illegible
- **When:** Extraction + judge run
- **Then:** Dosage field confidence < 0.85; WhatsApp correction message sent to caregiver
- **Checks:** Correction message includes field name, extracted value, and correction prompt

### TC-012: Re-upload correction flow
- **Given:** Low-confidence record awaiting correction
- **When:** Caregiver sends clearer photo in WhatsApp
- **Then:** New extraction runs on new file; same Record updated; previous extraction preserved in provenance
- **Checks:** Record.provenance updated with new file key; field corrected

---

## Correction Cases

### TC-013: Text correction via WhatsApp
- **Given:** Low-confidence dosage field; bot asks for correction
- **When:** Caregiver replies "500mg"
- **Then:** ExtractedField.correctedValue = "500mg"; correctedAt set; AuditEvent FIELD_CORRECTED logged

### TC-014: PWA correction flow
- **Given:** Record with a field caregiver wants to fix
- **When:** Caregiver opens record in PWA, edits doctor name field
- **Then:** Field saved with correctedValue; manuallyVerified = true; AuditEvent logged

---

## Summary Generation Cases

### TC-015: Summary generation from verified records
- **Given:** Patient with 5 verified records (2 lab reports, 2 prescriptions, 1 consultation)
- **When:** Caregiver taps "Generate Summary"
- **Then:** All 7 summary sections populated; PDF generated; pre-signed URL returned
- **Checks:** Lab trends include expected markers; medications from active prescriptions only

### TC-016: Summary excludes unverified low-confidence records
- **Given:** Patient with 3 verified records + 1 low-confidence unverified record
- **When:** Summary generated
- **Then:** Low-confidence record not included in summary; verified records included
- **Checks:** PDF does not contain data from unverified record

### TC-017: Portal link created on summary share
- **Given:** Summary generated, caregiver taps "Share with Doctor"
- **When:** Share action executes
- **Then:** AccessToken created with 8h TTL; token linked to patient; PDF sent to caregiver WhatsApp

---

## Portal OTP Access Cases

### TC-018: Successful OTP verification
- **Given:** Valid, unexpired portal link; OTP requested
- **When:** Doctor enters correct OTP within 10 minutes
- **Then:** otpVerified = true; session issued; portal summary shown; AuditEvent PORTAL_ACCESSED logged

### TC-019: Expired portal link
- **Given:** AccessToken.expiresAt in the past
- **When:** Doctor opens link
- **Then:** "This link has expired" page shown. No OTP sent.

### TC-020: OTP lockout after 3 failures
- **Given:** Valid portal link, OTP sent
- **When:** Doctor enters wrong OTP 3 times
- **Then:** Token locked; AuditEvent PORTAL_OTP_LOCKOUT logged; error shown: "Too many attempts. Ask the caregiver for a new link."

### TC-021: Caregiver revokes active portal link
- **Given:** Active portal link shared
- **When:** Caregiver revokes from PWA
- **Then:** AccessToken.revokedAt set; portal immediately returns expired message to doctor

---

## Deletion and Erasure Cases

### TC-022: Record soft delete
- **Given:** Record exists and is visible in PWA
- **When:** Caregiver deletes the record
- **Then:** Record.deletedAt set; not shown in PWA; AuditEvent RECORD_DELETION_REQUESTED logged

### TC-023: Patient profile deletion
- **Given:** Patient with 3 records and 1 active AccessToken
- **When:** Caregiver deletes patient profile (confirms by typing name)
- **Then:** All records soft deleted; AccessToken revoked; PatientProfile.deletedAt set; AuditEvent PROFILE_ERASURE_REQUESTED logged

### TC-024: Deleted patient not accessible via portal
- **Given:** Portal link existed for deleted patient
- **When:** Doctor opens link after patient deletion
- **Then:** "This link is no longer valid" shown (token revoked)

---

## Security and Misuse Cases

### TC-025: Webhook signature invalid → reject
- **Given:** POST to /api/webhooks/whatsapp with invalid X-Hub-Signature-256
- **When:** Handler processes request
- **Then:** 401 returned; no processing occurs; event logged (non-PHI)

### TC-026: Portal accessed without OTP → denied
- **Given:** Valid token URL opened in browser
- **When:** Attempt to access portal content without completing OTP
- **Then:** Redirect to OTP page; portal content not returned

### TC-027: Cross-patient token access attempt
- **Given:** AccessToken issued for Patient A
- **When:** Attempt to query Patient B records using this token
- **Then:** 403 returned; query scoped to patientId on token only

### TC-028: PHI not present in API error responses
- **Given:** Any API error condition (500, 400, 404)
- **When:** Error response returned
- **Then:** Error JSON contains only error code and non-PHI message; no patient name, field values, or raw content

---

## Manual Usability Checks

### MU-01: Doctor summary readable in 60 seconds
- Give printed summary to a doctor unfamiliar with Kavach
- Time how long it takes to identify: patient name, active condition, current medications, most recent HbA1c
- Target: all 4 identified in < 60 seconds without explanation

### MU-02: WhatsApp bot interaction completable in 5 messages
- Upload a document as a new caregiver
- Count the number of bot messages exchanged before confirmation
- Target: ≤ 5 messages for a clear, single-patient document

### MU-03: PWA usable on Android without installation
- Open PWA on Android Chrome without installing
- Verify: patient list loads, records accessible, summary generation works, no app store required
