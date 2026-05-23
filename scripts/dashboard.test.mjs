import assert from "node:assert/strict";
import { createRequire } from "node:module";
import { readFileSync } from "node:fs";
import test from "node:test";
import vm from "node:vm";
import ts from "typescript";

const require = createRequire(import.meta.url);
const moduleCache = new Map();
const { buildDashboardViewModel } = loadTsModule("lib/dashboard/domain.ts");
const nowMs = Date.parse("2026-06-12T12:00:00.000Z");

test("dashboard prioritizes creating a group when user has no groups", () => {
  const dashboard = buildDashboardViewModel({
    userId: "user-1",
    groups: [],
    nowMs,
  });

  assert.equal(dashboard.nextAction.kind, "CREATE_GROUP");
  assert.equal(dashboard.predictionProgress.missingOpen, 0);
});

test("dashboard prioritizes soon-locking missing predictions", () => {
  const dashboard = buildDashboardViewModel({
    userId: "user-1",
    groups: [
      group({
        matches: [
          match("match-1", {
            lockAt: "2026-06-12T20:00:00.000Z",
            predictionState: "MISSING",
          }),
          match("match-2", {
            lockAt: "2026-06-13T20:00:00.000Z",
            predictionState: "SAVED",
          }),
        ],
      }),
    ],
    nowMs,
  });

  assert.equal(dashboard.nextAction.kind, "MAKE_PICKS");
  assert.equal(dashboard.nextAction.title, "1 pick locks soon");
  assert.equal(dashboard.predictionProgress.totalOpen, 2);
  assert.equal(dashboard.predictionProgress.missingOpen, 1);
  assert.equal(dashboard.predictionProgress.savedOpen, 1);
  assert.equal(dashboard.continuePredicting[0].id, "match-1");
});

test("dashboard shows next matches when open predictions are complete", () => {
  const dashboard = buildDashboardViewModel({
    userId: "user-1",
    groups: [
      group({
        matches: [
          match("match-1", {
            lockAt: "2026-06-12T20:00:00.000Z",
            predictionState: "SAVED",
          }),
        ],
      }),
    ],
    nowMs,
  });

  assert.equal(dashboard.nextAction.kind, "VIEW_NEXT_MATCHES");
  assert.equal(dashboard.predictionProgress.missingOpen, 0);
  assert.equal(dashboard.nextLocks[0].id, "match-1");
});

test("dashboard falls back to leaderboard when no active matches remain", () => {
  const dashboard = buildDashboardViewModel({
    userId: "user-1",
    groups: [
      group({
        matches: [
          match("match-1", {
            lockAt: "2026-06-11T20:00:00.000Z",
            status: "FINISHED",
            predictionState: "LOCKED_SAVED",
          }),
        ],
        leaderboardSummary: {
          groupId: "group-1",
          groupName: "Friends",
          groupSeasonId: "group-season-1",
          snapshotAt: "2026-06-12T10:00:00.000Z",
          userRank: 2,
          userPoints: 3,
          leaderName: "Alex",
          leaderPoints: 5,
          topEntries: [],
          href: "/groups/group-1",
        },
      }),
    ],
    nowMs,
  });

  assert.equal(dashboard.nextAction.kind, "VIEW_LEADERBOARD");
  assert.equal(dashboard.leaderboardSummaries.length, 1);
});

function group(overrides = {}) {
  return {
    id: "group-1",
    name: "Friends",
    memberCount: 2,
    activeGroupSeason: {
      id: "group-season-1",
      label: "FIFA World Cup 2026",
      status: "ACTIVE",
    },
    matches: [],
    leaderboardSummary: null,
    ...overrides,
  };
}

function match(id, overrides = {}) {
  return {
    id,
    groupId: "group-1",
    groupName: "Friends",
    groupSeasonId: "group-season-1",
    groupSeasonLabel: "FIFA World Cup 2026",
    homeTeam: "USA",
    awayTeam: "CAN",
    kickoffAt: "2026-06-12T20:00:00.000Z",
    lockAt: "2026-06-12T20:00:00.000Z",
    status: "SCHEDULED",
    predictionState: "MISSING",
    href: "/groups/group-1",
    ...overrides,
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
      if (specifier === "@/lib/dashboard/types") {
        return {};
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
