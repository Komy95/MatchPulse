# MatchPulse

MatchPulse is a mobile-first Progressive Web App for FIFA World Cup 2026 predictions. The MVP focuses on private groups, fast score predictions, leaderboards, explainable AI match insights, team pages, and a transparent tournament simulator.

This repository is currently at Sprint 6.3: Next.js 15, TypeScript, Tailwind CSS, Firebase client/Admin SDK setup, Firebase Auth and Firestore emulator configuration, local sign-in, server-managed Firebase session cookies, protected dashboard routing, user profile bootstrap, reusable private groups, World Cup 2026 group seasons, season-scoped invites, conservative Firestore rules, provider-agnostic sports-data abstractions, prediction entry foundation, pure Hybrid 3-2-1 scoring domain, private group-season leaderboard snapshots, and a health endpoint.

## Current Scope

Implemented through Sprint 6.3:

- Next.js 15 App Router.
- TypeScript strict mode.
- Tailwind CSS.
- Firebase client SDK helper.
- Firebase Admin SDK helper.
- Firebase Auth emulator configuration.
- Firestore emulator configuration.
- Google sign-in client flow as the MVP default.
- Email/password sign-in as a local/test fallback when the provider is enabled in Firebase.
- Server-managed Firebase session cookie creation at `/api/auth/session`.
- Server-managed session logout at `/api/auth/logout`.
- Logout.
- Client auth state provider.
- Protected dashboard route at `/dashboard`.
- `users/{uid}` profile creation after first login.
- User-owned profile read/update rules with preference-only client updates after creation.
- Reusable private groups.
- First group season defaults to FIFA World Cup 2026.
- Active group membership and protected group detail pages.
- Season-scoped invite code and invite link flow.
- Server-only group, membership, group season, and invite mutations.
- Provider-agnostic sports-data domain types.
- Mock/local sports-data provider for tests and emulator development.
- Idempotent sports-data ingestion service and Firestore writer.
- Competition-season-scoped Firestore sports-data model.
- Idempotent local World Cup 2026 reference-data seed script.
- Group-season match list endpoint.
- Server-validated bulk prediction upsert endpoint.
- Current-user prediction entry UI on the group detail page.
- Prediction revision creation for changed predictions.
- Pure Hybrid 3-2-1 scoring domain.
- Scoreable match eligibility checks for final matches with 90-minute scores.
- Prediction scoring eligibility helpers for group-season scoped scoring.
- Private group-season leaderboard aggregation.
- Server-written `leaderboardSnapshots/latest` documents.
- Member-readable private leaderboard API and group detail UI.
- Owner/admin leaderboard recalculation route for MVP validation.
- Environment variable parsing.
- Basic mobile-first app shell.
- Basic health endpoint at `/api/health`.
- Authenticated user context helper for API routes.
- Cloud Run-compatible standalone build configuration.

Not implemented yet:

- Global leaderboard.
- AI insights.
- Simulator.
- Real sports-data provider integration.
- Ads.
- News.
- Push notifications.
- Full email/password registration.
- Capacitor or native app setup.

## Requirements

- Node.js 20 or newer.
- npm.
- Java runtime for Firebase emulators.

## Local Setup

Install dependencies:

```bash
npm install
```

Create local environment file:

```bash
cp .env.local.example .env.local
```

The included example values target local emulator development and do not contain real secrets.
The example also sets `FIREBASE_AUTH_EMULATOR_HOST` and `FIRESTORE_EMULATOR_HOST` so server-side Firebase Admin helpers use local emulators instead of production services.

Start Firebase emulators:

```bash
npm run emulators
```

In another terminal, start the Next.js dev server:

```bash
npm run dev
```

Open:

```text
http://localhost:3000
```

Sign in:

```text
http://localhost:3000/login
```

Protected dashboard:

```text
http://localhost:3000/dashboard
```

Create group:

```text
http://localhost:3000/groups/new
```

Join by invite code:

```text
http://localhost:3000/join
```

Health check:

```text
http://localhost:3000/api/health
```

Firebase Emulator UI:

```text
http://localhost:4000
```

## Local Auth and Firestore Emulator Testing

Use `.env.local.example` for emulator-safe local development. The example project ID and Firebase browser config are demo values and must not be replaced with production secrets for local tests.

Start the emulators before signing in:

```bash
npm run emulators
```

