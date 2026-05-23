import assert from "node:assert/strict";
import { createRequire } from "node:module";
import { readFileSync } from "node:fs";
import test from "node:test";
import vm from "node:vm";
import ts from "typescript";

const require = createRequire(import.meta.url);
const moduleCache = new Map();
const { buildPredictionResultFeedback } = loadTsModule("lib/predictions/result-feedback.ts");

test("prediction result feedback uses scoring domain for exact score", () => {
  const feedback = buildPredictionResultFeedback({
    match: match({ homeScore90: 2, awayScore90: 1 }),
    prediction: { homeGoals: 2, awayGoals: 1 },
    scoringPreset: "HYBRID_321",
  });

  assert.equal(feedback.status, "SCORED");
  assert.equal(feedback.points, 3);
  assert.equal(feedback.resultType, "EXACT_SCORE");
  assert.equal(feedback.reason, "Exact score: predicted both teams' goals correctly.");
});

test("prediction result feedback explains pending finished scores", () => {
  const feedback = buildPredictionResultFeedback({
    match: match({ homeScore90: null, awayScore90: null }),
    prediction: { homeGoals: 1, awayGoals: 1 },
    scoringPreset: "HYBRID_321",
  });

  assert.equal(feedback.status, "FINISHED_UNSCORED");
  assert.equal(feedback.points, null);
  assert.equal(feedback.reason, "Match is finished, but the 90-minute score is not available yet.");
});

test("prediction result feedback is absent without a saved prediction", () => {
  const feedback = buildPredictionResultFeedback({
    match: match({ homeScore90: 2, awayScore90: 1 }),
    prediction: null,
    scoringPreset: "HYBRID_321",
  });

  assert.equal(feedback, null);
});

function match(score, status = "FINISHED") {
  return {
    status,
    score,
  };
}

function loadTsModule(file) {
  if (moduleCache.has(file)) {
    return moduleCache.get(file).exports;
  }

  const loadedModule = { exports: {} };
  moduleCache.set(file, loadedModule);
  const source = readFileSync(file, "utf8");
  const transpiled = ts.transpileModule(source, {
    compilerOptions: {
      module: ts.ModuleKind.CommonJS,
      target: ts.ScriptTarget.ES2020,
    },
  });
  const sandbox = {
    exports: loadedModule.exports,
    module: loadedModule,
    require: (specifier) => {
      if (specifier === "@/lib/scoring/domain") {
        return loadTsModule("lib/scoring/domain.ts");
      }

      if (specifier === "node:crypto") {
        return require("node:crypto");
      }

      throw new Error(`Unsupported test module import: ${specifier}`);
    },
  };

  vm.runInNewContext(transpiled.outputText, sandbox, { filename: file });

  return loadedModule.exports;
}
