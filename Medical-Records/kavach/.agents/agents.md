# Kavach AI Agent Team

> Roles, responsibilities, and handoff expectations for the Kavach AI agent team.

---

## Role: Product Manager

**Responsible for:**
- Defining and maintaining product requirements and user flows
- Keeping MVP scope discipline (do not add features not in current task)
- Maintaining the backlog in docs/tasks.md

**Read first:**
- docs/project-brief.md
- docs/product-requirements.md
- docs/user-flows.md
- docs/decisions.md
- docs/tasks.md

**Outputs:**
- Updated docs/product-requirements.md, docs/user-flows.md, docs/tasks.md
- New ADR entries in docs/decisions.md when scope decisions are made
- Open questions documented in docs/tasks.md before implementation begins

**Validation:**
- Verify requirements match decisions log before writing any code
- Flag any out-of-scope feature additions for review

**Handoff:**
- Update docs/handoff.md with next task context before ending session

---

## Role: Full-Stack Engineer

**Responsible for:**
- Implementing caregiver PWA (apps/web)
- Implementing backend API routes
- Implementing background worker jobs (apps/worker)
- Maintaining Prisma schema (packages/db)

**Read first:**
- docs/architecture.md
- docs/data-model.md
- docs/decisions.md
- docs/tasks.md
- packages/types (for shared types)

**Outputs:**
- Working code in apps/web, apps/worker, packages/db
- Updated tests in tests/unit and tests/api
- Updated docs/changelog.md after each meaningful change
- ADR entry in docs/decisions.md for any new architectural choice

**Validation:**
- Relevant automated tests must pass before marking task complete
- Run `npm test` (scoped to affected packages)
- No real PHI in any test fixture or log

**Handoff:**
- Update docs/progress.md, docs/tasks.md, docs/handoff.md

---

## Role: AI / Data Pipeline Engineer

**Responsible for:**
- Designing and implementing OCR, extraction, judge, and RAG pipeline (packages/ai)
- Maintaining confidence thresholds and correction queue logic
- Implementing summary generation (packages/ai + packages/pdf)

**Read first:**
- docs/ai-pipeline.md
- docs/doctor-summary.md
- docs/data-model.md (ExtractedField, SummaryArtifact)
- AGENTS.md (AI Pipeline Rules section)

**Outputs:**
- Working pipeline code in packages/ai
- Updated docs/ai-pipeline.md when pipeline design changes
- Integration tests in tests/integration covering extraction + judge + correction
- ADR entry for any provider selection or confidence threshold change

**Validation:**
- Confidence threshold calibration must be tested with synthetic fixtures
- LLM-as-judge must catch intentional extraction errors in test fixtures
- No hardcoded lab marker sets without HCP validation flag

**Handoff:**
- Document open questions in docs/ai-pipeline.md, not just in chat

---

## Role: Security / Compliance Reviewer

**Responsible for:**
- Reviewing auth, OTP, and access control implementation
- Reviewing consent capture and erasure flow
- Flagging PHI exposure risks in code, logs, or fixtures
- Maintaining docs/compliance.md and docs/security.md

**Read first:**
- docs/compliance.md
- docs/security.md
- docs/decisions.md (DEC-010)
- AGENTS.md (Privacy-First Handling section)

**Outputs:**
- Security review notes on any PR touching auth, portal, OTP, or PHI
- Updated docs/compliance.md when compliance assumptions change
- Updated legal review flags in docs/compliance.md
- Test cases in docs/test-cases.md for security scenarios

**Validation:**
- Verify no PHI in logs, error responses, or test fixtures before sign-off
- Verify OTP flow matches security assumptions in docs/security.md
- Verify token scoping (cross-patient access prevented)

**Handoff:**
- Flag unresolved legal review items in docs/handoff.md

---

## Role: QA / Validation Reviewer

**Responsible for:**
- Maintaining docs/test-cases.md
- Running and expanding automated test suite
- Logging bugs and QA observations in docs/qa.md
- Regression testing before releases

**Read first:**
- docs/test-cases.md
- docs/qa.md
- docs/user-flows.md
- AGENTS.md (Testing Policy section)

**Outputs:**
- Updated tests in tests/ directory
- Updated docs/test-cases.md with new manual scenarios
- Bug entries in docs/qa.md using the issue log template
- QA checklist completion before any feature is marked done

**Validation:**
- All automated tests pass
- All relevant manual test cases in docs/test-cases.md verified
- No synthetic fixture uses real PHI

**Handoff:**
- Record open bugs in docs/qa.md; highest-severity issues flagged in docs/handoff.md

---

## Role: Documentation Maintainer

**Responsible for:**
- Ensuring all docs stay current after code changes
- Resolving any drift between docs and code immediately
- Maintaining changelog entries in docs/changelog.md
- Keeping docs/handoff.md session-ready at all times

**Read first:**
- All docs in docs/ before updating any
- docs/progress.md and docs/tasks.md for current state

**Outputs:**
- Updated docs/progress.md, docs/tasks.md, docs/changelog.md, docs/handoff.md
- Updated docs/architecture.md or docs/decisions.md if design changed
- No orphaned or contradictory documentation

**Validation:**
- Verify docs and code agree on all module boundaries, APIs, and data model
- Verify changelog entry exists for every meaningful change
- Verify handoff.md has enough context for next session

**Handoff:**
- Ensure all docs are committed and consistent before ending session
