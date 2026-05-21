# Firestore Data Model

Cloud Firestore is the primary application database for MatchPulse MVP. The model is designed around access patterns, denormalized read models, and security boundaries rather than relational normalization.

This document replaces the earlier SQL/RLS database model.

## Data Modeling Principles

- Design documents around the reads needed by dashboard, group pages, prediction entry, team pages, insights, simulator, and leaderboards.
- Denormalize small, stable display fields to avoid excessive fan-out reads.
- Keep private group data under group-scoped documents and subcollections.
- Keep public reference data in top-level collections that can be cached and read by anyone.
- Use server-only writes for provider ingestion, scoring, AI insights, simulations, and global leaderboard snapshots.
- Store provider IDs and freshness timestamps for traceability.
- Store model versions and input hashes for reproducibility.
- Use UTC timestamps for all kickoff, lock, generated, expiry, and invalidation fields.

## Collection Overview

| Collection or subcollection | Purpose | Read access | Write access |
|---|---|---|---|
| `users/{userId}` | App profile, preferences, privacy settings | Self, limited public fields through read models | Self for safe fields; server for privileged fields |
| `groups/{groupId}` | Private group settings and summary fields | Active members | Owner/admin through server routes |
| `groups/{groupId}/members/{userId}` | Membership role and status | Active members | Server routes only |
| `groups/{groupId}/invites/{inviteId}` | Invite tokens, expiry, revocation | Server-mediated | Owner/admin through server routes |
| `groups/{groupId}/predictions/{predictionId}` | User predictions for group matches | Members according to visibility settings | User-owned writes through server routes |
| `groups/{groupId}/predictionRevisions/{revisionId}` | Prediction audit history | Owner/admin or user-scoped views | Server routes only |
| `groups/{groupId}/leaderboardSnapshots/{snapshotId}` | Versioned group standings | Active members | Scoring jobs only |
| `competitions/{competitionId}` | FIFA World Cup and future competitions | Public | Server jobs/admin only |
| `seasons/{seasonId}` | Competition season or tournament instance | Public | Server jobs/admin only |
| `teams/{teamId}` | Country or club teams | Public | Server jobs/admin only |
| `matches/{matchId}` | Fixtures, status, scores, lock times | Public for World Cup fixtures | Server jobs/admin only |
| `teamMetricSnapshots/{snapshotId}` | Rankings, form, ratings, freshness | Public | Server jobs only |
| `matchInsights/{matchId}` | AI insight outputs and metadata | Public for public matches; restricted for private contexts | Server jobs/routes only |
| `simulationRuns/{simulationId}` | Public and custom simulation metadata/results | Public if public, requester if private | Server jobs/routes only |
| `globalLeaderboardSnapshots/{snapshotId}` | International all-user leaderboard snapshots | Public filtered read model | Scoring jobs only |
| `newsItems/{newsItemId}` | Licensed/compliant news metadata and snippets | Public or preference-filtered public | Server jobs only |
| `newsSources/{sourceId}` | News source metadata and attribution | Public | Server jobs/admin only |
| `adSlots/{slotId}` | Ad placement configuration | Public | Server/admin only |

## Key Document Shapes

### `users/{userId}`

Stores private profile and preference state.

Fields:

- `displayName`
- `photoUrl`
- `locale`
- `countryCode`
- `favoriteTeamIds`
- `followedTeamIds`
- `newsLanguage`
- `hiddenNewsSourceIds`
- `globalLeaderboardOptIn`
- `globalLeaderboardDisplayName`
- `globalLeaderboardCountryCode`
- `consent`
- `createdAt`
- `updatedAt`

Do not expose email through public leaderboard or group read models.

### `groups/{groupId}`

Stores group settings and denormalized summary fields.

Fields:

- `name`
- `slug`
- `competitionId`
- `seasonId`
- `ownerId`
- `scoringPreset`
- `predictionMode`
- `allowBooster`
- `predictionVisibility`
- `lockPolicy`
- `memberCount`
- `latestLeaderboardSnapshotId`
- `createdAt`
- `updatedAt`

### `groups/{groupId}/members/{userId}`

Fields:

- `userId`
- `displayName`
- `role`: `OWNER`, `ADMIN`, or `MEMBER`
- `status`: `ACTIVE`, `LEFT`, or `REMOVED`
- `joinedAt`
- `updatedAt`

Display name is denormalized so group member lists and leaderboard snapshots do not need to read every user profile.

### `groups/{groupId}/predictions/{predictionId}`

Recommended ID pattern: `{matchId}_{userId}` for idempotent upserts.

Fields:

- `groupId`
- `matchId`
- `userId`
- `homeGoals`
- `awayGoals`
- `predictionMode`
- `booster`
- `savedAt`
- `updatedAt`
- `lockAt`
- `status`

Keep `lockAt` copied from the match at save time for auditability, but validate against the canonical match document in server routes.

### `groups/{groupId}/predictionRevisions/{revisionId}`

Fields:

- `predictionId`
- `matchId`
- `userId`
- `previousValue`
- `nextValue`
- `changedAt`
- `changedBy`
- `reason`

