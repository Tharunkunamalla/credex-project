# Tests — StackSpend

## What is covered
- Audit engine rule logic in `tests/audit-engine/rules.test.ts`.
- Live data access verification in `tests/read-live-audits.test.ts`.
- Production build validation via `npm run build`.

## Test approach
- Use Vitest for fast unit tests around deterministic business logic.
- Use build-time validation to catch App Router, metadata, and server component issues.
- Keep audit calculations deterministic so outputs are repeatable across environments.

## Latest validation
- Production build completed successfully locally.
- CI was updated to use a Node 20 runtime so it matches the Next.js requirement.
