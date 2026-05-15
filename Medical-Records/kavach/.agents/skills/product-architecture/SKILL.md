---
name: product-architecture
description: Module boundaries, data flow, backend/frontend contracts, deployment shape, monorepo structure.
use_when:
  - Designing a new module or package
  - Defining API contracts between frontend and backend
  - Making technology or stack decisions
  - Reviewing or updating the system architecture
outputs:
  - Updated docs/architecture.md
  - New ADR in docs/decisions.md
  - Updated docs/data-model.md (if schema changes)
---

# Skill: Product Architecture

## When to Apply
Apply this skill when designing modules, defining API contracts, or making technology decisions.

## Process

### Read Before Designing
1. `docs/architecture.md` — current system design
2. `docs/data-model.md` — current schema
3. `docs/decisions.md` — resolved technology choices

### Module Boundary Principles
- Each package in `packages/` has a single responsibility
- Packages expose a clean TypeScript interface (no implementation details)
- `apps/` import from `packages/` — never the reverse
- UI logic stays in `apps/web/` — never leaks into packages

### Data Flow Principles
- All data changes go through the Prisma client in `packages/db`
- Raw files go to S3 before any processing
- Extraction results go to DB before correction or summary generation
- Events flow through the queue (BullMQ) for async operations

### API Contract Design
- All API routes return `{ data: T | null, error: string | null }`
- Caregiver routes require `X-Account-Id` validated from session
- Doctor portal routes require `X-Access-Token` validated against DB
- Zod schemas defined in `packages/types` for all request/response shapes

### Recording Architectural Decisions
Every module boundary, stack choice, or significant technical decision must be recorded in `docs/decisions.md` with:
- Date
- Decision
- Rationale
- Consequences (including any trade-offs)
