# Database and RLS Design

## Database principles

- Use Supabase Postgres as the system of record.
- Enable Row Level Security on all private or mutable tables.
- Public reference tables can be readable by anonymous users.
- Service role writes provider data, scoring snapshots, AI outputs, and simulations.
- Store provider IDs and timestamps for traceability.
- Store model versions and input hashes for reproducibility.

## Core entities

| Entity | Purpose |
|---|---|
| `profiles` | App-level user profile linked to Supabase Auth user |
| `competitions` | FIFA World Cup, leagues, Champions League later |
| `seasons` | Competition season or tournament instance |
| `teams` | Country or club teams |
| `matches` | Fixtures, status, scores, lock times |
| `groups` | Private prediction pools |
| `group_members` | Membership and roles |
| `group_invites` | Invite codes and revocation |
| `predictions` | User predictions |
| `prediction_revisions` | Audit history for prediction changes |
| `leaderboard_snapshots` | Versioned standings |
| `team_metric_snapshots` | Rankings, form, ratings |
| `match_insights` | AI insight outputs |
| `simulation_runs` | Model executions and result metadata |
| `simulation_team_probs` | Per-team stage probabilities |
| `ad_slots` | Ad placement configuration |

## Enum direction

Use database enums or constrained text for:

- `competition_kind`: `WORLD_CUP`, `LEAGUE`, `CHAMPIONS_LEAGUE`
- `match_stage`: `GROUP`, `ROUND_OF_32`, `ROUND_OF_16`, `QUARTER_FINAL`, `SEMI_FINAL`, `THIRD_PLACE`, `FINAL`
- `match_status`: `SCHEDULED`, `LIVE`, `FINISHED`, `POSTPONED`, `CANCELLED`, `ABANDONED`, `VOID`
- `prediction_mode`: `EXACT_SCORE`, `THREE_WAY`
- `group_role`: `OWNER`, `ADMIN`, `MEMBER`
- `membership_status`: `ACTIVE`, `LEFT`, `REMOVED`
- `insight_kind`: `MATCH_PREVIEW`, `TEAM_SUMMARY`, `SIM_EXPLANATION`
- `simulation_model`: `ELO_POISSON_V1`, `DIXON_COLES_V2`, `HYBRID_V3`

## RLS policy matrix

| Table group | Read rule | Write rule |
|---|---|---|
| Public reference data | Anyone | Service role only |
| Private groups | Active members only | Owner/admin depending on operation |
| Predictions | Active members can read group predictions according to group visibility settings | User can write only own predictions before lock |
| Leaderboards | Active members only | Service role only |
| AI outputs | Public for public matches, member-only for private contexts | Service role only |
| Simulation results | Public when public flag is true; requester otherwise | Service role only |
| Profiles | Self and minimal group-context fields | Self only |

## Prediction write rule

A prediction write must verify:

1. The user is authenticated.
2. The user has active membership in the group.
3. The match belongs to the group competition.
4. Current UTC time is earlier than `match.lock_at`.
5. Booster rules are respected.
6. The prediction shape matches the group `prediction_mode`.

## Suggested migration order

1. Auth profile bootstrap
2. Competitions, seasons, teams, matches
3. Groups, members, invites
4. Predictions and prediction revisions
5. Scoring snapshots
6. Team metric snapshots
7. Match insights
8. Simulation runs and probabilities
9. Ad slots and consent-related tables

## Minimal indexes

Create indexes for:

- `matches(competition_id, kickoff_at)`
- `matches(season_id, stage, group_code)`
- `group_members(group_id, profile_id)` unique
- `predictions(group_id, match_id, profile_id)` unique
- `leaderboard_snapshots(group_id, snapshot_at)`
- `team_metric_snapshots(team_id, metric_date, source)` unique
- `match_insights(match_id, kind, generated_at)`
- `simulation_runs(competition_id, created_at)`
- `simulation_team_probs(simulation_run_id, team_id)` unique
