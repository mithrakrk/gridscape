# Product Scope Guardrails

**Type:** always-on
**Scope:** all files

## Stay Focused on v1 Scope

Kavach v1 is anchored to the **routine doctor's visit** use case. Do not add features outside this scope without explicit instruction and a new ADR entry.

## v1 Is In Scope
- WhatsApp bot ingestion (photo + PDF)
- AI extraction: OCR → LLM extraction → LLM-as-judge → caregiver correction
- Multi-patient profile management in PWA
- One-page doctor summary PDF generation
- Doctor web portal with OTP access (time-limited, read-only)
- Free tier only — no payments in v1

## Do NOT Add in v1 Unless Explicitly Instructed
- Camera scan / document scanning UI
- ABHA / Ayushman Bharat Digital Mission integration
- Medication reminders or scheduling
- Advanced trend graphs or visualisations beyond the summary
- Paid plan billing or subscription management
- Pharmacy referral or monetisation features
- Push-confirm auth (Phase 2)
- Multilingual UI beyond scaffold readiness

## Optimise for Caregiver Workflow
- This is a caregiver tool, not a broad hospital management system
- All UX decisions should be evaluated from the 25–40 year old caregiver's perspective
- Doctor surfaces are consumption-only — never build doctor workflow management

## Before Building Analytics or Dashboards
- The summary flow must be working end-to-end first
- No analytics or reporting features before core ingestion → summary → share → portal loop is complete

## Flag Scope Creep
If a task requires adding a feature not in the v1 scope list:
1. Stop and document it in docs/tasks.md as "Backlog (Later Phases)"
2. Note it in docs/handoff.md
3. Do not implement it without explicit user approval and an ADR entry
