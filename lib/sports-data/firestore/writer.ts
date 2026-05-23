import { getFirebaseAdminFirestore } from "@/lib/firebase/admin";
import type {
  BracketNode,
  NormalizedMatch,
  NormalizedSportsDataBatch,
  NormalizedTeam,
  Player,
  Squad,
  SportsDataIngestionSummary,
  TournamentGroup,
} from "@/lib/sports-data/domain";
import {
  matchLifecycleStatusFromMatchStatus,
  validateTournamentReferenceData,
} from "@/lib/sports-data/validation";

export interface SportsDataWriter {
  upsertSportsDataBatch(batch: NormalizedSportsDataBatch): Promise<SportsDataIngestionSummary>;
  upsertMatchUpdates(matches: NormalizedMatch[]): Promise<void>;
}

export class FirestoreSportsDataWriter implements SportsDataWriter {
  async upsertSportsDataBatch(
    batch: NormalizedSportsDataBatch,
  ): Promise<SportsDataIngestionSummary> {
    validateTournamentReferenceData({
      season: batch.season,
      tournamentGroups: batch.tournamentGroups,
      teams: batch.teams,
      matches: batch.matches,
      squads: batch.squads,
      players: batch.players,
      bracketNodes: batch.bracketNodes,
    });

    const firestore = getFirebaseAdminFirestore();
    const competitionRef = firestore.collection("competitions").doc(batch.competition.id);
    const seasonRef = competitionRef.collection("seasons").doc(batch.season.id);
    const writeBatch = firestore.batch();

    writeBatch.set(competitionRef, toCompetitionFirestore(batch), { merge: true });
    writeBatch.set(seasonRef, toSeasonFirestore(batch), { merge: true });

    for (const group of batch.tournamentGroups ?? []) {
      writeBatch.set(seasonRef.collection("tournamentGroups").doc(group.id), toTournamentGroupFirestore(group), {
        merge: true,
      });
    }

    for (const team of batch.teams) {
      writeBatch.set(seasonRef.collection("teams").doc(team.id), toTeamFirestore(team), {
        merge: true,
      });
    }

    for (const player of batch.players ?? []) {
      writeBatch.set(seasonRef.collection("players").doc(player.id), toPlayerFirestore(player), {
        merge: true,
      });
    }

    for (const squad of batch.squads ?? []) {
      writeBatch.set(seasonRef.collection("squads").doc(squad.id), toSquadFirestore(squad), {
        merge: true,
      });
    }

    for (const match of batch.matches) {
      writeBatch.set(seasonRef.collection("matches").doc(match.id), toMatchFirestore(match), {
        merge: true,
      });
    }

    for (const node of batch.bracketNodes ?? []) {
      writeBatch.set(seasonRef.collection("bracketNodes").doc(node.id), toBracketNodeFirestore(node), {
        merge: true,
      });
    }

    await writeBatch.commit();

    return summarizeBatch(batch);
  }

  async upsertMatchUpdates(matches: NormalizedMatch[]): Promise<void> {
    if (matches.length === 0) {
      return;
    }

    const firestore = getFirebaseAdminFirestore();
    const writeBatch = firestore.batch();

    for (const match of matches) {
      const matchRef = firestore
        .collection("competitions")
        .doc(match.competitionId)
        .collection("seasons")
        .doc(match.seasonId)
        .collection("matches")
        .doc(match.id);

      writeBatch.set(matchRef, toMatchFirestore(match), { merge: true });
    }

    await writeBatch.commit();
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
    tournamentGroupCount: batch.tournamentGroups?.length ?? 0,
    squadCount: batch.squads?.length ?? 0,
    playerCount: batch.players?.length ?? 0,
    bracketNodeCount: batch.bracketNodes?.length ?? 0,
    finalMatchCount: batch.matches.filter((match) => match.status === "FINISHED").length,
  };
}

function toTournamentGroupFirestore(group: TournamentGroup) {
  return {
    competitionId: group.competitionId,
    seasonId: group.seasonId,
    code: group.code,
    name: group.name,
    teamIds: group.teamIds,
    sortOrder: group.sortOrder,
    visibility: group.visibility,
    provider: group.provider ?? null,
    freshness: group.freshness ?? null,
    updatedAt: group.updatedAt,
  };
}

function toTeamFirestore(team: NormalizedTeam) {
  return {
    competitionId: team.competitionId,
    seasonId: team.seasonId,
    name: team.name,
    shortName: team.shortName,
    countryCode: team.countryCode,
    status: team.status ?? "confirmed",
    groupCode: team.groupCode ?? null,
    provider: team.provider,
    freshness: team.freshness,
    updatedAt: team.updatedAt,
  };
}

function toPlayerFirestore(player: Player) {
  return {
    competitionId: player.competitionId,
    seasonId: player.seasonId,
    teamId: player.teamId,
    displayName: player.displayName,
    countryCode: player.countryCode,
    position: player.position,
    shirtNumber: player.shirtNumber,
    status: player.status,
    provider: player.provider ?? null,
    freshness: player.freshness ?? null,
    updatedAt: player.updatedAt,
  };
}

function toSquadFirestore(squad: Squad) {
  return {
    competitionId: squad.competitionId,
    seasonId: squad.seasonId,
    teamId: squad.teamId,
    status: squad.status,
    playerIds: squad.playerIds,
    publishedAt: squad.publishedAt,
    provider: squad.provider ?? null,
    freshness: squad.freshness ?? null,
    updatedAt: squad.updatedAt,
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
    lifecycleStatus: match.lifecycleStatus ?? matchLifecycleStatusFromMatchStatus(match.status),
    stage: match.stage,
    groupCode: match.groupCode ?? null,
    venue: match.venue ?? null,
    score: match.score,
    provider: match.provider,
    freshness: match.freshness,
    updatedAt: match.updatedAt,
  };
}

function toBracketNodeFirestore(node: BracketNode) {
  return {
    competitionId: node.competitionId,
    seasonId: node.seasonId,
    stage: node.stage,
    matchId: node.matchId,
    status: node.status,
    sortOrder: node.sortOrder,
    homeSource: node.homeSource,
    awaySource: node.awaySource,
    winnerTargetNodeId: node.winnerTargetNodeId,
    loserTargetNodeId: node.loserTargetNodeId,
    provider: node.provider ?? null,
    freshness: node.freshness ?? null,
    updatedAt: node.updatedAt,
  };
}
