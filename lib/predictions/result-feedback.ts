import {
  getScoreableMatchResult,
  scorePrediction,
  type ScoreableMatchInput,
  type ScoringPreset,
  type ScoringResultType,
} from "@/lib/scoring/domain";

export type PredictionResultFeedback =
  | {
      status: "SCORED";
      actualHomeGoals: number;
      actualAwayGoals: number;
      points: number;
      resultType: ScoringResultType;
      reason: string;
    }
  | {
      status: "FINISHED_UNSCORED";
      actualHomeGoals: null;
      actualAwayGoals: null;
      points: null;
      resultType: null;
      reason: string;
    }
  | {
      status: "NOT_FINAL";
      actualHomeGoals: null;
      actualAwayGoals: null;
      points: null;
      resultType: null;
      reason: string;
    };

export function buildPredictionResultFeedback({
  match,
  prediction,
  scoringPreset,
}: {
  match: ScoreableMatchInput;
  prediction: {
    homeGoals: number;
    awayGoals: number;
  } | null;
  scoringPreset: ScoringPreset;
}): PredictionResultFeedback | null {
  if (!prediction) {
    return null;
  }

  const scoreable = getScoreableMatchResult(match);

  if (!scoreable.scoreable) {
    return {
      status: scoreable.reason === "MISSING_90_MINUTE_SCORE" ? "FINISHED_UNSCORED" : "NOT_FINAL",
      actualHomeGoals: null,
      actualAwayGoals: null,
      points: null,
      resultType: null,
      reason: nonScoreableReason(scoreable.reason),
    };
  }

  const result = scorePrediction({
    predictionHomeGoals: prediction.homeGoals,
    predictionAwayGoals: prediction.awayGoals,
    actualHomeGoals: scoreable.actualHomeGoals,
    actualAwayGoals: scoreable.actualAwayGoals,
    scoringPreset,
  });

  return {
    status: "SCORED",
    actualHomeGoals: scoreable.actualHomeGoals,
    actualAwayGoals: scoreable.actualAwayGoals,
    points: result.points,
    resultType: result.resultType,
    reason: scoredReason(result.resultType),
  };
}

function scoredReason(resultType: ScoringResultType) {
  switch (resultType) {
    case "EXACT_SCORE":
      return "Exact score: predicted both teams' goals correctly.";
    case "GOAL_DIFFERENCE":
      return "Goal difference: predicted the correct margin.";
    case "TENDENCY":
      return "Tendency: predicted the correct winner or draw.";
    case "MISS":
      return "Miss: prediction did not match the result tendency.";
  }
}

function nonScoreableReason(reason: string) {
  switch (reason) {
    case "MATCH_NOT_FINAL":
      return "Match is not finished yet.";
    case "MATCH_POSTPONED":
      return "Match was postponed and is not scoreable.";
    case "MATCH_CANCELLED":
      return "Match was cancelled and is not scoreable.";
    case "MATCH_ABANDONED":
      return "Match was abandoned and is not scoreable.";
    case "MATCH_VOID":
      return "Match was voided and is not scoreable.";
    case "MISSING_90_MINUTE_SCORE":
      return "Match is finished, but the 90-minute score is not available yet.";
    default:
      return "Match is not scoreable yet.";
  }
}
