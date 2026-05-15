# AGENTS.md — Kavach

## Project Mission
Build **Kavach** (कवच) — *your family's health, protected* — a WhatsApp-first medical records management product for Indian family caregivers. Target user is the 25–40 year old caregiver managing health records for a 40–65 year old family member.

**Founders:** Kavya (idea) · Mithra (build)

## Inherited Rules
Follow all rules in the root `AGENTS.md` for universal project conventions.

## Medical Records–Specific Rules

1. **Never silently discard extraction failures.** Low-confidence OCR/LLM extractions must always trigger a caregiver correction flow, not silent omission. A missed medication dosage in a summary is a patient safety risk.

2. **Always preserve the raw source document.** Structured extraction is supplementary. The raw file (photo/PDF) is the legal and medical source of truth and must never be deleted or overwritten.

3. **DPDP Act 2023 is non-negotiable.** Any new data field, processing step, or third-party integration must be assessed for compliance before implementation. Check `docs/decisions.md` DEC-010.

4. **Lab marker sets must be HCP-validated before coding.** Do not hardcode condition-linked markers without first confirming them through healthcare professional interviews. Defaults should be clearly marked as provisional.

5. **Multi-patient data model from the start.** All queries, APIs, and UI components must operate within the `Account → PatientProfile → Record` hierarchy. Never assume a single patient per account.

6. **Doctor-facing surfaces are read-only.** The web portal for doctors must never allow record modification. Portal links must be time-limited (default: 8 hours).

## Key Docs
- `docs/project-brief.md` — full product definition and v1 scope
- `docs/architecture.md` — system architecture and tech decisions
- `docs/decisions.md` — all architectural and product decisions log
- `docs/tasks.md` — current task list
- `docs/progress.md` — project status
- `docs/handoff.md` — context for next session
