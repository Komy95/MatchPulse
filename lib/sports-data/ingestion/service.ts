import type {
  SportsDataIngestionRequest,
  SportsDataIngestionSummary,
} from "@/lib/sports-data/domain";
import type { SportsDataWriter } from "@/lib/sports-data/firestore/writer";
import type { SportsDataProvider } from "@/lib/sports-data/providers/types";

export async function ingestCompetitionSeason({
  provider,
  writer,
  request,
}: {
  provider: SportsDataProvider;
  writer: SportsDataWriter;
  request: SportsDataIngestionRequest;
}): Promise<SportsDataIngestionSummary> {
  const batch = await provider.fetchCompetitionSeason(request);

  validateBatchScope(batch, request);

  return writer.upsertSportsDataBatch(batch);
}

function validateBatchScope(
  batch: Awaited<ReturnType<SportsDataProvider["fetchCompetitionSeason"]>>,
  request: SportsDataIngestionRequest,
) {
  if (batch.competition.id !== request.competitionId) {
    throw new Error("Provider returned a competition outside the requested scope.");
  }

  if (batch.season.id !== request.seasonId) {
    throw new Error("Provider returned a season outside the requested scope.");
  }

  for (const team of batch.teams) {
    if (team.competitionId !== request.competitionId || team.seasonId !== request.seasonId) {
      throw new Error("Provider returned a team outside the requested scope.");
    }
  }

  for (const match of batch.matches) {
    if (match.competitionId !== request.competitionId || match.seasonId !== request.seasonId) {
      throw new Error("Provider returned a match outside the requested scope.");
    }
  }
}
