# User Flows — Kavach

> Last updated: 2026-05-16

---

## Journey 1: Caregiver Onboarding

```
1. Caregiver opens Kavach PWA (link from doctor referral card or WhatsApp message)
2. Enters phone number → OTP sent → OTP verified → Account created
3. Consent screen shown:
   - Data processing purpose
   - Storage location (India)
   - Sharing conditions
   - Right to correction and erasure
   Caregiver accepts → ConsentRecord created
4. Prompted to add first patient profile:
   - Name
   - Date of birth
   - Blood group (optional)
   - Known allergies (optional)
5. WhatsApp bot link shown:
   - "Send your medical reports to this WhatsApp number to start organising them"
   - QR code + phone number displayed
6. Dashboard shown: patient switcher + empty record list with CTA
```

**Test refs:** TC-001, TC-002, TC-003

---

## Journey 2: Patient Profile Creation

```
1. Caregiver taps "Add Patient" in PWA
2. Fills form:
   - Name (required)
   - Date of birth (required)
   - Relationship to caregiver (optional, for display)
   - Blood group (optional)
   - Known allergies (optional, multi-entry)
3. Patient profile saved → PatientProfile record created
4. Caregiver lands on patient detail page (empty records)
```

**Test refs:** TC-004, TC-005

---

## Journey 3: WhatsApp Report Ingestion

```
1. Caregiver opens WhatsApp, sends photo or PDF to Kavach bot number
2. Bot responds: "Got it! Is this for [Patient A] or [Patient B]?"
   (shows patient names from account)
3. Caregiver replies with patient name or number
4. Bot: "What type of document is this?
   1. Lab report  2. Prescription  3. Consultation note  4. Other"
5. Caregiver selects type
6. Bot: "Thanks! Processing your document..."
7. Ingestion pipeline runs: OCR → Extraction → Judge
8a. HIGH CONFIDENCE:
    Bot: "✅ Done! Added [record type] dated [date] to [patient name]'s records."
8b. LOW CONFIDENCE (specific fields):
    Bot: "We processed your document but need help with a few details.
    📋 [record type] dated [date]
    ❓ We couldn't read: Dosage. It looks like '250m' — is this 250mg or 500mg?
    Reply with the correct value or send a clearer photo."
9. Caregiver replies → field corrected → record marked verified
```

**Test refs:** TC-006, TC-007, TC-008, TC-009, TC-010

---

## Journey 4: Low-Confidence Extraction Correction

```
1. Record uploaded and extraction runs (Journey 3 path 8b)
2. Correction queue entry created
3. WhatsApp message sent to caregiver with flagged fields
4. Caregiver options:
   a. Reply with correct value → ExtractedField.correctedValue set
   b. Send clearer photo → new extraction run, linked to same record
   c. Ignore (record stays as LOW_CONFIDENCE — not included in summary automatically)
5. AuditEvent: FIELD_CORRECTED with before/after values
6. If all flagged fields resolved: record status updated to verified
7. PWA shows correction status in record list
```

**Test refs:** TC-009, TC-010, TC-011

---

## Journey 5: Pre-Visit Summary Generation

```
1. Caregiver opens patient detail in PWA
2. Taps "Generate Summary"
3. System confirms: "Generate summary for [patient name]? This will include all verified records."
4. RAG pipeline retrieves verified records
5. LLM generates structured summary JSON (7 sections)
6. PDF rendered from template
7. Preview shown to caregiver in PWA:
   - Patient snapshot
   - Conditions, medications, lab trends
   - Recent visits
   - Portal link placeholder
8. Caregiver reviews and taps "Share with Doctor"
9. AccessToken created (8h TTL)
10. Portal link + QR embedded in PDF (re-rendered)
11. PDF sent to caregiver's WhatsApp by bot
12. Caregiver forwards PDF to doctor on WhatsApp
```

**Test refs:** TC-012, TC-013, TC-014

---

## Journey 6: Doctor Portal Access

```
1. Doctor receives PDF on WhatsApp from caregiver
2. Doctor scans QR code or taps portal link
3. Browser opens Kavach portal page
4. OTP request page shown: "A verification code has been sent to the caregiver's phone"
5. OTP sent via SMS to caregiver's registered phone number
6. Caregiver shares OTP with doctor (verbally or via message)
7. Doctor enters 6-digit OTP
8. System verifies OTP:
   - OTP hash match + not expired (10 min) + within token expiry (8h)
   - AuditEvent: PORTAL_ACCESSED with IP address
9. Doctor views portal:
   - Same 7-section summary in web layout
   - "View Documents" section: list of records linked in summary
   - Doctor can open individual records (pre-signed S3 URLs, 15 min TTL)
10. Session expires when AccessToken TTL reached
```

**Test refs:** TC-015, TC-016, TC-017, TC-018

---

## Journey 7: Record Correction (PWA)

```
1. Caregiver opens record in PWA
2. Sees extracted fields with confidence indicators
3. Taps "Edit" on a field
4. Types correct value → saves
5. AuditEvent: FIELD_CORRECTED (before: rawValue, after: correctedValue)
6. Record marked: manuallyVerified = true
7. Summary will use corrected value on next generation
```

**Test refs:** TC-019, TC-020

---

## Journey 8: Deletion / Erasure Request

```
1. Caregiver navigates to patient profile settings (or record detail)
2. Selects "Delete Record" or "Delete Patient Profile"

   For record deletion:
   a. Confirmation dialog: "This will remove the document and all extracted data. This action cannot be undone."
   b. Caregiver confirms → Record soft deleted (deletedAt set)
   c. AuditEvent: RECORD_DELETION_REQUESTED
   d. S3 lifecycle: file marked for deletion after retention period
   e. Record no longer appears in UI or summaries

   For patient profile deletion:
   a. Warning: "This will delete [name]'s profile and all associated records. Any active portal links will be revoked immediately."
   b. Caregiver types patient name to confirm
   c. All records soft deleted → all AccessTokens revoked → profile tombstoned
   d. AuditEvent: PROFILE_ERASURE_REQUESTED
   e. Erasure workflow triggered (see docs/compliance.md)
```

**Test refs:** TC-021, TC-022, TC-023
