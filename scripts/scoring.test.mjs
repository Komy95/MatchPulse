import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";
import vm from "node:vm";
import ts from "typescript";

const source = readFileSync("lib/scoring/domain.ts", "utf8");
const transpiled = ts.transpileModule(source, {
  compilerOptions: {
    module: ts.ModuleKind.CommonJS,
    target: ts.ScriptTarget.ES2020,
  },
});
const sandbox = {
  exports: {},
};

vm.runInNewContext(transpiled.outputText, sandbox);

const {
  evaluatePredictionScoreEligibility,
  getScoreableMatchResult,
  scorePrediction,
} = sandbox.exports;

function score(overrides) {
  return scorePrediction({
    predictionHomeGoals: 2,
    predictionAwayGoals: 1,
    actualHomeGoals: 2,
    actualAwayGoals: 1,
    scoringPreset: "HYBRID_321",
    ...overrides,
  });
}

function assertScore(overrides, expected) {
  const result = score(overrides);
  assert.equal(result.points, expected.points);
  assert.equal(result.resultType, expected.resultType);
  assert.equal(result.boosterApplied, false);
}

test("exact score home win", () => {
  assertScore(
    { predictionHomeGoals: 2, predictionAwayGoals: 1, actualHomeGoals: 2, actualAwayGoals: 1 },
    { points: 3, resultType: "EXACT_SCORE" },
  );
});

test("exact score draw", () => {
  assertScore(
    { predictionHomeGoals: 1, predictionAwayGoals: 1, actualHomeGoals: 1, actualAwayGoals: 1 },
    { points: 3, resultType: "EXACT_SCORE" },
  );
});

test("exact score away win", () => {
  assertScore(
    { predictionHomeGoals: 0, predictionAwayGoals: 2, actualHomeGoals: 0, actualAwayGoals: 2 },
    { points: 3, resultType: "EXACT_SCORE" },
  );
});

test("correct goal difference home win", () => {
  assertScore(
    { predictionHomeGoals: 3, predictionAwayGoals: 1, actualHomeGoals: 2, actualAwayGoals: 0 },
    { points: 2, resultType: "GOAL_DIFFERENCE" },
  );
});

test("correct goal difference away win", () => {
  assertScore(
    { predictionHomeGoals: 1, predictionAwayGoals: 3, actualHomeGoals: 0, actualAwayGoals: 2 },
    { points: 2, resultType: "GOAL_DIFFERENCE" },
  );
});

test("correct goal difference draw", () => {
  assertScore(
    { predictionHomeGoals: 2, predictionAwayGoals: 2, actualHomeGoals: 0, actualAwayGoals: 0 },
    { points: 2, resultType: "GOAL_DIFFERENCE" },
  );
});

test("correct tendency home win", () => {
  assertScore(
    { predictionHomeGoals: 1, predictionAwayGoals: 0, actualHomeGoals: 3, actualAwayGoals: 1 },
    { points: 1, resultType: "TENDENCY" },
  );
});

test("correct tendency draw is scored as goal difference because draw difference is zero", () => {
  assertScore(
    { predictionHomeGoals: 3, predictionAwayGoals: 3, actualHomeGoals: 1, actualAwayGoals: 1 },
    { points: 2, resultType: "GOAL_DIFFERENCE" },
  );
});

test("correct tendency away win", () => {
  assertScore(
    { predictionHomeGoals: 0, predictionAwayGoals: 1, actualHomeGoals: 1, actualAwayGoals: 3 },
    { points: 1, resultType: "TENDENCY" },
  );
});

test("wrong prediction", () => {
  assertScore(
    { predictionHomeGoals: 2, predictionAwayGoals: 0, actualHomeGoals: 0, actualAwayGoals: 1 },
    { points: 0, resultType: "MISS" },
  );
});

test("zero-zero draw", () => {
  assertScore(
    { predictionHomeGoals: 0, predictionAwayGoals: 0, actualHomeGoals: 0, actualAwayGoals: 0 },
    { points: 3, resultType: "EXACT_SCORE" },
  );
});

test("high but valid scores", () => {
  assertScore(
    { predictionHomeGoals: 20, predictionAwayGoals: 18, actualHomeGoals: 19, actualAwayGoals: 17 },
    { points: 2, resultType: "GOAL_DIFFERENCE" },
  );
});

test("missing actual score is not scoreable", () => {
  assertJsonEqual(
    getScoreableMatchResult({
      status: "FINISHED",
      score: { homeScore90: null, awayScore90: 1 },
    }),
    { scoreable: false, reason: "MISSING_90_MINUTE_SCORE" },
  );
});

test("non-final match is not scoreable", () => {
  assertJsonEqual(
    getScoreableMatchResult({
      status: "LIVE",
      score: { homeScore90: 1, awayScore90: 1 },
    }),
    { scoreable: false, reason: "MATCH_NOT_FINAL" },
  );
});

test("postponed cancelled and void matches are not scoreable", () => {
  assertJsonEqual(getScoreableMatchResult({ status: "POSTPONED" }), {
    scoreable: false,
    reason: "MATCH_POSTPONED",
  });
  assertJsonEqual(getScoreableMatchResult({ status: "CANCELLED" }), {
    scoreable: false,
    reason: "MATCH_CANCELLED",
  });
  assertJsonEqual(getScoreableMatchResult({ status: "VOID" }), {
    scoreable: false,
    reason: "MATCH_VOID",
  });
  assertJsonEqual(getScoreableMatchResult({ status: "ABANDONED" }), {
    scoreable: false,
    reason: "MATCH_ABANDONED",
  });
});

test("finished match with 90-minute scores is scoreable", () => {
  assertJsonEqual(
    getScoreableMatchResult({
      status: "FINISHED",
      score: { homeScore90: 2, awayScore90: 1 },
    }),
    { scoreable: true, actualHomeGoals: 2, actualAwayGoals: 1 },
  );
});

test("prediction eligibility enforces group-season and lock invariants", () => {
  const validInput = {
    prediction: {
      groupSeasonId: "group-season-1",
      matchId: "match-1",
      homeGoals: 2,
      awayGoals: 1,
      savedAtMs: 1_000,
      lockAtMs: 2_000,
    },
    groupSeasonId: "group-season-1",
    matchId: "match-1",
    matchSeasonId: "world-cup-2026",
    groupSeasonCanonicalSeasonId: "world-cup-2026",
  };

  assertJsonEqual(evaluatePredictionScoreEligibility(validInput), { eligible: true });
  assertJsonEqual(
    evaluatePredictionScoreEligibility({
      ...validInput,
      prediction: { ...validInput.prediction, savedAtMs: 2_000 },
    }),
    { eligible: false, reason: "PREDICTION_SAVED_AFTER_LOCK" },
  );
  assertJsonEqual(
    evaluatePredictionScoreEligibility({
      ...validInput,
      matchSeasonId: "other-season",
    }),
    { eligible: false, reason: "MATCH_OUTSIDE_GROUP_SEASON" },
  );
});

function assertJsonEqual(actual, expected) {
  assert.equal(JSON.stringify(actual), JSON.stringify(expected));
}
