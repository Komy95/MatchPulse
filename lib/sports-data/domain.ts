export type SportsDataProviderId = "sportmonks" | "api-football" | "football-data-org" | "mock";

export type MatchStatus =
  | "SCHEDULED"
  | "LINEUPS_PENDING"
  | "LIVE"
  | "HALFTIME"
  | "FINISHED"
  | "POSTPONED"
  | "CANCELLED"
  | "ABANDONED";

export type ProviderMetadata = {
  providerId: SportsDataProviderId;
  externalId: string;
  sourceName: string;
  sourceUrl?: string;
  fetchedAt: string;
  providerUpdatedAt?: string;
};

export type FreshnessMetadata = {
  providerId: SportsDataProviderId;
  fetchedAt: string;
  providerUpdatedAt?: string;
  staleAfter: string;
};

export type NormalizedCompetition = {
  id: string;
  name: string;
  countryCode: string | null;
  provider: ProviderMetadata;
  freshness: FreshnessMetadata;
  updatedAt: string;
};

export type NormalizedSeason = {
  id: string;
  competitionId: string;
  label: string;
  startsAt: string;
  endsAt: string;
  provider: ProviderMetadata;
  freshness: FreshnessMetadata;
  updatedAt: string;
};

export type NormalizedTeam = {
  id: string;
  competitionId: string;
  seasonId: string;
  name: string;
  shortName: string;
  countryCode: string | null;
  groupCode?: string;
  provider: ProviderMetadata;
  freshness: FreshnessMetadata;
  updatedAt: string;
};

export type NormalizedVenue = {
  name: string;
  city?: string;
  countryCode?: string;
};

export type MatchScore = {
  homeScore90: number | null;
  awayScore90: number | null;
  homeScoreFinal: number | null;
  awayScoreFinal: number | null;
};

export type NormalizedMatch = {
  id: string;
  competitionId: string;
  seasonId: string;
  homeTeamId: string;
  awayTeamId: string;
  kickoffAt: string;
  lockAt: string;
  status: MatchStatus;
  stage: string;
  groupCode?: string;
  venue?: NormalizedVenue;
  score: MatchScore;
  provider: ProviderMetadata;
  freshness: FreshnessMetadata;
  updatedAt: string;
};

export type NormalizedSportsDataBatch = {
  competition: NormalizedCompetition;
  season: NormalizedSeason;
  teams: NormalizedTeam[];
  matches: NormalizedMatch[];
  fetchedAt: string;
  freshness: FreshnessMetadata;
};

export type SportsDataIngestionRequest = {
  competitionId: string;
  seasonId: string;
};

export type SportsDataIngestionSummary = {
  providerId: SportsDataProviderId;
  competitionId: string;
  seasonId: string;
  teamsUpserted: number;
  matchesUpserted: number;
  finalMatches: number;
  fetchedAt: string;
};
