# Google Cloud Architecture

This document describes the target Google Cloud and Firebase deployment model for MatchPulse. It is documentation only. Do not create deployment config files from this document.

## Target Services

| Service | Role |
|---|---|
| Firebase Auth | User authentication |
| Cloud Firestore | Primary application database |
| Firebase Hosting or Firebase App Hosting | Public hosting and routing entry point |
| Cloud Run | Next.js full-stack runtime |
| Cloud Run Jobs | Background processing |
| Cloud Scheduler | Cron triggers |
| Pub/Sub | Event-driven job orchestration |
| Secret Manager | API keys and secrets |
| Cloud Logging | Structured logs for app and jobs |
| Error Reporting | Error aggregation and alerting |

## Deployment Model

### Public Hosting

Use Firebase Hosting or Firebase App Hosting as the public entry point for the mobile-first PWA.

Responsibilities:

- Serve static assets.
- Route dynamic app traffic to the Cloud Run service or managed App Hosting runtime.
- Apply HTTPS and domain configuration.
- Support preview channels or staging environments where practical.
- Support PWA delivery for the installable mobile web app experience.
- Preserve fast mobile loading for invite, onboarding, prediction, dashboard, and matchday routes.

## Mobile-First PWA Delivery

MatchPulse launches as a mobile-first Progressive Web App.

Architecture implications:

- The hosted web app must support installable PWA behavior in future implementation.
- Static assets, app shell, and public reference data may be cached when freshness rules allow it.
- Private predictions, private group data, auth-sensitive data, and live match data must not be aggressively cached.
- Desktop is supported responsively but is not the primary delivery target.
- Native iOS/Android packaging is post-MVP.

See `docs/MOBILE-APP-STRATEGY.md` and `docs/PWA-REQUIREMENTS.md`.

### Cloud Run Service

The Next.js 15 app runs as a Cloud Run service.

Responsibilities:

- App Router pages.
- Server rendering.
- REST-first API route handlers.
- Firebase Auth token verification.
- Firebase Admin SDK access.
- Private mutable operation validation.
- Protected OpenAI or simulation request entry points.

### Cloud Run Jobs

Use Cloud Run Jobs for background processing.

Jobs:

- Provider fixture ingestion.
- Team metric ingestion.
- News ingestion.
- Final score ingestion.
- Scoring recalculation.
- Global leaderboard generation.
- AI insight refresh.
- Public simulation generation.
- Maintenance and backfills.

Jobs must be idempotent and log structured metadata.

### Cloud Scheduler

Use Cloud Scheduler for cron-like triggers.

Examples:

- Refresh fixtures daily before tournament.
- Refresh live match data frequently during match windows.
- Refresh team metrics daily.
- Refresh news every 10-60 minutes based on source rights.
- Run public simulator nightly or after major data changes.

Scheduler should publish to Pub/Sub or invoke a protected Cloud Run endpoint with `CRON_SECRET`.

### Pub/Sub

Use Pub/Sub for asynchronous events.

Example topics:

- `provider.fixture.updated`
- `provider.match.finished`
- `scoring.recalculate.requested`
- `leaderboard.global.refresh.requested`
- `insight.refresh.requested`
- `simulation.public.refresh.requested`
- `news.refresh.requested`

Pub/Sub decouples ingestion from scoring, insight refreshes, and simulations.

### Secret Manager

Use Secret Manager for deployed secrets:

- `OPENAI_API_KEY`
- `SPORTS_PROVIDER_API_KEY`
- provider-specific API keys.
- `CRON_SECRET`
- ad provider secrets if needed.

Do not store real secrets in repository files.

### Observability

Use Cloud Logging and Error Reporting for:

- Route handler errors.
- Job failures.
- Provider ingestion failures.
- AI validation failures.
- Simulation run failures.
- Security-sensitive denied operations.

Logs should include job IDs, provider names, match IDs, group IDs when safe, and correlation IDs. Do not log private prediction values unless explicitly needed for secure debugging.

## Environment and Secret Naming

### Public Client Variables

Use `NEXT_PUBLIC_` only for values safe to expose to browsers:

- `NEXT_PUBLIC_APP_URL`
- `NEXT_PUBLIC_FIREBASE_API_KEY`
- `NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN`
- `NEXT_PUBLIC_FIREBASE_PROJECT_ID`
- `NEXT_PUBLIC_FIREBASE_APP_ID`

### Server Variables

Use server-only variables for runtime configuration:

- `GOOGLE_CLOUD_PROJECT`
- `FIREBASE_PROJECT_ID`
- `SPORTS_PROVIDER`
- `SIM_DEFAULT_RUNS`
- `LIVE_CACHE_TTL_SEC`
- `INSIGHT_CACHE_TTL_SEC`
- `PUBLIC_SIM_CACHE_TTL_SEC`
- `AD_PROVIDER`
- `CONSENT_MODE`

### Secrets

Use Secret Manager for:

- `OPENAI_API_KEY`
- `SPORTS_PROVIDER_API_KEY`
- `CRON_SECRET`

## Staging and Production Separation

Use separate Firebase/GCP projects:

- `matchpulse-staging`
- `matchpulse-production`

Project IDs above are examples only. Do not hard-code real project IDs in documentation or config.

Separation rules:

- Separate Firebase Auth user pools.
- Separate Firestore databases.
- Separate Secret Manager secrets.
- Separate Pub/Sub topics.
- Separate Cloud Run services and jobs.
- Separate ad/analytics configuration where possible.
- Staging may use provider sandbox keys or lower-cost data plans.

## Deployment Flow

Recommended future flow:

1. Pull request opens.
2. Documentation, lint, type checks, and tests run.
3. Preview deployment is created if configured.
4. Merge to main deploys staging or production depending on branch strategy.
5. Cloud Run Jobs are deployed alongside app runtime when implementation exists.
6. Secrets are referenced from Secret Manager, not committed.

Do not create GitHub Actions, Firebase, or Cloud Run config files as part of documentation-only work.

## Open Decisions

- Firebase Hosting vs Firebase App Hosting as the primary public hosting layer.
- Whether Cloud Run service is deployed directly or managed through App Hosting.
- Branch strategy for staging and production.
- Exact Pub/Sub topic naming convention.
- Whether custom simulations run synchronously in Cloud Run routes or asynchronously through Pub/Sub and Cloud Run Jobs.