Google login is the MVP default. Email/password is available only as a local/test fallback unless full registration is explicitly implemented later.

For Google sign-in, use the emulator popup flow from `/login`. For email/password sign-in, enable the Email/Password provider in the Auth emulator UI and create a local test user there first. Then sign in from `/login` with that local user.

The browser signs in with Firebase Auth first, then sends the Firebase ID token to:

```text
POST /api/auth/session
```

The route verifies the ID token with the Firebase Admin SDK, creates a Firebase session cookie, and sets `__session` as `HttpOnly`, `SameSite=Lax`, `path=/`, and `Secure` in production. Browser code does not write the session cookie directly.

Logout calls:

```text
POST /api/auth/logout
```

The route clears the session cookie server-side before the client signs out of Firebase Auth.

## Reusable Groups and Seasons

Groups are reusable social containers. A group can have multiple tournament or season instances over time.

Sprint 3 creates:

```text
groups/{groupId}
groups/{groupId}/members/{userId}
groups/{groupId}/seasons/{groupSeasonId}
groups/{groupId}/seasons/{groupSeasonId}/invites/{inviteId}
inviteCodes/{code}
```

When a group is created, MatchPulse automatically creates the first group season:

```text
competitionId=fifa-world-cup
seasonId=world-cup-2026
label=FIFA World Cup 2026
scoringPreset=HYBRID_321
predictionMode=EXACT_SCORE
predictionVisibility=AFTER_LOCK
```

Scoring and prediction rules live on the group season, not the reusable group.

Group mutations are server-only through:

```text
POST /api/v1/groups
GET /api/v1/groups
GET /api/v1/groups/{groupId}
GET /api/v1/groups/{groupId}/seasons
POST /api/v1/groups/{groupId}/seasons/{groupSeasonId}/invites
POST /api/v1/groups/join
```

Firestore rules allow active members to read their own groups, group members, and group seasons. Client writes to groups, members, group seasons, invites, predictions, prediction revisions, and leaderboard snapshots are denied for MVP.

Invite codes are reserved in the server-only `inviteCodes/{code}` registry. Duplicate joins are idempotent, `LEFT` members rejoin as active members and increment `memberCount` once, and `REMOVED` members cannot rejoin through an invite code.

## Sports Data Abstraction

Sprint 4 introduces a server-side sports-data layer for future World Cup 2026 ingestion. It does not call real vendor APIs yet and does not add prediction, scoring, leaderboard, insight, or simulator behavior.

Implemented paths:

```text
lib/sports-data/domain.ts
lib/sports-data/providers/types.ts
lib/sports-data/providers/mock.ts
lib/sports-data/ingestion/service.ts
lib/sports-data/firestore/writer.ts
```

Canonical Firestore write model:

```text
competitions/{competitionId}
competitions/{competitionId}/seasons/{seasonId}
competitions/{competitionId}/seasons/{seasonId}/teams/{teamId}
competitions/{competitionId}/seasons/{seasonId}/matches/{matchId}
```

The ingestion writer uses deterministic provider-scoped document IDs and merge upserts so the same provider batch can be run repeatedly without duplicate teams or matches. Provider credentials must remain server-only. Use `SPORTS_PROVIDER_API_KEY` from Secret Manager when a real provider adapter is implemented later.

For local emulator development, seed the reference data after starting Firestore:

```bash
npm run seed:reference
```

The seed is idempotent and writes the canonical local World Cup 2026 competition, season, teams, and starter match under `competitions/{competitionId}/seasons/{seasonId}`. It refuses to run without `FIRESTORE_EMULATOR_HOST` unless `--allow-production` is passed intentionally.

## Prediction Entry

Sprint 5 supports current-user score predictions for matches in a group season before `lockAt`.

Implemented routes:

```text
GET /api/v1/groups/{groupId}/seasons/{groupSeasonId}/matches
POST /api/v1/groups/{groupId}/seasons/{groupSeasonId}/predictions
```

Prediction writes are server-only. The server verifies active group membership, group-season scope, canonical match existence, prediction mode, booster setting, score bounds, and trusted server time before writing. Direct Firestore client writes to predictions and prediction revisions are denied.

## Scoring And Leaderboards

Sprint 6.2 added pure scoring logic. Sprint 6.3 uses that scoring domain to create private group-season leaderboard snapshots.

MVP scoring uses Hybrid 3-2-1:

