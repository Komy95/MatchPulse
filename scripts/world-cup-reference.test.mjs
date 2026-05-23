import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";
import vm from "node:vm";
import ts from "typescript";

const moduleCache = new Map();
const {
  buildGroupsWithTeams,
  buildTeamFixtureMap,
  groupFixturesByGroup,
  groupNodesByStage,
  readableBracketSource,
  readableSquadStatus,
  sortFixtures,
  sortTeams,
} = loadTsModule("lib/world-cup/view-model.ts");

test("world cup groups render teams from reference ids without hardcoded UI data", () => {
  const groups = buildGroupsWithTeams(
    [
      group("wc2026-group-b", "B", 1, ["canada", "qatar"]),
      group("wc2026-group-a", "A", 0, ["mexico", "missing-team", "south-africa"]),
    ],
    [
      team("qatar", "Qatar", "B2"),
      team("south-africa", "South Africa", "A2"),
      team("mexico", "Mexico", "A1"),
      team("canada", "Canada", "B1"),
    ],
  );

  assert.deepEqual(plain(groups.map((candidate) => candidate.code)), ["A", "B"]);
  assert.deepEqual(plain(groups[0].teams.map((candidate) => candidate.id)), ["mexico", "south-africa"]);
});

test("world cup teams sort by group position for the public list", () => {
  const teams = sortTeams([
    team("qatar", "Qatar", "B2"),
    team("south-africa", "South Africa", "A2"),
    team("mexico", "Mexico", "A1"),
    team("canada", "Canada", "B1"),
  ]);

  assert.deepEqual(plain(teams.map((candidate) => candidate.id)), ["mexico", "south-africa", "canada", "qatar"]);
});

test("world cup squad status remains understandable when squad players are unknown", () => {
  assert.equal(readableSquadStatus(undefined), "Unknown");
  assert.equal(readableSquadStatus("final"), "Final");
  assert.equal(readableSquadStatus("updated"), "Updated");
});

test("world cup fixtures group by group and tolerate missing kickoff times", () => {
  const fixtures = sortFixtures([
    fixture("match-b2", "B", 2, null),
    fixture("match-a2", "A", 2, null),
    fixture("match-a1", "A", 1, null),
  ]);
  const grouped = groupFixturesByGroup(fixtures);

  assert.deepEqual(plain(fixtures.map((match) => match.id)), ["match-a1", "match-a2", "match-b2"]);
  assert.deepEqual(plain(grouped.map((groupedFixtures) => groupedFixtures.groupCode)), ["A", "B"]);
});

test("world cup team fixture map includes home and away matches", () => {
  const byTeam = buildTeamFixtureMap([
    fixture("match-1", "A", 1, null, { homeTeamId: "mexico", awayTeamId: "canada" }),
    fixture("match-2", "A", 2, null, { homeTeamId: "qatar", awayTeamId: "mexico" }),
  ]);

  assert.deepEqual(plain(byTeam.get("mexico")?.map((match) => match.id)), ["match-1", "match-2"]);
});

test("world cup bracket nodes group by stage and unresolved placeholders stay explicit", () => {
  const grouped = groupNodesByStage([
    bracketNode("final-1", "final", 1),
    bracketNode("r32-2", "round_of_32", 2),
    bracketNode("r32-1", "round_of_32", 1),
  ]);

  assert.equal(grouped[0].stage, "round_of_32");
  assert.deepEqual(plain(grouped[0].nodes.map((node) => node.id)), ["r32-1", "r32-2"]);
  assert.equal(readableBracketSource("TBD_R32_1_home"), "Round of 32 place to be confirmed");
});

function plain(value) {
  return JSON.parse(JSON.stringify(value));
}

function group(id, code, sortOrder, teamIds) {
  return {
    id,
    code,
    name: `Group ${code}`,
    teamIds,
    sortOrder,
  };
}

function team(id, name, groupPosition) {
  return {
    id,
    name,
    shortName: name,
    countryCode: id.slice(0, 2).toUpperCase(),
    fifaCode: id.slice(0, 3).toUpperCase(),
    confederation: null,
    groupCode: groupPosition.slice(0, 1),
    groupPosition,
    status: "confirmed",
    coachName: null,
  };
}

function fixture(id, groupCode, matchday, kickoffAt, overrides = {}) {
  return {
    id,
    competitionId: "fifa-world-cup",
    seasonId: "world-cup-2026",
    stage: "group",
    groupCode,
    matchday,
    homeTeamId: null,
    awayTeamId: null,
    homeTeam: null,
    awayTeam: null,
    homeSource: null,
    awaySource: null,
    kickoffAt,
    lockAt: kickoffAt,
    venue: null,
    status: "SCHEDULED",
    lifecycleStatus: "scheduled",
    score: {
      homeScore90: null,
      awayScore90: null,
      homeScoreFinal: null,
      awayScoreFinal: null,
    },
    winnerTeamId: null,
    source: null,
    freshness: null,
    updatedAt: null,
    ...overrides,
  };
}

function bracketNode(id, stage, position) {
  return {
    id,
    stage,
    position,
    matchId: null,
    match: null,
    status: "unresolved",
    homeSource: "TBD_R32_1_home",
    awaySource: "TBD_R32_1_away",
    homeTeamId: null,
    awayTeamId: null,
    homeTeam: null,
    awayTeam: null,
    winnerTargetNodeId: null,
    loserTargetNodeId: null,
    mappingStatus: null,
    source: null,
    freshness: null,
    updatedAt: null,
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
      if (specifier === "@/lib/world-cup/reference-data") {
        return {};
      }

      throw new Error(`Unsupported test module import: ${specifier}`);
    },
  };

  vm.runInNewContext(transpiled.outputText, sandbox, { filename: file });

  return loadedModule.exports;
}
