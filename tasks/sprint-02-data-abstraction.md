# Sprint 02: Data Abstraction

## Goal

Build the provider abstraction and normalized football data ingestion layer.

## Tasks

- Create `SportsProvider` interface.
- Add normalized team and match types.
- Implement provider factory.
- Add first provider adapter.
- Create competition, season, team, and match migrations.
- Build fixture ingestion job.
- Store provider IDs and freshness timestamps.
- Add idempotent upsert logic.

## Acceptance criteria

- Provider adapter returns normalized match objects.
- Ingestion can be run repeatedly without duplicates.
- Match and team records include provider metadata.
- UI does not depend on provider-specific payloads.
