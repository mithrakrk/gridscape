# Decisions — Kavach

> Architectural and product decisions log (ADR format). Add entries in reverse chronological order.
> Last updated: 2026-05-16

---

## 2026-05-16 — Workspace Scaffold

### DEC-013: Monorepo structure with Turborepo
- **Decision:** Use a Turborepo-managed monorepo with `apps/` and `packages/` directories.
- **Rationale:** Multiple apps (web PWA, worker) share packages (db, ai, auth, pdf, compliance). Turborepo provides caching and task orchestration without overhead. Aligns with Next.js recommendations.
- **Consequences:** Requires Node 20+. All package.json workspace definitions must be kept in sync.

### DEC-014: Next.js for both caregiver PWA and doctor portal
- **Decision:** Single Next.js app handles both `/(caregiver)` routes and `/portal` routes, using route groups for separation.
- **Rationale:** Reduces operational complexity. Portal pages are statically rendered with server-side OTP verification. PWA features (manifest, service worker) applied only to caregiver routes.
- **Consequences:** Doctor portal and caregiver app share the same deployment. Clear route-group separation prevents accidental data access.

### DEC-015: BullMQ (Redis) for background job queue
- **Decision:** Use BullMQ with Redis for ingestion and summary generation background jobs.
- **Rationale:** OCR and LLM calls are too slow for synchronous HTTP handling. BullMQ provides retry logic, job status tracking, and queue visibility. Redis is already needed for conversation state (WhatsApp bot).
- **Consequences:** Requires Redis in all environments (dev: local Redis or Docker; prod: ElastiCache Mumbai). Jobs are stubbed for MVP; queue ready for production.

### DEC-016: Prisma ORM with PostgreSQL
- **Decision:** Use Prisma ORM over raw SQL or alternatives.
- **Rationale:** Type-safe DB client generation, migration system, and schema-as-code align with the project's TypeScript-first approach. pgvector extension supported via raw SQL in Prisma migrations.
- **Consequences:** All schema changes go through Prisma migration files. DB client generated from schema — never modify generated client directly.

### DEC-017: Puppeteer for PDF generation
- **Decision:** Use Puppeteer (headless Chrome) to render HTML templates as PDFs.
- **Rationale:** HTML/CSS gives full design control for the doctor summary layout. More flexible than library-based PDF generation. Puppeteer is well-supported in Node.js environments.
- **Consequences:** Puppeteer adds ~100MB to Lambda/container size. May require Lambda layer or ECS container for PDF generation in production. For MVP, run in worker process.

---

## 2026-05-16 — Initial Product Definition (grill-me session)

### DEC-001 through DEC-012
See `Medical-Records/docs/decisions.md` for the full set of product decisions from the grill-me session. These are reproduced below for monorepo completeness.

### DEC-001: Primary user is the caregiver
- Caregiver (25–40) is the operator; patient (40–65+) is the beneficiary. All UX designed for caregiver.

### DEC-002: Primary MVP use case is routine doctor's visit
- Most frequent touchpoint; best for habit formation and retention.

### DEC-003: Doctor handoff via WhatsApp PDF + web portal drill-down
- Doctors already live on WhatsApp. Zero new behaviour required.

### DEC-004: Portal access via OTP (Phase 2: push-confirm)
- Keeps patient/caregiver in control of data access. Satisfies DPDP consent requirements.

### DEC-005: WhatsApp bot as primary ingestion channel
- Caregivers already forward medical reports on WhatsApp. Redirecting existing habit.

### DEC-006: Hybrid storage — raw file + AI extraction
- Raw file is the legal source of truth. Structured extraction enables smart summaries.

### DEC-007: RAG for summary generation, LLM-as-judge for extraction validation
- RAG is correct pattern. LLM-as-judge catches hallucinations before they reach the doctor summary.

### DEC-008: Multi-patient support from day one
- Indian caregivers commonly manage both parents. Retrofitting later is expensive.

### DEC-009: PWA for caregiver management interface
- No app store friction. Works on Android and iOS. Linked directly from WhatsApp bot.

### DEC-010: AWS Mumbai, DPDP Act 2023 compliant
- Health data of Indian citizens must be stored in India. Trust is a core product differentiator.

### DEC-011: Freemium + tiered consumer plans + pharmacy B2B
- Indian consumers are price-sensitive. Freemium drives adoption; Family plan monetises power users.

### DEC-012: GTM via Apollo/KIMS/dermatologist doctor network
- Doctor referral is the highest-trust acquisition channel for a health data product.
