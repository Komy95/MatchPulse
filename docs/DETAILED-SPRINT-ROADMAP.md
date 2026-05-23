# Detailed Sprint Roadmap

This roadmap defines the next MatchPulse development sequence from the current post-Sprint-6 state toward a usable World Cup 2026 MVP.

The plan separates responsibilities between:

- **Codex / AI coding agent**: repository implementation, tests, documentation, and local validation.
- **Tim / cloud infrastructure owner**: Firebase, Google Cloud, provider accounts, secrets, budgets, and operational setup.
- **Content / provider strategy**: free or no-cost approaches for the test phase, with production considerations documented separately.

## Strategic Product Priority

The primary MVP loop is:

```text
Private group -> Matches -> Predictions -> Scoring -> Private leaderboard
```

The following features remain secondary until the private prediction loop is stable:

- News feed
- AI insights
- Tournament simulator
- Ads
- Push notifications
- Capacitor / native app packaging
- Production deployment

## Provider Strategy for the Test Phase

### Football data

Use **free or open data only** during development and testing.

Recommended approach:

1. **openfootball / football.json** for local development, test data, and seed experiments.
2. Existing local seed data for World Cup 2026 placeholder/reference structures.
3. Defer commercial sports-data providers until the prediction and leaderboard loop is stable.

Production candidates to evaluate later:

- football-data.org
- API-Football
- Sportmonks

Rules:

- Keep provider payloads behind a normalization layer.
- Do not let UI components depend directly on provider-specific fields.
- Do not use odds in the MVP to avoid betting-style positioning.
- Do not use official logos, crests, or FIFA marks unless rights are confirmed.

### News and content

Use **metadata-only link-out content** during testing.

Recommended approach:

1. RSS/Open feeds only where terms are acceptable.
2. Store only metadata.
3. Always link to the original source.
4. Do not store full article bodies.
5. Do not store copyrighted images.
6. Do not use AI summaries of third-party articles until usage rights are clear.

Possible future test candidates:

- RSS feeds from official or reputable football sources where terms allow metadata usage
- NewsAPI developer plan for local testing only
- GNews free plan for local testing only
- Kicker / Sportschau / FIFA / UEFA as link-out candidates, not scraped content sources

News is not part of the immediate private-pool MVP.

---

# Sprint 6.4: Scoring and Leaderboard Stabilization

## Product Goal

Ensure the existing scoring and private leaderboard foundation is correct, secure, and regression-safe before building additional user-facing features.

## Why This Sprint Matters

Scoring and leaderboards are the core emotional payoff of the app. If they are wrong, inconsistent, or insecure, the core product loop becomes untrustworthy.

## Codex Tasks

### 1. Review existing scoring implementation

Codex should inspect:

- `lib/scoring/*`
- leaderboard-related modules
- prediction domain modules
- group season data access
- relevant API routes
- tests related to scoring and predictions

Validate:

- Hybrid 3-2-1 logic is correct.
- 90-minute score rule is documented and respected.
- Extra time and penalties are not used for MVP user scoring.
- Non-scoreable matches are ignored.
- Prediction revisions do not break scoring.
- Scoring remains group-season scoped.

### 2. Review existing leaderboard implementation

Validate:

- Leaderboards are stored under group seasons.
- Active members can read private leaderboards.
- Non-members cannot read private leaderboards.
- Clients cannot directly write leaderboard snapshots.
- Ranking is deterministic.
- Tie-breakers are implemented consistently.

### 3. Add or improve tests

Add focused tests for:

- exact score scoring
- goal-difference scoring
- tendency scoring
- miss scoring
- draw handling
- non-scoreable match handling
- inactive/removed member handling
- deterministic ranking
- non-member leaderboard denial
- direct Firestore write denial if emulator tests exist

### 4. Update validation documentation

Update README or a dedicated validation document with:

- local emulator test workflow
- scoring validation steps
- leaderboard validation steps
- expected commands

### 5. Ensure quality gates pass

Required commands:

```bash
npm run typecheck
npm run lint
npm run build
npm run test
```

