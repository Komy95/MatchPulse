# AGENTS.md

This file contains the main instructions for AI coding agents working in this repository.

## Project goal

Build a World-Cup-first friendly football prediction app with private groups, score predictions, leaderboards, explainable AI match insights, team pages, and a transparent FIFA World Cup 2026 tournament simulator.

The app should later support regular leagues and Champions League, but the MVP must remain focused on FIFA World Cup 2026.

## Highest-priority product rules

- Private groups, predictions, and leaderboards are the core product loop.
- AI insights are a presentation layer over structured, licensed football data, not a source of truth.
- The simulator must support the FIFA World Cup 2026 format: 48 teams, 12 groups of four, top two plus eight best third-placed teams into the Round of 32.
- The MVP should avoid paid entry pools, cash prizes, betting, wagering, or gambling-style monetization.
- Use ads first and a premium no-ads plan second.
- Do not ship official team crests, FIFA marks, or copyrighted assets unless rights are confirmed.

## Technical stack

Use:

- Next.js App Router
- TypeScript
- Tailwind CSS
- Supabase Auth
- Supabase Postgres
- Supabase Row Level Security
- Server-side route handlers for authenticated writes
- Background jobs for ingestion, scoring, AI refreshes, and simulations
- OpenAI Structured Outputs for AI insight cards

## Architecture rules

- Public reference data can be cached aggressively.
- Private group data must be protected by RLS and authenticated server routes.
- Mutable private operations must never be performed directly from unaudited client code.
- Provider data must be normalized behind a provider interface.
- No UI component should depend directly on a specific sports-data vendor payload.
- Store provider freshness timestamps and expose stale-data warnings where relevant.
- Store AI outputs with input hash, model version, generated timestamp, expiry, and invalidation timestamp.
- Simulations must be versioned by model version, input hash, assumptions, and run count.

## Coding standards

- Use strict TypeScript.
- Prefer small, typed modules with clear domain boundaries.
- Use Zod or equivalent schema validation at API boundaries.
- Keep route handlers thin; move business logic into `lib/*`.
- Use optimistic UI only where server validation can safely reject invalid state.
- All date comparisons for match locking must use UTC.
- Do not assume local time for kickoff or lock logic.
- Avoid large unstructured prompt files. Keep prompts schema-bound and testable.
- Every new API route needs validation, authorization, error handling, and tests.

## Domain rules

### Predictions

- Users may edit predictions only before `lockAt`.
- Bulk prediction saves must be idempotent.
- Prediction history should be retained.
- MVP scoring should default to Hybrid 3-2-1:
  - 3 points for exact score
  - 2 points for correct goal difference
  - 1 point for correct tendency
- Knockout user prediction scoring should use the 90-minute result plus stoppage time.
- Tournament advancement simulation may use extra time and penalties.

### AI insights

- Use only supplied structured evidence.
- Do not invent injuries, lineups, odds, quotes, or player-specific claims.
- If data is missing or conflicting, produce a low-confidence card with clear warnings.
- AI responses must match the insight JSON schema.
- Reject malformed insight responses before rendering.

### Simulator

- MVP model: Elo-informed independent Poisson.
- Public simulation: precomputed and cached.
- On-demand simulation: authenticated and stored for reuse.
- Always persist model assumptions and model version.
- Group-stage and knockout logic must be config-driven, not hard-coded in scattered UI logic.

## Recommended repository structure

```text
app/
  (marketing)/
  (app)/
  api/v1/
components/
  groups/
  predictions/
  insights/
  teams/
  simulator/
  ads/
lib/
  providers/
  scoring/
  insights/
  simulator/
  auth/
  db/
  cache/
supabase/
  migrations/
  functions/
docs/
tasks/
skills/
```

## Definition of done

A task is done only when:

- It is typed.
- It has validation.
- It enforces authorization.
- It has relevant tests or documented test steps.
- It handles missing or stale provider data gracefully.
- It does not leak private group data.
- It keeps the World Cup 2026 MVP scope intact.
