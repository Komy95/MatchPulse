# API Specifications

## API Principles

- Use REST-first route handlers for MVP.
- Route handlers run in the Next.js server runtime on Cloud Run.
- Route handlers use Firebase Auth for user identity and Firebase Admin SDK for privileged Firestore access.
- Validate all request bodies.
- Return stable JSON contracts.
- Keep route handlers thin and call domain services.
- Enforce member access for private group resources.
- Use UTC for all lock-time checks.
- Client-side code must not bypass server validation for private mutable operations.
- Firestore Security Rules are required, but they do not replace Cloud Run business validation.

## Error Shape

```json
{
  "error": {
    "code": "PREDICTION_LOCKED",
    "message": "Prediction cannot be changed after lock time.",
    "details": {}
  }
}
```

## Core Endpoints

Implemented through Sprint 5:

| Endpoint | Method | Auth | Purpose |
|---|---|---|---|
| `/api/auth/session` | POST | Firebase ID token | Create server-managed Firebase session cookie |
| `/api/auth/logout` | POST | Session | Clear server-managed session cookie |
| `/api/v1/groups` | GET | Authenticated | List groups where the user is an active member |
| `/api/v1/groups` | POST | Authenticated | Create reusable group, owner membership, first World Cup 2026 group season, and initial invite |
| `/api/v1/groups/{groupId}` | GET | Member | Group detail |
| `/api/v1/groups/{groupId}/seasons` | GET | Member | List seasons for a reusable group |
| `/api/v1/groups/{groupId}/seasons/{groupSeasonId}/invites` | POST | Owner/Admin | Create a season-scoped invite |
| `/api/v1/groups/join` | POST | Authenticated | Join by invite code |
| `/api/v1/groups/{groupId}/seasons/{groupSeasonId}/matches` | GET | Member | Group-season scoped matches with current user's prediction |
| `/api/v1/groups/{groupId}/seasons/{groupSeasonId}/predictions` | POST | Member | Bulk prediction upsert |

Sprint 4 data abstraction does not add public HTTP ingestion endpoints. Provider ingestion is a server-side module intended for Cloud Run Jobs or trusted admin triggers. Sports-data writes go through Firebase Admin SDK and target:

```text
competitions/{competitionId}
competitions/{competitionId}/seasons/{seasonId}
competitions/{competitionId}/seasons/{seasonId}/teams/{teamId}
competitions/{competitionId}/seasons/{seasonId}/matches/{matchId}
```

Do not expose provider API keys or ingestion mutation routes to browser clients.

Sprint 6.2 adds pure scoring-domain code only. It does not add scoring, leaderboard, or job API routes.

Future endpoints must keep group-season scoping:

| Endpoint | Method | Auth | Purpose |
|---|---|---|---|
| `/api/v1/groups/{groupId}/seasons/{groupSeasonId}/leaderboard` | GET | Member | Group-season leaderboard |
| `/api/v1/leaderboard/global` | GET | Public/Auth optional | Future global leaderboard read model |
| `/api/v1/matches/{matchId}` | GET | Public or member | Future match detail |
| `/api/v1/matches/{matchId}/insight` | GET | Public or member | Future AI insight |
| `/api/v1/news` | GET | Public/Auth optional | Future personalized or generic team news |
| `/api/v1/profile/preferences` | GET | Authenticated | Future user preferences API |
| `/api/v1/profile/preferences` | PATCH | Authenticated | Future user preferences API |
| `/api/v1/teams/{teamId}` | GET | Public | Future team page data |
| `/api/v1/simulations` | POST | Authenticated | Future custom simulation |
| `/api/v1/simulations/{simulationId}` | GET | Requester or public | Future simulation result |
| `/api/v1/simulations/public/world-cup-2026` | GET | Public | Future cached public simulation |

## Server Validation Requirements

Every private mutable endpoint must verify:

1. Firebase ID token is valid.
2. The authenticated UID is mapped to the intended user.
3. The user has the required group membership or role.
4. Request body validates against the endpoint schema.
5. Firestore writes are scoped to allowed documents.
6. Domain constraints are enforced with trusted server time.

## Create Group

```http
POST /api/v1/groups
```

Request:

```json
{
  "name": "WM 2026 Family Pool"
}
```

Response:

```json
{
  "group": {
    "id": "grp_01JX...",
    "slug": "wm-2026-family-pool",
    "activeGroupSeasonId": "seasonDocId",
    "inviteCode": "8YQ2K9P4",
    "inviteUrl": "http://localhost:3000/join?code=8YQ2K9P4",
    "ownerRole": "OWNER"
  }
}
```

Validation:

- `name` is required.
- Initial group season is created with `competitionId=fifa-world-cup` and `seasonId=world-cup-2026`.
- Authenticated user becomes owner.
- Group, owner membership, group season, invite, and invite-code registry are written atomically where possible.

## Join Group

```http
POST /api/v1/groups/join
```

Request:

```json
{
  "code": "8YQ2K9P4"
}
```

Response:

```json
{
  "membership": {
    "groupId": "grp_01JX...",
    "groupSeasonId": "seasonDocId",
    "membershipStatus": "ACTIVE",
    "role": "MEMBER"
  }
}
```

