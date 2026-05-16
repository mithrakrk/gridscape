# Progress — Kavach

> Last updated: 2026-05-16 (Milestone 1D — Dashboard & Record Verification)

---

## Current Status: 🟢 Milestone 1D Complete — PWA Foundation Ready

Dashboard wired to live data. Record detail and manual correction flow implemented. All core caregiver PWA routes (Dashboard, Patient List, Patient Detail, Record Detail) are functional. 108 tests passing.

---

## Completed

### 2026-05-16 — Workspace Scaffold
- ✅ Monorepo directory structure created
- ✅ AGENTS.md, GEMINI.md, README.md written
- ✅ All docs written: project-brief, architecture, data-model, ai-pipeline, compliance, security, doctor-summary, portal-access, whatsapp-ingestion, user-flows, product-requirements, test-cases, qa, decisions, tasks, changelog, handoff
- ✅ .agents/rules: always-on-docs, coding-standards, testing-rules, healthcare-privacy-guardrails, product-scope-guardrails
- ✅ .agents/workflows: start-project, build-feature, add-user-flow, validate-ai-pipeline, test-feature, ship-check
- ✅ .agents/skills: planning, product-architecture, healthcare-compliance, ai-extraction, qa-validation, docs-maintenance
- ✅ .agents/agents.md: AI team roles defined
- ✅ Prisma schema starter (packages/db)
- ✅ Shared TypeScript types (packages/types)
- ✅ AI pipeline interfaces (packages/ai)
- ✅ PDF generation interface (packages/pdf)
- ✅ Auth package stub (packages/auth)
- ✅ WhatsApp package stub (packages/whatsapp)
- ✅ Compliance package stub (packages/compliance)
- ✅ Next.js app shell (apps/web) with route structure
- ✅ Worker job stubs (apps/worker)
- ✅ Starter tests: unit, integration, workflows, api
- ✅ Synthetic mock data (sample-data/)
- ✅ Env example files
- ✅ Test fixtures (synthetic only)

### 2026-05-16 — Milestone 1D: Dashboard & Record Verification
- ✅ `/dashboard` (Server + Client) — wired to real patient switcher + recent records feed
- ✅ `GET /api/records/[id]` — record detail with extracted fields (account-scoped)
- ✅ `PATCH /api/records/[id]/fields/[fieldId]` — manual correction with audit logging
- ✅ `/patients/[id]/records/[recordId]` (Server + Client) — record detail view with inline field correction
- ✅ Auto-verification logic — record promoted to `VERIFIED` when all low-confidence fields are resolved
- ✅ `tests/api/records.test.ts` — 16 tests covering scoping, corrections, and promotion logic
- ✅ **108 tests passing, 12 test files**

### 2026-05-16 — Milestone 1C: Patient Management
- ✅ `GET /api/patients` — account-scoped list with record counts
- ✅ `POST /api/patients` — create with validation, logs PATIENT_CREATED audit event
- ✅ `GET /api/patients/[id]` — detail + last 50 records
- ✅ `PATCH /api/patients/[id]` — update name/dob/bloodGroup/weight, logs PATIENT_UPDATED
- ✅ `DELETE /api/patients/[id]` — soft-delete, logs PATIENT_DELETED
- ✅ `apps/web/lib/get-session-account.ts` — server-side session helper for Server Components
- ✅ `/patients` (Server Component + PatientListClient) — live patient list, inline Add form, delete
- ✅ `/patients/[id]` (Server Component + PatientDetailClient) — patient snapshot, inline edit, records list with status badges
- ✅ `tests/api/patients.test.ts` — 24 tests (GET list, POST, GET detail, PATCH, DELETE — auth guard, cross-account isolation, soft-delete enforcement, audit events)
- ✅ **92 tests passing, 11 test files**

### 2026-05-16 — Milestone 1B: Caregiver Auth
- ✅ `packages/auth/src/index.ts` — full caregiver OTP auth (`requestCaregiverOtp`, `verifyCaregiverOtp`, `normalisePhone`, `hashOtp`, `compareOtp`)
- ✅ `CaregiverOtp` Prisma model added — one active OTP per account, bcrypt-hashed, single-use, 10-min TTL
- ✅ Prisma client regenerated with new model
- ✅ `apps/web/lib/session.ts` — iron-session config (`KavachSession` type, `sessionOptions`, `isAuthenticated` guard)
- ✅ `apps/web/app/api/auth/request-otp/route.ts` — POST handler
- ✅ `apps/web/app/api/auth/verify-otp/route.ts` — POST handler + session cookie set + CAREGIVER_LOGIN audit event
- ✅ `apps/web/app/api/auth/logout/route.ts` — POST handler (destroys session)
- ✅ `apps/web/middleware.ts` — Edge middleware guarding all caregiver routes; injects `x-kavach-account-id` header
- ✅ `apps/web/app/auth/page.tsx` — wired to real API endpoints; dev OTP banner; friendly error messages
- ✅ `tests/unit/caregiver-auth.test.ts` — 15 tests (OTP generation, bcrypt hash/verify, phone normalisation)
- ✅ `tests/api/auth-flow.test.ts` — 17 tests (requestCaregiverOtp, verifyCaregiverOtp all paths, session type guard)
- ✅ **73 tests passing, 11 test files**
- ✅ DEC-018, DEC-019, DEC-020 added to decisions.md

### 2026-05-16 — Milestone 1A: Database Foundation
- ✅ Prisma schema validated (P1012 BOM issue resolved — schema is correct)
- ✅ Prisma client generated (`@prisma/client` v5.22.0) into `node_modules`
- ✅ `docker-compose.yml` added — PostgreSQL 16 + Redis 7 for local dev
- ✅ `.env.local` created (mirrors `.env.example`, local DB creds pre-filled)
- ✅ `vitest.config.ts` confirmed present and working
- ✅ `turbo.json` and root `tsconfig.json` confirmed present
- ✅ `packages/db/tsconfig.json` added
- ✅ `scripts/seed.ts` — synthetic seed for Account → 2 PatientProfiles → 2 Records with ExtractedFields, ConsentRecord, AuditEvents
- ✅ `tests/unit/schema-invariants.test.ts` — 11 tests covering `Account→PatientProfile→Record` scoping, soft-delete filtering, RecordStatus lifecycle, ExtractedField confidence invariants
- ✅ All 41 tests passing (9 test files)

### 2026-05-16 — Product Definition (grill-me session)
- ✅ All product decisions resolved (DEC-001 through DEC-012)
- ✅ Full product brief, architecture, data model documented

---

## In Progress

1. **Milestone 2A:** WhatsApp Webhook Handler (packages/whatsapp)
2. Ingestion Pipeline: OCR (Puppeteer/AI) + Extraction (LLM)
3. Job Queue: BullMQ setup for background processing
4. Record Status Lifecycle: PENDING → PROCESSING → LOW_CONFIDENCE/VERIFIED

---

## Next Steps

1. **Milestone 2:** Ingestion Pipeline & WhatsApp Integration
2. WhatsApp Webhook Implementation
3. OCR and AI Extraction pipeline development
4. Background job processing via BullMQ

---

## Blockers

- WhatsApp Business API registration not yet complete (external dependency)
- AWS infrastructure not yet provisioned (external setup needed)
- LLM provider DPA not yet signed (prerequisite for real data)
- HCP interviews not yet conducted (required before finalising lab marker sets)
