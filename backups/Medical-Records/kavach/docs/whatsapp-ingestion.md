# WhatsApp Ingestion — Kavach

> Last updated: 2026-05-16

---

## Webhook Flow

```
Meta WhatsApp Cloud API
         │
         │ POST /api/webhooks/whatsapp
         ▼
[Webhook Handler]
  1. Verify X-Hub-Signature-256 header (HMAC-SHA256)
  2. Parse message type: text | image | document | interactive_reply
  3. Look up caregiver account by sender phone number
  4. Route to appropriate handler:
     - New media (image/document) → Ingestion Handler
     - Text reply → Conversation State Handler
     - Interactive reply (button tap) → Conversation State Handler
```

---

## Message and Attachment Handling

### Media Upload Message
1. Download media from WhatsApp servers using `mediaId`
2. Validate: file type (JPEG, PNG, PDF only), file size (max 16MB)
3. Upload to S3 raw: `s3://kavach-records/{accountId}/{patientId}/{timestamp}-{originalFilename}`
4. Create `Record` in DB: `recordType = PENDING`, `rawFileUrl` set, `confidenceScore = null`
5. Store conversation state: waiting for patient attribution
6. Send WhatsApp reply: patient attribution prompt

### Patient Attribution
- If account has 1 patient: auto-attribute, skip attribution step
- If account has 2–5 patients: numbered list buttons (WhatsApp interactive buttons)
- If account has 6+ patients: text prompt with patient names listed (buttons not supported for 6+)
- Caregiver selects patient
- Conversation state updated: patientId resolved

### Record Type Classification
After patient attribution:
1. Check if type obvious from file (e.g., filename contains "prescription", "lab"): pre-fill suggestion
2. Send classification prompt with 4–5 options as WhatsApp interactive buttons
3. Caregiver selects type
4. `Record.recordType` updated
5. Ingestion job queued: `{ recordId, patientId, s3Key }`

---

## Conversation State Machine

```
States:
  IDLE                    → waiting for new message
  AWAITING_PATIENT        → media received, waiting for patient selection
  AWAITING_RECORD_TYPE    → patient attributed, waiting for record type
  AWAITING_CORRECTION     → low-confidence field, waiting for caregiver correction
  PROCESSING              → job queued, bot will notify when done

Transitions:
  IDLE + media received         → AWAITING_PATIENT
  AWAITING_PATIENT + selection  → AWAITING_RECORD_TYPE
  AWAITING_RECORD_TYPE + type   → PROCESSING
  PROCESSING + HIGH_CONFIDENCE  → IDLE (bot sends success message)
  PROCESSING + LOW_CONFIDENCE   → AWAITING_CORRECTION
  AWAITING_CORRECTION + reply   → IDLE (correction saved, bot confirms)
  AWAITING_CORRECTION + media   → re-run extraction on new file
```

State is stored in Redis with caregiver phone number as key. TTL: 24 hours (conversation expires).

---

## Caregiver Clarification Flow

### Low-Confidence Extraction Notification
```
Bot message:
"We processed your [record type] dated [date] for [patient name].
We need help reading a few details:

❓ Medication dosage: We read '250m' — is this 250mg or 500mg?
❓ Doctor name: We read 'Dr. Sharm' — can you confirm the full name?

Please reply with corrections, or send a clearer photo of this document."
```

### Correction Handling
- Text reply: parsed against flagged fields; matched by order or by field label
- New photo: triggers fresh extraction, linked to existing `Record` record
- "Skip" reply: fields left as LOW_CONFIDENCE, record excluded from auto-summary but accessible in portal
- Multiple corrections in one reply: parsed sequentially

---

## Failure Modes

| Failure | Bot Response | System Action |
|---|---|---|
| File too large (>16MB) | "This file is too large (max 16MB). Please compress it and try again." | No record created |
| Unsupported file type | "Only photos (JPG/PNG) and PDFs are supported." | No record created |
| OCR returns empty | "We couldn't read text from this document. Please send a clearer photo." | Record marked EXTRACTION_FAILED |
| LLM API timeout | "Processing is taking longer than usual. We'll notify you when done." | Job retried with backoff (max 3 retries) |
| Account not found for phone | "Welcome! Please create your Kavach account at [link] first." | No record created |
| No patients on account | "You need to add a patient profile first. Visit [link]." | No record created |
| Webhook signature invalid | Reject silently (log for monitoring, no user message) | 401 returned to Meta |
| Conversation state expired | Reset to IDLE; send: "Let's start over. Please send your document again." | State cleared |

---

## Webhook Verification (Meta Requirement)

Meta sends a GET request to verify the webhook endpoint on setup:
```
GET /api/webhooks/whatsapp?hub.mode=subscribe&hub.verify_token={token}&hub.challenge={challenge}

Response: echo hub.challenge if hub.verify_token matches env WHATSAPP_VERIFY_TOKEN
```

---

## Rate Limiting

- Max 1 active processing job per caregiver at a time (queue deduplication)
- Max 10 document uploads per caregiver per day (free tier limit)
- WhatsApp conversation state writes rate-limited to prevent spam attacks
