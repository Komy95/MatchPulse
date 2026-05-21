# API Specifications

## API principles

- Use REST-first route handlers for MVP.
- Validate all request bodies.
- Return stable JSON contracts.
- Keep route handlers thin and call domain services in `lib/*`.
- Enforce member access for private group resources.
- Use UTC for all lock-time checks.

## Error shape

```json
{
  "error": {
    "code": "PREDICTION_LOCKED",
    "message": "Prediction cannot be changed after lock time.",
    "details": {}
  }
}
```

## Core endpoints

| Endpoint | Method | Auth | Purpose |
|---|---|---|---|
| `/api/v1/groups` | POST | Authenticated | Create group |
| `/api/v1/groups/{groupId}` | GET | Member | Group detail |
| `/api/v1/groups/{groupId}` | PATCH | Owner/Admin | Update settings |
| `/api/v1/groups/{groupId}/join` | POST | Authenticated | Join by invite |
| `/api/v1/groups/{groupId}/matches` | GET | Member | Group-scoped matches |
| `/api/v1/groups/{groupId}/predictions` | POST | Member | Bulk prediction upsert |
| `/api/v1/groups/{groupId}/leaderboard` | GET | Member | Leaderboard |
| `/api/v1/matches/{matchId}` | GET | Public or member | Match detail |
| `/api/v1/matches/{matchId}/insight` | GET | Public or member | AI insight |
| `/api/v1/teams/{teamId}` | GET | Public | Team page data |
| `/api/v1/simulations` | POST | Authenticated | Start custom simulation |
| `/api/v1/simulations/{simulationId}` | GET | Requester or public | Simulation result |
| `/api/v1/simulations/public/world-cup-2026` | GET | Public | Cached public simulation |

## Create group

```http
POST /api/v1/groups
```

Request:

```json
{
  "name": "WM 2026 Family Pool",
  "competitionCode": "FIFA_WC_2026",
  "predictionMode": "EXACT_SCORE",
  "scoringPreset": "HYBRID_321",
  "allowBooster": true,
  "showPredictionsAfterLock": false
}
```

Response:

```json
{
  "id": "grp_01JX...",
  "slug": "wm-2026-family-pool",
  "inviteCode": "8YQ2K9P4",
  "ownerRole": "OWNER"
}
```

Validation:

- `name` is required.
- `competitionCode` must exist.
- `scoringPreset` must be supported.
- Authenticated user becomes owner.

## Join group

```http
POST /api/v1/groups/{groupId}/join
```

Request:

```json
{
  "inviteCode": "8YQ2K9P4"
}
```

Response:

```json
{
  "groupId": "grp_01JX...",
  "membershipStatus": "ACTIVE",
  "role": "MEMBER"
}
```

Edge cases:

- Duplicate joins return current membership.
- Revoked or expired invites are rejected.
- Removed users may need admin approval before rejoin.

## Bulk upsert predictions

```http
POST /api/v1/groups/{groupId}/predictions
```

Request:

```json
{
  "predictions": [
    {
      "matchId": "mat_01",
      "homeGoals": 2,
      "awayGoals": 1,
      "confidence": "high",
      "booster": true
    }
  ]
}
```

Response:

```json
{
  "saved": 1,
  "locked": 0,
  "ignored": []
}
```

Rules:

- User must be an active member.
- Match must belong to the group competition.
- Reject predictions where `now >= lockAt`.
- Store revision history.
- Save operation must be idempotent.

## Leaderboard

```http
GET /api/v1/groups/{groupId}/leaderboard
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

## Match insight

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

## Public simulation

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
