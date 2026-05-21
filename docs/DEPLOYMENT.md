# Deployment

This document defines the intended local development and deployment strategy for the Firebase and Google Cloud target architecture. It is documentation only. Do not create Firebase, Google Cloud, or GitHub Actions configuration files from this document.

## Local Development

Future implementation should support:

- Next.js 15 local dev server.
- Firebase Auth emulator.
- Firestore emulator.
- Local environment file based on `templates/env.example`.
- Mock or sandbox sports provider keys.
- Optional local job entry points for ingestion/scoring/simulation testing.

Example commands for later implementation documentation:

```bash
npm install
npm run dev
firebase emulators:start --only auth,firestore
```

These are examples only. Do not install dependencies or create config files during documentation-only tasks.

## Firebase Project Setup

Future setup steps:

1. Create separate Firebase projects for staging and production.
2. Enable Firebase Auth.
3. Enable Cloud Firestore.
4. Configure authorized domains.
5. Configure Firebase web app credentials.
6. Configure emulator support for local development.
7. Publish Firestore Security Rules only after implementation and review.
8. Publish Firestore indexes only after query patterns are implemented and verified.

Do not commit real Firebase config secrets. Public Firebase web app config may be used client-side, but project-specific values should be supplied through environment variables.

## Google Cloud Project Setup

Future setup steps:

1. Link or select the Google Cloud project behind each Firebase project.
2. Enable Cloud Run.
3. Enable Cloud Run Jobs.
4. Enable Cloud Scheduler.
5. Enable Pub/Sub.
6. Enable Secret Manager.
7. Enable Cloud Logging and Error Reporting.
8. Configure service accounts with least privilege.
9. Grant runtime access to required Secret Manager secrets.

Use separate projects for staging and production.

## Environment Variables

Use `templates/env.example` as the variable inventory.

Rules:

- Never commit real secrets.
- Only `NEXT_PUBLIC_*` variables may be exposed to browser code.
- Use Secret Manager for deployed secrets.
- Keep local `.env` files untracked.
- Use different provider keys for staging and production where possible.

## GitHub-to-Google-Cloud Deployment Strategy

Recommended future CI/CD:

1. GitHub pull request runs checks.
2. Main branch merge triggers deployment.
3. Build creates Cloud Run service artifact.
4. Deployment references secrets from Secret Manager.
5. Cloud Run Jobs are deployed or updated.
6. Firestore rules and indexes are deployed only from reviewed implementation changes.
7. Smoke checks validate health endpoints and critical routes.

No GitHub Actions workflow should be created during this documentation-only task.

## Example Future Commands

These examples are for deployment documentation only and must not be run as part of this task.

```bash
gcloud run deploy matchpulse-web --source .
gcloud run jobs deploy matchpulse-ingest-fixtures --source .
gcloud scheduler jobs create pubsub refresh-fixtures --topic provider.fixture.refresh
firebase deploy --only hosting
firebase deploy --only firestore:rules,firestore:indexes
```

Use placeholder project IDs in examples. Do not hard-code real project IDs or secrets.

## Release Environments

### Staging

Purpose:

- Validate auth, rules, routes, jobs, provider ingestion, AI insight validation, and simulator outputs before production.

Data:

- Non-production users.
- Provider sandbox data when available.
- Lower simulation run counts.
- Test ad/consent configuration.

### Production

Purpose:

- Serve live World Cup 2026 users.

Data:

- Production Firebase Auth.
- Production Firestore.
- Licensed provider keys.
- Production ad/consent configuration.
- Production simulation run counts.

## Rollback Strategy

Future implementation should support:

- Reverting Cloud Run service revisions.
- Pausing Cloud Scheduler jobs.
- Disabling Pub/Sub subscriptions or job consumers.
- Invalidating stale AI insight and simulation documents.
- Re-running scoring jobs idempotently.

## Open Decisions

- Firebase Hosting vs Firebase App Hosting.
- Exact CI/CD provider and branch strategy.
- Whether staging deploys from every main merge or from release branches.
- Service account naming and least-privilege role split.
- Smoke test scope for deployments.
