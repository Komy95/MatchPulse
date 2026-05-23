import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";
import vm from "node:vm";
import ts from "typescript";

const moduleCache = new Map();
const { buildGroupsWithTeams, readableSquadStatus, sortTeams } = loadTsModule("lib/world-cup/view-model.ts");

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
