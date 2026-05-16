# Security — Kavach

> Last updated: 2026-05-16

---

## Access Control Assumptions

| Actor | Access Level | Mechanism |
|---|---|---|
| Caregiver | Read/write own account data | Session cookie + account-scoped queries |
| Doctor | Read-only time-limited portal | Tokenized link + OTP verification |
| System worker | DB read/write for processing | Service account, least-privilege IAM role |
| Admin | Not in v1 | Deferred |

- All caregiver API calls validate the session and scope queries to `accountId`
- Doctor portal queries are scoped to the specific `patientId` the token was issued for
- Workers operate under a separate DB role with no access to auth or consent tables

---

## OTP Flow Assumptions

1. Caregiver generates a portal link in the PWA
2. System creates an `AccessToken` record (8-hour TTL)
3. Link is shared (via WhatsApp or copy-to-clipboard) to the doctor
4. Doctor opens the link
5. System sends an OTP to the caregiver's registered phone number
6. Doctor obtains OTP from caregiver (in-person or via message)
7. Doctor enters OTP on the portal page
8. System verifies OTP (bcrypt hash comparison), marks `otpVerified = true`, sets `usedAt`
9. Doctor receives a short-lived session (≤8 hours remaining on token)
10. OTP hash cleared from DB after verification

**OTP properties:**
- 6-digit numeric
- Expires in 10 minutes if not used
- Single use
- Rate-limited: max 3 OTP attempts per token before lockout

---

## Secure Link Design

- Token is a cryptographically random string (128-bit, URL-safe base64)
- Token stored as hash in DB (not plaintext)
- Link format: `https://kavach.app/portal/{token}` — token in path not query string
- Links are never logged in application logs
- S3 pre-signed URLs used for raw file access (short TTL, 15 minutes)
- Summary PDF links: pre-signed S3 URLs or time-limited CDN signed URLs

---

## Logging Guidance

**Never log:**
- Patient names, dates of birth, blood group, or any PHI field values
- Raw medical report content or extracted field values
- OTP values (before or after hashing)
- Raw S3 file content
- Full tokens (log only first 8 characters + `...` for debugging)

**Log (structured, non-PHI):**
- Event types (RECORD_UPLOADED, PORTAL_ACCESSED, EXTRACTION_FAILED)
- Record IDs (internal, non-guessable cuid)
- Confidence score tiers (HIGH/LOW, not exact float)
- File types and sizes
- Error codes and stack traces (scrubbed of PHI)

---

## Secrets Management

| Secret | Storage |
|---|---|
| Database connection string | AWS Secrets Manager |
| S3 access keys | IAM role (instance profile), not static keys |
| WhatsApp API token | AWS Secrets Manager |
| LLM API key | AWS Secrets Manager |
| OTP signing secret | AWS Secrets Manager |
| Session secret | AWS Secrets Manager |
| Redis connection | AWS Secrets Manager |

**Rule:** No secrets in environment variable files committed to Git. `.env.example` files show structure only with placeholder values.

---

## Basic Threat Model

| Threat | Mitigation |
|---|---|
| Unauthorised access to patient records | Account-scoped DB queries; JWT/session validation on every request |
| Doctor portal link interception | OTP required even with valid token; link expiry |
| OTP brute force | Max 3 attempts; token lockout after failure |
| Extraction hallucinations exposing false medical data | LLM-as-judge validation; caregiver correction flow; confidence flagging |
| S3 pre-signed URL sharing | Short TTL (15 min); URLs not stored in DB |
| Session hijacking | httpOnly, Secure, SameSite=Strict cookies |
| PHI in logs | Structured logging with explicit PHI exclusion rules |
| Accidental data deletion | Soft delete with tombstoning; erasure is a multi-step flow |
| API abuse (WhatsApp webhook spam) | Webhook signature verification; rate limiting on ingestion queue |
| Insider access to raw data | Least-privilege IAM; no direct DB access for application except via ORM |
| LLM API data leakage | DPA with provider; no raw PHI fields sent in prompt if avoidable |

---

## Deferred Security Items (Post-v1)

- [ ] Multi-factor auth for caregiver account
- [ ] Push-confirm doctor access (like Google Auth prompt)
- [ ] IP allowlisting for admin operations
- [ ] Full penetration test before public launch
- [ ] SOC 2 / ISO 27001 readiness assessment (if enterprise customers added)
- [ ] Incident response runbook
