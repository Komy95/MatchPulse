import assert from "node:assert/strict";
import { createRequire } from "node:module";
import { readFileSync } from "node:fs";
import test from "node:test";
import vm from "node:vm";
import ts from "typescript";

const require = createRequire(import.meta.url);
const moduleCache = new Map();
const { buildLeaderboardSnapshot } = loadTsModule("lib/leaderboard/domain.ts");

const baseMembers = [
  member("user-a", "Alex"),
  member("user-b", "Blair"),
  member("user-c", "Casey"),
];
const baseMatches = [
  match("match-1", { homeScore90: 2, awayScore90: 1 }),
  match("match-2", { homeScore90: 1, awayScore90: 1 }),
  match("match-3", { homeScore90: 0, awayScore90: 2 }),
];

test("no predictions returns zero-point active member rankings", () => {
  const snapshot = build([]);

  assert.equal(snapshot.entries.length, 3);
  assertJsonEqual(
    snapshot.entries.map(({ userId, rank, points, scoredPredictionCount }) => ({
      userId,
      rank,
      points,
      scoredPredictionCount,
    })),
    [
      { userId: "user-a", rank: 1, points: 0, scoredPredictionCount: 0 },
      { userId: "user-b", rank: 2, points: 0, scoredPredictionCount: 0 },
      { userId: "user-c", rank: 3, points: 0, scoredPredictionCount: 0 },
    ],
  );
});

test("one user exact score ranks first", () => {
  const snapshot = build([
    prediction("user-b", "match-1", 2, 1),
    prediction("user-a", "match-1", 0, 0),
  ]);

  assert.equal(snapshot.entries[0].userId, "user-b");
  assert.equal(snapshot.entries[0].points, 3);
  assert.equal(snapshot.entries[0].exactCount, 1);
});

test("multiple users are ranked by total points", () => {
  const snapshot = build([
    prediction("user-a", "match-1", 2, 1),
    prediction("user-b", "match-1", 3, 2),
  ]);

  assertJsonEqual(
    snapshot.entries.map((entry) => [entry.userId, entry.points]),
    [
      ["user-a", 3],
      ["user-b", 2],
      ["user-c", 0],
    ],
  );
});

test("tie is broken by exact count", () => {
  const snapshot = build([
    prediction("user-a", "match-1", 2, 1),
    prediction("user-b", "match-1", 3, 2),
    prediction("user-b", "match-3", 0, 1),
  ]);

  assert.equal(snapshot.entries[0].userId, "user-a");
  assert.equal(snapshot.entries[0].points, 3);
  assert.equal(snapshot.entries[1].points, 3);
});

test("tie is broken by goal difference count", () => {
  const snapshot = build([
    prediction("user-a", "match-1", 3, 2),
    prediction("user-b", "match-1", 3, 1),
    prediction("user-b", "match-3", 1, 2),
  ]);

  assert.equal(snapshot.entries[0].userId, "user-a");
  assert.equal(snapshot.entries[0].goalDifferenceCount, 1);
  assert.equal(snapshot.entries[1].tendencyCount, 2);
});

test("tendency count is tracked before final deterministic display-name tie", () => {
  const snapshot = build([
    prediction("user-a", "match-1", 3, 1),
    prediction("user-b", "match-1", 0, 0),
  ]);

  assert.equal(snapshot.entries[0].userId, "user-a");
  assert.equal(snapshot.entries[0].tendencyCount, 1);
  assert.equal(snapshot.entries[1].missCount, 1);
});

test("final deterministic tie uses display name and user id", () => {
  const snapshot = build([], {
    members: [
      member("user-c", "Blair"),
      member("user-b", "Blair"),
      member("user-a", "Alex"),
    ],
  });

  assertJsonEqual(
    snapshot.entries.map((entry) => entry.userId),
    ["user-a", "user-b", "user-c"],
  );
});

test("non-scoreable matches are ignored", () => {
  const snapshot = build([prediction("user-a", "match-live", 2, 1)], {
    matches: [match("match-live", { homeScore90: 2, awayScore90: 1 }, "LIVE")],
  });

  assert.equal(snapshot.scoredMatchIds.length, 0);
  assert.equal(snapshot.entries[0].points, 0);
});

test("predictions for matches outside group season are ignored", () => {
  const snapshot = build([prediction("user-a", "outside-match", 2, 1)], {
    matches: [
      {
        ...match("outside-match", { homeScore90: 2, awayScore90: 1 }),
        seasonId: "other-season",
      },
    ],
  });

  assert.equal(snapshot.entries[0].points, 0);
  assert.equal(snapshot.entries[0].scoredPredictionCount, 0);
});

test("inactive and removed members are not ranked", () => {
  const snapshot = build(
    [
      prediction("user-a", "match-1", 2, 1),
      prediction("user-b", "match-1", 2, 1),
      prediction("user-c", "match-1", 2, 1),
    ],
    {
      members: [
        member("user-a", "Alex", "ACTIVE"),
        member("user-b", "Blair", "LEFT"),
        member("user-c", "Casey", "REMOVED"),
      ],
    },
  );

  assertJsonEqual(
    snapshot.entries.map((entry) => entry.userId),
    ["user-a"],
  );
});

test("snapshot input hash is stable for identical scoring input", () => {
  const first = build([prediction("user-a", "match-1", 2, 1)]);
  const second = build([prediction("user-a", "match-1", 2, 1)]);

  assert.equal(first.inputHash, second.inputHash);
});

test("snapshot input hash ignores previous rank presentation state", () => {
  const first = build([prediction("user-a", "match-1", 2, 1)]);
  const second = build([prediction("user-a", "match-1", 2, 1)], {
    previousEntries: first.entries,
  });

  assert.equal(first.inputHash, second.inputHash);
  assert.equal(second.entries[0].previousRank, 1);
});

function build(predictions, overrides = {}) {
  return buildLeaderboardSnapshot({
    groupId: "group-1",
    groupSeasonId: "group-season-1",
    canonicalSeasonId: "world-cup-2026",
    scoringPreset: "HYBRID_321",
    members: baseMembers,
    predictions,
    matches: baseMatches,
    ...overrides,
  });
}

function assertJsonEqual(actual, expected) {
  assert.equal(JSON.stringify(actual), JSON.stringify(expected));
}

function member(userId, displayName, status = "ACTIVE") {
  return {
    userId,
    displayName,
    photoUrl: null,
    role: "MEMBER",
    status,
  };
}

function match(id, score, status = "FINISHED") {
  return {
    id,
    seasonId: "world-cup-2026",
    status,
    score,
  };
}

function prediction(userId, matchId, homeGoals, awayGoals) {
  return {
    groupSeasonId: "group-season-1",
    matchId,
    userId,
    homeGoals,
    awayGoals,
    savedAtMs: 1_000,
    lockAtMs: 2_000,
    updatedAtMs: 3_000,
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
