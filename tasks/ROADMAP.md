# Delivery Roadmap

This roadmap is documentation guidance only. Do not create implementation files, install dependencies, or scaffold Firebase/GCP configuration during documentation-only tasks.

## Build Sequence

1. **Firebase/GCP foundation**
2. **Mobile/PWA strategy and readiness**
3. **Design-system documentation**
4. **Data abstraction**
5. **Private groups**
6. **Preferences and dashboard**
7. **Predictions and leaderboards**
8. **Team pages**
9. **AI insights**
10. **Tournament simulator**
11. **Ads, consent, and compliance**

## Phase Overview

| Phase | Outcome | Future implementation areas |
|---|---|---|
| Firebase/GCP foundation | Working app shell, Firebase Auth, Firestore model, local emulators, Cloud Run-compatible runtime | `app/`, auth modules, Firestore docs/rules/indexes, env templates |
| Mobile/PWA strategy and readiness | Mobile-first PWA requirements, installability plan, caching boundaries, native post-MVP guardrails, future Capacitor distribution decision | `docs/MOBILE-APP-STRATEGY.md`, `docs/PWA-REQUIREMENTS.md`, `docs/NATIVE-APP-ROADMAP.md` |
| Design-system documentation | Visual direction, screen principles, color usage, spacing, typography, cards, forms, motion, accessibility | `docs/DESIGN-PHILOSOPHY.md`, UX docs |
| Data abstraction | One canonical sports-data interface and Cloud Run Job ingestion plan | provider modules, ingestion jobs |
| Private groups | Create and join pools with Firestore-backed membership | group API routes, group components, security rules |
| Preferences and dashboard | Signed-in command center with next locks, picks, news, rank, insights, simulator shortcut | dashboard route, preference routes, news panels |
| Predictions | Prediction entry and locking | prediction domain, prediction components |
| Leaderboards | Private group and global scoring/ranking | scoring domain, Cloud Run scoring jobs |
| Team pages | Context pages from cached Firestore data | team routes and team domain |
| AI insights | Schema-bound explanations stored in Firestore | insight domain, OpenAI integration, refresh jobs |
| Simulator | Public and custom probability runs stored in Firestore | simulator domain, simulation jobs |
| Commercial hardening | Ads, consent, attribution, legal pages | ad components, privacy pages, consent model |

## Sprint 1: Technical Foundation

Implemented foundation:

- Next.js 15 App Router.
- TypeScript strict mode.
- Tailwind CSS.
- Firebase client SDK setup.
- Firebase Admin SDK server setup.
- Firestore emulator setup.
- Firebase Auth emulator setup.
- Initial Firestore Security Rules.
- Cloud Run-compatible project structure.
- Environment variable templates based on `templates/env.example`.
- Local development documentation.
- Basic app shell and health endpoint.

Still deferred:

- Firestore index definitions beyond implemented query needs.
- PWA manifest/service worker.
- Production Firebase/GCP project setup.

## Mobile/PWA Prerequisite

Before Sprint 1 implementation, future work must use `docs/MOBILE-APP-STRATEGY.md` and `docs/PWA-REQUIREMENTS.md` to confirm:

- MatchPulse launches as a mobile-first PWA.
- The MVP should feel like a premium iPhone app.
- Desktop is responsive support, not the primary design target.
- Native iOS/Android packaging is post-MVP.
- Capacitor wrapper is post-MVP / Phase 2.
- Fully native Swift/Kotlin is out of scope unless traction or platform requirements justify it.
- PWA installability is planned without creating native app files.
- Public data caching has freshness metadata.
- Private predictions, private group data, auth-sensitive data, and live match data are not aggressively cached.
- Push notifications are deferred in Sprint 1 and MVP.
- Install guidance uses soft education after activation, not blocking first-visit popups.

## Design-System Documentation Prerequisite

Before implementing UI screens or components, future implementation work must use `docs/DESIGN-PHILOSOPHY.md` as the visual source of truth.

Required before UI implementation:

- Confirm the design direction: Apple-like clarity meets World Cup energy.
- Confirm the color usage rules.
- Confirm mobile-first layout rules.
- Confirm card, button, form, empty state, loading state, motion, and accessibility guidance.
- Confirm no betting/casino visual patterns, generic fantasy sports clutter, or unlicensed FIFA/team assets.

## Sprint 2: Auth, Profile Bootstrap, and Session Hardening

Implemented:

- Firebase Auth client flow.
- Google sign-in as MVP default.
- Email/password sign-in as local/test fallback.
- Server-managed Firebase session cookies through `/api/auth/session`.
- Server-side logout through `/api/auth/logout`.
- Protected dashboard route.
- `users/{uid}` profile bootstrap from verified Firebase token.
- User-owned profile preference updates.
- Conservative profile-focused Firestore rules.

## Sprint 3: Reusable Groups, Group Seasons, and Invites

Implemented:

- Reusable `groups/{groupId}` social container.
- Group members under `groups/{groupId}/members/{userId}`.
- Initial FIFA World Cup 2026 group season under `groups/{groupId}/seasons/{groupSeasonId}`.
- Season-scoped invites under `groups/{groupId}/seasons/{groupSeasonId}/invites/{inviteId}`.
- Server-only invite code registry under `inviteCodes/{code}`.
- REST routes for group create/list/detail, group seasons, invite creation, and join by code.
- Member-gated Firestore reads and server-only group/member/season/invite mutations.
- Mobile-first dashboard, create group, group detail, invite, and join screens.

## Stabilization: Sprint 1-3 Foundation

Current stabilization pass:

- Align documentation with the implemented Firebase/Auth/Groups architecture.
- Make group-season scoping canonical for future predictions and leaderboards.
- Harden invite code uniqueness, member-count behavior, and rejoin rules.
- Strengthen local vs staging/production environment validation.
- Add lightweight validation coverage and documented emulator checks.

## Sprint 4: Data Abstraction

Future implementation should establish:

- Provider interface for Sportmonks, API-Football, and football-data.org.
- Normalized team and match shapes.
- Idempotent ingestion design for Cloud Run Jobs.
- Firestore write model for competitions, seasons, teams, matches, and freshness metadata.
- Pub/Sub event plan for provider updates.

## Sprint 5: Preferences and Dashboard

Future implementation should establish:

- Profile preference setup.
- Favorite/followed team selection.
- Personalized news preferences.
- Dashboard data aggregation.
- Next action priority model.
- Dashboard modules for picks, locks, standings, global rank, news, insights, and simulator.

## Sprint 6: Predictions and Leaderboards

Future implementation should establish:

- Bulk prediction upsert through Cloud Run route handlers.
- Prediction documents under `groups/{groupId}/seasons/{groupSeasonId}/predictions`.
- UTC lock enforcement.
- Prediction revision history.
- Hybrid 3-2-1 scoring.
- Private group-season leaderboard snapshots.
- Global leaderboard snapshots for opted-in users.
- Cloud Run scoring jobs triggered by final match updates.

## Sprint 7: Team Pages and AI Insights

Future implementation should establish:

- Team page read models.
- Team metric snapshots.
- Match insight evidence builder.
- OpenAI Structured Outputs integration through server runtime.
- Insight schema validation.
- Firestore insight caching and invalidation.
- Cloud Run insight refresh jobs.

## Sprint 8: Tournament Simulator

Future implementation should establish:

- Elo-informed independent Poisson model.
- FIFA World Cup 2026 format engine.
- Public simulation Cloud Run Job.
- Authenticated custom simulation route or queued job.
- Firestore simulation run storage.
- Simulator dashboard/team page links.

## Sprint 9: Ads, Consent, and Compliance

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