Edge cases:

- Duplicate joins return current membership.
- A `LEFT` member is reactivated and increments `memberCount` because they were not active.
- A `REMOVED` member is denied rejoin through invite.
- Revoked invites return `INVITE_REVOKED`.
- Expired invites return `INVITE_EXPIRED`.
- Invalid invites return `INVITE_INVALID`.
- Invalid invite responses must not leak private group or season data.

## Create Season Invite

```http
POST /api/v1/groups/{groupId}/seasons/{groupSeasonId}/invites
```

Request:

```json
{
  "refresh": true
}
```

Response:

```json
{
  "invite": {
    "id": "inviteDocId",
    "code": "8YQ2K9P4",
    "inviteUrl": "http://localhost:3000/join?code=8YQ2K9P4",
    "expiresAt": "2026-06-21T12:00:00.000Z",
    "usageCount": 0
  }
}
```

Rules:

- User must be an active group member with `OWNER` or `ADMIN` role.
- Invite is scoped to the group season.
- Invite code is reserved in `inviteCodes/{code}` to avoid collisions.
- Normal members cannot create invites.

## Group Season Matches

```http
GET /api/v1/groups/{groupId}/seasons/{groupSeasonId}/matches
```

Rules:

- User must be an active group member.
- Group season must belong to the group.
- Matches are loaded from the canonical public path `competitions/{competitionId}/seasons/{seasonId}/matches`.
- Response includes only the current user's prediction, if present.
- Other users' predictions are not exposed in Sprint 5.

## Bulk Upsert Predictions

```http
POST /api/v1/groups/{groupId}/seasons/{groupSeasonId}/predictions
```

Request:

```json
{
  "predictions": [
    {
      "matchId": "mat_01",
      "homeGoals": 2,
      "awayGoals": 1,
      "booster": true
    }
  ]
}
```

Response:

```json
{
  "saved": 1,
  "unchanged": 0,
  "revisionsCreated": 0
}
```

Rules:

- User must be an active group member.
- Match must exist under the group season's canonical competition and season.
- Reject predictions where `now >= lockAt`.
- Server uses trusted server time and does not accept client-supplied `lockAt` or `userId`.
- Scores must be integers from 0 to 20.
- Booster can be used only when the group season allows it.
- Store revision history.
- Save operation must be idempotent.
- Use Firestore transactions or batched writes where needed to keep predictions and revisions consistent.

## Leaderboard

```http
GET /api/v1/groups/{groupId}/seasons/{groupSeasonId}/leaderboard
```

Response:

```json
{
  "groupId": "grp_01JX...",
  "snapshotAt": "2026-06-15T22:00:00Z",
  "entries": [
    {
      "rank": 1,
      "profileId": "pro_01",
      "displayName": "Tim",
      "points": 18,
      "exactCount": 4,
      "tendencyCount": 6
    }
  ]
}
```

## Global Leaderboard

```http
GET /api/v1/leaderboard/global
```

Rules:

- Uses a public read model generated by scoring jobs.
- Includes only opted-in users.
- Must not include email, private group IDs, private group names, or private prediction details.
- Uses a single global scoring basis independent of private group custom presets unless a future decision changes this.

## Match Insight

```http
GET /api/v1/matches/{matchId}/insight
```

Response:

```json
{
  "match_id": "wc26-m-0001",
  "generated_at": "2026-06-10T12:00:00Z",
  "freshness": {
    "provider_updated_at": "2026-06-10T11:55:00Z",
    "ranking_updated_at": "2026-06-01T00:00:00Z"
  },
  "prediction": {
    "home_win": 0.41,
    "draw": 0.29,
    "away_win": 0.30,
    "recommended_pick": "HOME_OR_DRAW"
  },
  "confidence": "medium",
  "summary": "Spain have the edge because they combine the stronger rating baseline with better recent results, but the draw probability remains material.",
  "evidence": [
    "Home team higher on model rating by 84 Elo-equivalent points",
    "Away team conceded more goals per match in the last 8 internationals"
  ],
  "warnings": [
    "Lineups not final"
  ],
  "citation_tokens": [
    "provider:fixture:12345",
    "provider:ranking:2026-06-01"
  ]
}
```

## Public Simulation

```http
GET /api/v1/simulations/public/world-cup-2026
```

Response:

```json
{
  "simulation_id": "sim_wc26_public_2026_06_10",
  "model_version": "elo_poisson_v1",
  "runs": 100000,
  "generated_at": "2026-06-10T12:15:00Z",
  "assumptions": {
    "host_advantage": true,
    "extra_time_scaling": 0.33,
    "penalty_shootout_rating_weight": 0.15
  },
  "teams": [
    {
      "team_id": "esp",
      "name": "Spain",
      "group": "H",
      "probabilities": {
        "reach_round_of_32": 0.88,
        "reach_round_of_16": 0.62,
        "reach_quarter_final": 0.39,
        "reach_semi_final": 0.22,
        "reach_final": 0.11,
        "win_tournament": 0.06
      }
    }
  ]
}
```
