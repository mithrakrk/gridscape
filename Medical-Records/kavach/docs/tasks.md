# Tasks — Kavach

> Last updated: 2026-05-16

---

## Milestone 1: Scaffold and Foundation (CURRENT)

### ✅ Completed
- [x] Scaffold full monorepo workspace
- [x] Write all docs (project-brief, architecture, data-model, ai-pipeline, compliance, security, doctor-summary, portal-access, whatsapp-ingestion, user-flows, product-requirements, test-cases, qa, decisions, changelog, handoff)
- [x] Create .agents rules, workflows, skills
- [x] Create starter package interfaces (db, ai, pdf, auth, whatsapp, compliance, types, core)
- [x] Create Next.js PWA app shell with route structure
- [x] Create worker job stubs
- [x] Create starter unit, integration, workflow, and API tests
- [x] Create synthetic mock data fixtures
- [x] Create env example files

### ✅ Implementation Foundation (Milestone 1A + 1B)
- [x] Implement full Prisma schema — complete, matches data-model.md; `CaregiverOtp` model added
- [x] Set up local PostgreSQL for development — docker-compose.yml + .env.local provided
- [x] Generate Prisma client and verify schema — `@prisma/client` v5.22.0; regenerated for 1B
- [x] Add schema-scoping unit tests — tests/unit/schema-invariants.test.ts (11 tests)
- [x] Implement caregiver OTP auth (`packages/auth/src/index.ts`) — requestCaregiverOtp, verifyCaregiverOtp, normalisePhone, hashOtp, compareOtp
- [x] iron-session config (`apps/web/lib/session.ts`) — KavachSession type, isAuthenticated guard
- [x] API routes: `/api/auth/request-otp`, `/api/auth/verify-otp`, `/api/auth/logout`
- [x] Next.js Edge middleware (`apps/web/middleware.ts`) — guards caregiver routes, injects x-kavach-account-id
- [x] Auth page wired to real API endpoints
- [x] Auth tests — 15 unit tests (caregiver-auth.test.ts) + 17 flow tests (auth-flow.test.ts); 73 total

### ✅ Milestone 1C — Patient Management
- [x] `GET /api/patients` — account-scoped list with record counts
- [x] `POST /api/patients` — create with validation + PATIENT_CREATED audit event
- [x] `GET /api/patients/[id]` — detail + records (account-scoped, 404 on mismatch)
- [x] `PATCH /api/patients/[id]` — partial update + PATIENT_UPDATED audit event
- [x] `DELETE /api/patients/[id]` — soft-delete + PATIENT_DELETED audit event
- [x] `apps/web/lib/get-session-account.ts` — server-side session helper for Server Components
- [x] `/patients` page — live data, inline Add Patient form, delete
- [x] `/patients/[id]` page — snapshot, inline edit, records list with status badges
- [x] 24 patient API tests; 92 total tests passing

### ✅ Milestone 1D — Dashboard & Record Verification
- [x] Wire dashboard to real patient data (patient switcher, record counts)
- [x] Record detail page (`/patients/[id]/records/[recordId]`) with extracted fields
- [x] Manual correction flow for low-confidence fields (PATCH extracted field)
- [x] Add API route `PATCH /api/records/[id]/fields/[fieldId]`
- [x] 16 record/field API tests; 108 total tests passing

---

## Milestone 2: Ingestion Pipeline

- [ ] Register WhatsApp Business API (Meta Cloud API) — external
- [ ] Implement WhatsApp webhook handler (packages/whatsapp)
- [ ] Implement WhatsApp conversation state machine (Redis)
- [ ] Connect OCR provider (AWS Textract) to interface
- [ ] Connect LLM extraction to interface (GPT-4o or Gemini)
- [ ] Implement LLM-as-judge step
- [ ] Implement confidence classification + correction queue
- [ ] Implement WhatsApp correction notification messages
- [ ] Test ingestion pipeline with sample Indian lab reports and prescriptions

---

## Milestone 3: Summary and Portal

- [ ] Implement RAG retrieval for patient records (pgvector)
- [ ] Implement summary generation LLM call
- [ ] Implement Puppeteer PDF template and rendering
- [ ] Create summary preview page in PWA
- [ ] Implement "Share with Doctor" flow (AccessToken creation)
- [ ] Implement doctor portal route with OTP verification
- [ ] Implement doctor portal read-only record view
- [ ] Test end-to-end: upload → extract → correct → generate → share → portal access

---

## Milestone 4: Compliance and Hardening

- [ ] Implement consent capture and ConsentRecord storage
- [ ] Implement erasure workflow (soft delete → tombstone → S3 lifecycle)
- [ ] Implement audit event logging for all significant events
- [ ] Review and test all security assumptions (auth, OTP, portal scoping)
- [ ] Obtain legal review of compliance posture (L-01 through L-07 in docs/compliance.md)
- [ ] Set up AWS Mumbai infrastructure (RDS, S3, ElastiCache, CloudFront)
- [ ] Production environment hardening

---

## Discovery and Research (Ongoing)

- [ ] Conduct HCP interviews to validate lab marker sets
- [ ] Interview 5–10 caregivers to validate WhatsApp bot hypothesis
- [ ] Validate doctor summary design with Apollo/KIMS contacts
- [ ] Select SMS provider for OTP delivery (Twilio vs AWS SNS)
- [ ] Sign LLM provider DPA before processing real data
- [ ] Run OCR provider comparison (Textract vs Cloud Vision) on sample Indian reports

---

## Backlog (Later Phases)

- [ ] Camera scan ingestion (Phase 2)
- [ ] Push-confirm auth for portal access (Phase 2)
- [ ] Trend graphs and visualisations (Phase 2)
- [ ] Paid plan billing integration (Phase 2)
- [ ] Medication reminders (Phase 2)
- [ ] ABHA / Ayushman Bharat Digital Mission integration (Phase 3)
- [ ] Pharmacy referral partnership integration (Phase 3)