If `npm run test` does not exist, Codex should either add it properly or document the current test command.

## Tim / Cloud Infrastructure Tasks

- Do not create new Cloud Run services yet.
- Do not create Cloud Run Jobs yet.
- Keep all validation local through Firebase emulators.
- Confirm Java is installed locally so Firestore/Auth emulators work.
- Confirm Firebase Auth and Firestore are enabled in staging.
- Confirm budget alerts are active in Google Cloud Billing.
- Do not add real provider keys yet.

## Content / Provider Tasks

- No news integration.
- No external football provider integration.
- Continue using local/reference seed data.

## Acceptance Criteria

- Scoring behavior is covered by tests.
- Leaderboard ranking behavior is covered by tests.
- Non-members cannot read leaderboard data.
- Direct client writes remain denied.
- Documentation reflects current validation steps.
- Typecheck, lint, build, and tests pass.

## Out of Scope

- News
- AI insights
- Simulator
- Live football provider ingestion
- Cloud Run deployment
- Push notifications
- Native app packaging

---

# Sprint 6.5: Preferences and Mobile Dashboard

## Product Goal

Turn the app from a set of functional pages into a useful mobile command center for the user.

## Why This Sprint Matters

The dashboard should answer:

- What should I do next?
- Which predictions are still missing?
- Which matches lock soon?
- How am I doing in my groups?

## Codex Tasks

### 1. Extend user preferences

Support safe user preference fields:

- display name
- locale
- country code
- favorite team IDs
- followed team IDs
- global leaderboard opt-in placeholder, if already documented
- consent placeholder, without implementing real consent management yet

Ensure:

- Auth-derived fields are not freely client-editable if security rules restrict them.
- Client-write permissions remain narrow.
- Profile updates do not weaken Firestore rules.

### 2. Build dashboard aggregation service

Create a server-side or controlled data access layer that returns only the signed-in user's dashboard data.

Dashboard should include:

- active groups
- active group seasons
- next matches
- open predictions
- soon-locking matches
- private leaderboard summary
- quick action links

Avoid:

- expensive fan-out reads
- pulling all predictions for all users
- leaking private group data

### 3. Build mobile-first dashboard UI

Dashboard modules:

- **Continue predicting** card
- **My groups** section
- **Next locks** section
- **Leaderboard summary** section
- **Profile/preferences shortcut**

Design requirements:

- mobile-first
- soft cards
- one primary action per area
- no dense tables
- large tap targets
- Apple-like clarity

### 4. Add tests or validation steps

Validate:

- unauthenticated users are redirected
- dashboard only shows data for the current user
- dashboard does not show non-member group data
- missing predictions are correctly identified
- locked matches are not shown as editable

## Tim / Cloud Infrastructure Tasks

- No new cloud infrastructure required.
- Monitor Firestore query patterns in emulator/local development.
- If Firestore requests new indexes, ask Codex to add them to `firestore.indexes.json`.
- Do not deploy to production.

## Content / Provider Tasks

- No news content yet.
- No external football provider yet.
- Dashboard can use seeded/reference matches only.

## Acceptance Criteria

- User sees a useful mobile dashboard after login.
- Dashboard shows active groups and active seasons.
- Dashboard shows next prediction actions.
- Dashboard does not leak other users' private data.
- Preferences can be updated safely.
- Typecheck, lint, build, and tests pass.

## Out of Scope

- News cards
- AI insight cards
- Simulator cards
- Push notifications
- Global leaderboard

---

# Sprint 7: Team Pages and Reference Data Presentation

## Product Goal

Make teams and match context visible in a useful, readable way without requiring external websites.

## Why This Sprint Matters

Team pages are one of the differentiators from generic prediction apps. They also prepare the evidence layer for future AI insights.

## Codex Tasks

### 1. Implement team detail pages

Create team pages that show:

- team name
- competition/season context
- group code if available
- upcoming matches
- completed matches
- basic match status
- data freshness

Do not use official logos or crests.

### 2. Implement team-related API/data access

Add or complete endpoints/services such as:

- `GET /api/v1/teams/{teamId}`
- `GET /api/v1/teams/{teamId}/matches`

