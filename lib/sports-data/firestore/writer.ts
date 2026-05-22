import { getFirebaseAdminFirestore } from "@/lib/firebase/admin";
import type {
  NormalizedMatch,
  NormalizedSportsDataBatch,
  NormalizedTeam,
  SportsDataIngestionSummary,
} from "@/lib/sports-data/domain";

export interface SportsDataWriter {
  upsertSportsDataBatch(batch: NormalizedSportsDataBatch): Promise<SportsDataIngestionSummary>;
}

export class FirestoreSportsDataWriter implements SportsDataWriter {
  async upsertSportsDataBatch(
    batch: NormalizedSportsDataBatch,
  ): Promise<SportsDataIngestionSummary> {
    const firestore = getFirebaseAdminFirestore();
    const competitionRef = firestore.collection("competitions").doc(batch.competition.id);
    const seasonRef = competitionRef.collection("seasons").doc(batch.season.id);
    const writeBatch = firestore.batch();

    writeBatch.set(competitionRef, toCompetitionFirestore(batch), { merge: true });
    writeBatch.set(seasonRef, toSeasonFirestore(batch), { merge: true });

    for (const team of batch.teams) {
      writeBatch.set(seasonRef.collection("teams").doc(team.id), toTeamFirestore(team), {
        merge: true,
      });
    }

    for (const match of batch.matches) {
      writeBatch.set(seasonRef.collection("matches").doc(match.id), toMatchFirestore(match), {
        merge: true,
      });
    }

    await writeBatch.commit();

    return summarizeBatch(batch);
  }
}

export function summarizeBatch(batch: NormalizedSportsDataBatch): SportsDataIngestionSummary {
  return {
    providerId: batch.freshness.providerId,
    competitionId: batch.competition.id,
    seasonId: batch.season.id,
    teamsUpserted: batch.teams.length,
    matchesUpserted: batch.matches.length,
    finalMatches: batch.matches.filter((match) => match.status === "FINISHED").length,
    fetchedAt: batch.fetchedAt,
  };
}

function toCompetitionFirestore(batch: NormalizedSportsDataBatch) {
  return {
    name: batch.competition.name,
    countryCode: batch.competition.countryCode,
    provider: batch.competition.provider,
    freshness: batch.competition.freshness,
    updatedAt: batch.competition.updatedAt,
  };
}

function toSeasonFirestore(batch: NormalizedSportsDataBatch) {
  return {
    competitionId: batch.season.competitionId,
    label: batch.season.label,
    startsAt: batch.season.startsAt,
    endsAt: batch.season.endsAt,
    provider: batch.season.provider,
    freshness: batch.season.freshness,
    lastIngestedAt: batch.fetchedAt,
    updatedAt: batch.season.updatedAt,
    teamCount: batch.teams.length,
    matchCount: batch.matches.length,
    finalMatchCount: batch.matches.filter((match) => match.status === "FINISHED").length,
  };
}

function toTeamFirestore(team: NormalizedTeam) {
  return {
    competitionId: team.competitionId,
    seasonId: team.seasonId,
    name: team.name,
    shortName: team.shortName,
    countryCode: team.countryCode,
    groupCode: team.groupCode ?? null,
    provider: team.provider,
    freshness: team.freshness,
    updatedAt: team.updatedAt,
  };
}

function toMatchFirestore(match: NormalizedMatch) {
  return {
    competitionId: match.competitionId,
    seasonId: match.seasonId,
    homeTeamId: match.homeTeamId,
    awayTeamId: match.awayTeamId,
    kickoffAt: match.kickoffAt,
    lockAt: match.lockAt,
    status: match.status,
    stage: match.stage,
    groupCode: match.groupCode ?? null,
    venue: match.venue ?? null,
    score: match.score,
    provider: match.provider,
    freshness: match.freshness,
    updatedAt: match.updatedAt,
  };
}
