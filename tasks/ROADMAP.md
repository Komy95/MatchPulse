# Delivery Roadmap

This roadmap is documentation guidance only. Do not create implementation files, install dependencies, or scaffold Firebase/GCP configuration during documentation-only tasks.

## Build Sequence

1. **Firebase/GCP foundation**
2. **Data abstraction**
3. **Private groups**
4. **Preferences and dashboard**
5. **Predictions and leaderboards**
6. **Team pages**
7. **AI insights**
8. **Tournament simulator**
9. **Ads, consent, and compliance**

## Phase Overview

| Phase | Outcome | Future implementation areas |
|---|---|---|
| Firebase/GCP foundation | Working app shell, Firebase Auth, Firestore model, local emulators, Cloud Run-compatible runtime | `app/`, auth modules, Firestore docs/rules/indexes, env templates |
| Data abstraction | One canonical sports-data interface and Cloud Run Job ingestion plan | provider modules, ingestion jobs |
| Private groups | Create and join pools with Firestore-backed membership | group API routes, group components, security rules |
| Preferences and dashboard | Signed-in command center with next locks, picks, news, rank, insights, simulator shortcut | dashboard route, preference routes, news panels |
| Predictions | Prediction entry and locking | prediction domain, prediction components |
| Leaderboards | Private group and global scoring/ranking | scoring domain, Cloud Run scoring jobs |
| Team pages | Context pages from cached Firestore data | team routes and team domain |
| AI insights | Schema-bound explanations stored in Firestore | insight domain, OpenAI integration, refresh jobs |
| Simulator | Public and custom probability runs stored in Firestore | simulator domain, simulation jobs |
| Commercial hardening | Ads, consent, attribution, legal pages | ad components, privacy pages, consent model |

## Sprint 1: Firebase/GCP Foundation

Future implementation should establish:

- Next.js 15 App Router.
- TypeScript.
- Tailwind CSS.
- Firebase client SDK setup.
- Firebase Admin SDK server setup.
- Firestore emulator setup.
- Firebase Auth emulator setup.
- Initial Firestore data model.
- Initial Firestore Security Rules.
- Initial Firestore index definitions based on implemented queries.
- Cloud Run-compatible project structure.
- Environment variable templates based on `templates/env.example`.
- Local development documentation.
- Staging and production Firebase/GCP project separation.

Do not create these files during documentation-only work. This sprint describes future implementation.

## Sprint 2: Data Abstraction

Future implementation should establish:

- Provider interface for Sportmonks, API-Football, and football-data.org.
- Normalized team and match shapes.
- Idempotent ingestion design for Cloud Run Jobs.
- Firestore write model for competitions, seasons, teams, matches, and freshness metadata.
- Pub/Sub event plan for provider updates.

## Sprint 3: Private Groups

Future implementation should establish:

- Group create route.
- Invite generation and join route.
- Firestore membership model.
- Owner/admin/member roles.
- Group settings validation.
- Firestore Security Rules for member reads.
- Server-side validation for admin writes.

## Sprint 4: Preferences and Dashboard

Future implementation should establish:

- Profile preference setup.
- Favorite/followed team selection.
- Personalized news preferences.
- Dashboard data aggregation.
- Next action priority model.
- Dashboard modules for picks, locks, standings, global rank, news, insights, and simulator.

## Sprint 5: Predictions and Leaderboards

Future implementation should establish:

- Bulk prediction upsert through Cloud Run route handlers.
- UTC lock enforcement.
- Prediction revision history.
- Hybrid 3-2-1 scoring.
- Private group leaderboard snapshots.
- Global leaderboard snapshots for opted-in users.
- Cloud Run scoring jobs triggered by final match updates.

## Sprint 6: Team Pages and AI Insights

Future implementation should establish:

- Team page read models.
- Team metric snapshots.
- Match insight evidence builder.
- OpenAI Structured Outputs integration through server runtime.
- Insight schema validation.
- Firestore insight caching and invalidation.
- Cloud Run insight refresh jobs.

## Sprint 7: Tournament Simulator

Future implementation should establish:

- Elo-informed independent Poisson model.
- FIFA World Cup 2026 format engine.
- Public simulation Cloud Run Job.
- Authenticated custom simulation route or queued job.
- Firestore simulation run storage.
- Simulator dashboard/team page links.

## Sprint 8: Ads, Consent, and Compliance

Future implementation should establish:

- Consent-aware ads.
- Privacy policy, terms, imprint, data attribution, and cookie settings.
- Provider attribution.
- No unlicensed logos or FIFA marks.
- No betting, paid entry, cash prizes, or gambling-style monetization.

## MVP Release Criteria

- Users can create and join private groups.
- Users can submit and edit predictions before lock.
- Predictions are locked at kickoff using UTC.
- Final scores trigger scoring.
- Private leaderboards are visible to active group members.
- Global leaderboard includes only eligible/opted-in public display data.
- Dashboard shows next locks, unfinished picks, private standings, global rank, personalized news, match insights, and simulator entry point.
- Team pages load with freshness metadata.
- AI insight cards validate against schema.
- Public simulator returns World Cup 2026 stage probabilities.
- Consent-aware ads can be enabled.
- No unlicensed logos are shipped.
