# MatchPulse

MatchPulse is a mobile-first Progressive Web App for FIFA World Cup 2026 predictions. The MVP focuses on private groups, fast score predictions, leaderboards, explainable AI match insights, team pages, and a transparent tournament simulator.

This repository is currently at Sprint 3: Next.js 15, TypeScript, Tailwind CSS, Firebase client/Admin SDK setup, Firebase Auth and Firestore emulator configuration, local sign-in, server-managed Firebase session cookies, protected dashboard routing, user profile bootstrap, reusable private groups, World Cup 2026 group seasons, season-scoped invites, conservative Firestore rules, and a health endpoint.

## Current Scope

Implemented through Sprint 3:

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
- Environment variable parsing.
- Basic mobile-first app shell.
- Basic health endpoint at `/api/health`.
- Authenticated user context helper for API routes.
- Cloud Run-compatible standalone build configuration.

Not implemented yet:

- Predictions.
- Leaderboards.
- AI insights.
- Simulator.
- Sports-data ingestion.
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
- Invalid invite returns `INVITE_INVALID`, `INVITE_EXPIRED`, or `INVITE_REVOKED` without group details.
- Member can read the active member list on the group detail page.
- Client direct writes to group, member, group season, invite, prediction, revision, or leaderboard documents are denied by Firestore rules.

## Verification

Run:

```bash
npm run typecheck
npm run lint
npm run build
```

## Environment Variables

Use `.env.local.example` for local development and `templates/env.example` as the project-wide variable inventory.

Rules:

- Do not commit real secrets.
- Only `NEXT_PUBLIC_*` variables may be exposed to browser code.
- Use Firebase emulators for local Auth and Firestore development.
- Use Secret Manager for deployed server secrets.
- For deployed Firebase Admin SDK usage, prefer Application Default Credentials in the Cloud Run runtime.

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
  insights/
  providers/
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
