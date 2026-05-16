# Changelog — Kavach

> Last updated: 2026-05-16
> Format: [YYYY-MM-DD] [Type] Description

## 2026-05-16 (Milestone 1C — Patient Management)

### [FEAT] Patient CRUD API
- `GET /api/patients` — list all non-deleted, non-archived patients for account; includes record count per patient
- `POST /api/patients` — create patient; validates name (required), dateOfBirth (optional, ISO format); logs `PATIENT_CREATED` audit event; returns 201
- `GET /api/patients/[id]` — detail + last 50 records; 404 on cross-account access (anti-enumeration)
- `PATCH /api/patients/[id]` — partial update of name/dob/bloodGroup/weightKg/allergies; logs `PATIENT_UPDATED` audit event
- `DELETE /api/patients/[id]` — soft-delete (sets `deletedAt`); logs `PATIENT_DELETED` audit event; never hard-deletes

### [FEAT] Server-side session helper (`apps/web/lib/get-session-account.ts`)
- Reads iron-session from Next.js cookie store for use in Server Components

### [FEAT] Patient list page (`/patients`)
- Server Component fetches real DB data (account-scoped)
- `PatientListClient`: inline Add Patient form (name required, DOB, blood group dropdown, allergy chips), patient cards with record count badge, soft-delete with confirmation, optimistic UI

### [FEAT] Patient detail page (`/patients/[id]`)
- Server Component; returns 404 on cross-account access
- `PatientDetailClient`: patient snapshot (name, age, blood group, weight, allergies), inline edit form (PATCH on save), records list with status color badges, delete with confirmation

### [TEST] Patient API tests (replaces placeholder stubs)
- 24 tests across GET list, POST, GET detail, PATCH, DELETE
- Covers: auth guard (401), cross-account isolation (404), field validation, audit events, soft-delete enforcement, age calculation

### Totals: 92 tests passing, 11 test files

---

## 2026-05-16 (Milestone 1B — Caregiver Auth)

### [FEAT] Caregiver OTP auth flow (`packages/auth`)
- `requestCaregiverOtp` — upserts Account, generates bcrypt-hashed OTP, stores in `CaregiverOtp` model
- `verifyCaregiverOtp` — bcrypt comparison, attempt tracking, lockout after 3 failures, expiry check, clears hash after use
- `normalisePhone` — normalises Indian mobile numbers to E.164 (+91XXXXXXXXXX)
- `hashOtp` / `compareOtp` — bcrypt wrappers (10 rounds)
- Dev-only: `_devOtp` returned in `requestCaregiverOtp` when `NODE_ENV !== production`

### [FEAT] CaregiverOtp schema model
- New Prisma model: one active OTP per caregiver Account (upsert on each request)
- Fields: `otpHash` (bcrypt), `expiresAt`, `attempts`, `verifiedAt`
- Prisma client regenerated

### [FEAT] iron-session cookie management (`apps/web/lib/session.ts`)
- `KavachSession` type (`accountId`, `phoneNumber`)
- `sessionOptions` — httpOnly, SameSite=Strict, Secure in prod, 7-day maxAge
- `isAuthenticated` type guard
- SESSION_SECRET fail-fast in non-test environments

### [FEAT] Auth API routes
- `POST /api/auth/request-otp` — validates phone, returns `_devOtp` in dev/test
- `POST /api/auth/verify-otp` — verifies OTP, sets iron-session cookie, logs `CAREGIVER_LOGIN` audit event
- `POST /api/auth/logout` — destroys session (idempotent)

### [FEAT] Next.js Edge middleware (`apps/web/middleware.ts`)
- Guards all caregiver routes (`/dashboard`, `/patients`, `/api/patients`, etc.)
- API routes → 401 JSON; page routes → redirect to `/auth?next=`
- Injects `x-kavach-account-id` header for downstream Route Handlers

### [FEAT] Auth page wired to real API
- `apps/web/app/auth/page.tsx` — calls real endpoints, friendly error messages, dev OTP banner

### [TEST] Auth unit and flow tests
- `tests/unit/caregiver-auth.test.ts` — 15 tests (OTP gen, bcrypt, phone normalisation)
- `tests/api/auth-flow.test.ts` — 17 tests (all paths: success, INVALID_OTP, EXPIRED, LOCKED, NO_OTP, production OTP hiding)
- **73 total tests passing (11 files)**

### [DEPS] Added `iron-session`, `@types/bcryptjs`

---

## 2026-05-16 (Milestone 1A — DB Foundation)

### [FEAT] Prisma client generated and validated
- `packages/db/prisma/schema.prisma` confirmed complete — matches `docs/data-model.md` exactly
- Resolved BOM false-positive in `prisma generate` (schema was correct; issue was encoding display artifact)
- Generated `@prisma/client` v5.22.0 via `npx prisma generate`

### [FEAT] Local dev environment setup
- Added `docker-compose.yml` — PostgreSQL 16-alpine + Redis 7-alpine with health checks
- Added `.env.local` — pre-filled `DATABASE_URL=postgresql://kavach:kavach@localhost:5432/kavach_dev`; placeholder values for all other services

### [FEAT] Test infrastructure wired
- Added `vitest`, `@vitest/coverage-v8`, `ts-node` to root `devDependencies`
- Added `test`, `test:watch`, `test:coverage` scripts to root `package.json`
- Confirmed `vitest.config.ts` works — 41 tests passing across 9 files

### [FEAT] Seed script
- Created `scripts/seed.ts` — synthetic-only seed for Account → 2 PatientProfiles → 2 Records (LAB_REPORT + PRESCRIPTION) with ExtractedFields, ConsentRecord, AuditEvents
- Added `db:seed` script to root `package.json`
- Added `prisma.seed` to `packages/db/package.json`

### [TEST] Schema invariant tests added
- Created `tests/unit/schema-invariants.test.ts` — 11 tests covering:
  - `Account → PatientProfile` scoping and cross-account isolation
  - Soft-delete filtering (`deletedAt === null`)
  - `RecordStatus` lifecycle invariants (VERIFIED, LOW_CONFIDENCE thresholds)
  - `ExtractedField` confidence flag correctness

### [CONFIG] Config files
- Created `packages/db/tsconfig.json` (extends root tsconfig)
- `turbo.json` and root `tsconfig.json` confirmed present from scaffold



### [SCAFFOLD] Full monorepo workspace created
- Created kavach/ monorepo inside Medical-Records/ workspace
- All directory structure created per workspace spec
- AGENTS.md, GEMINI.md, README.md, package.json, .gitignore created
- All 18 documentation files written with substantive content
- .agents/rules: 5 rule files created
- .agents/workflows: 6 workflow files created
- .agents/skills: 6 skill files created (one SKILL.md per skill directory)
- .agents/agents.md: AI team roster defined
- packages/db: Prisma schema started with all entities
- packages/types: Shared TypeScript interfaces
- packages/ai: OCR, extraction, judge, RAG interfaces
- packages/pdf: PDF generation interface
- packages/auth: Auth package stub
- packages/whatsapp: WhatsApp webhook stub
- packages/compliance: Consent, audit, erasure stubs
- apps/web: Next.js PWA shell with route structure and placeholder UI
- apps/worker: Background job stubs
- tests/: Starter unit, integration, workflow, and API tests
- sample-data/: Synthetic mock data (no real PHI)
- infrastructure/env: Env example files

### [DOCS] Product definition from grill-me session incorporated
- All 12 product decisions (DEC-001 through DEC-012) recorded
- Project brief, architecture, data model, AI pipeline fully documented
- Compliance posture documented with legal review flags
