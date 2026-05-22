import type {
  NormalizedSportsDataBatch,
  SportsDataIngestionRequest,
  SportsDataProviderId,
} from "@/lib/sports-data/domain";

export interface SportsDataProvider {
  readonly id: SportsDataProviderId;
  fetchCompetitionSeason(
    request: SportsDataIngestionRequest,
  ): Promise<NormalizedSportsDataBatch>;
}

export class ProviderDataError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "ProviderDataError";
  }
}
