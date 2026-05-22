# MatchPulse

MatchPulse is a mobile-first Progressive Web App for FIFA World Cup 2026 predictions. The MVP focuses on private groups, fast score predictions, leaderboards, explainable AI match insights, team pages, and a transparent tournament simulator.

This repository is currently at Sprint 1 foundation: Next.js 15, TypeScript, Tailwind CSS, Firebase client/Admin SDK setup, Firebase Auth and Firestore emulator configuration, a basic app shell, and a health endpoint.

## Current Scope

Implemented in Sprint 1 foundation:

- Next.js 15 App Router.
- TypeScript strict mode.
- Tailwind CSS.
- Firebase client SDK helper.
- Firebase Admin SDK helper.
- Firebase Auth emulator configuration.
- Firestore emulator configuration.
- Environment variable parsing.
- Basic mobile-first app shell.
- Basic health endpoint at `/api/health`.
- Basic authenticated user context helper.
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

Health check:

```text
http://localhost:3000/api/health
```

Firebase Emulator UI:

```text
http://localhost:4000
```

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
