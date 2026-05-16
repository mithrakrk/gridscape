# Handoff — Kavach

> Last updated: 2026-05-16

---

## Current State

**Milestone 1D complete.** Core PWA foundation is ready. Dashboard, Patient Management, and Record Verification are fully implemented and tested. 108 tests passing.

**Ready for Milestone 2:** WhatsApp ingestion and AI extraction pipeline.

---

## What Was Done This Session (Milestone 1A)

1. Validated `packages/db/prisma/schema.prisma` — schema is complete and correct (matches `docs/data-model.md`)
2. Confirmed `turbo.json`, root `tsconfig.json`, `vitest.config.ts` were already present
3. Created `packages/db/tsconfig.json`
4. Created `docker-compose.yml` — PostgreSQL 16 + Redis 7 for local dev (one-command setup)
5. Created `.env.local` — pre-filled with local DB creds, placeholder values for services not needed in Milestone 1A
6. Updated `package.json` — added `vitest`, `@vitest/coverage-v8`, `ts-node`; added `test`, `test:watch`, `test:coverage`, `db:seed` scripts
7. Updated `packages/db/package.json` — added `prisma.seed` config
8. Created `scripts/seed.ts` — synthetic seed exercising all schema relationships (Account → 2 PatientProfiles → 2 Records + ExtractedFields + ConsentRecord + AuditEvents)
9. Generated Prisma client v5.22.0 (resolved BOM false-positive — schema was correct)
10. Created `tests/unit/schema-invariants.test.ts` — 11 tests for `Account→Patient→Record` scoping invariants, soft-delete, RecordStatus, ExtractedField confidence
11. Ran all tests — **41 tests passing, 9 test files, 0 failures**

---

## Key Context for Next Session

- **Primary user** is the **caregiver** (25–40). All UX designed for them.
- **Multi-patient is a day-one requirement.** `Account → PatientProfile → Record` everywhere.
- **LLM-as-judge is critical.** Never allow unvalidated extractions into the summary.
- **Raw files are the legal source of truth.** Never delete without compliance-reviewed flow.
- **Doctor surfaces are read-only.** Portal links expire in 8 hours.
- **Lab marker sets are provisional.** HCP interviews required before finalising.
- **DPDP compliance is non-negotiable.** Consent, erasure, audit trail in v1.
- **All test fixtures use synthetic data.** No real PHI ever in tests or docs.

---

## Immediate Next Actions (Milestone 2A)

1. [ ] Implement `POST /api/webhook/whatsapp` handler.
2. [ ] Setup Redis + BullMQ for background processing.
3. [ ] Define `packages/ai` extraction schemas and LLM prompts.
4. [ ] Implement mock OCR/Extraction for local development.

---

## Risks / Watch-Outs

- WhatsApp Business API approval from Meta can take weeks — start registration early
- LLM provider DPA must be signed before processing real medical data — do not skip
- HCP interviews must happen before finalising lab marker configuration — do not hardcode
- AWS Mumbai infrastructure provisioning is a prerequisite for production — plan early
- Legal review of DPDP compliance assumptions (L-01 through L-07) must happen before beta launch
