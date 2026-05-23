# Tournament Reference Data

MatchPulse stores football tournament reference data once, centrally, under:

```text
competitions/{competitionId}
  seasons/{seasonId}
    tournamentGroups/{tournamentGroupId}
    teams/{teamId}
    players/{playerId}
    squads/{squadId}
    matches/{matchId}
    bracketNodes/{bracketNodeId}
```

Private groups do not duplicate teams, matches, scores, squads, or bracket structure. A private group season stores only its own group configuration and references the canonical season:

```text
groups/{groupId}/seasons/{groupSeasonId}
  competitionId: "fifa-world-cup"
  seasonId: "world-cup-2026"
```

Predictions reference central match IDs through `matchId`. Leaderboards score against central match results read from `competitions/{competitionId}/seasons/{seasonId}/matches/{matchId}`.

## ID Conventions

Use deterministic, lower-case, hyphenated document IDs. Helpers live in `lib/sports-data/ids.ts`.

- `competitionId`: `competitionDocumentId(name)`, for example `fifa-world-cup`.
- `seasonId`: `seasonDocumentId(competitionId, seasonLabel)`, for example `world-cup-2026`.
- `teamId`: `teamDocumentId(competitionId, seasonId, teamName)` or provider-scoped `deterministicProviderEntityId`.
- `matchId`: `matchDocumentId({ competitionId, seasonId, stage, homeTeamId, awayTeamId, kickoffAt })` or provider-scoped `deterministicProviderEntityId`.
- `tournamentGroupId`: `tournamentGroupDocumentId(competitionId, seasonId, groupCode)`.
- `squadId`: `squadDocumentId(competitionId, seasonId, teamId)`.
- `playerId`: `playerDocumentId(competitionId, seasonId, teamId, playerName)`.
- `bracketNodeId`: `bracketNodeDocumentId(competitionId, seasonId, stage, sortOrder)`.

Provider-backed ingestion may use provider-scoped IDs where a stable provider external ID exists. Manual/local reference data should use the explicit helper matching the entity type.

## Lifecycle States

Team status:

- `confirmed`
- `placeholder`
- `eliminated`

Squad status:

- `unknown`
- `provisional`
- `final`
- `updated`

Player status:

- `active`
- `replaced`
- `withdrawn`
- `injured`

Match lifecycle status:

- `scheduled`
- `live`
- `finished`
- `corrected`
- `postponed`
- `cancelled`
- `abandoned`
- `void`

For backward compatibility with existing prediction and scoring logic, match documents also retain the provider-normalized uppercase `status` field. New consumers should use `lifecycleStatus` for the canonical central tournament lifecycle.

Bracket node status:

- `unresolved`
- `scheduled`
- `live`
- `finished`

## Source And Freshness Metadata

Reference data should carry:

- `provider`: source identity, source external ID, source name, source URL if available, fetched time, and provider-updated time if available.
- `freshness`: provider ID, fetched time, provider-updated time if available, and stale-after time.
- `updatedAt`: the time MatchPulse last wrote the normalized document.

AI insights, team pages, simulator outputs, and stale-data warnings should rely on this metadata rather than guessing freshness from private group data.

## Data Sources To Provide

For the MVP without paid provider integration, provide licensed or public-domain structured data as JSON/CSV that can be normalized into the central paths above:

- Competition: name, country/scope if applicable, source metadata.
- Season: label, start/end dates, tournament format metadata.
- Teams: official display name, short name, ISO country code, group assignment, lifecycle status.
- Tournament groups: group code/name, ordered team IDs.
- Matches: kickoff UTC, lock UTC, stage, group code if group-stage, home/away team IDs or placeholders, venue text if licensed, lifecycle status, score fields.
- Squads and players: team ID, player display name, position, shirt number, lifecycle status, squad status and publish/update times.
- Bracket nodes: stage, sort order, participant sources, linked match ID when scheduled, winner/loser target nodes.

Do not provide official FIFA marks, unlicensed crests, player photos, or copyrighted assets unless rights are confirmed. Plain text names, IDs, lifecycle states, fixtures, and source/freshness metadata are enough for this sprint.

## Client Access Rules

Published central reference data is public-readable through Firestore Security Rules. Direct client writes are denied for all central reference collections. Server routes, Cloud Run jobs, ingestion jobs, and seed scripts write through Firebase Admin SDK and are not constrained by client rules.

This keeps the central tournament results layer canonical while allowing private groups to safely read shared fixtures and results.
