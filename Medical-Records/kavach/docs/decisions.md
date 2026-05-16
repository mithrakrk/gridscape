# Decisions — Medical Records

> Architectural and product decisions log. Add entries in reverse chronological order.

---

## 2026-05-16 — Initial Product Definition (grill-me session)

### DEC-001: Primary user is the caregiver, not the patient
- **Decision:** Target the 25–40 year old family member/caregiver who manages records on behalf of the 40–65 year old patient.
- **Rationale:** In the Indian context, family handles medical admin. The patient is the beneficiary, not the operator. Designing for the caregiver determines UX, language level, and onboarding flow.

### DEC-002: Primary MVP use case is the routine doctor's visit
- **Decision:** Anchor the MVP around the routine doctor's visit scenario.
- **Rationale:** Most frequent touchpoint; best for building habit and retention. Emergency is the highest-stakes scenario but harder to solve and validate at MVP stage.

### DEC-003: Doctor handoff via WhatsApp PDF + web portal drill-down
- **Decision:** Caregiver shares a one-page PDF summary via WhatsApp. PDF contains a link/QR to a web portal for drill-down into specific or all reports.
- **Rationale:** Doctors already live on WhatsApp. Zero new behaviour required. Portal allows doctor to request source documents without requiring app installation.

### DEC-004: Portal access via OTP (Phase 2: push-confirm)
- **Decision:** Doctor opens time-limited portal link; OTP is sent to caregiver's phone. Phase 2 upgrades to a push-confirm button (like Google Auth).
- **Rationale:** Keeps patient/caregiver in control of data access. Satisfies DPDP consent requirements. 15-second friction acceptable in clinical setting.

### DEC-005: WhatsApp bot as primary ingestion channel
- **Decision:** Caregiver forwards photos/PDFs to a WhatsApp bot. Camera scan is Phase 2.
- **Rationale:** Caregivers already forward medical reports on WhatsApp. Redirecting this existing habit is the path of least resistance.

### DEC-006: Hybrid storage — raw file + AI extraction
- **Decision:** Always preserve the raw document. Attempt structured extraction (OCR → LLM) best-effort. Use LLM-as-judge to validate accuracy. Flag low-confidence extractions for caregiver correction.
- **Rationale:** Raw file is the legal source of truth for medical data. Structured extraction is what makes smart summaries possible. LLM-as-judge is critical for medical accuracy.

### DEC-007: RAG for summary generation, LLM-as-judge for extraction validation
- **Decision:** Use RAG to retrieve relevant patient records when generating the doctor summary. Use a separate LLM call as judge to validate extraction output.
- **Rationale:** RAG is the right pattern for retrieval-augmented summary generation. LLM-as-judge catches hallucinations and low-confidence extractions before they reach the doctor summary.

### DEC-008: Multi-patient support from day one
- **Decision:** Data model supports Account → [Patient Profiles] → [Records] from v1.
- **Rationale:** Indian caregivers commonly manage both parents (and sometimes in-laws). Retrofitting multi-patient support later is expensive. UI impact is minimal (patient switcher).

### DEC-009: PWA for caregiver management interface
- **Decision:** Build a Progressive Web App for the caregiver management UI. Native app deferred until retention data justifies it.
- **Rationale:** No app store friction. Works on Android and iOS. Can be linked directly from the WhatsApp bot. One codebase.

### DEC-010: AWS Mumbai, DPDP Act 2023 compliant
- **Decision:** All data (files, structured records) stored in AWS ap-south-1. Explicit consent flows. Right to erasure built into v1.
- **Rationale:** Health data of Indian citizens must be stored in India. DPDP Act 2023 is in force. Trust is a core product differentiator.

### DEC-011: Freemium + tiered consumer plans + pharmacy B2B
- **Decision:** Free tier (1 patient, 30 docs/month), Family plan (₹149/month), Premium plan (TBD). Pharmacy referral revenue as a separate B2B stream.
- **Rationale:** Indian consumers are price-sensitive. Freemium drives adoption; Family plan monetises power users (multi-patient caregivers). Pharmacy referrals are non-intrusive revenue that aligns with user intent.

### DEC-012: GTM via Apollo/KIMS/dermatologist doctor network
- **Decision:** Launch through existing doctor relationships at Apollo, KIMS, and dermatologist network. Secondary: caregiver WhatsApp communities. Tertiary: pharmacy referrals.
- **Rationale:** Doctor referral is the highest-trust acquisition channel for a health data product. Existing relationships accelerate time-to-first-user significantly.