- 3 points for exact score.
- 2 points for correct goal difference.
- 1 point for correct tendency.
- 0 points for a miss.

Prediction scoring uses the 90-minute result plus stoppage time only. Extra time and penalties are out of scope for user prediction scoring. Booster multiplication is also deferred; the base scoring result is calculated without booster effects.

Private leaderboard snapshots are scoped to:

```text
groups/{groupId}/seasons/{groupSeasonId}/leaderboardSnapshots/latest
```

Snapshots are server-written only, active group members can read them, and non-members cannot read them. Recalculation is idempotent: unchanged scoring inputs keep the existing latest snapshot. Global leaderboards remain deferred.

After the first successful login, verify in the Firestore emulator UI that a document exists at:

```text
users/{uid}
```

The profile document contains:

```text
displayName
email
photoUrl
locale
countryCode
favoriteTeamIds
followedTeamIds
globalLeaderboardOptIn
consent
createdAt
updatedAt
```

The dashboard profile form updates only the signed-in user's own document. Firestore rules reject reads and writes for other user IDs, reject profile documents outside the expected shape, and prevent client updates to auth-derived fields after creation:

```text
displayName
email
photoUrl
createdAt
```

## Sprint 3 Validation Steps

Run the app against Firebase Auth and Firestore emulators:

```bash
npm run emulators
npm run dev
```

Then validate:

- Authenticated user can create a reusable group at `/groups/new`.
- Group creation also creates the first `FIFA World Cup 2026` group season.
- Creator becomes `OWNER` in `groups/{groupId}/members/{uid}`.
- Group appears on the dashboard with its active season label.
- Unauthenticated user cannot create a group and is redirected to login.
- Non-member cannot read group detail through `GET /api/v1/groups/{groupId}`.
- Member can read seasons through `GET /api/v1/groups/{groupId}/seasons`.
- Owner/admin can create an invite for the active group season.
- Valid invite code joins the reusable group at `/join`.
- Duplicate join returns active membership without creating a duplicate member.
- A `LEFT` member can rejoin and increments `memberCount` only because they were not active.
- A `REMOVED` member is denied rejoin through invite.
- Invalid invite returns `INVITE_INVALID`, `INVITE_EXPIRED`, or `INVITE_REVOKED` without group details.
- Member can read the active member list on the group detail page.
- Client direct writes to group, member, group season, invite, prediction, revision, or leaderboard documents are denied by Firestore rules.

## Sprint 5 Validation Steps

Run the app against Firebase Auth and Firestore emulators, then seed reference data:

```bash
npm run emulators
npm run seed:reference
npm run dev
```

Then validate:

- Active group member can open a group detail page and see seeded World Cup matches.
- Non-member cannot call `GET /api/v1/groups/{groupId}/seasons/{groupSeasonId}/matches`.
- Active group member can save predictions before `lockAt`.
- Repeating the same save is idempotent.
- Changing a saved prediction creates a prediction revision.
- Saving after `lockAt` returns `PREDICTION_LOCKED`.
- Invalid match IDs return `MATCH_NOT_FOUND`.
- Direct client writes to prediction and revision documents are denied by Firestore rules.

## Sprint 6.3 Validation Steps

Run the app against Firebase Auth and Firestore emulators, then seed reference data:

```bash
npm run emulators
npm run seed:reference
npm run dev
```

Then validate:

- Active group member can call `GET /api/v1/groups/{groupId}/seasons/{groupSeasonId}/leaderboard`.
- A group owner/admin can call `POST /api/v1/groups/{groupId}/seasons/{groupSeasonId}/leaderboard/recalculate`.
- Repeating recalculation without scoring-relevant changes returns the same latest snapshot.
- Non-members cannot read private group leaderboard snapshots.
- Direct Firestore client writes to `leaderboardSnapshots/{snapshotId}` are denied.
- The group detail page shows a mobile-first leaderboard section and an empty state when no snapshot exists.

## Verification

Run:

```bash
npm test
npm run test:emulator
npm run typecheck
npm run lint
npm run validate:foundation
npm run build
```

`npm run test:emulator` starts the Firebase Auth and Firestore emulators and runs the prediction integration/security suite. It requires Java on `PATH` because the Firestore emulator is Java-based.

The emulator suite verifies:

