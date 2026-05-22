# Data Providers

## Provider Strategy

Use a provider abstraction so sports-data vendors can be swapped without rewriting the app.

Primary production candidates:

- Sportmonks
- API-Football

Fallback / secondary candidate:

- football-data.org

Use official FIFA pages only as verification anchors unless explicit content/feed rights are confirmed.

## Target Runtime

Provider ingestion runs through Cloud Run Jobs.

Triggers:

- Cloud Scheduler for scheduled ingestion.
- Pub/Sub for event-driven refreshes.
- Manual protected admin trigger for emergency refreshes.

Normalized provider data is stored in Cloud Firestore. UI components must never depend directly on vendor payloads.

## Provider Abstraction

The future implementation should expose a typed provider interface that returns normalized football data.

Required normalized concepts:

- Competition.
- Season/tournament.
- Team.
- Fixture/match.
- Match status.
- Score fields for 90-minute, stoppage-time, extra-time, and penalties where available.
- Team metric snapshots.
- Provider freshness timestamps.

## Source-Use Rules

- Use licensed provider data for product-rendered fixture, team, and stats content.
- Attribute where the provider requires it.
- Do not assume team logos are covered by fixture-data rights.
- Do not scrape or republish FIFA-owned content as the canonical data source.
- Do not resell raw third-party data.
- Store provider IDs and freshness timestamps for all normalized records.
- Store the provider name and provider terms constraints where needed for attribution.

## Normalized Storage Targets

Cloud Run ingestion jobs write normalized data to Firestore collections such as:

- `competitions/{competitionId}`
- `competitions/{competitionId}/seasons/{seasonId}`
- `competitions/{competitionId}/seasons/{seasonId}/teams/{teamId}`
- `competitions/{competitionId}/seasons/{seasonId}/matches/{matchId}`
- `teamMetricSnapshots/{snapshotId}`
- `newsItems/{newsItemId}` if the source is licensed/compliant
- `newsSources/{sourceId}`

## Ingestion Rules

- Ingestion must be idempotent.
- Provider payloads must be normalized before writing to Firestore.
- Repeated ingestion must not create duplicate teams or matches.
- Provider freshness must be persisted.
- Conflicting provider payloads should be stored as warnings or reconciliation metadata, not silently overwritten.
- Final score ingestion should publish or trigger scoring recalculation.
- Material provider updates should trigger AI insight invalidation and public simulation refresh when relevant.

## Implementation Guidance

Suggested future implementation areas:

```text
lib/providers/
  base.ts
  normalize.ts
  sportmonks.ts
  apiFootball.ts
  footballData.ts
  providerFactory.ts

Cloud Run Jobs:
  ingest-fixtures
  ingest-team-metrics
  ingest-news
  ingest-final-scores
```

Do not create implementation files during documentation-only work.

## Provider Acceptance Tests

- Each provider adapter returns the same normalized match shape.
- Provider-specific fields do not leak into UI components.
- Missing optional fields are handled safely.
- Provider freshness is stored.
- Ingestion is idempotent.
- Duplicate teams and matches are not created on repeated ingestion.
- Final-score updates can trigger scoring recalculation.
