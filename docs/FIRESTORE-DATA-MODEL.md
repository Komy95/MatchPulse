# Firestore Data Model

Cloud Firestore is the primary application database for MatchPulse MVP. The model is designed around access patterns, denormalized read models, and security boundaries rather than relational normalization.

This document is the canonical Firestore data model for the MVP.

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
| `groups/{groupId}` | Reusable private social container and summary fields | Active members | Server routes only |
| `groups/{groupId}/members/{userId}` | Membership role and status | Active members | Server routes only |
| `groups/{groupId}/seasons/{groupSeasonId}` | Tournament/season-specific group instance | Active members | Server routes only |
| `groups/{groupId}/seasons/{groupSeasonId}/invites/{inviteId}` | Season-scoped invite tokens, expiry, revocation | Server-mediated | Owner/admin through server routes |
| `inviteCodes/{code}` | Server-only invite code uniqueness and lookup registry | None | Server routes only |
| `groups/{groupId}/seasons/{groupSeasonId}/predictions/{predictionId}` | User predictions for group-season matches | Owning user while visibility rules are private | Server routes only |
| `groups/{groupId}/seasons/{groupSeasonId}/predictionRevisions/{revisionId}` | Prediction audit history | Server-mediated only for MVP | Server routes only |
| `groups/{groupId}/seasons/{groupSeasonId}/leaderboardSnapshots/{snapshotId}` | Future versioned group-season standings | Active members | Scoring jobs only |
| `competitions/{competitionId}` | FIFA World Cup and future competition metadata | Public | Server jobs/admin only |
| `competitions/{competitionId}/seasons/{seasonId}` | Provider-normalized competition season or tournament instance | Public | Server jobs/admin only |
| `competitions/{competitionId}/seasons/{seasonId}/teams/{teamId}` | Season participants | Public | Server jobs/admin only |
| `competitions/{competitionId}/seasons/{seasonId}/matches/{matchId}` | Season fixtures, status, scores, and lock times | Public for World Cup fixtures | Server jobs/admin only |
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

Stores the reusable social container. Members belong to the group and can be reused across future tournaments or league seasons.

Fields:

- `name`
- `slug`
- `ownerId`
- `memberCount`
- `activeGroupSeasonId`
- `createdAt`
- `updatedAt`
- `archivedAt`

Do not store scoring rules, prediction rules, match picks, or leaderboards directly on the group. Those belong to a group season.

### `groups/{groupId}/members/{userId}`

Fields:

- `userId`
- `displayName`
- `photoUrl`
- `role`: `OWNER`, `ADMIN`, or `MEMBER`
- `status`: `ACTIVE`, `LEFT`, or `REMOVED`
- `joinedAt`
- `updatedAt`

Display name is denormalized so group member lists and leaderboard snapshots do not need to read every user profile.

### `groups/{groupId}/seasons/{groupSeasonId}`

Stores the competition/tournament-specific instance for a reusable group.

Sprint 3 creates one default group season for every group:

- `competitionId`: `fifa-world-cup`
- `seasonId`: `world-cup-2026`
- `label`: `FIFA World Cup 2026`
- `status`: `UPCOMING`
- `scoringPreset`: `HYBRID_321`
- `predictionMode`: `EXACT_SCORE`
- `allowBooster`: `true`
- `predictionVisibility`: `AFTER_LOCK`

Fields:

- `groupId`
- `competitionId`
- `seasonId`
- `label`
- `status`: `UPCOMING`, `ACTIVE`, `COMPLETED`, or `ARCHIVED`
- `scoringPreset`
- `predictionMode`
- `allowBooster`
- `predictionVisibility`
- `createdAt`
- `updatedAt`
- `startsAt`
- `endsAt`

### `groups/{groupId}/seasons/{groupSeasonId}/invites/{inviteId}`

Stores season-scoped invite metadata. Invite documents are never client-readable in MVP; validation is server-mediated.

Fields:

- `code`
- `groupId`
- `groupSeasonId`
- `createdBy`
- `createdAt`
- `expiresAt`
- `revokedAt`
- `usageCount`

### `inviteCodes/{code}`

Server-only registry used to make short invite codes unique and to resolve a code to the season-scoped invite document without ambiguous collection-group reads.

Fields:

- `code`
- `groupId`
- `groupSeasonId`
- `inviteId`
- `createdAt`
- `expiresAt`
- `revokedAt`

### `groups/{groupId}/seasons/{groupSeasonId}/predictions/{predictionId}`

Recommended ID pattern: `{matchId}_{userId}` for idempotent upserts.

Fields:

- `groupId`
- `groupSeasonId`
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

