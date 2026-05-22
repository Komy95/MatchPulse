import * as crypto from "node:crypto";
import {
  evaluatePredictionScoreEligibility,
  getScoreableMatchResult,
  scorePrediction,
  type ScoringPreset,
} from "@/lib/scoring/domain";
import type { GroupMemberStatus, GroupRole } from "@/lib/groups/types";
import type { MatchStatus } from "@/lib/sports-data/domain";
import type { LeaderboardEntry } from "@/lib/leaderboard/types";

export type LeaderboardMemberInput = {
  userId: string;
  displayName: string | null;
  photoUrl: string | null;
  role?: GroupRole;
  status: GroupMemberStatus;
};

export type LeaderboardPredictionInput = {
  groupSeasonId: string;
  matchId: string;
  userId: string;
  homeGoals: number;
  awayGoals: number;
  savedAtMs: number;
  lockAtMs: number;
  updatedAtMs: number;
};

export type LeaderboardMatchInput = {
  id: string;
  seasonId: string;
  status: MatchStatus | "VOID" | string;
  score?: {
    homeScore90?: number | null;
    awayScore90?: number | null;
  } | null;
  homeScore90?: number | null;
  awayScore90?: number | null;
};

export type BuildLeaderboardSnapshotInput = {
  groupId: string;
  groupSeasonId: string;
  canonicalSeasonId: string;
  scoringPreset: ScoringPreset;
  members: LeaderboardMemberInput[];
  predictions: LeaderboardPredictionInput[];
  matches: LeaderboardMatchInput[];
  previousEntries?: LeaderboardEntry[];
};

export type BuiltLeaderboardSnapshot = {
  groupId: string;
  groupSeasonId: string;
  scoringPreset: ScoringPreset;
  scoredMatchIds: string[];
  entries: LeaderboardEntry[];
  inputHash: string;
};

type MutableEntry = Omit<LeaderboardEntry, "rank" | "previousRank">;

export function buildLeaderboardSnapshot(
  input: BuildLeaderboardSnapshotInput,
): BuiltLeaderboardSnapshot {
  const activeMembers = input.members
    .filter((member) => member.status === "ACTIVE")
    .sort(compareMembers);
  const entriesByUserId = new Map<string, MutableEntry>();
  const previousRankByUserId = new Map(
    (input.previousEntries ?? []).map((entry) => [entry.userId, entry.rank]),
  );
  const matchesById = new Map(
    input.matches
      .filter((match) => match.seasonId === input.canonicalSeasonId)
      .map((match) => [match.id, match]),
  );
  const scoreableMatches = input.matches
    .filter(
      (match) =>
        match.seasonId === input.canonicalSeasonId && getScoreableMatchResult(match).scoreable,
    )
    .sort((left, right) => left.id.localeCompare(right.id));
  const scoredMatchIds = scoreableMatches.map((match) => match.id);

  for (const member of activeMembers) {
    entriesByUserId.set(member.userId, {
      userId: member.userId,
      displayName: member.displayName,
      photoUrl: member.photoUrl,
      points: 0,
      exactCount: 0,
      goalDifferenceCount: 0,
      tendencyCount: 0,
      missCount: 0,
      scoredPredictionCount: 0,
      lastScoredAt: null,
    });
  }

  const activeUserIds = new Set(activeMembers.map((member) => member.userId));

  for (const prediction of input.predictions.sort(comparePredictions)) {
    if (!activeUserIds.has(prediction.userId)) {
      continue;
    }

    const match = matchesById.get(prediction.matchId);

    if (!match) {
      continue;
    }

    const scoreable = getScoreableMatchResult(match);

    if (!scoreable.scoreable) {
      continue;
    }

    const eligibility = evaluatePredictionScoreEligibility({
      prediction: {
        groupSeasonId: prediction.groupSeasonId,
        matchId: prediction.matchId,
        homeGoals: prediction.homeGoals,
        awayGoals: prediction.awayGoals,
        savedAtMs: prediction.savedAtMs,
        lockAtMs: prediction.lockAtMs,
      },
      groupSeasonId: input.groupSeasonId,
      matchId: match.id,
      matchSeasonId: match.seasonId,
      groupSeasonCanonicalSeasonId: input.canonicalSeasonId,
    });

    if (!eligibility.eligible) {
      continue;
    }

    const entry = entriesByUserId.get(prediction.userId);

    if (!entry) {
      continue;
    }

    const score = scorePrediction({
      predictionHomeGoals: prediction.homeGoals,
      predictionAwayGoals: prediction.awayGoals,
      actualHomeGoals: scoreable.actualHomeGoals,
      actualAwayGoals: scoreable.actualAwayGoals,
      scoringPreset: input.scoringPreset,
    });

    entry.points += score.points;
    entry.scoredPredictionCount += 1;
    entry.lastScoredAt = maxIso(entry.lastScoredAt, prediction.updatedAtMs);

    switch (score.resultType) {
      case "EXACT_SCORE":
        entry.exactCount += 1;
        break;
      case "GOAL_DIFFERENCE":
        entry.goalDifferenceCount += 1;
        break;
      case "TENDENCY":
        entry.tendencyCount += 1;
        break;
      case "MISS":
        entry.missCount += 1;
        break;
    }
  }

  const entries = [...entriesByUserId.values()]
    .sort(compareRankedEntries)
    .map((entry, index) => ({
      ...entry,
      rank: index + 1,
      previousRank: previousRankByUserId.get(entry.userId) ?? null,
    }));

  return {
    groupId: input.groupId,
    groupSeasonId: input.groupSeasonId,
    scoringPreset: input.scoringPreset,
    scoredMatchIds,
    entries,
    inputHash: hashSnapshotInput({
      groupId: input.groupId,
      groupSeasonId: input.groupSeasonId,
      scoringPreset: input.scoringPreset,
      scoredMatchIds,
      entries,
    }),
  };
}