- Reference-data seed creates the canonical competition, season, teams, and matches.
- Seeded matches include `kickoffAt` and `lockAt` UTC timestamps.
- The reference-data seed is idempotent.
- Group-season scoped prediction documents use `groups/{groupId}/seasons/{groupSeasonId}/predictions/{matchId}_{userId}`.
- Active members can view group-season matches.
- Non-members cannot view or save group-season predictions.
- Members can save predictions before `lockAt`.
- Predictions after `lockAt` are rejected.
- Duplicate saves are idempotent.
- Changed predictions create prediction revisions.
- Invalid match IDs are rejected.
- Matches outside the group season are rejected.
- Direct Firestore client writes to predictions, prediction revisions, and reference matches are denied.
- Direct Firestore client writes to leaderboard snapshots are denied.

## Environment Variables

Use `.env.local.example` for local development and `templates/env.example` as the project-wide variable inventory.

Rules:

- `APP_ENV=local` is the default and keeps emulator development permissive.
- `APP_ENV=staging` and `APP_ENV=production` fail fast when required Firebase public config or the server project ID is missing.
- Do not commit real secrets.
- Only `NEXT_PUBLIC_*` variables may be exposed to browser code.
- Use Firebase emulators for local Auth and Firestore development.
- Use Secret Manager for deployed server secrets.
- For deployed Firebase Admin SDK usage, prefer Application Default Credentials in the Cloud Run runtime.

Required for local emulator development:

```text
APP_ENV=local
NEXT_PUBLIC_APP_URL=http://localhost:3000
NEXT_PUBLIC_FIREBASE_API_KEY=demo-api-key
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=demo-matchpulse.firebaseapp.com
NEXT_PUBLIC_FIREBASE_PROJECT_ID=matchpulse-local
NEXT_PUBLIC_FIREBASE_APP_ID=demo-app-id
FIREBASE_PROJECT_ID=matchpulse-local
FIREBASE_AUTH_EMULATOR_HOST=127.0.0.1:9099
FIRESTORE_EMULATOR_HOST=127.0.0.1:8080
SPORTS_PROVIDER=mock
```

Required for staging/production runtime configuration:

```text
APP_ENV=staging
NEXT_PUBLIC_APP_URL=
NEXT_PUBLIC_FIREBASE_API_KEY=
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=
NEXT_PUBLIC_FIREBASE_PROJECT_ID=
NEXT_PUBLIC_FIREBASE_APP_ID=
FIREBASE_PROJECT_ID= or GOOGLE_CLOUD_PROJECT=
SPORTS_PROVIDER=mock or real provider id
```

Secret Manager-backed values for deployed environments:

```text
OPENAI_API_KEY
SPORTS_PROVIDER_API_KEY
CRON_SECRET
```

`SPORTS_PROVIDER_API_KEY` is required when `SPORTS_PROVIDER` is `sportmonks`, `api-football`, or `football-data-org`. It is not required for the local `mock` provider.

Optional local Firebase Admin SDK service account variables are supported by the helper but should only be used in untracked local environment files:

```text
FIREBASE_SERVICE_ACCOUNT_PROJECT_ID=
FIREBASE_SERVICE_ACCOUNT_CLIENT_EMAIL=
FIREBASE_SERVICE_ACCOUNT_PRIVATE_KEY=
```

## Project Structure

```text
app/
  api/auth/logout/
  api/auth/session/
  api/health/
  api/v1/groups/
  dashboard/
  groups/
  join/
  login/
  globals.css
  layout.tsx
  page.tsx
components/
lib/
  auth/
  cache/
  firebase/
  profile/
  predictions/
  sports-data/
  insights/
  scoring/
  simulator/
public/
docs/
tasks/
templates/
```

## Documentation

Start with:

- `AGENTS.md`
- `PROJECT_CONTEXT.md`
- `docs/ARCHITECTURE.md`
- `docs/FIRESTORE-DATA-MODEL.md`
- `docs/FIREBASE-SECURITY-RULES.md`
- `docs/MOBILE-APP-STRATEGY.md`
- `docs/PWA-REQUIREMENTS.md`
- `docs/DESIGN-PHILOSOPHY.md`
- `tasks/ROADMAP.md`

## Product Guardrails

- FIFA World Cup 2026 first.
- Mobile-first PWA first.
- No betting, wagering, paid entry pools, or cash prizes.
- No unlicensed FIFA marks, team crests, player photos, or copyrighted match photography.
- No Supabase dependency.