Prediction documents are written only by `POST /api/v1/groups/{groupId}/seasons/{groupSeasonId}/predictions`. The server validates active membership, group-season scope, match existence, prediction mode, booster settings, score bounds, and `now < lockAt` using trusted server time and the canonical match document.

### `groups/{groupId}/seasons/{groupSeasonId}/predictionRevisions/{revisionId}`

Fields:

- `predictionId`
- `matchId`
- `userId`
- `previousValue`
- `nextValue`
- `changedAt`
- `changedBy`
- `reason`

Revisions are created only when a user changes an existing prediction. Repeating the same save is idempotent and does not create a revision.

### Future Scoring Result Fields

Sprint 6.2 implements the pure scoring domain only. Leaderboard snapshots remain deferred to Sprint 6.3.

When scoring results are persisted later, each scored prediction should preserve enough metadata for auditable leaderboard aggregation:

- `points`
- `resultType`: `EXACT_SCORE`, `GOAL_DIFFERENCE`, `TENDENCY`, or `MISS`
- `scoringPreset`: `HYBRID_321`
- `predictedOutcome`
- `actualOutcome`
- `predictedGoalDifference`
- `actualGoalDifference`
- `exactScore`
- `correctGoalDifference`
- `correctTendency`
- `boosterApplied`

MVP prediction scoring uses the 90-minute result plus stoppage time only. Extra time and penalties are not used for user prediction scoring. Booster multiplication is not applied in Sprint 6.2.

### `groups/{groupId}/seasons/{groupSeasonId}/leaderboardSnapshots/{snapshotId}`

Fields:

- `snapshotAt`
- `matchId`
- `groupSeasonId`
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

### `competitions/{competitionId}`

Stores public competition metadata normalized from the sports-data provider abstraction.

Fields:

- `name`
- `countryCode`
- `provider`
- `freshness`
- `updatedAt`

### `competitions/{competitionId}/seasons/{seasonId}`

Stores the provider-normalized season or tournament instance. This is the canonical public season path for sports data ingestion. The older top-level `seasons/{seasonId}`, `teams/{teamId}`, and `matches/{matchId}` shapes are not used by the Sprint 4 ingestion path.

Fields:

- `competitionId`
- `label`
- `startsAt`
- `endsAt`
- `provider`
- `freshness`
- `lastIngestedAt`
- `updatedAt`
- `teamCount`
- `matchCount`
- `finalMatchCount`

### `competitions/{competitionId}/seasons/{seasonId}/teams/{teamId}`

Stores provider-normalized season participants. Team IDs are deterministic and provider-scoped so repeated ingestion upserts the same document.

Fields:

- `competitionId`
- `seasonId`
- `name`
- `shortName`
- `countryCode`
- `groupCode`
- `provider`
- `freshness`
- `updatedAt`

### `competitions/{competitionId}/seasons/{seasonId}/matches/{matchId}`

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
- `score`
- `provider`
- `freshness`
- `updatedAt`

Match IDs are deterministic and provider-scoped. `kickoffAt`, `lockAt`, provider freshness, and all provider update timestamps must be UTC ISO timestamps. Future prediction locking and scoring jobs must read this canonical match document before accepting prediction saves or scoring final results.

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
- `competitions/{competitionId}/seasons`
- `competitions/{competitionId}/seasons/{seasonId}/teams`
- `competitions/{competitionId}/seasons/{seasonId}/matches`
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
- group seasons
- season-scoped invites
- group-season predictions, limited to owning user until visibility rules are implemented
- group-season prediction revisions, server-mediated only for MVP
- group-season leaderboard snapshots
- private/custom simulation runs

Public read models must not contain private group names, private prediction values, emails, or hidden profile fields.

## Query Patterns and Required Indexes

Do not create `firestore.indexes.json` during documentation-only work. These are intended index requirements for later implementation.

| Query | Collection scope | Likely index |
|---|---|---|
| Upcoming matches by season | `competitions/{competitionId}/seasons/{seasonId}/matches` | `kickoffAt ASC` |
| Matches by stage/group | `competitions/{competitionId}/seasons/{seasonId}/matches` | `stage ASC, groupCode ASC, kickoffAt ASC` |
| Active group members | `groups/{groupId}/members` | `status ASC, role ASC` |
| Group seasons | `groups/{groupId}/seasons` | `createdAt ASC` |
| Invite code lookup | `inviteCodes` | document ID equals normalized code |
| User predictions in a group season | `groups/{groupId}/seasons/{groupSeasonId}/predictions` | `userId ASC, matchId ASC` |
| Match predictions in a group season | `groups/{groupId}/seasons/{groupSeasonId}/predictions` | `matchId ASC, userId ASC` |
| Group-season leaderboard snapshots | `groups/{groupId}/seasons/{groupSeasonId}/leaderboardSnapshots` | `snapshotAt DESC` |
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
