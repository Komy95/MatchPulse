# MatchPulse

MatchPulse is a mobile-first Progressive Web App for FIFA World Cup 2026 predictions. The MVP focuses on private groups, fast score predictions, leaderboards, explainable AI match insights, team pages, and a transparent tournament simulator.

This repository is currently at Sprint 2: Next.js 15, TypeScript, Tailwind CSS, Firebase client/Admin SDK setup, Firebase Auth and Firestore emulator configuration, local sign-in, protected dashboard routing, user profile bootstrap, conservative profile-focused Firestore rules, and a health endpoint.

## Current Scope

Implemented through Sprint 2:

- Next.js 15 App Router.
- TypeScript strict mode.
- Tailwind CSS.
- Firebase client SDK helper.
- Firebase Admin SDK helper.
- Firebase Auth emulator configuration.
- Firestore emulator configuration.
- Google sign-in client flow.
- Email/password sign-in flow when the provider is enabled in Firebase.
- Logout.
- Client auth state provider.
- Protected dashboard route at `/dashboard`.
- `users/{uid}` profile creation after first login.
- User-owned profile read/update rules.
- Environment variable parsing.
- Basic mobile-first app shell.
- Basic health endpoint at `/api/health`.
- Authenticated user context helper for API routes.
- Cloud Run-compatible standalone build configuration.

Not implemented yet:

- Private groups.
- Predictions.
- Leaderboards.
- AI insights.
- Simulator.
- Sports-data ingestion.
- Ads.
- News.
- Push notifications.
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

For Google sign-in, use the emulator popup flow from `/login`. For email/password sign-in, enable the Email/Password provider in the Auth emulator UI and create a local test user there first. Then sign in from `/login` with that local user.

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

The dashboard profile form updates only the signed-in user's own document. Firestore rules reject reads and writes for other user IDs and reject profile documents outside the expected shape.

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
  api/health/
  globals.css
  layout.tsx
  page.tsx
components/
lib/
  auth/
  cache/
  firebase/
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
