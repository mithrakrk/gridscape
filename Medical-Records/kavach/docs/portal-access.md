# Portal Access — Kavach

> Last updated: 2026-05-16

---

## Link Sharing Flow

1. Caregiver requests portal link from PWA (patient detail → "Share with Doctor")
2. System creates `AccessToken`:
   - `token`: 128-bit cryptographically random, URL-safe base64
   - `expiresAt`: now + 8 hours
   - `otpVerified`: false
   - `patientId`: scoped to this patient only
3. Link format: `https://kavach.app/portal/{token}`
4. PDF generated/updated with QR code encoding this link
5. PDF sent to caregiver via WhatsApp bot
6. Caregiver forwards PDF (and/or link) to doctor

---

## OTP Entry Flow

1. Doctor opens portal link in browser
2. Server validates token: exists, not revoked, not expired
3. If invalid: "This link has expired. Please ask the caregiver to generate a new summary."
4. If valid: OTP generation page rendered
   - "A verification code has been sent to the caregiver's mobile number"
   - OTP (6-digit) generated, bcrypt-hashed, stored in `AccessToken.otpHash`
   - OTP sent via SMS to caregiver's registered phone number
   - OTP expires in 10 minutes
5. Doctor enters OTP (from caregiver verbally or via message)
6. Server verifies:
   - bcrypt.compare(enteredOTP, storedHash)
   - OTP not expired (within 10 minutes)
   - Token not yet expired (within 8 hours)
   - Attempt count ≤ 3 (rate limit)
7. If OTP valid:
   - `otpVerified = true`
   - `usedAt` set
   - `otpHash` cleared (single use)
   - Session cookie set (scoped to token expiry)
   - AuditEvent: `PORTAL_ACCESSED` with IP address and timestamp
8. If OTP invalid:
   - Attempt count incremented
   - If attempts ≥ 3: token locked, AuditEvent: `PORTAL_OTP_LOCKOUT`
   - Error shown: "Incorrect code. X attempts remaining."

---

## Session Assumptions

- Portal session is stateless beyond the validated `AccessToken`
- Session cookie contains the token ID (not the raw token)
- Server re-validates token on every portal page request: not expired, not revoked
- No persistent login — each portal visit requires OTP re-verification if session cookie absent
- Session ends when `AccessToken.expiresAt` is reached (max 8 hours from link creation)

---

## Expiry Assumptions

| Event | Behaviour |
|---|---|
| Token TTL reached (8 hours) | Link no longer works; portal page shows expired message |
| OTP not entered within 10 min | OTP expires; doctor must request caregiver to trigger new OTP |
| 3 OTP failures | Token locked; caregiver must generate new link |
| Caregiver revokes link manually | `revokedAt` set; portal immediately inaccessible |
| Patient profile deleted | All associated tokens revoked immediately |

---

## Doctor Drill-Down Boundaries

What the doctor can see in the portal:
- Full 7-section summary (same content as PDF)
- Record list: all records linked in this summary (record type, date, confidence tier)
- Individual record view: pre-signed S3 URL to raw file (15-minute TTL)
- Lab trend charts (if implemented in v2)

What the doctor cannot do:
- Modify any data
- Upload new records
- Access records from other patients on the account
- Access records not linked in the summary (unless explicitly included by caregiver)
- Re-generate a portal link
- Revoke their own access

---

## Phase 2: Push-Confirm Upgrade

In Phase 2, OTP entry will be replaced by a push-confirm flow:
1. Doctor opens portal link
2. Kavach app sends a push notification to caregiver's phone
3. Caregiver sees: "Dr [name] is requesting access to [patient name]'s records. Allow?"
4. Caregiver taps Allow → doctor access granted
5. Caregiver taps Deny → access rejected, AuditEvent logged
This removes the OTP handover friction but requires the caregiver to have the Kavach app installed with push notifications enabled.
