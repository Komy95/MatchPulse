import type { MatchStatus } from "@/lib/sports-data/domain";

export type ScoringPreset = "HYBRID_321";

export type ScoringResultType = "EXACT_SCORE" | "GOAL_DIFFERENCE" | "TENDENCY" | "MISS";

export type MatchOutcome = "HOME_WIN" | "DRAW" | "AWAY_WIN";

export type ScorePredictionInput = {
  predictionHomeGoals: number;
  predictionAwayGoals: number;
  actualHomeGoals: number;
  actualAwayGoals: number;
  scoringPreset: ScoringPreset;
};

export type ScoringResult = {
  points: number;
  resultType: ScoringResultType;
  scoringPreset: ScoringPreset;
  predictedOutcome: MatchOutcome;
  actualOutcome: MatchOutcome;
  predictedGoalDifference: number;
  actualGoalDifference: number;
  exactScore: boolean;
  correctGoalDifference: boolean;
  correctTendency: boolean;
  boosterApplied: false;
};

export type ScoreableMatchInput = {
  status: MatchStatus | "VOID" | string;
  score?: {
    homeScore90?: number | null;
    awayScore90?: number | null;
  } | null;
  homeScore90?: number | null;
  awayScore90?: number | null;
};

export type ScoreableMatchResult =
  | {
      scoreable: true;
      actualHomeGoals: number;
      actualAwayGoals: number;
    }
  | {
      scoreable: false;
      reason:
        | "MATCH_NOT_FINAL"
        | "MATCH_POSTPONED"
        | "MATCH_CANCELLED"
        | "MATCH_ABANDONED"
        | "MATCH_VOID"
        | "MISSING_90_MINUTE_SCORE";
    };

export type PredictionScoreEligibilityInput = {
  prediction: {
    groupSeasonId: string;
    matchId: string;
    homeGoals: number;
    awayGoals: number;
    savedAtMs: number;
    lockAtMs: number;
  };
  groupSeasonId: string;
  matchId: string;
  matchSeasonId: string;
  groupSeasonCanonicalSeasonId: string;
};

export type PredictionScoreEligibilityResult =
  | {
      eligible: true;
    }
  | {
      eligible: false;
      reason:
        | "PREDICTION_OUTSIDE_GROUP_SEASON"
        | "PREDICTION_OUTSIDE_MATCH"
        | "MATCH_OUTSIDE_GROUP_SEASON"
        | "PREDICTION_SCORE_INVALID"
        | "PREDICTION_SAVED_AFTER_LOCK";
    };

export function scorePrediction(input: ScorePredictionInput): ScoringResult {
  assertValidGoal(input.predictionHomeGoals, "predictionHomeGoals");
  assertValidGoal(input.predictionAwayGoals, "predictionAwayGoals");
  assertValidGoal(input.actualHomeGoals, "actualHomeGoals");
  assertValidGoal(input.actualAwayGoals, "actualAwayGoals");

  if (input.scoringPreset !== "HYBRID_321") {
    throw new Error(`Unsupported scoring preset: ${input.scoringPreset}`);
  }

  const predictedGoalDifference = input.predictionHomeGoals - input.predictionAwayGoals;
  const actualGoalDifference = input.actualHomeGoals - input.actualAwayGoals;
  const predictedOutcome = getMatchOutcome(input.predictionHomeGoals, input.predictionAwayGoals);
  const actualOutcome = getMatchOutcome(input.actualHomeGoals, input.actualAwayGoals);
  const exactScore =
    input.predictionHomeGoals === input.actualHomeGoals &&
    input.predictionAwayGoals === input.actualAwayGoals;
  const correctGoalDifference = !exactScore && predictedGoalDifference === actualGoalDifference;
  const correctTendency =
    !exactScore && !correctGoalDifference && predictedOutcome === actualOutcome;

  const resultType: ScoringResultType = exactScore
    ? "EXACT_SCORE"
    : correctGoalDifference
      ? "GOAL_DIFFERENCE"
      : correctTendency
        ? "TENDENCY"
        : "MISS";

  const pointsByResultType: Record<ScoringResultType, number> = {
    EXACT_SCORE: 3,
    GOAL_DIFFERENCE: 2,
    TENDENCY: 1,
    MISS: 0,
  };

  return {
    points: pointsByResultType[resultType],
    resultType,
    scoringPreset: input.scoringPreset,
    predictedOutcome,
    actualOutcome,
    predictedGoalDifference,
    actualGoalDifference,
    exactScore,
    correctGoalDifference,
    correctTendency,
    // Booster multiplication is intentionally deferred until product rules define it.
    boosterApplied: false,
  };
}

export function getScoreableMatchResult(match: ScoreableMatchInput): ScoreableMatchResult {
  switch (match.status) {
    case "FINISHED":
      break;
    case "POSTPONED":
      return { scoreable: false, reason: "MATCH_POSTPONED" };
    case "CANCELLED":
      return { scoreable: false, reason: "MATCH_CANCELLED" };
    case "ABANDONED":
      return { scoreable: false, reason: "MATCH_ABANDONED" };
    case "VOID":
      return { scoreable: false, reason: "MATCH_VOID" };
    default:
      return { scoreable: false, reason: "MATCH_NOT_FINAL" };
  }

  const homeScore90 = match.score?.homeScore90 ?? match.homeScore90;
  const awayScore90 = match.score?.awayScore90 ?? match.awayScore90;

  if (!isValidGoal(homeScore90) || !isValidGoal(awayScore90)) {
    return { scoreable: false, reason: "MISSING_90_MINUTE_SCORE" };
  }

  return {
    scoreable: true,
    actualHomeGoals: homeScore90,
    actualAwayGoals: awayScore90,
  };
}

export function evaluatePredictionScoreEligibility(
  input: PredictionScoreEligibilityInput,
): PredictionScoreEligibilityResult {
  if (input.prediction.groupSeasonId !== input.groupSeasonId) {
    return { eligible: false, reason: "PREDICTION_OUTSIDE_GROUP_SEASON" };
  }

  if (input.prediction.matchId !== input.matchId) {
    return { eligible: false, reason: "PREDICTION_OUTSIDE_MATCH" };
  }

  if (input.matchSeasonId !== input.groupSeasonCanonicalSeasonId) {
    return { eligible: false, reason: "MATCH_OUTSIDE_GROUP_SEASON" };
  }

  if (!isValidGoal(input.prediction.homeGoals) || !isValidGoal(input.prediction.awayGoals)) {
    return { eligible: false, reason: "PREDICTION_SCORE_INVALID" };
  }

  if (input.prediction.savedAtMs >= input.prediction.lockAtMs) {
    return { eligible: false, reason: "PREDICTION_SAVED_AFTER_LOCK" };
  }

  return { eligible: true };
}

export function getMatchOutcome(homeGoals: number, awayGoals: number): MatchOutcome {
  assertValidGoal(homeGoals, "homeGoals");
  assertValidGoal(awayGoals, "awayGoals");

  if (homeGoals > awayGoals) {
    return "HOME_WIN";
  }

  if (homeGoals < awayGoals) {
    return "AWAY_WIN";
  }

  return "DRAW";
}

function assertValidGoal(value: number, field: string) {
  if (!isValidGoal(value)) {
    throw new Error(`${field} must be a non-negative integer.`);
  }
}

function isValidGoal(value: unknown): value is number {
  return typeof value === "number" && Number.isInteger(value) && value >= 0;
}
