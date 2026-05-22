import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";
import vm from "node:vm";
import ts from "typescript";

const policySource = readFileSync("lib/predictions/policy.ts", "utf8");
const transpiled = ts.transpileModule(policySource, {
  compilerOptions: {
    module: ts.ModuleKind.CommonJS,
    target: ts.ScriptTarget.ES2020,
  },
});
const sandbox = {
  exports: {},
};

vm.runInNewContext(transpiled.outputText, sandbox);

const { evaluatePredictionUpsertPolicy } = sandbox.exports;

function validInput(overrides = {}) {
  return {
    nowMs: 1_000,
    lockAtMs: 2_000,
    groupPredictionMode: "EXACT_SCORE",
    requestedPredictionMode: "EXACT_SCORE",
    allowBooster: true,
    requested: {
      homeGoals: 2,
      awayGoals: 1,
      booster: false,
    },
    existing: null,
    ...overrides,
  };
}

test("member can save prediction before lock", () => {
  assertJsonEqual(evaluatePredictionUpsertPolicy(validInput()), {
    action: "CREATE",
    createRevision: false,
  });
});

test("member cannot save prediction after lock", () => {
  assertJsonEqual(
    evaluatePredictionUpsertPolicy(validInput({ nowMs: 2_000 })),
    { errorCode: "PREDICTION_LOCKED" },
  );
});

test("duplicate save is idempotent", () => {
  assertJsonEqual(
    evaluatePredictionUpsertPolicy(
      validInput({
        existing: {
          homeGoals: 2,
          awayGoals: 1,
          booster: false,
        },
      }),
    ),
    {
      action: "NOOP",
      createRevision: false,
    },
  );
});

test("changed prediction creates a revision", () => {
  assertJsonEqual(
    evaluatePredictionUpsertPolicy(
      validInput({
        existing: {
          homeGoals: 1,
          awayGoals: 1,
          booster: false,
        },
      }),
    ),
    {
      action: "UPDATE",
      createRevision: true,
    },
  );
});

test("booster is rejected when group season disables it", () => {
  assertJsonEqual(
    evaluatePredictionUpsertPolicy(
      validInput({
        allowBooster: false,
        requested: {
          homeGoals: 2,
          awayGoals: 1,
          booster: true,
        },
      }),
    ),
    { errorCode: "BOOSTER_NOT_ALLOWED" },
  );
});

test("prediction mode must match group season setting", () => {
  assertJsonEqual(
    evaluatePredictionUpsertPolicy(validInput({ requestedPredictionMode: "OTHER" })),
    { errorCode: "PREDICTION_INVALID" },
  );
});

function assertJsonEqual(actual, expected) {
  assert.equal(JSON.stringify(actual), JSON.stringify(expected));
}
