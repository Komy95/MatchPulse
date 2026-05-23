import type {
  NormalizedMatch,
  NormalizedSportsDataBatch,
  SportsDataIngestionRequest,
  SportsDataProviderId,
} from "@/lib/sports-data/domain";

export interface SportsDataProvider {
  readonly id: SportsDataProviderId;
  fetchCompetitionSeason(
    request: SportsDataIngestionRequest,
  ): Promise<NormalizedSportsDataBatch>;
  fetchLiveMatches(request: SportsDataIngestionRequest): Promise<NormalizedMatch[]>;
  fetchMatchDetails(
    request: SportsDataIngestionRequest,
    externalMatchId: string,
  ): Promise<NormalizedMatch>;
}

export class ProviderDataError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "ProviderDataError";
  }
}
