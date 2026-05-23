import type { Timestamp } from "firebase-admin/firestore";
import type { MatchStatus, NormalizedVenue } from "@/lib/sports-data/domain";
import type { PredictionResultFeedback } from "@/lib/predictions/result-feedback";

export type PredictionMode = "EXACT_SCORE";
export type PredictionStatus = "SAVED";

export type PredictionDocument = {
  groupId: string;
  groupSeasonId: string;
  matchId: string;
  userId: string;
  homeGoals: number;
  awayGoals: number;
  predictionMode: PredictionMode;
  booster: boolean;
  savedAt: Timestamp;
  updatedAt: Timestamp;
  lockAt: string;
  status: PredictionStatus;
};

export type PredictionRevisionDocument = {
  predictionId: string;
  matchId: string;
  userId: string;
  previousValue: PredictionValue | null;
  nextValue: PredictionValue;
  changedAt: Timestamp;
  changedBy: string;
  reason: "USER_EDIT";
};

export type PredictionValue = {
  homeGoals: number;
  awayGoals: number;
  booster: boolean;
};

export type TeamSummary = {
  id: string;
  name: string;
  shortName: string;
  countryCode: string | null;
};

export type MatchPredictionSummary = {
  id: string;
  kickoffAt: string;
  lockAt: string;
  locked: boolean;
  status: MatchStatus;
  stage: string;
  groupCode: string | null;
  venue: NormalizedVenue | null;
  result: PredictionResultFeedback | null;
  homeTeam: TeamSummary;
  awayTeam: TeamSummary;
  prediction: {
    homeGoals: number;
    awayGoals: number;
    booster: boolean;
    updatedAt: string;
  } | null;
};