function compareRankedEntries(left: MutableEntry, right: MutableEntry) {
  return (
    right.points - left.points ||
    right.exactCount - left.exactCount ||
    right.goalDifferenceCount - left.goalDifferenceCount ||
    right.tendencyCount - left.tendencyCount ||
    displayName(left).localeCompare(displayName(right)) ||
    left.userId.localeCompare(right.userId)
  );
}

function compareMembers(left: LeaderboardMemberInput, right: LeaderboardMemberInput) {
  return displayName(left).localeCompare(displayName(right)) || left.userId.localeCompare(right.userId);
}

function comparePredictions(
  left: LeaderboardPredictionInput,
  right: LeaderboardPredictionInput,
) {
  return left.matchId.localeCompare(right.matchId) || left.userId.localeCompare(right.userId);
}

function displayName(value: { displayName: string | null; userId: string }) {
  return (value.displayName?.trim() || value.userId).toLocaleLowerCase();
}

function maxIso(current: string | null, candidateMs: number) {
  const candidate = new Date(candidateMs).toISOString();

  return current && current > candidate ? current : candidate;
}

function hashSnapshotInput(input: {
  groupId: string;
  groupSeasonId: string;
  scoringPreset: ScoringPreset;
  scoredMatchIds: string[];
  entries: LeaderboardEntry[];
}) {
  const scoringRelevantInput = {
    ...input,
    entries: input.entries.map((entry) => ({
      userId: entry.userId,
      displayName: entry.displayName,
      photoUrl: entry.photoUrl,
      rank: entry.rank,
      points: entry.points,
      exactCount: entry.exactCount,
      goalDifferenceCount: entry.goalDifferenceCount,
      tendencyCount: entry.tendencyCount,
      missCount: entry.missCount,
      scoredPredictionCount: entry.scoredPredictionCount,
      lastScoredAt: entry.lastScoredAt,
    })),
  };

  return crypto.createHash("sha256").update(JSON.stringify(scoringRelevantInput)).digest("hex");
}
