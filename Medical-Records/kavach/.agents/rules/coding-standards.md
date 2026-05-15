# Coding Standards Rule

**Type:** always-on
**Scope:** all source files

## TypeScript
- Use TypeScript for all source files (`.ts`, `.tsx`).
- Enable strict mode in all `tsconfig.json` files.
- No implicit `any`. Prefer explicit types from `packages/types`.
- Use Zod for runtime validation at API boundaries.

## Module Boundaries
- `packages/*` contain shared business logic only — no UI dependencies.
- `apps/web` may import from `packages/*` but not vice versa.
- `apps/worker` may import from `packages/*` but not vice versa.
- Circular dependencies are forbidden.

## API Design
- All API routes return consistent `{ data, error }` shape.
- All caregiver API routes validate session and scope to `accountId`.
- All doctor portal routes validate token and scope to `patientId` on the token.
- Return 401 for unauthenticated, 403 for unauthorised (not 404).

## Error Handling
- Never expose PHI in error messages returned to clients.
- Log errors server-side with non-PHI context only (record ID, error code, confidence tier).
- Use structured logging (JSON) for all server-side logs.

## Database
- All queries use Prisma client — no raw SQL except for pgvector operations.
- All queries are scoped to `accountId` for caregiver operations.
- Use transactions for multi-step writes.
- Never hard-delete records — use soft delete (`deletedAt`).

## Testing
- Co-locate unit test logic with source where practical.
- Executable tests in `tests/`.
- Use synthetic fixtures only — never real PHI.
- One test file per feature/module minimum.

## Git
- Commit messages: `[type] short description` (e.g., `[feat] add patient CRUD endpoints`)
- Types: feat, fix, refactor, test, docs, chore
- Never commit `.env` files, secrets, or real PHI
