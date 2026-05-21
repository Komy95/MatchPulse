# Backend API implementation skill

## Purpose

Build validated, authorized Next.js route handlers.

## Use this skill when

- Adding or modifying files under `app/api/v1/`
- Implementing group, prediction, leaderboard, insight, team, or simulation endpoints

## Inputs

- API contract from `docs/API-SPECS.md`
- Domain logic in `lib/*`
- Supabase session and RLS requirements

## Process

1. Validate route params and request body.
2. Load authenticated user where required.
3. Enforce authorization before reading private data.
4. Delegate business logic to `lib/*`.
5. Return stable JSON response and error shape.
6. Add tests or documented test steps.

## Output

- Route handler
- Validation schema
- Domain service call
- Consistent JSON response

## Acceptance checklist

- [ ] Input validation exists
- [ ] Auth required where needed
- [ ] Member/admin check exists
- [ ] Business logic is not buried in route handler
- [ ] Errors use standard shape
- [ ] UTC time used for lock checks
