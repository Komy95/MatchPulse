import type { Timestamp } from "firebase-admin/firestore";
import type { ScoringPreset } from "@/lib/scoring/domain";

export type LeaderboardGeneratedBy = "SERVER_ROUTE" | "TRUSTED_JOB";

export type LeaderboardEntry = {
  userId: string;
  displayName: string | null;
  photoUrl: string | null;
  rank: number;
  previousRank: number | null;
  points: number;
  exactCount: number;
  goalDifferenceCount: number;
  tendencyCount: number;
  missCount: number;
  scoredPredictionCount: number;
  lastScoredAt: string | null;
};

export type LeaderboardSnapshot = {
  groupId: string;
  groupSeasonId: string;
  snapshotAt: string;
  scoringPreset: ScoringPreset;
  scoredMatchIds: string[];
  generatedBy: LeaderboardGeneratedBy;
  entries: LeaderboardEntry[];
  inputHash: string;
  createdAt: string;
};

export type LeaderboardSnapshotDocument = Omit<
  LeaderboardSnapshot,
  "snapshotAt" | "createdAt"
> & {
  snapshotAt: Timestamp;
  createdAt: Timestamp;
};
