export type SportsDataProviderId = "sportmonks" | "api-football" | "football-data-org" | "mock";

export type MatchStatus =
  | "SCHEDULED"
  | "LINEUPS_PENDING"
  | "LIVE"
  | "HALFTIME"
  | "FINISHED"
  | "CORRECTED"
  | "POSTPONED"
  | "CANCELLED"
  | "ABANDONED"
  | "VOID";

export type TeamLifecycleStatus = "confirmed" | "placeholder" | "eliminated";

export type SquadLifecycleStatus = "unknown" | "provisional" | "final" | "updated";

export type PlayerLifecycleStatus = "active" | "replaced" | "withdrawn" | "injured";

export type MatchLifecycleStatus =
  | "scheduled"
  | "live"
  | "finished"
  | "corrected"
  | "postponed"
  | "cancelled"
  | "abandoned"
  | "void";

export type BracketNodeLifecycleStatus = "unresolved" | "scheduled" | "live" | "finished";

export type TournamentStage =
  | "group"
  | "round-of-32"
  | "round-of-16"
  | "quarter-final"
  | "semi-final"
  | "third-place"
  | "final";

export type ReferenceDataVisibility = "draft" | "published" | "archived";

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
  status?: TeamLifecycleStatus;
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
  lifecycleStatus?: MatchLifecycleStatus;
  stage: string;
  groupCode?: string;
  venue?: NormalizedVenue;
  score: MatchScore;
  provider: ProviderMetadata;
  freshness: FreshnessMetadata;
  updatedAt: string;
};

export type TournamentGroup = {
  id: string;
  competitionId: string;
  seasonId: string;
  code: string;
  name: string;
  teamIds: string[];
  sortOrder: number;
  visibility: ReferenceDataVisibility;
  provider?: ProviderMetadata;
  freshness?: FreshnessMetadata;
  updatedAt: string;
};

export type Player = {
  id: string;
  competitionId: string;
  seasonId: string;
  teamId: string;
  displayName: string;
  countryCode: string | null;
  position: "goalkeeper" | "defender" | "midfielder" | "forward" | "unknown";
  shirtNumber: number | null;
  status: PlayerLifecycleStatus;
  provider?: ProviderMetadata;
  freshness?: FreshnessMetadata;
  updatedAt: string;
};

export type Squad = {
  id: string;
  competitionId: string;
  seasonId: string;
  teamId: string;
  status: SquadLifecycleStatus;
  playerIds: string[];
  publishedAt: string | null;
  provider?: ProviderMetadata;
  freshness?: FreshnessMetadata;
  updatedAt: string;
};

export type BracketNode = {
  id: string;
  competitionId: string;
  seasonId: string;
  stage: TournamentStage;
  matchId: string | null;
  status: BracketNodeLifecycleStatus;
  sortOrder: number;
  homeSource: BracketParticipantSource;
  awaySource: BracketParticipantSource;
  winnerTargetNodeId: string | null;
  loserTargetNodeId: string | null;
  provider?: ProviderMetadata;
  freshness?: FreshnessMetadata;
  updatedAt: string;
};

export type BracketParticipantSource =
  | {
      type: "team";
      teamId: string;
    }
  | {
      type: "group-rank";
      groupId: string;
      rank: number;
    }
  | {
      type: "best-third";
      slot: number;
    }
  | {
      type: "winner";
      bracketNodeId: string;
    }
  | {
      type: "loser";
      bracketNodeId: string;
    }
  | {
      type: "placeholder";
      label: string;
    };

export type NormalizedSportsDataBatch = {
  competition: NormalizedCompetition;
  season: NormalizedSeason;
  tournamentGroups?: TournamentGroup[];
  teams: NormalizedTeam[];
  matches: NormalizedMatch[];
  squads?: Squad[];
  players?: Player[];
  bracketNodes?: BracketNode[];
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
