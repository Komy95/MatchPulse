# Project Context

This document is the implementation baseline for MatchPulse. It consolidates the product vision, MVP scope, architecture decisions, technology stack, coding standards, and pre-implementation documentation review.

## Product Vision

MatchPulse is a World-Cup-first friendly football prediction app for FIFA World Cup 2026.

The core product loop is:

1. A user creates or joins a private group.
2. Group members submit exact-score predictions before each match locks.
3. Final match results trigger scoring and leaderboard updates.
4. Users can compare themselves inside private groups and on an international all-user leaderboard.
5. Members use personalized team news, team pages, match context, AI insight cards, and simulator probabilities to make more informed picks.

The differentiator is not generic pool mechanics alone. The product should make casual fans feel more informed through clear team context, explainable AI match insights, and a transparent tournament simulator.

Regular leagues and Champions League can be supported later, but MVP implementation must stay focused on FIFA World Cup 2026.

## MVP Scope

### In Scope

- Firebase-authenticated user profiles.
- Private groups with owner/admin/member roles.
- Invite links or invite codes for joining groups.
- Group settings for scoring preset, prediction mode, lock policy, booster availability, and prediction visibility.
- Bulk exact-score prediction entry.
- Prediction editing only before `lock_at`.
- Prediction revision history.
- Hybrid 3-2-1 scoring as the default:
  - 3 points for exact score.
  - 2 points for correct goal difference.
  - 1 point for correct tendency.
- Additional MVP scoring presets:
  - Exact-only.
  - 1X2 only.
- Leaderboard snapshots visible only to active group members.
- Public team pages with schedule, group, form, ranking, context, and freshness metadata.
- Match detail pages with score, facts, team comparison, freshness status, and AI insight card.
- AI insight cards generated from structured evidence only.
- Public cached FIFA World Cup 2026 tournament simulation.
- Authenticated custom simulation runs stored for reuse.
- Account setup preferences for favorite teams, followed teams, locale, and content preferences.
- A landing or signed-in home surface with news about selected teams and relevant World Cup context.
- An international leaderboard across all users, shown separately from private group leaderboards.
- Consent-aware ads.
- Premium no-ads plan as a later monetization path.

### Out of Scope for MVP

- Paid-entry pools.
- Cash prizes.
- Betting, wagering, odds-led UX, or gambling-style monetization.
- Public wagering.
- Social feeds.
- Chat.
- Complex notification systems.
- Advanced B2B white-label features.
- Official team crests, FIFA marks, or copyrighted assets unless rights are confirmed.
- Unlicensed full-text news republishing.

## Product Decisions

- The MVP tournament is FIFA World Cup 2026.
- The simulator must support the 2026 format: 48 teams, 12 groups of four, top two in each group plus the eight best third-placed teams advance to the Round of 32.
- Private groups, predictions, and leaderboards are the highest-priority product loop.
- The leaderboard model has two layers:
  - Private group leaderboards for group competition.
  - A global international leaderboard across all users for broader comparison.
- Account creation should collect lightweight preferences that can personalize team news and team/match surfaces.
- Personalized news must be sourced from licensed feeds, RSS/source metadata where permitted, or links/snippets that comply with publisher terms.
- AI insights are a presentation layer over structured, licensed football data. They are not a source of truth.
- Missing or stale data must be visible to users rather than silently hidden.
- Knockout user prediction scoring uses the 90-minute result plus stoppage time.
- Tournament advancement simulation may use extra time and penalties.
- All match lock comparisons must use UTC.

## Architecture Decisions

### Application Architecture

- Use Next.js 15 App Router.
- Use TypeScript in strict mode.
- Use Tailwind CSS for styling.
- Use Firebase Auth for authentication.
- Use Cloud Firestore as the primary application database.
- Use Firestore Security Rules for client-readable data protection.
- Use Firebase Hosting or Firebase App Hosting for public hosting.
- Use Cloud Run for the Next.js full-stack runtime.
- Use Cloud Run Jobs for ingestion, scoring, AI refreshes, and simulations.
- Use Cloud Scheduler and Pub/Sub for scheduled and event-driven jobs.
- Use Secret Manager for API keys and secrets.
- Use Cloud Logging and Error Reporting for observability.
- Use server-side Next.js route handlers for authenticated writes.
- Keep route handlers thin and move business logic into `lib/*`.
- Use OpenAI Structured Outputs for AI insight cards.

### Data Boundaries

- Public reference data can be cached aggressively.
- Private group data must be protected by both Firestore Security Rules and authenticated application routes.
- Mutable private operations must not be performed directly from unaudited client code.
- Route handlers use Firebase Admin SDK server-side for privileged Firestore access.
- Provider payloads must be normalized behind a provider interface.
- UI components must not depend directly on sports-data vendor response shapes.
- Provider freshness timestamps must be stored and surfaced where relevant.
- AI outputs must store input hash, model version, generated timestamp, expiry, and invalidation timestamp.
- Simulation runs must store model version, input hash, assumptions, run count, and generated timestamp.

