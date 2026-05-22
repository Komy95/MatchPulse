import type { PredictionValue } from "@/lib/predictions/types";

export type PredictionPolicyInput = {
  nowMs: number;
  lockAtMs: number;
  groupPredictionMode: string;
  requestedPredictionMode: string;
  allowBooster: boolean;
  requested: PredictionValue;
  existing: PredictionValue | null;
};

export type PredictionPolicyResult =
  | {
      action: "CREATE" | "UPDATE";
      createRevision: boolean;
    }
  | {
      action: "NOOP";
      createRevision: false;
    }
  | {
      errorCode:
        | "PREDICTION_LOCKED"
        | "PREDICTION_INVALID"
        | "BOOSTER_NOT_ALLOWED";
    };

export function evaluatePredictionUpsertPolicy(
  input: PredictionPolicyInput,
): PredictionPolicyResult {
  if (input.requestedPredictionMode !== input.groupPredictionMode) {
    return { errorCode: "PREDICTION_INVALID" };
  }

  if (input.requested.booster && !input.allowBooster) {
    return { errorCode: "BOOSTER_NOT_ALLOWED" };
  }

  if (input.nowMs >= input.lockAtMs) {
    return { errorCode: "PREDICTION_LOCKED" };
  }

  if (!input.existing) {
    return {
      action: "CREATE",
      createRevision: false,
    };
  }

  if (
    input.existing.homeGoals === input.requested.homeGoals &&
    input.existing.awayGoals === input.requested.awayGoals &&
    input.existing.booster === input.requested.booster
  ) {
    return {
      action: "NOOP",
      createRevision: false,
    };
  }

  return {
    action: "UPDATE",
    createRevision: true,
  };
}