### `groups/{groupId}/leaderboardSnapshots/{snapshotId}`

Fields:

- `snapshotAt`
- `matchId`
- `scoringPreset`
- `entries`
- `generatedByJobId`

Each entry may include:

- `userId`
- `displayName`
- `rank`
- `previousRank`
- `points`
- `exactCount`
- `goalDifferenceCount`
- `tendencyCount`

### `matches/{matchId}`

Fields:

- `competitionId`
- `seasonId`
- `homeTeamId`
- `awayTeamId`
- `kickoffAt`
- `lockAt`
- `status`
- `stage`
- `groupCode`
- `venue`
- `city`
- `homeScore90`
- `awayScore90`
- `homeScoreFinal`
- `awayScoreFinal`
- `provider`
- `providerId`
- `providerUpdatedAt`
- `updatedAt`

### `matchInsights/{matchId}`

Fields:

- `matchId`
- `kind`
- `modelVersion`
- `promptVersion`
- `inputHash`
- `generatedAt`
- `expiresAt`
- `invalidatedAt`
- `providerFreshness`
- `confidence`
- `prediction`
- `summary`
- `evidence`
- `warnings`
- `citationTokens`

### `simulationRuns/{simulationId}`

Fields:

- `competitionId`
- `seasonId`
- `visibility`: `PUBLIC` or `PRIVATE`
- `requesterId`
- `modelVersion`
- `inputHash`
- `assumptions`
- `runCount`
- `generatedAt`
- `expiresAt`
- `teams`

For public simulations, store a compact read model suitable for simulator and team pages.

## Denormalization Rules

- Denormalize display names into member and leaderboard documents.
- Denormalize team names, group codes, and stage labels into dashboard/match read models when needed.
- Denormalize latest snapshot IDs into parent group documents.
- Denormalize provider freshness into match, team metric, insight, and simulator documents.
- Never denormalize private prediction details into public documents.
- Treat denormalized fields as derived data owned by server jobs or server routes.

## Embedded vs Referenced Data

Embed when:

- The data is small.
- The data is read together.
- The data is a point-in-time snapshot.
- Historical accuracy matters, such as leaderboard entries or prediction revisions.

Reference when:

- The data changes frequently.
- The document could grow without bound.
- Access control differs.
- The data is shared across many surfaces, such as matches, teams, or users.

## Public vs Private Documents

Public documents:

- `competitions`
- `seasons`
- `teams`
- `matches`
- `teamMetricSnapshots`
- public `matchInsights`
- public `simulationRuns`
- `newsItems`
- `newsSources`
- `adSlots`

Private documents:

- `users/{userId}` private fields
- `groups/{groupId}`
- group members
- group predictions
- prediction revisions
- group leaderboard snapshots
- private/custom simulation runs

Public read models must not contain private group names, private prediction values, emails, or hidden profile fields.

## Query Patterns and Required Indexes

Do not create `firestore.indexes.json` during documentation-only work. These are intended index requirements for later implementation.

| Query | Collection scope | Likely index |
|---|---|---|
| Upcoming matches by season | `matches` | `seasonId ASC, kickoffAt ASC` |
| Matches by stage/group | `matches` | `seasonId ASC, stage ASC, groupCode ASC, kickoffAt ASC` |
| Active group members | `groups/{groupId}/members` | `status ASC, role ASC` |
| User predictions in a group | `groups/{groupId}/predictions` | `userId ASC, matchId ASC` |
| Match predictions in a group | `groups/{groupId}/predictions` | `matchId ASC, userId ASC` |
| Group leaderboard snapshots | `groups/{groupId}/leaderboardSnapshots` | `snapshotAt DESC` |
| Team metric snapshots | `teamMetricSnapshots` | `teamId ASC, metricDate DESC, source ASC` |
| News by team and language | `newsItems` | `teamIds ARRAY_CONTAINS, language ASC, publishedAt DESC` |
| Public simulation by competition | `simulationRuns` | `visibility ASC, competitionId ASC, generatedAt DESC` |
| User private simulations | `simulationRuns` | `requesterId ASC, generatedAt DESC` |
| Global leaderboard latest | `globalLeaderboardSnapshots` | `scope ASC, snapshotAt DESC` |

## Server-Only Writes

The following writes must use Cloud Run route handlers or Cloud Run Jobs with Firebase Admin SDK:

- Provider ingestion.
- Match score updates.
- Group creation and admin settings changes.
- Invite creation, revocation, and join processing.
- Prediction saves and revision creation.
- Scoring and leaderboard snapshot generation.
- Global leaderboard generation.
- AI insight generation and invalidation.
- Simulation execution.
- News ingestion.

## Open Data Model Decisions

- Final ID strategy for groups, matches, teams, and simulation runs.
- Whether user display names are globally unique.
- Whether global leaderboard opt-in is default-off or default-on.
- Exact prediction visibility read model after lock.
- News source licensing and snippet rules.
- Whether custom simulations store full team probabilities or a compact result summary.