### Suggested App Structure

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
  layout/
lib/
  auth/
  cache/
  db/
  groups/
  insights/
  news/
  predictions/
  providers/
  scoring/
  simulator/
  teams/
  validators/
docs/
tasks/
skills/
```

## Data Model Baseline

Core entities:

- `users/{userId}`
- `groups/{groupId}`
- `groups/{groupId}/members/{userId}`
- `groups/{groupId}/invites/{inviteId}`
- `groups/{groupId}/predictions/{predictionId}`
- `groups/{groupId}/predictionRevisions/{revisionId}`
- `groups/{groupId}/leaderboardSnapshots/{snapshotId}`
- `competitions/{competitionId}`
- `seasons/{seasonId}`
- `teams/{teamId}`
- `matches/{matchId}`
- `teamMetricSnapshots/{snapshotId}`
- `matchInsights/{matchId}`
- `simulationRuns/{simulationId}`
- `globalLeaderboardSnapshots/{snapshotId}`
- `newsItems/{newsItemId}`
- `newsSources/{sourceId}`
- `adSlots/{slotId}`

Private or mutable documents must be protected by Firestore Security Rules and server-side Cloud Run validation. Public reference documents can be readable by everyone. Server-only writes should be reserved for provider data, scoring snapshots, AI outputs, simulation results, and news ingestion.

## API Baseline

Use REST-first route handlers under `/api/v1`.

Core MVP endpoints:

- `POST /api/v1/groups`
- `GET /api/v1/groups/{groupId}`
- `PATCH /api/v1/groups/{groupId}`
- `POST /api/v1/groups/{groupId}/join`
- `GET /api/v1/groups/{groupId}/matches`
- `POST /api/v1/groups/{groupId}/predictions`
- `GET /api/v1/groups/{groupId}/leaderboard`
- `GET /api/v1/leaderboard/global`
- `GET /api/v1/matches/{matchId}`
- `GET /api/v1/matches/{matchId}/insight`
- `GET /api/v1/news`
- `GET /api/v1/teams/{teamId}`
- `GET /api/v1/profile/preferences`
- `PATCH /api/v1/profile/preferences`
- `POST /api/v1/simulations`
- `GET /api/v1/simulations/{simulationId}`
- `GET /api/v1/simulations/public/world-cup-2026`

All API responses should use stable JSON contracts. Errors should use this shape:

```json
{
  "error": {
    "code": "PREDICTION_LOCKED",
    "message": "Prediction cannot be changed after lock time.",
    "details": {}
  }
}
```

## Coding Standards

- Use strict TypeScript.
- Prefer small typed modules with clear domain boundaries.
- Validate API boundaries with Zod or an equivalent schema library.
- Keep route handlers thin.
- Put business rules in `lib/*` domain services.
- Enforce authorization in route handlers and Firestore Security Rules.
- Use optimistic UI only where server validation can safely reject invalid state.
- Use UTC for all kickoff and lock-time comparisons.
- Avoid large unstructured prompt files.
- Keep prompts schema-bound and testable.
- Reject malformed AI insight responses before rendering.
- Add tests for new API routes, validation, authorization, and business rules.
- Document test steps when automated coverage is not yet practical.

## Delivery Sequence

1. Firebase/GCP foundation: app shell, Firebase Auth, Firestore model, security rules, local emulator plan, and Cloud Run-compatible runtime.
2. Data abstraction: provider interface and Cloud Run Job-based normalized ingestion.
3. Private groups: create, join, roles, invites.
4. Preferences and personalized home: account setup preferences and team-news feed.
5. Predictions and leaderboards: bulk upsert, lock checks, private scoring snapshots, global leaderboard snapshots.
6. Team pages: cached public context with freshness metadata.
7. AI insights: schema-bound insight generation and validation.
8. Tournament simulator: public cached runs and authenticated custom runs.
9. Ads, consent, and compliance.

## Documentation Review

### Inconsistencies

- Product name differs: the repository and agent instructions use `MatchPulse`, while `docs/PRD.md` names the product `FutureCast`. Implementation should use `MatchPulse` unless the product is intentionally renamed.
- Route structure differs for team pages: `docs/ARCHITECTURE.md` places team pages under `app/(app)/teams/[teamId]/page.tsx`, while `tasks/ROADMAP.md` references `app/teams/[teamId]/page.tsx`.
- Background job runtime is now Cloud Run Jobs triggered by Cloud Scheduler and Pub/Sub. Older job path references should be treated as historical and not implemented directly.
- MVP surface count is described as five first-class surfaces, but the fifth combines team pages and simulator. Implementation planning should treat team pages and simulator as separate workstreams.
- API docs include `GET /api/v1/groups/{groupId}/matches`, but the architecture route tree omits `groups/[groupId]/matches/route.ts`.
- `predictionMode` values use `EXACT_SCORE` and `THREE_WAY`, while scoring presets include `1X2 only`. The naming should be normalized before schema work.
- Simulation model enum includes future models (`DIXON_COLES_V2`, `HYBRID_V3`) even though MVP specifies `ELO_POISSON_V1`. This is acceptable as future-proofing, but MVP code should only implement and expose `ELO_POISSON_V1`.
- The docs mention a pricing page and premium no-ads path, but MVP release criteria only require consent-aware ads. Premium subscription implementation should remain out of initial MVP unless explicitly added.
- Earlier docs define leaderboards only inside private groups. The updated product direction adds a global international leaderboard across all users, so scoring and privacy rules must now support both contexts.
- Earlier docs do not include team news or preference-based personalization. The updated product direction adds a personalized news surface, so data sourcing and publisher rights need to be decided before implementation.

### Missing Decisions

- Final product name and public brand language.
- Primary sports-data provider, fallback provider, and licensing constraints.
- Whether invite links identify groups by `groupId`, slug, invite code, or a separate invite token.
- Exact lock policy: kickoff time, configurable offset before kickoff, or per-group override.
- Prediction visibility policy: whether members can see others' predictions after lock, after kickoff, after final score, or never.
- Booster rules: number of boosters, scoring multiplier, stage restrictions, edit behavior, and tie-in to scoring snapshots.
- Leaderboard tie-breakers.
- Whether standings recalculate from event history every time or persist denormalized point totals.
- Exact group admin permissions after tournament start.
- Profile privacy rules and which profile fields are visible in group context.
- Global leaderboard display rules: public display name, country/locale, anonymization option, opt-out policy, and whether all users are included by default.
- Global leaderboard scoring basis: all World Cup matches, only predictions made before kickoff, handling missed matches, tie-breakers, and whether private group scoring presets affect global score.
- News source strategy: licensed news API, publisher RSS metadata, manual curated links, or provider-integrated editorial content.
- News personalization rules: favorite teams, followed teams, locale, language, tournament stage, and whether users can edit preferences after signup.
- News caching, attribution, snippet length, and outbound-link behavior.
- ID strategy: UUIDs, prefixed IDs, slugs, or provider-derived IDs.
- Data freshness thresholds for each surface.
- Stale-data warning copy and severity levels.
- AI model versioning convention and invalidation triggers.
- AI insight JSON schema details and validation error handling behavior.
- Simulation assumptions for Elo source, home advantage, neutral-site handling, draws, extra time, penalties, third-place ranking tiebreakers, and bracket placement.
- Public simulation cadence during live tournament phases.
- Consent management provider, ad provider, and regional privacy requirements.
- Test framework and minimum test coverage expectations.
- Deployment target, cron mechanism, and secret management process.

### Implementation Risks

- Gambling perception risk: prediction pools plus boosters can appear betting-adjacent. Avoid odds-led UI, paid entry, prizes, and gambling language.
- Licensing risk: provider data, FIFA marks, and team crests require explicit rights. Use neutral team identifiers and licensed data only.
- Privacy risk: private group data must be protected consistently at route, service, and Firestore Security Rules layers.
- Global leaderboard privacy risk: public rankings can expose user activity across the app. Provide clear display-name controls and decide opt-out behavior early.
- News licensing risk: team news cannot be copied wholesale from publishers. Use licensed content, compliant snippets, attribution, and links.
- Personalization risk: team/news preferences are user profile data. Store only what is needed and make preferences editable.
- Locking risk: local timezone assumptions can cause incorrect prediction locks. Store and compare lock times in UTC only.
- Data quality risk: stale or missing provider data can undermine scores, insights, and simulations. Store freshness metadata and expose warnings.
- AI trust risk: generated insights may imply unsupported claims. Only use supplied structured evidence and reject schema-invalid output.
- Simulator credibility risk: probabilities are sensitive to model assumptions. Persist assumptions and make them visible.
- Reproducibility risk: scoring, insights, and simulations need input hashes and version fields before results are generated.
- Scope risk: league, Champions League, chat, notifications, premium plans, and white-label features should not displace the World Cup MVP.
- Operational risk: Cloud Run Jobs, Scheduler, Pub/Sub topics, and Secret Manager access need concrete project configuration before implementation.

## Definition of Done

A task is done only when:

- It is typed.
- It validates inputs.
- It enforces authorization.
- It has relevant tests or documented test steps.
- It handles missing or stale provider data gracefully where applicable.
- It does not leak private group data.
- It keeps the World Cup 2026 MVP scope intact.
