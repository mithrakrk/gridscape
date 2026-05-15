# AGENTS.md — Kavach

> Kavach (कवच) — *Your family's health, protected.*
> WhatsApp-first medical records management for Indian family caregivers.
> **Founders:** Kavya (idea) · Mithra (build)

---

## Project Mission

Build Kavach — a caregiver-first product that helps the 25–40 year old family member collect medical reports over WhatsApp, organise them per patient, generate a one-page doctor summary PDF, and share a secure web portal link with OTP access for drill-down into reports.

**Core thesis to validate:** A caregiver, introduced to the product by a trusted doctor, will use a WhatsApp bot to organise medical records and proactively share a one-page summary before the next appointment.

**Primary use case:** Routine doctor's visit.

---

## Target User

| Role | Description |
|---|---|
| **Primary user** | Caregiver (25–40) managing records for a family member |
| **Beneficiary** | Patient (40–65+) receiving care |
| **Doctor** | Read-only portal consumer; time-limited OTP access |

---

## Working Rules

1. **Read docs before work.** Before any changes, read: `docs/project-brief.md`, `docs/architecture.md`, `docs/decisions.md`, `docs/tasks.md`, `docs/progress.md`.
2. **Plan before coding.** Define an implementation plan before writing code.
3. **Prefer smallest viable change.** Do not over-engineer. Do not add features not in the current task.
4. **Update docs after work.** After any meaningful change, update `docs/progress.md`, `docs/tasks.md`, `docs/handoff.md`, `docs/changelog.md`.
5. **Architecture changes require decisions.md entry.** Any module boundary, schema, or stack change must be recorded with a dated ADR entry.
6. **Do not leave important context only in chat.** Persist all decisions and context to markdown.
7. **Resolve docs-code drift immediately.** If documentation and code contradict, fix the contradiction before continuing.
8. **Ask before destructive actions.** Confirm with the user before deleting files, dropping schema, or replacing major flows.

---

## Scope Discipline

**v1 in scope:**
- WhatsApp bot ingestion (photo + PDF)
- AI extraction: OCR → LLM extraction → LLM-as-judge → caregiver correction
- Multi-patient PWA (profile management, record browser, correction interface)
- One-page doctor summary PDF generation
- Doctor web portal with OTP access (time-limited links, read-only)
- Free tier only — no payments in v1

**Out of scope for v1:** camera scan, ABHA/ABDM, medication reminders, trend graphs, paid billing, pharmacy partnerships, push-confirm auth.

---

## Privacy-First Handling

- Never expose real PHI in test fixtures, logs, or documentation. Use synthetic data only.
- DPDP Act 2023 is non-negotiable. See `docs/decisions.md` DEC-010 and `docs/compliance.md`.
- Explicit consent capture at account creation and whenever processing scope changes.
- Right to erasure scaffolded from v1.
- Audit logging traces every significant data event.
- Raw files are the legal source of truth — never delete without a compliance-reviewed erasure flow.
- Doctor-facing surfaces are strictly read-only. Portal links expire in 8 hours by default.
- Never log PHI fields, raw report content, or OTP values.

---

## Multi-Patient Data Model (Non-Negotiable)

All code, APIs, queries, and UI operate within: `Account → [PatientProfiles] → [Records]`

Never assume a single patient per account.

---

## AI Pipeline Rules

- Never silently discard extraction failures. Low-confidence extractions trigger caregiver correction.
- LLM-as-judge is required for all extraction outputs.
- Lab marker configurations must be marked provisional until HCP-validated.

---

## Testing Policy

### Automated Tests
- All executable tests live in `tests/` (unit/, integration/, workflows/, api/, fixtures/).
- Every logic change in extraction, portal access, consent, OTP, PDF, or patient-record linkage must include a test update.
- Tests must pass before a task is done.

### Manual QA
- Manual scenarios and acceptance criteria → `docs/test-cases.md`
- QA observations and bug logs → `docs/qa.md`

### Fixtures
- Only synthetic sample data in `tests/fixtures/` and `sample-data/`.
- Never use real PHI.

---

## Definition of Done

- [ ] Implementation complete and compiles/runs
- [ ] Relevant automated tests updated and passing
- [ ] Manual scenarios in `docs/test-cases.md` updated
- [ ] `docs/progress.md` reflects new state
- [ ] `docs/tasks.md` marks task complete with next steps
- [ ] `docs/changelog.md` has an entry
- [ ] `docs/handoff.md` ready for next session
- [ ] No real PHI in any fixture, log, or doc example

---

## Folder Conventions

```
kavach/
├── apps/web/          # Caregiver PWA (Next.js)
├── apps/worker/       # Background job processor
├── packages/db/       # Prisma schema + DB client
├── packages/ai/       # OCR, extraction, judge, RAG interfaces
├── packages/pdf/      # Summary PDF generation
├── packages/auth/     # OTP + session management
├── packages/whatsapp/ # WhatsApp webhook + bot logic
├── packages/compliance/ # Consent, audit, erasure
├── packages/types/    # Shared TypeScript types
├── packages/core/     # Shared utilities
├── packages/ui/       # Shared UI components
├── packages/config/   # Shared configuration
├── infrastructure/    # AWS, env, deployment configs
├── scripts/           # Utility and migration scripts
├── tests/             # All automated tests
├── docs/              # All project documentation
├── sample-data/       # Synthetic mock data only
└── .agents/           # Agent rules, workflows, skills
```

---

## Key Docs (Read First)

- `docs/project-brief.md` — product definition and v1 scope
- `docs/architecture.md` — system design
- `docs/decisions.md` — full ADR log
- `docs/tasks.md` — current backlog
- `docs/progress.md` — status and blockers
- `docs/handoff.md` — context for next session
- `docs/compliance.md` — DPDP requirements
- `docs/ai-pipeline.md` — OCR/extraction/judge/RAG design
