# Product Requirements Document

## Product summary

MatchPulse is a private, friendly football prediction app for FIFA World Cup 2026. It helps friends, families, and office groups create private pools, submit match predictions, compare leaderboards, understand teams, and use explainable AI match previews and a transparent tournament simulator.

## Strategic position

The market already handles prediction pools, invites, leaderboards, chat, bonus questions, and branded experiences well. The product gap is stronger match intelligence, useful team pages, and understandable tournament probabilities.

## MVP scope

The MVP has five first-class surfaces:

1. **Private groups**
2. **Predictions**
3. **Leaderboards**
4. **AI match insights**
5. **Team pages and tournament simulator**

Do not build social feeds, chat, complex notifications, betting, public wagering, paid-entry pools, or advanced B2B white-label features in MVP.

## Target users

| Segment | Need | MVP relevance |
|---|---|---|
| Friends and family | Simple private World Cup pool | Highest viral potential |
| Office and club groups | Lightweight competition setup | Later premium path |
| Casual fans | Help choosing picks and understanding teams | Strong fit for AI insights |
| Analytic fans | Transparent probabilities and assumptions | Early evangelist segment |

## Core user stories

### Private groups

- As a user, I can create a private World Cup group quickly.
- As an admin, I can invite members by code or link.
- As an admin, I can choose scoring preset and lock policy before the tournament starts.
- As a member, I can join a group from an invite link.
- As a non-member, I cannot view private group data.

### Predictions

- As a member, I can submit exact-score predictions in bulk.
- As a member, I can update predictions until lock time.
- As a member, I can see which matches remain unpicked.
- As a member, I can optionally mark one prediction with a booster if the group allows it.

### Leaderboards

- As a member, I can see current group ranking.
- As a member, I can see points, exact hits, tendency hits, and rank.
- As an admin, I can trust that leaderboards are recalculated after official final scores.

### AI match insights

- As a member, I can read a short pre-match explanation.
- As a member, I can see why a team is favored.
- As a member, I can see warnings when data is stale or incomplete.
- As a member, I should never see invented claims.

### Team pages

- As a fan, I can quickly understand a team’s schedule, group, form, ranking, and context.
- As a fan, I can see when the data was last updated.
- As a fan, I can still use the page when advanced data is missing.

### Tournament simulator

- As a fan, I can see each team’s probability to reach each tournament stage.
- As a fan, I can understand the assumptions behind the simulation.
- As an authenticated user, I can start a custom simulation from current state.

## MVP scoring presets

| Preset | Logic | Default use |
|---|---|---|
| Hybrid 3-2-1 | 3 exact score, 2 goal difference, 1 tendency | Default |
| Exact-only | 3 exact score, 0 otherwise | Small groups |
| 1X2 only | 1 correct outcome | Casual groups |

## Knockout scoring rule

For MVP:

- User predictions are scored on the 90-minute result plus stoppage time.
- Tournament simulation uses extra time and penalties for bracket advancement.

## Main screens

| Screen | Purpose |
|---|---|
| Landing | Explain app, start auth, create or join group |
| Dashboard | Active groups, next locks, unfinished picks |
| Group overview | Group matches, leaderboard, insights, settings |
| Prediction entry | Fast bulk prediction flow |
| Match detail | Score, facts, team comparison, AI card |
| Team page | Team context, schedule, form, rankings |
| Simulator | Stage probabilities and assumptions |
| Profile | Display name, locale, consent and preferences |

## Acceptance criteria

- A new group can be created in under 30 seconds.
- Invite links work on mobile and desktop.
- Predictions cannot be saved after lock time.
- Non-members cannot access private group data.
- Leaderboards update after final match results.
- AI insight output always validates against schema.
- Stale or incomplete data is visible to users.
- Simulator probabilities are versioned and reproducible by input hash.