Ensure:

- public reference data can be read safely
- provider payloads do not leak into UI
- freshness metadata is visible

### 3. Add stale-data UI

If provider/reference data is old or mock/seeded, display a subtle message:

```text
Data last updated: ...
```

or:

```text
This data is based on current seed/reference data.
```

### 4. Keep source abstraction intact

If using openfootball or local data:

- keep it behind provider abstraction
- normalize it before storing or rendering
- do not couple UI to openfootball's raw schema

## Tim / Cloud Infrastructure Tasks

- No paid sports provider yet.
- Keep `SPORTS_PROVIDER_API_KEY` as placeholder.
- Do not create scheduled ingestion jobs yet.
- Review if Firestore public read costs remain acceptable.

## Content / Provider Tasks

Use for development/testing:

- openfootball / football.json
- local seed data

Do not use yet:

- Sportmonks production subscription
- API-Football production subscription
- football-data.org paid plan

## Acceptance Criteria

- Team pages render from canonical reference data.
- Team pages do not rely on official logos/crests.
- Team pages show match context and freshness.
- Provider-specific fields stay outside UI.
- Typecheck, lint, build, and tests pass.

## Out of Scope

- AI team summaries
- news articles
- player pages
- squad lineups
- injuries
- odds

---

# Sprint 8: Content and News Strategy Documentation

## Product Goal

Define a rights-safe and cost-free test strategy for football news before any implementation.

## Why This Sprint Matters

News is attractive but legally risky. This sprint prevents accidental scraping, copyright issues, or technical debt.

## Codex Tasks

Documentation only.

Create or update:

- `docs/CONTENT-STRATEGY.md`
- `docs/NEWS-FEED-STRATEGY.md`
- `docs/PROVIDER-SOURCE-POLICY.md`
- `docs/FIRESTORE-DATA-MODEL.md`
- `docs/API-SPECS.md`
- `tasks/ROADMAP.md`

Document:

- news is secondary, not MVP-critical
- metadata-only storage
- link-out behavior
- source registry
- allowed vs disallowed source usage
- RSS provider concept
- API provider concept
- licensing guardrails

### Source policy

Allowed in test phase:

- RSS/open feeds where terms are acceptable
- NewsAPI developer plan for local tests only
- GNews free plan for local tests only
- manually curated link-out sources

Disallowed:

- scraping kicker articles
- scraping Sportschau articles
- copying FIFA/UEFA article bodies
- storing copyrighted images
- storing full article bodies
- generating AI summaries from scraped article text

## Tim / Cloud Infrastructure Tasks

- Do not create news API secrets unless required for local experiments.
- If needed later, prepare placeholders only:

```bash
echo "placeholder" | gcloud secrets create NEWS_API_KEY --data-file=-
echo "placeholder" | gcloud secrets create GNEWS_API_KEY --data-file=-
```

- Do not use free developer news API keys in production.

## Content / Provider Tasks

Research candidate sources and classify them manually:

- source name
- homepage
- feed URL if available
- language
- allowed usage
- attribution requirement
- commercial usage status
- whether excerpt is allowed
- whether images are allowed

## Acceptance Criteria

- News strategy is documented.
- No implementation is added.
- Roadmap clearly places news after core private prediction loop.
- Legal/content guardrails are explicit.

## Out of Scope

- News UI
- RSS parser
- News API integration
- News ingestion jobs
- AI summaries

---

# Sprint 9: Minimal Metadata News Feed

## Product Goal

Test whether lightweight football news links add user value without creating licensing risk.

## Codex Tasks

### 1. Implement news source model

Firestore collections:

```text
newsSources/{sourceId}
newsItems/{newsItemId}
```

`newsSources` fields:

- name
- homepageUrl
- feedUrl
- provider
- language
- country
- allowedUse
- requiresAttribution
- allowExcerpt
- allowImages
- active
- createdAt
- updatedAt

`newsItems` fields:

- title
- sourceId
- sourceName
- canonicalUrl
- provider
- providerItemId
- publishedAt
- language
- excerpt, only if allowed
- teamIds
- competitionIds
- attributionText
- createdAt
- updatedAt

