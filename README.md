# MatchPulse AI World Cup Prediction App

MatchPulse is a web-first, friendly football prediction app for the FIFA World Cup 2026. The product focuses on private pools for friends, family, and office groups, supported by explainable AI match insights, useful team pages, personalized team news, a global leaderboard, and a transparent tournament simulator.

## Product positioning

Build this as a **World-Cup-first private prediction app**, not a generic tipping clone.

Core value proposition:

> A private, ad-supported World Cup prediction app for friends and family that combines picks, leaderboards, explainable AI match insights, rich team pages, and a transparent tournament simulator.

## MVP priorities

1. **Private groups, invites, predictions, and leaderboards**
2. **Team pages with cached structured football data**
3. **Explainable AI match insight cards**
4. **Tournament simulation for World Cup 2026**
5. **Ads, consent, attribution, and premium no-ads**

## Recommended stack

- **Frontend:** Next.js 15 App Router, TypeScript, Tailwind
- **Backend:** Next.js Route Handlers on Cloud Run
- **Auth:** Firebase Auth
- **Database:** Cloud Firestore
- **Security:** Firestore Security Rules plus server-side Cloud Run validation
- **Jobs:** Cloud Run Jobs triggered by Cloud Scheduler and Pub/Sub
- **Secrets:** Secret Manager
- **Observability:** Cloud Logging and Error Reporting
- **AI:** OpenAI Structured Outputs for schema-bound insight cards
- **Data providers:** Sportmonks or API-Football as primary provider, football-data.org as fallback

## Repository docs

Start with these files:

- `AGENTS.md` for universal coding-agent instructions
- `docs/PRD.md` for product scope and user stories
- `docs/ARCHITECTURE.md` for technical architecture
- `docs/API-SPECS.md` for route contracts
- `docs/FIRESTORE-DATA-MODEL.md` for Firestore data model direction
- `docs/FIREBASE-SECURITY-RULES.md` for conceptual access-control behavior
- `docs/GOOGLE-CLOUD-ARCHITECTURE.md` for deployment architecture
- `docs/DEPLOYMENT.md` for deployment strategy
- `docs/AI-INSIGHTS.md` for prompt/schema strategy
- `docs/SIMULATOR.md` for model and simulation logic
- `tasks/ROADMAP.md` for implementation order
- `skills/*/SKILL.md` for reusable AI-agent workflows
