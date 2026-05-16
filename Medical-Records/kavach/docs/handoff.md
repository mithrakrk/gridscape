# Handoff — Medical Records

> Last updated: 2026-05-16

---

## Current State

Product definition is complete. No code has been written yet. The project is in the pre-build research phase.

---

## What Was Done

A full grill-me session was conducted to stress-test the problem statement and resolve all major product and architectural decisions. All decisions are documented in `docs/decisions.md`. The full product definition is in `docs/project-brief.md`.

---

## Key Context for Next Session

- **Primary user** is the **caregiver** (25–40), not the patient. Design all UX for them.
- The **WhatsApp bot is the ingestion AND sharing channel** — caregivers forward documents in, and share the PDF summary out, all via WhatsApp. The PWA is for management only.
- **Multi-patient is a day-one requirement** — data model must be `Account → [Patient Profiles] → [Records]` from the start.
- **LLM-as-judge is critical** — medical data accuracy cannot be sacrificed for speed. Low-confidence extractions must trigger human correction, not silent failure.
- **GTM anchor is the existing doctor network** (Apollo, KIMS, dermatologists) — this is the highest-trust acquisition channel and should be the first thing activated post-MVP.
- **DPDP Act 2023 compliance is non-negotiable** — all data in AWS Mumbai, explicit consent on onboarding, right to erasure in v1.
- **Lab marker configuration is research-dependent** — HCP interviews must happen before building the summary generator, so marker sets are clinically validated.

---

## Immediate Next Actions

1. [ ] Conduct HCP interviews (Apollo/KIMS contacts) to validate doctor summary contents and lab marker sets
2. [ ] Interview 5–10 caregivers to validate WhatsApp bot hypothesis
3. [ ] Register WhatsApp Business API
4. [ ] Set up AWS Mumbai infrastructure
5. [ ] Begin PWA scaffold
