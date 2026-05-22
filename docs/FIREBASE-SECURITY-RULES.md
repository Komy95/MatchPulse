# Firebase Security Rules

This document describes the intended Firestore Security Rules behavior for MatchPulse. It is conceptual documentation only. Do not create a real `firestore.rules` file during documentation-only work.

## Security Model

Firestore Security Rules protect client reads and safe client writes. They are not the only authorization layer.

Cloud Run route handlers and Cloud Run Jobs must still perform server-side validation for:

- Group creation and admin changes.
- Invite join logic.
- Prediction lock checks.
- Booster rules.
- Prediction mode and scoring preset validation.
- Revision history creation.
- Scoring and leaderboard generation.
- Provider ingestion.
- AI insight refreshes.
- Simulation execution.
- News ingestion.

## Identity Assumptions

- Users authenticate with Firebase Auth.
- The authenticated UID maps to `users/{userId}`.
- Server runtimes use Firebase Admin SDK and bypass Security Rules, so server code must enforce authorization explicitly.
- Custom claims may be used later for admin tooling, but MVP should not depend on broad admin claims for normal group access.

## Intended Rule Behaviors

### User Profiles

Users can read and write their own profile document at `users/{userId}`.

Allowed self-managed fields may include:

- `displayName`
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

Server-only fields:

- `createdAt` if system-generated.
- privileged account status fields.
- moderation flags.
- derived scoring/global leaderboard fields.

Rules should prevent users from writing another user's profile.

### Public Reference Data

Everyone can read public reference documents:

- `competitions/{competitionId}`
- `competitions/{competitionId}/seasons/{seasonId}`
- `competitions/{competitionId}/seasons/{seasonId}/teams/{teamId}`
- `competitions/{competitionId}/seasons/{seasonId}/matches/{matchId}`
- `teamMetricSnapshots/{snapshotId}`
- public `matchInsights/{matchId}`
- public `simulationRuns/{simulationId}`
- `newsItems/{newsItemId}`
- `newsSources/{sourceId}`
- `adSlots/{slotId}`

Clients cannot write public reference data. Writes are server-only.

### Private Groups

Group documents at `groups/{groupId}` are reusable social containers and are readable only by active members.

Membership is checked through:

```text
groups/{groupId}/members/{request.auth.uid}
```

The member document must exist and have `status == "ACTIVE"`.

Group, member, group-season, invite, invite-code registry, prediction, revision, and leaderboard mutations are denied from clients in MVP and must go through protected Cloud Run routes or jobs.

### Group Seasons

Group seasons at `groups/{groupId}/seasons/{groupSeasonId}` hold tournament/season-specific settings such as scoring preset, prediction mode, booster availability, and prediction visibility.

Active group members can read group seasons for their group. Clients cannot write group season documents directly.

### Group Members

Active members can read member documents for their group.

Only protected server routes can:

- Add a member.
- Change a role.
- Mark a member as removed.
- Process a rejoin.
- Leave owner/admin audit fields.

Users may be allowed to mark themselves as `LEFT` only through a server route so ownership transfer and group invariants are handled correctly.

### Invites

Invite documents should not be broadly client-readable.

Invite validation should be server-mediated because rules alone cannot safely handle:

- Expiry.
- Revocation.
- Removed-user rejoin policy.
- Rate limiting.
- Invite token secrecy.

Sprint 3 uses season-scoped invite documents at:

```text
groups/{groupId}/seasons/{groupSeasonId}/invites/{inviteId}
```

It also uses a server-only `inviteCodes/{code}` registry for code uniqueness and lookup. Clients cannot read or write either collection.

### Predictions

Users can read only their own predictions while private visibility is the only implemented Sprint 5 behavior. Prediction writes go only through server-validated routes for MVP.

Rules may enforce ownership checks:

- `prediction.userId == request.auth.uid`
- active membership in the group.

However, Firestore Security Rules alone are insufficient for complete prediction validation because prediction writes require checking:

- Canonical match `lockAt`.
- Current trusted server time.
- Group prediction mode.
- Booster rules.
- Match belongs to the group's competition.
- Idempotent revision creation.

Therefore, direct client writes to `groups/{groupId}/seasons/{groupSeasonId}/predictions/{predictionId}` are denied for MVP. The implemented server route is `POST /api/v1/groups/{groupId}/seasons/{groupSeasonId}/predictions`.

### Prediction Revisions

Prediction revisions are append-only audit records and must be server-only writes.

Read access should be limited:

- User revision reads remain server-mediated until an audit UI is explicitly implemented.
- Owner/admin may read broader revision history for moderation or audit if product policy allows.
- Do not expose revision history to non-members.

### Leaderboard Snapshots

Group leaderboard snapshots are readable only by active group members.

Writes are server-only from scoring jobs.

Global leaderboard snapshots are public read models for opted-in users only and must not include:

- Email.
- Private group IDs or names.
- Private prediction details.
- Hidden profile fields.

### AI Insights

Public match insights may be client-readable.

Writes are server-only from Cloud Run Jobs or protected route handlers.

Rules should prevent clients from writing or modifying:

- `modelVersion`
- `inputHash`
- `generatedAt`
- `providerFreshness`
- `expiresAt`
- `invalidatedAt`
- insight content.

### Simulation Runs

Public simulation runs are readable by everyone.

Private/custom simulation runs are readable only by the requester.

Writes are server-only. Users request custom simulations through protected Cloud Run routes or queued jobs.

### News

News source and item documents may be public read models, subject to source licensing.

Writes are server-only. Users may manage personal hidden sources or followed teams in their profile document.

## Where Server-Side Validation Is Required

Firestore Security Rules should not be treated as the business-rule engine. Cloud Run server routes must validate:

- Auth token and user identity.
- Active group membership.
- Owner/admin role for group settings.
- Invite token validity, expiry, revocation, and removed-user policy.
- Prediction lock using trusted server time and canonical match data.
- Prediction input shape and score bounds.
- Booster eligibility.
- Prediction revision creation.
- Scoring calculations.
- Global leaderboard inclusion and public display fields.
- Provider payload normalization.
- AI insight schema validation.
- Simulation assumptions and run limits.
- Consent-sensitive ad and analytics behavior.

## Acceptance Criteria

- Users cannot read or write another user's private profile fields.
- Non-members cannot read private group data.
- Group members can read only groups where their membership is active.
- Owner/admin-only operations cannot be performed by normal members.
- Prediction writes cannot bypass Cloud Run validation in MVP.
- Public reference data is readable by everyone but writable only by server processes.
- Server-only job outputs cannot be modified by clients.
