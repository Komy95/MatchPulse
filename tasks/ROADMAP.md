# Delivery Roadmap

## Build sequence

1. **Foundation**
2. **Data abstraction**
3. **Private groups**
4. **Predictions and leaderboards**
5. **Team pages**
6. **AI insights**
7. **Tournament simulator**
8. **Ads, consent, and compliance**

## Phase overview

| Phase | Outcome | Primary files |
|---|---|---|
| Foundation | Working app shell, auth, schema, RLS | `app/`, `lib/auth/`, `supabase/migrations/` |
| Data abstraction | One canonical sports-data interface | `lib/providers/`, `supabase/functions/ingest-*` |
| Private groups | Create and join pools | `app/api/v1/groups/*`, `components/groups/*` |
| Predictions | Prediction entry and locking | `lib/predictions/`, `components/predictions/*` |
| Leaderboards | Scoring and ranking | `lib/scoring/`, `jobs/recalcLeaderboard.ts` |
| Team pages | Context pages from cached data | `app/teams/[teamId]/page.tsx`, `lib/teams/*` |
| AI insights | Schema-bound explanations | `lib/insights/*` |
| Simulator | Public and custom probability runs | `lib/simulator/*`, `workers/simulateTournament.ts` |
| Commercial hardening | Ads, consent, attribution | `components/ads/*`, `app/privacy/page.tsx` |

## MVP release criteria

- Users can create and join private groups.
- Users can submit and edit predictions before lock.
- Predictions are locked at kickoff using UTC.
- Final scores trigger scoring.
- Leaderboards are visible to active group members.
- Team pages load with freshness metadata.
- AI insight cards validate against schema.
- Public simulator returns World Cup 2026 stage probabilities.
- Consent-aware ads can be enabled.
- No unlicensed logos are shipped.