### 2. Implement metadata-only RSS adapter

Rules:

- parse feed metadata
- store canonical URLs
- deduplicate by canonical URL/provider ID
- do not fetch full article pages
- do not store article bodies
- do not store images unless explicitly allowed

### 3. Implement basic news display

Possible surfaces:

- team page news section
- dashboard optional section

UI requirements:

- source visible
- date visible
- opens original article
- clearly external link
- no AI summary

## Tim / Cloud Infrastructure Tasks

- Use local/test sources only.
- Do not schedule automated jobs yet unless explicitly needed.
- If external API keys are used, store them in Secret Manager.
- Monitor Firestore reads/writes if testing ingestion repeatedly.

## Content / Provider Tasks

Start with 2-3 manually approved sources.

Do not include a source unless:

- it has a stable feed/API
- usage terms are acceptable for metadata/link-out
- attribution can be shown

## Acceptance Criteria

- News items are metadata-only.
- Every news card links to the original source.
- Source attribution is visible.
- No article bodies are stored.
- No images are stored unless allowed.
- News does not block predictions/scoring/leaderboards.

## Out of Scope

- AI news summaries
- personalization beyond simple team/competition tags
- push notifications
- production content licensing

---

# Sprint 10: AI Match Insights

## Product Goal

Add explainable, evidence-grounded match insights based on structured data.

## Codex Tasks

### 1. Build evidence layer

Evidence should come only from structured app data:

- match data
- team data
- rankings if available
- form metrics if available
- provider freshness

No article scraping.

### 2. Implement structured AI output

Insight schema should include:

- matchId
- modelVersion
- inputHash
- generatedAt
- providerFreshness
- prediction
- confidence
- summary
- evidence
- warnings
- citationTokens

### 3. Add guardrails

The AI must not invent:

- injuries
- lineups
- odds
- quotes
- player-specific claims
- unsupported statistics

### 4. Store AI outputs

Firestore:

```text
matchInsights/{matchId}
```

or season-scoped structure if already documented.

## Tim / Cloud Infrastructure Tasks

- Add real OpenAI key only when this sprint starts:

```bash
printf "sk-..." | gcloud secrets versions add OPENAI_API_KEY --data-file=-
```

- Monitor cost.
- Do not schedule automatic refresh initially.
- Manual/protected refresh first.

## Content / Provider Tasks

- AI should use structured match/team data, not news articles.
- News should not be part of AI evidence until rights are clear.

## Acceptance Criteria

- Insight output matches schema.
- Unsupported claims are rejected or warned.
- Data freshness is visible.
- Missing evidence produces low-confidence output.
- No AI output is treated as source of truth.

## Out of Scope

- Article summarization
- Betting odds recommendations
- automatic live refresh
- simulator integration

---

# Sprint 11: Tournament Simulator V1

## Product Goal

Provide transparent World Cup 2026 tournament probabilities.

## Codex Tasks

### 1. Build pure simulation domain

Model:

- Elo-informed independent Poisson MVP
- versioned assumptions
- deterministic input hashing
- configurable tournament rules

### 2. Implement World Cup 2026 format

Support:

- 48 teams
- 12 groups of four
- top two advance
- eight best third-placed teams advance
- Round of 32
- knockout rounds

Tie-breaker implementation should be versioned and later verified against official rules.

### 3. Store simulation runs

Firestore:

```text
simulationRuns/{simulationId}
```

Fields:

- competitionId
- seasonId
- modelVersion
- assumptions
- inputHash
- runCount
- generatedAt
- expiresAt
- teams/probabilities

### 4. UI

Show:

- probability cards
- team probabilities by stage
- assumptions panel
- generated timestamp

## Tim / Cloud Infrastructure Tasks

- No Cloud Run Job initially.
- Test performance locally.
- If slow, plan Cloud Run Job later.
- No production simulation automation yet.

## Acceptance Criteria

- Simulation runs locally.
- Output is stable for same input/seed if deterministic seed is used.
- Probabilities are reasonable and sum correctly per stage expectations.
- Assumptions are visible.
- Model version is stored.

