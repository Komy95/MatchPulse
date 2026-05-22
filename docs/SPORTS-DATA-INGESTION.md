# Sports Data Ingestion

Sprint 4 establishes the provider-agnostic data layer for future FIFA World Cup 2026 ingestion. It does not integrate a real vendor API yet, does not deploy Cloud Run Jobs, and does not implement predictions, scoring, leaderboards, AI insights, or simulator behavior.

## Provider Boundary

All providers must implement `SportsDataProvider` from `lib/sports-data/providers/types.ts`.

The interface returns normalized domain objects only:

- `NormalizedCompetition`
- `NormalizedSeason`
- `NormalizedTeam`
- `NormalizedMatch`
- provider metadata
- freshness metadata

Provider-specific response shapes must stay inside provider adapters. UI components, route handlers, prediction logic, scoring jobs, and Firestore writers must not depend on Sportmonks, API-Football, football-data.org, or any other vendor payload directly.

The local `MockSportsDataProvider` is the only Sprint 4 provider. It exists for tests and emulator-safe local development.

For local prediction development, `npm run seed:reference` writes a small idempotent World Cup 2026 reference-data set to the Firestore emulator. It refuses to run against a deployed project unless `--allow-production` is passed intentionally.

## Canonical Firestore Model

Sports data is public read, server write:

```text
competitions/{competitionId}
competitions/{competitionId}/seasons/{seasonId}
competitions/{competitionId}/seasons/{seasonId}/teams/{teamId}
competitions/{competitionId}/seasons/{seasonId}/matches/{matchId}
```

The competition-season path is canonical. Future prediction and scoring code should resolve a group season's `competitionId` and `seasonId`, then read matches from:

```text
competitions/{competitionId}/seasons/{seasonId}/matches/{matchId}
```

Do not create provider-ingested matches directly under `groups/{groupId}` or under a group season. Group seasons reference public sports data; private predictions and leaderboards live under the group season.

## Idempotency

The ingestion service:

1. Accepts a provider and `{ competitionId, seasonId }` request.
2. Fetches normalized data.
3. Validates that every returned competition, season, team, and match belongs to the requested scope.
4. Writes through `SportsDataWriter`.
5. Uses deterministic provider-scoped document IDs for teams and matches.
6. Uses Firestore merge upserts.
7. Updates freshness metadata and season aggregate counts.

The same provider batch can be rerun without creating duplicate competitions, seasons, teams, or matches.

## Freshness and Observability

Every normalized document stores:

- `provider.providerId`
- `provider.externalId`
- `provider.sourceName`
- `provider.fetchedAt`
- optional `provider.providerUpdatedAt`
- `freshness.fetchedAt`
- `freshness.staleAfter`
- optional `freshness.providerUpdatedAt`
- `updatedAt`

Season documents also store:

- `lastIngestedAt`
- `teamCount`
- `matchCount`
- `finalMatchCount`

Cloud Run Jobs should log provider ID, competition ID, season ID, fetched timestamp, upsert counts, final match count, and any provider validation errors.

## Future Cloud Run Job and Pub/Sub Plan

Future ingestion should run as a Cloud Run Job triggered by Cloud Scheduler. The scheduler can publish a Pub/Sub message containing:

```json
{
  "providerId": "sportmonks",
  "competitionId": "fifa-world-cup",
  "seasonId": "world-cup-2026"
}
```

The job should:

1. Resolve the configured provider adapter.
2. Read provider API credentials from Secret Manager.
3. Run the idempotent ingestion service.
4. Retry transient provider/network failures with Cloud Run Job retry settings.
5. Fail fast on invalid provider data so bad payloads do not overwrite trusted documents.
6. Emit structured logs for freshness and upsert summaries.

When a match transitions to `FINISHED`, a later sprint can publish a scoring event. Scoring must remain a separate job that reads final match data and writes group-season leaderboard snapshots. Sprint 4 only stores enough status and freshness metadata to make that future trigger auditable.

## Provider Credentials

Local tests use the mock provider and require no secrets.

Future real providers should use server-only configuration:

```text
SPORTS_PROVIDER=sportmonks | api-football | football-data-org
SPORTS_PROVIDER_API_KEY=<Secret Manager value>
```

Never expose provider credentials through `NEXT_PUBLIC_*` variables or client bundles.

## Validation

Run:

```bash
npm test
npm run typecheck
npm run lint
npm run validate:foundation
npm run build
```

The sports-data test suite covers provider mapping, deterministic IDs, idempotent writes, freshness updates, status normalization, and invalid provider data rejection.
