import { getFirebaseAdminFirestore } from "@/lib/firebase/admin";
import { eventBus } from "@/lib/events";
import type {
  MatchStatus,
  NormalizedMatch,
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

export async function ingestLiveUpdates({
  provider,
  writer,
  request,
}: {
  provider: SportsDataProvider;
  writer: SportsDataWriter;
  request: SportsDataIngestionRequest;
}) {
  const liveMatches = await provider.fetchLiveMatches(request);

  validateMatchScope(liveMatches, request);

  const previousStatuses = await fetchCurrentMatchStatuses(liveMatches);

  await writer.upsertMatchUpdates(liveMatches);

  let finishedEventsPublished = 0;

  for (const match of liveMatches) {
    const previousStatus = previousStatuses.get(match.id);

    if (match.status === "FINISHED" && previousStatus !== "FINISHED") {
      eventBus.emit("match-finished", {
        competitionId: match.competitionId,
        seasonId: match.seasonId,
        matchId: match.id,
      });
      finishedEventsPublished += 1;
    }
  }

  return {
    providerId: provider.id,
    competitionId: request.competitionId,
    seasonId: request.seasonId,
    matchesUpserted: liveMatches.length,
    finishedEventsPublished,
  };
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

function validateMatchScope(matches: NormalizedMatch[], request: SportsDataIngestionRequest) {
  for (const match of matches) {
    if (match.competitionId !== request.competitionId || match.seasonId !== request.seasonId) {
      throw new Error("Provider returned a live match outside the requested scope.");
    }
  }
}

async function fetchCurrentMatchStatuses(matches: NormalizedMatch[]): Promise<Map<string, MatchStatus>> {
  if (matches.length === 0) {
    return new Map();
  }

  const firestore = getFirebaseAdminFirestore();
  const refs = matches.map((match) =>
    firestore
      .collection("competitions")
      .doc(match.competitionId)
      .collection("seasons")
      .doc(match.seasonId)
      .collection("matches")
      .doc(match.id),
  );
  const snapshots = await firestore.getAll(...refs);
  const statuses = new Map<string, MatchStatus>();

  snapshots.forEach((snapshot, index) => {
    const status = snapshot.data()?.status;

    if (snapshot.exists && typeof status === "string") {
      statuses.set(matches[index].id, status as MatchStatus);
    }
  });

  return statuses;
}
