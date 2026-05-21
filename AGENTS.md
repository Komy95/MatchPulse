# AGENTS.md

This file contains the main instructions for AI coding agents working in this repository.

## Project goal

Build a World-Cup-first friendly football prediction app with private groups, score predictions, leaderboards, explainable AI match insights, team pages, personalized team news, a global leaderboard, and a transparent FIFA World Cup 2026 tournament simulator.

The app should later support regular leagues and Champions League, but the MVP must remain focused on FIFA World Cup 2026.

MatchPulse is a mobile-first Progressive Web App first. It should feel like a premium iPhone app, not a desktop-first website. Desktop is supported responsively. Native iOS/Android packaging is post-MVP, with Capacitor selected as the preferred future App Store and Google Play path.

## Highest-priority product rules

- Private groups, predictions, and leaderboards are the core product loop.
- The signed-in dashboard is the command center for next locks, unfinished picks, group standings, global rank, news, insights, and simulator entry points.
- The primary MVP experience is phone-based: invite link, authentication, group join, prediction entry, matchday return, leaderboard review, and optional add-to-home-screen.
- AI insights are a presentation layer over structured, licensed football data, not a source of truth.
- The simulator must support the FIFA World Cup 2026 format: 48 teams, 12 groups of four, top two plus eight best third-placed teams into the Round of 32.
- The MVP should avoid paid entry pools, cash prizes, betting, wagering, or gambling-style monetization.
- Use ads first and a premium no-ads plan second.
- Do not ship official team crests, FIFA marks, or copyrighted assets unless rights are confirmed.

## Technical stack

Use:

- Next.js 15 App Router
- TypeScript
- Tailwind CSS
- Firebase Auth
- Cloud Firestore as the primary application database
- Firestore Security Rules for client-readable data protection
- Firebase Hosting or Firebase App Hosting for public hosting
- Progressive Web App delivery for the MVP mobile app experience
- Cloud Run for the Next.js full-stack runtime
- Cloud Run Jobs for ingestion, scoring, AI refreshes, and simulations
- Cloud Scheduler and Pub/Sub for scheduled and event-driven jobs
- Secret Manager for API keys and secrets
- Cloud Logging and Error Reporting for observability
- OpenAI Structured Outputs for AI insight cards
- Sports data provider abstraction for Sportmonks, API-Football, and football-data.org

## Architecture rules

- Public reference data can be cached aggressively.
- Private group data must be protected by Firestore Security Rules and authenticated server routes.
- Mutable private operations must never be performed directly from unaudited client code.
- Client writes may support safe profile/preference updates, but prediction saves, group admin changes, scoring, AI refreshes, provider ingestion, and simulation execution require server-side validation.
- Route handlers run in the Next.js server runtime on Cloud Run and use Firebase Admin SDK where privileged access is needed.
- Provider data must be normalized behind a provider interface.
- No UI component should depend directly on a specific sports-data vendor payload.
- Store provider freshness timestamps and expose stale-data warnings where relevant.
- Store AI outputs in Firestore with input hash, model version, generated timestamp, provider freshness, expiry, and invalidation timestamp.
- Store simulations in Firestore with model version, input hash, assumptions, run count, generated timestamp, and visibility.

## Coding standards

- Use strict TypeScript.
- Prefer small, typed modules with clear domain boundaries.
- Use Zod or equivalent schema validation at API boundaries.
- Keep route handlers thin; move business logic into domain modules.
- Use optimistic UI only where server validation can safely reject invalid state.
- All date comparisons for match locking must use UTC.
- Do not assume local time for kickoff or lock logic.
- Avoid large unstructured prompt files. Keep prompts schema-bound and testable.
- Every new API route needs validation, authorization, error handling, and tests.
- Firestore document shapes must be designed around access patterns, query limits, and denormalized read models.
- All UI work must follow `docs/DESIGN-PHILOSOPHY.md`: Apple-like clarity meets World Cup energy, mobile-first, calm, premium, readable, and free of betting/casino visual patterns.
- Mobile/PWA work must follow `docs/MOBILE-APP-STRATEGY.md` and `docs/PWA-REQUIREMENTS.md`; native app packaging must remain post-MVP unless explicitly scoped, and the preferred future path is a Capacitor wrapper rather than fully native Swift/Kotlin.

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
- Public simulation: precomputed by Cloud Run Jobs and cached.
- On-demand simulation: authenticated and stored for reuse.
- Always persist model assumptions and model version.
- Group-stage and knockout logic must be config-driven, not hard-coded in scattered UI logic.

## Recommended repository structure

This is documentation guidance only. Do not scaffold implementation files unless a later implementation task explicitly asks for them.

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
docs/
tasks/
skills/
```

Google Cloud and Firebase configuration files must only be created during an explicit implementation task. Do not add `firebase.json`, `firestore.rules`, `firestore.indexes.json`, Cloud Run deployment files, or emulator configuration during documentation-only work.

## Definition of done

A task is done only when:

- It is typed.
- It has validation.
- It enforces authorization.
- It has relevant tests or documented test steps.
- It handles missing or stale provider data gracefully.
- It does not leak private group data.
- It keeps the World Cup 2026 MVP scope intact.