## Out of Scope

- Betting probabilities
- odds ingestion
- admin calibration tooling
- scheduled nightly runs

---

# Sprint 12: Staging Deployment on Google Cloud

## Product Goal

Move from local-only development to a reproducible staging environment.

## Codex Tasks

### 1. Harden environment validation

Separate modes:

- local emulator
- staging
- production

Staging must fail fast if required variables are missing.

### 2. Add deployment documentation

Document:

- Firebase project
- Google Cloud project
- Cloud Run / App Hosting choice
- secrets
- service accounts
- deployment steps

### 3. Prepare runtime configuration

Ensure:

- no secrets committed
- public env vars are safe
- server-only vars stay server-only
- health endpoint works

## Tim / Cloud Infrastructure Tasks

### Verify APIs

```bash
gcloud config set project matchpulse-staging-da54c

gcloud services list --enabled | grep -E "run|cloudbuild|secretmanager|firestore|firebase|artifactregistry"
```

### Verify secrets

```bash
gcloud secrets list
```

Expected:

```text
OPENAI_API_KEY
SPORTS_PROVIDER_API_KEY
CRON_SECRET
```

Optional:

```text
NEWS_API_KEY
GNEWS_API_KEY
```

### Create runtime service account

```bash
gcloud iam service-accounts create matchpulse-runtime \
  --display-name="MatchPulse Runtime Service Account"
```

### IAM principle

Grant least privilege only:

- Firestore access
- Secret Manager Secret Accessor
- Logging Writer

Do not grant Owner.

## Acceptance Criteria

- App can be deployed to staging.
- Staging config is reproducible.
- Secrets are read from Secret Manager where applicable.
- Health endpoint works in staging.
- No production project is required yet.

## Out of Scope

- Production deployment
- autoscaling optimization
- Cloud Run Jobs
- CDN tuning

---

# Sprint 13: Ads, Consent, and Legal Basics

## Product Goal

Prepare the app for a public MVP without unnecessary compliance risk.

## Codex Tasks

- privacy page
- imprint page
- terms page
- provider attribution page
- cookie/consent placeholder
- ad slot placeholders
- no-betting positioning copy
- no cash prize / no wagering language

Do not enable real ads until consent and policy are reviewed.

## Tim / Cloud Infrastructure Tasks

- No AdSense required yet.
- If planning ads, start reviewing:
  - Google AdSense
  - consent management
  - German/EU legal requirements
- Consider legal review before public launch.

## Acceptance Criteria

- Legal pages exist.
- Provider attribution is visible where needed.
- No unlicensed logos or marks are shipped.
- No gambling-style monetization is introduced.
- Ads are not shown without a consent strategy.

## Out of Scope

- Paid premium plan
- subscription billing
- app store in-app purchases
- real ad network integration

---

# Recommended Execution Summary

## Immediate Next Sprints

```text
Sprint 6.4 -> stabilize scoring and leaderboard tests
Sprint 6.5 -> preferences and dashboard
Sprint 7   -> team pages
```

## Content Work

```text
Sprint 8 -> content/news strategy documentation
Sprint 9 -> minimal metadata-only news feed
```

## Differentiation Layer

```text
Sprint 10 -> AI match insights
Sprint 11 -> tournament simulator
```

## Operationalization

```text
Sprint 12 -> staging deployment
Sprint 13 -> ads, consent, legal basics
```

## What Tim Should Not Do Yet

- Do not buy a production sports data API yet.
- Do not buy or configure a news API for production yet.
- Do not create production Firebase/GCP project yet.
- Do not manually create Cloud Run services until deployment is defined in repo.
- Do not enable ads yet.
- Do not start App Store / Capacitor packaging yet.

## What Codex Should Not Do Yet

- Do not implement global leaderboard.
- Do not implement AI insights before team/reference data is useful.
- Do not implement news before the metadata-only strategy is documented.
- Do not scrape sources.
- Do not introduce provider payloads directly into UI.
- Do not weaken Firestore rules.
