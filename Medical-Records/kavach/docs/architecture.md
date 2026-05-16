# Architecture — Kavach

> Last updated: 2026-05-16

---

## System Overview

```
[Caregiver] ──WhatsApp──► [WhatsApp Bot] ──► [Ingestion Pipeline]
                                                     │
                                              OCR + LLM Extraction
                                              LLM-as-Judge (validation)
                                                     │
                                              [Database — AWS Mumbai]
                                              Raw file (S3) + Structured record (PostgreSQL)
                                                     │
                               ┌─────────────────────┴──────────────────────┐
                          [PWA App]                               [Summary Generator]
                       (Caregiver UI)                            RAG over patient records
                                                                         │
                                                              [PDF Summary] ──WhatsApp──► Doctor
                                                                         │
                                                              [Web Portal] ◄── OTP ── Doctor
```

---

## Services and Modules

### 1. WhatsApp Bot (`packages/whatsapp`)
- Receives photos and PDFs from caregiver via Meta Cloud API webhook
- Asks 1–2 clarifying questions (record type, patient attribution)
- Routes documents to ingestion pipeline
- Sends WhatsApp notifications for low-confidence extractions
- Delivers shareable PDF summary on caregiver request
- **Technology:** WhatsApp Business API (Meta Cloud API)

### 2. Ingestion Pipeline (`apps/worker`, `packages/ai`)
- **OCR:** Provider-agnostic interface (default: AWS Textract, Mumbai; alternative: Google Cloud Vision)
- **LLM Extraction:** Structured JSON output via LLM (provider-agnostic; OpenAI GPT-4o / Google Gemini)
  - Extracts: patient name, test names, values, units, reference ranges, dates, doctor name, record type
- **LLM-as-Judge:** Second LLM call validates extraction against raw OCR text; flags low-confidence fields
- **Storage:** Raw file → S3 (encrypted, Mumbai); Structured record → PostgreSQL (RDS, Mumbai)
- **Queue:** BullMQ (Redis-backed) — stubbed for MVP, ready for production

### 3. Data Layer (`packages/db`)
- Prisma ORM + PostgreSQL
- Schema: Account, PatientProfile, Record, ExtractedField, SummaryArtifact, AuditEvent, AccessToken, ConsentRecord
- All queries scoped by account (multi-tenant by design)

### 4. Caregiver PWA (`apps/web`)
- **Technology:** Next.js + React + TypeScript, hosted on AWS CloudFront
- Routes: dashboard, patients, patient detail, records, summary preview, correction flow
- Patient profile switcher (multi-patient is first-class)
- Correction interface for flagged low-confidence extractions
- Summary generation trigger

### 5. Summary Generator (`packages/ai`, `packages/pdf`)
- RAG pipeline: retrieves relevant records from patient history
- Generates structured summary: patient snapshot, conditions, medications, lab trends, recent visits, upcoming/pending
- Lab trends: primary markers + condition-linked markers (configurable; provisional until HCP-validated)
- Renders to PDF via Puppeteer
- **Technology:** LangChain / custom RAG, Puppeteer for PDF

### 6. Doctor Web Portal (`apps/web/app/portal`)
- Time-limited link (expires in 8 hours by default)
- OTP-gated (OTP sent to caregiver's phone)
- Read-only view of summary + source records
- No write access for doctors
- **Technology:** Next.js static + server-side OTP verification

### 7. Auth (`packages/auth`)
- Caregiver auth: magic link / OTP-friendly baseline
- Doctor access: time-limited tokenized link + OTP verification
- Session management with secure httpOnly cookies

### 8. Compliance (`packages/compliance`)
- Consent capture and storage
- Audit event logging
- Erasure workflow (tombstoning with retention policy awareness)
- Purpose limitation enforcement

---

## Frontend / Backend Boundaries

```
apps/web (Next.js)
  ├── app/(caregiver)/*   — caregiver-authenticated pages
  ├── app/portal/*        — doctor portal pages (OTP-gated)
  ├── app/api/*           — Route Handlers (backend API)
  └── components/*        — shared UI components

packages/*               — shared business logic, no UI
apps/worker              — background jobs (no HTTP interface)
```

---

## AI Pipeline Boundary

```
packages/ai/
  ├── ocr/         — OCR provider interface + implementations
  ├── extraction/  — LLM extraction prompt + structured output
  ├── judge/       — LLM-as-judge validation
  ├── rag/         — RAG retrieval for summary generation
  └── embeddings/  — vector embedding interface (for RAG)
```

---

## Storage Model

| Data | Store | Location |
|---|---|---|
| Raw files (photos, PDFs) | AWS S3 | ap-south-1, encrypted at rest |
| Structured records | AWS RDS PostgreSQL | ap-south-1 |
| Vector embeddings | pgvector extension | Same RDS instance |
| Sessions / OTP cache | Redis (ElastiCache) | ap-south-1 |
| CDN / static assets | AWS CloudFront | Closest edge |

---

## Access and Sharing Model

| Actor | Access |
|---|---|
| Caregiver | Full read/write on own account's patients and records |
| Doctor | Read-only, time-limited (8h), OTP-gated portal link |
| System (worker) | Service account with least-privilege DB access |
| Admin | Not in v1 — deferred |

---

## Infrastructure

| Concern | Decision |
|---|---|
| Cloud provider | AWS Mumbai (ap-south-1) |
| File storage | S3 (encrypted at rest, SSE-S3 minimum) |
| Database | RDS PostgreSQL (Mumbai) |
| Cache / queue | ElastiCache Redis (Mumbai) |
| AI processing | OpenAI / Google Gemini with DPA in place |
| CDN | CloudFront |
| Compliance | DPDP Act 2023 — explicit consent, right to erasure, purpose limitation |
| Secrets | AWS Secrets Manager (not environment variable files in production) |

---

## Implementation Order (Near-Term)

1. Prisma schema (packages/db)
2. Core types (packages/types)
3. Auth package stub (packages/auth)
4. Caregiver PWA shell (apps/web)
5. WhatsApp webhook stub (packages/whatsapp)
6. AI pipeline interfaces (packages/ai)
7. PDF template (packages/pdf)
8. Portal OTP flow (apps/web/app/portal)
9. Background worker shell (apps/worker)
10. Compliance + audit scaffolding (packages/compliance)

---

## Phase Roadmap

| Phase | Features |
|---|---|
| **v1 (MVP)** | WhatsApp bot, AI extraction + judge, PWA, PDF summary, OTP portal |
| **v2** | Camera scan, push-confirm auth, tiered billing, trend graphs |
| **v3** | ABHA integration, medication reminders, pharmacy partnerships |
