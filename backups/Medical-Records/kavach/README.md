# Kavach — Your family's health, protected.

> A WhatsApp-first medical records management product for Indian family caregivers.
> **Founders:** Kavya (idea) · Mithra (build)
> **Name:** Kavach (कवच) means shield/armour in Sanskrit.

---

## What is Kavach?

Kavach helps the 25–40 year old caregiver — the family member who manages everyone's health — collect medical reports over WhatsApp, organise them per patient, generate a clean one-page doctor summary PDF, and share a secure portal link with the doctor during appointments.

It solves a real, painful problem: Indian families accumulate years of paper medical records, lose them, and end up wasting precious consultation time reconstructing history from memory.

---

## Why WhatsApp-first?

WhatsApp is already how Indian families share medical reports. Caregivers already forward test results and prescriptions to family group chats. Kavach redirects this existing behaviour — the bot receives what caregivers already share — into a structured, retrievable system. Zero new habit required.

---

## Who is it for?

| Role | Who |
|---|---|
| **Primary user** | Caregiver (25–40) managing records on behalf of a family member |
| **Beneficiary** | Patient (40–65+) receiving care |
| **Consumer** | Doctor — reads the one-page summary, optionally drills into records via portal |

---

## Workspace Organisation

```
kavach/
├── apps/web/          # Caregiver PWA — patient management, summary preview, corrections
├── apps/worker/       # Background jobs — ingestion, extraction, PDF generation
├── packages/
│   ├── db/            # Prisma schema + PostgreSQL client
│   ├── ai/            # OCR, LLM extraction, judge, RAG interfaces
│   ├── pdf/           # Doctor summary PDF generation
│   ├── auth/          # OTP + session management
│   ├── whatsapp/      # WhatsApp webhook + bot message handling
│   ├── compliance/    # Consent capture, audit log, erasure workflow
│   ├── types/         # Shared TypeScript types
│   ├── core/          # Shared utilities
│   ├── ui/            # Shared React components
│   └── config/        # Shared configuration
├── infrastructure/    # AWS CDK / env / deployment configs
├── scripts/           # Dev utilities and migration scripts
├── tests/             # All automated tests
├── docs/              # All project documentation
├── sample-data/       # Synthetic mock data only (no real PHI)
└── .agents/           # Agent rules, workflows, skills
```

---

## Docs

| File | Contents |
|---|---|
| `docs/project-brief.md` | Product definition, users, MVP scope, thesis |
| `docs/architecture.md` | System design, services, tech decisions |
| `docs/decisions.md` | All architectural + product ADR entries |
| `docs/tasks.md` | Current task backlog |
| `docs/progress.md` | Status, completed, blockers, next steps |
| `docs/handoff.md` | Context for the next session |
| `docs/data-model.md` | Full data model reference |
| `docs/ai-pipeline.md` | OCR/extraction/judge/RAG design |
| `docs/compliance.md` | DPDP, consent, erasure, retention |
| `docs/security.md` | Access control, OTP, secrets, threat model |
| `docs/doctor-summary.md` | One-page summary design and requirements |
| `docs/portal-access.md` | Portal link + OTP flow |
| `docs/whatsapp-ingestion.md` | WhatsApp webhook + ingestion design |
| `docs/test-cases.md` | Manual QA scenarios and acceptance criteria |
| `docs/qa.md` | QA log, checklists, bug tracking |
| `docs/changelog.md` | Change history |

---

## Tests

- Automated tests → `tests/` (unit/, integration/, workflows/, api/)
- Fixtures → `tests/fixtures/` (synthetic only, no real PHI)
- Manual scenarios and acceptance criteria → `docs/test-cases.md`
- QA observations and bug logs → `docs/qa.md`

---

## Workflows (Agent Automation)

Located in `.agents/workflows/`. Invoke as slash commands:

| Command | Purpose |
|---|---|
| `/start-project` | Initialise docs, define MVP, create first backlog |
| `/build-feature` | Full feature implementation cycle with test + docs update |
| `/add-user-flow` | Add or refine a product journey end-to-end |
| `/validate-ai-pipeline` | Inspect OCR/extraction/judge flow and confidence handling |
| `/test-feature` | Create missing tests, expand scenarios, record QA findings |
| `/ship-check` | Pre-ship verification: docs, blockers, security, MVP readiness |

---

## Skills (Specialised Agent Execution)

Located in `.agents/skills/`. Applied based on task domain:

| Skill | Use When |
|---|---|
| `planning/` | PRD shaping, backlog, milestones, scope control |
| `product-architecture/` | Module design, data flow, API contracts |
| `healthcare-compliance/` | Consent, erasure, privacy-aware design |
| `ai-extraction/` | OCR, extraction pipeline, judge step, confidence |
| `qa-validation/` | Test strategy, API validation, regression |
| `docs-maintenance/` | Reading and updating project docs |

---

## First MVP Milestone

1. Scaffold monorepo and shared packages
2. Create caregiver web shell (Next.js PWA)
3. Define core data model (Prisma schema)
4. Implement synthetic patient/profile flows
5. Stub WhatsApp ingestion endpoint
6. Stub OCR/extraction/judge pipeline interfaces
7. Create one-page doctor summary template
8. Create portal link + OTP flow skeleton
9. Create initial automated tests
10. Update all docs to reflect implementation baseline

---

## Compliance Notice

Kavach is designed with a DPDP Act 2023-aligned posture:
- Data stored in AWS Mumbai (ap-south-1)
- Explicit consent capture at onboarding
- Correction and erasure workflows in v1
- Audit trail on all significant data events

**This is not a legal certification.** Consult a qualified legal advisor before processing real patient health data. All current test and sample data is fully synthetic.

---

## Stack

| Layer | Technology |
|---|---|
| Frontend (PWA) | Next.js + React + TypeScript |
| Backend | Next.js Route Handlers + Node.js |
| Database | PostgreSQL via Prisma ORM |
| Storage | S3-compatible (AWS S3, Mumbai) |
| AI | Modular interfaces (OpenAI / Gemini provider-agnostic) |
| PDF | Puppeteer / HTML-to-PDF |
| Queue | BullMQ (Redis-backed, stubbed for MVP) |
| Deployment | AWS Mumbai (ap-south-1) |
