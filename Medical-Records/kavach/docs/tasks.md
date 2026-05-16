# Tasks — Medical Records

> Last updated: 2026-05-16

---

## Current Focus: Pre-build Research & Setup

### 🔲 Discovery & Validation
- [ ] Conduct HCP (healthcare professional) interviews to validate and configure condition-linked lab marker sets
- [ ] Interview 5–10 caregivers (25–40 years) from target demographic to validate WhatsApp bot ingestion hypothesis
- [ ] Validate one-page summary content with Apollo/KIMS doctor contacts
- [ ] Map out DPDP Act 2023 compliance requirements with a legal advisor

### 🔲 Technical Setup
- [ ] Register WhatsApp Business API (Meta Cloud API)
- [ ] Set up AWS account with Mumbai (ap-south-1) as primary region
- [ ] Evaluate OCR providers: Google Cloud Vision vs AWS Textract (test on sample Indian medical reports)
- [ ] Select LLM provider and confirm data processing agreement covers Indian health data
- [ ] Scaffold PWA project (React)
- [ ] Set up RDS PostgreSQL instance (Mumbai)
- [ ] Design database schema: Account, PatientProfile, Record tables

### 🔲 v1 Build
- [ ] WhatsApp bot: receive photo/PDF, ask clarifying questions, route to pipeline
- [ ] Ingestion pipeline: OCR → LLM extraction → LLM-as-judge → store raw + structured
- [ ] Human-in-the-loop: WhatsApp notification for low-confidence fields; type or re-upload resolution
- [ ] Multi-patient PWA: patient switcher, record browser, profile management
- [ ] Summary generator: RAG pipeline, condition-linked marker selection, PDF render
- [ ] Doctor web portal: OTP gate, time-limited link, record drill-down view
- [ ] WhatsApp share flow: generate PDF summary, send via WhatsApp bot

### 🔲 GTM Preparation
- [ ] Draft doctor referral card / talking points for Apollo/KIMS contacts
- [ ] Identify 3–5 caregiver WhatsApp communities for organic seeding
- [ ] Create onboarding flow for first 50 caregiver families

---

## Backlog (Later Phases)

- [ ] Camera scan ingestion (Phase 2)
- [ ] Push-confirm auth for portal access (Phase 2)
- [ ] Trend graphs and visualisations (Phase 2)
- [ ] Paid plan billing integration (Phase 2)
- [ ] Medication reminders (Phase 2)
- [ ] ABHA / Ayushman Bharat Digital Mission integration (Phase 3)
- [ ] Pharmacy referral partnership integration (Phase 3)
