# Data Providers

## Provider strategy

Use a provider abstraction so sports-data vendors can be swapped without rewriting the app.

Primary production candidates:

- Sportmonks
- API-Football

Fallback / secondary candidate:

- football-data.org

Use official FIFA pages only as verification anchors unless explicit content/feed rights are confirmed.

## Provider abstraction

```ts
export type NormalizedTeam = {
  provider: string;
  providerId: string;
  name: string;
  shortName?: string;
  countryCode?: string;
  fifaCode?: string;
};

export type NormalizedMatch = {
  provider: string;
  providerId: string;
  competitionCode: string;
  seasonLabel: string;
  homeTeamProviderId: string;
  awayTeamProviderId: string;
  kickoffAt: string;
  status: string;
  stage?: string;
  groupCode?: string;
  venue?: string;
  city?: string;
  homeScore90?: number;
  awayScore90?: number;
  providerUpdatedAt?: string;
};

export interface SportsProvider {
  getCompetition(code: string): Promise<unknown>;
  listTeams(params: { competitionCode: string; seasonLabel: string }): Promise<NormalizedTeam[]>;
  listMatches(params: { competitionCode: string; seasonLabel: string }): Promise<NormalizedMatch[]>;
  getMatch(providerId: string): Promise<NormalizedMatch>;
}
```

## Source-use rules

- Use licensed provider data for product-rendered fixture, team, and stats content.
- Attribute where the provider requires it.
- Do not assume team logos are covered by fixture-data rights.
- Do not scrape or republish FIFA-owned content as the canonical data source.
- Do not resell raw third-party data.
- Store provider IDs and freshness timestamps for all normalized records.

## Implementation files

```text
lib/providers/
  base.ts
  normalize.ts
  sportmonks.ts
  apiFootball.ts
  footballData.ts
  providerFactory.ts
supabase/functions/
  ingest-fixtures/
  ingest-team-metrics/
```

## Provider acceptance tests

- Each provider adapter returns the same normalized match shape.
- Provider-specific fields do not leak into UI components.
- Missing optional fields are handled safely.
- Provider freshness is stored.
- Ingestion is idempotent.
- Duplicate teams and matches are not created on repeated ingestion.
