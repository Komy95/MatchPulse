import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";
import vm from "node:vm";
import ts from "typescript";

const moduleFiles = new Map([
  ["@/lib/sports-data/ids", "lib/sports-data/ids.ts"],
  ["@/lib/sports-data/domain", "lib/sports-data/domain.ts"],
  ["@/lib/sports-data/validation", "lib/sports-data/validation.ts"],
  ["@/lib/sports-data/providers/types", "lib/sports-data/providers/types.ts"],
  ["@/lib/sports-data/providers/mock", "lib/sports-data/providers/mock.ts"],
  ["@/lib/sports-data/firestore/writer", "lib/sports-data/firestore/writer.ts"],
  ["@/lib/sports-data/ingestion/service", "lib/sports-data/ingestion/service.ts"],
]);

const moduleCache = new Map();

function loadModule(specifier) {
  if (specifier === "@/lib/firebase/admin") {
    return {
      getFirebaseAdminFirestore() {
        throw new Error("Firestore admin is not available in unit tests.");
      },
    };
  }

  if (specifier === "@/lib/events") {
    return {
      eventBus: {
        emit() {},
      },
    };
  }

  const file = moduleFiles.get(specifier);
  if (!file) {
    throw new Error(`Unsupported test module import: ${specifier}`);
  }

  if (moduleCache.has(specifier)) {
    return moduleCache.get(specifier).exports;
  }

  const loadedModule = { exports: {} };
  moduleCache.set(specifier, loadedModule);

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
    require: loadModule,
  };

  vm.runInNewContext(transpiled.outputText, sandbox, { filename: file });

  return loadedModule.exports;
}

const {
  MockSportsDataProvider,
  mapMockProviderPayload,
  normalizeMockMatchStatus,
} = loadModule("@/lib/sports-data/providers/mock");
const {
  bracketNodeDocumentId,
  deterministicProviderEntityId,
  deterministicSportsDocumentId,
  playerDocumentId,
  squadDocumentId,
  teamDocumentId,
  tournamentGroupDocumentId,
} = loadModule("@/lib/sports-data/ids");
const {
  validateBracketNode,
  validateSquad,
  validateTeam,
  validateTournamentGroup,
  validateTournamentReferenceData,
} = loadModule("@/lib/sports-data/validation");
const { ingestCompetitionSeason } = loadModule("@/lib/sports-data/ingestion/service");
const { summarizeBatch } = loadModule("@/lib/sports-data/firestore/writer");

const request = {
  competitionId: "fifa-world-cup",
  seasonId: "world-cup-2026",
};

function basePayload(overrides = {}) {
  return {
    competition: {
      externalId: "mock-wc",
      name: "FIFA World Cup",
    },
    season: {
      externalId: "mock-wc-2026",
      label: "FIFA World Cup 2026",
      startsAt: "2026-06-11T00:00:00.000Z",
      endsAt: "2026-07-19T23:59:59.000Z",
    },
    teams: [
      {
        externalId: "usa",
        name: "United States",
        shortName: "USA",
        countryCode: "US",
        groupCode: "A",
      },
      {
        externalId: "can",
        name: "Canada",
        shortName: "CAN",
        countryCode: "CA",
        groupCode: "A",
      },
    ],
    matches: [
      {
        externalId: "match-001",
        homeExternalId: "usa",
        awayExternalId: "can",
        kickoffAt: "2026-06-12T20:00:00.000Z",
        status: "FT",
        stage: "GROUP_STAGE",
        groupCode: "A",
        score: {
          homeScore90: 2,
          awayScore90: 1,
          homeScoreFinal: 2,
          awayScoreFinal: 1,
        },
      },
    ],
    ...overrides,
  };
}

function referenceSeason() {
  return {
    id: "world-cup-2026",
    competitionId: "fifa-world-cup",
  };
}

function referenceMetadata(externalId = "local") {
  return {
    providerId: "mock",
    externalId,
    sourceName: "MatchPulse local test",
    fetchedAt: "2026-05-22T12:00:00.000Z",
  };
}

function referenceFreshness() {
  return {
    providerId: "mock",
    fetchedAt: "2026-05-22T12:00:00.000Z",
    staleAfter: "2026-05-23T00:00:00.000Z",
  };
}

function referenceTeam(overrides = {}) {
  return {
    id: "mock-usa",
    competitionId: "fifa-world-cup",
    seasonId: "world-cup-2026",
    name: "United States",
    shortName: "USA",
    countryCode: "US",
    status: "confirmed",
    groupCode: "A",
    provider: referenceMetadata("usa"),
    freshness: referenceFreshness(),
    updatedAt: "2026-05-22T12:00:00.000Z",
    ...overrides,
  };
}

function referenceTournamentGroup(overrides = {}) {
  return {
    id: "fifa-world-cup-world-cup-2026-group-a",
    competitionId: "fifa-world-cup",
    seasonId: "world-cup-2026",
    code: "A",
    name: "Group A",
    teamIds: ["mock-usa"],
    sortOrder: 0,
    visibility: "published",
    provider: referenceMetadata("group-a"),
    freshness: referenceFreshness(),
    updatedAt: "2026-05-22T12:00:00.000Z",
    ...overrides,
  };
}

function referencePlayer(overrides = {}) {
  return {
    id: "player-1",
    competitionId: "fifa-world-cup",
    seasonId: "world-cup-2026",
    teamId: "mock-usa",
    displayName: "Alex Test",
    countryCode: "US",
    position: "forward",
    shirtNumber: 9,
    status: "active",
    provider: referenceMetadata("player-1"),
    freshness: referenceFreshness(),
    updatedAt: "2026-05-22T12:00:00.000Z",
    ...overrides,
  };
}

function referenceSquad(overrides = {}) {
  return {
    id: "squad-1",
    competitionId: "fifa-world-cup",
    seasonId: "world-cup-2026",
    teamId: "mock-usa",
    status: "provisional",
    playerIds: ["player-1"],
    publishedAt: null,
    provider: referenceMetadata("squad-1"),
    freshness: referenceFreshness(),
    updatedAt: "2026-05-22T12:00:00.000Z",
    ...overrides,
  };
}

function referenceMatch(overrides = {}) {
  return {
    id: "match-1",
    competitionId: "fifa-world-cup",
    seasonId: "world-cup-2026",
    homeTeamId: "mock-usa",
    awayTeamId: "mock-usa",
    kickoffAt: "2026-06-12T20:00:00.000Z",
    lockAt: "2026-06-12T20:00:00.000Z",
    status: "SCHEDULED",
    lifecycleStatus: "scheduled",
    stage: "GROUP_STAGE",
    groupCode: "A",
    score: {
      homeScore90: null,
      awayScore90: null,
      homeScoreFinal: null,
      awayScoreFinal: null,
    },
    provider: referenceMetadata("match-1"),
    freshness: referenceFreshness(),
    updatedAt: "2026-05-22T12:00:00.000Z",
    ...overrides,
  };
}

function referenceBracketNode(overrides = {}) {
  return {
    id: "node-1",
    competitionId: "fifa-world-cup",
    seasonId: "world-cup-2026",
    stage: "round-of-32",
    matchId: null,
    status: "unresolved",
    sortOrder: 1,
    homeSource: { type: "placeholder", label: "Winner Group A" },
    awaySource: { type: "placeholder", label: "Runner-up Group B" },
    winnerTargetNodeId: null,
    loserTargetNodeId: null,
    provider: referenceMetadata("node-1"),
    freshness: referenceFreshness(),
    updatedAt: "2026-05-22T12:00:00.000Z",
    ...overrides,
  };
}

class InMemorySportsDataWriter {
  documents = new Map();
  writeCount = 0;

  async upsertSportsDataBatch(batch) {
    this.writeCount += 1;
    const competitionPath = `competitions/${batch.competition.id}`;
    const seasonPath = `${competitionPath}/seasons/${batch.season.id}`;

    this.documents.set(competitionPath, batch.competition);
    this.documents.set(seasonPath, {
      ...batch.season,
      lastIngestedAt: batch.fetchedAt,
      teamCount: batch.teams.length,
      matchCount: batch.matches.length,
      finalMatchCount: batch.matches.filter((match) => match.status === "FINISHED").length,
    });

    for (const team of batch.teams) {
      this.documents.set(`${seasonPath}/teams/${team.id}`, team);
    }

    for (const match of batch.matches) {
      this.documents.set(`${seasonPath}/matches/${match.id}`, match);
    }

    return summarizeBatch(batch);
  }

  async upsertMatchUpdates(matches) {
    this.writeCount += 1;

    for (const match of matches) {
      this.documents.set(
        `competitions/${match.competitionId}/seasons/${match.seasonId}/matches/${match.id}`,
        match,
      );
    }
  }
}

test("mock provider maps raw provider data into normalized models", async () => {
  const provider = new MockSportsDataProvider(basePayload(), "2026-05-22T12:00:00.000Z");
  const batch = await provider.fetchCompetitionSeason(request);

  assert.equal(batch.competition.id, "fifa-world-cup");
  assert.equal(batch.season.id, "world-cup-2026");
  assert.equal(batch.tournamentGroups.length, 1);
  assert.equal(batch.teams.length, 2);
  assert.equal(batch.matches.length, 1);
  assert.equal(batch.teams[0].status, undefined);
  assert.equal(batch.matches[0].status, "FINISHED");
  assert.equal(batch.matches[0].lifecycleStatus, undefined);
  assert.equal(batch.matches[0].kickoffAt, "2026-06-12T20:00:00.000Z");
  assert.equal(batch.matches[0].lockAt, batch.matches[0].kickoffAt);
  assert.equal(batch.matches[0].provider.providerId, "mock");
});

test("document ID generation is deterministic and provider-scoped", () => {
  assert.equal(
    deterministicSportsDocumentId(["FIFA World Cup", "2026", "Match 001"]),
    "fifa-world-cup-2026-match-001",
  );
  assert.equal(
    deterministicProviderEntityId({
      providerId: "mock",
      externalId: "MATCH:001",
      fallbackParts: ["ignored"],
    }),
    "mock-match-001",
  );
  assert.equal(teamDocumentId("fifa-world-cup", "world-cup-2026", "United States"), "fifa-world-cup-world-cup-2026-team-united-states");
  assert.equal(tournamentGroupDocumentId("fifa-world-cup", "world-cup-2026", "A"), "fifa-world-cup-world-cup-2026-group-a");
  assert.equal(squadDocumentId("fifa-world-cup", "world-cup-2026", "mock-usa"), "fifa-world-cup-world-cup-2026-squad-mock-usa");
  assert.equal(playerDocumentId("fifa-world-cup", "world-cup-2026", "mock-usa", "Alex Test"), "fifa-world-cup-world-cup-2026-player-mock-usa-alex-test");
  assert.equal(bracketNodeDocumentId("fifa-world-cup", "world-cup-2026", "round-of-32", 1), "fifa-world-cup-world-cup-2026-bracket-round-of-32-01");
});

test("valid team model passes central tournament validation", () => {
  const season = referenceSeason();
  const team = referenceTeam();

  assert.doesNotThrow(() => validateTeam(team, season));
});

test("valid tournament group model passes central tournament validation", () => {
  const season = referenceSeason();
  const team = referenceTeam();
  const group = referenceTournamentGroup({ teamIds: [team.id] });

  assert.doesNotThrow(() => validateTournamentGroup(group, season, new Set([team.id])));
});

test("valid squad model passes central tournament validation", () => {
  const season = referenceSeason();
  const team = referenceTeam();
  const player = referencePlayer({ teamId: team.id });
  const squad = referenceSquad({ teamId: team.id, playerIds: [player.id] });

  assert.doesNotThrow(() =>
    validateSquad(squad, season, new Set([team.id]), new Set([player.id])),
  );
});

test("valid bracket node model passes central tournament validation", () => {
  const season = referenceSeason();
  const team = referenceTeam();
  const group = referenceTournamentGroup({ teamIds: [team.id] });
  const match = referenceMatch({ homeTeamId: team.id, awayTeamId: team.id });
  const node = referenceBracketNode({
    matchId: match.id,
    homeSource: { type: "group-rank", groupId: group.id, rank: 1 },
    awaySource: { type: "team", teamId: team.id },
  });

  assert.doesNotThrow(() =>
    validateBracketNode(
      node,
      season,
      new Set([match.id]),
      new Set([node.id]),
      new Set([team.id]),
      new Set([group.id]),
    ),
  );
});

test("central tournament validation rejects invalid references", () => {
  const season = referenceSeason();
  const team = referenceTeam();
  const player = referencePlayer({ teamId: team.id });
  const squad = referenceSquad({ teamId: team.id, playerIds: [player.id, "missing-player"] });

  assert.throws(
    () =>
      validateTournamentReferenceData({
        season,
        tournamentGroups: [referenceTournamentGroup({ teamIds: ["missing-team"] })],
        teams: [team],
        players: [player],
        squads: [squad],
        matches: [referenceMatch({ homeTeamId: team.id, awayTeamId: "missing-team" })],
        bracketNodes: [
          referenceBracketNode({
            matchId: "missing-match",
            homeSource: { type: "winner", bracketNodeId: "missing-node" },
          }),
        ],
      }),
    /unknown team|unknown player|unknown match|unknown bracket node/,
  );
});

test("ingestion upserts are idempotent for repeated provider batches", async () => {
  const provider = new MockSportsDataProvider(basePayload(), "2026-05-22T12:00:00.000Z");
  const writer = new InMemorySportsDataWriter();

  const first = await ingestCompetitionSeason({ provider, writer, request });
  const documentCountAfterFirstRun = writer.documents.size;
  const second = await ingestCompetitionSeason({ provider, writer, request });

  assert.deepEqual(first, second);
  assert.equal(writer.documents.size, documentCountAfterFirstRun);
  assert.equal(first.teamsUpserted, 2);
  assert.equal(first.matchesUpserted, 1);
  assert.equal(first.finalMatches, 1);
});

test("freshness metadata updates on subsequent ingestion runs", async () => {
  const writer = new InMemorySportsDataWriter();
  await ingestCompetitionSeason({
    provider: new MockSportsDataProvider(basePayload(), "2026-05-22T12:00:00.000Z"),
    writer,
    request,
  });
  await ingestCompetitionSeason({
    provider: new MockSportsDataProvider(basePayload(), "2026-05-22T13:00:00.000Z"),
    writer,
    request,
  });

  const season = writer.documents.get("competitions/fifa-world-cup/seasons/world-cup-2026");
  assert.equal(season.freshness.fetchedAt, "2026-05-22T13:00:00.000Z");
  assert.equal(season.lastIngestedAt, "2026-05-22T13:00:00.000Z");
});

test("match status normalization covers provider status variants", () => {
  assert.equal(normalizeMockMatchStatus("TIMED"), "SCHEDULED");
  assert.equal(normalizeMockMatchStatus("in-play"), "LIVE");
  assert.equal(normalizeMockMatchStatus("HALF TIME"), "HALFTIME");
  assert.equal(normalizeMockMatchStatus("FT"), "FINISHED");
  assert.equal(normalizeMockMatchStatus("canceled"), "CANCELLED");
});

test("mock provider live updates include live, halftime, and finished matches only", async () => {
  const provider = new MockSportsDataProvider(
    basePayload({
      matches: [
        {
          externalId: "match-001",
          homeExternalId: "usa",
          awayExternalId: "can",
          kickoffAt: "2026-06-12T20:00:00.000Z",
          status: "scheduled",
          stage: "GROUP_STAGE",
        },
      ],
    }),
    "2026-05-22T12:00:00.000Z",
  );

  assert.equal((await provider.fetchLiveMatches(request)).length, 0);

  provider.setMockMatchState("match-001", {
    status: "LIVE",
    score: {
      homeScore90: 1,
      awayScore90: 0,
    },
  });

  const liveMatches = await provider.fetchLiveMatches(request);

  assert.equal(liveMatches.length, 1);
  assert.equal(liveMatches[0].status, "LIVE");
  assert.equal(liveMatches[0].score.homeScore90, 1);
});

test("mock provider match state score overrides preserve existing score fields", async () => {
  const provider = new MockSportsDataProvider(basePayload(), "2026-05-22T12:00:00.000Z");

  provider.setMockMatchState("match-001", {
    score: {
      homeScore90: 3,
    },
  });

  const match = await provider.fetchMatchDetails(request, "match-001");

  assert.equal(match.score.homeScore90, 3);
  assert.equal(match.score.awayScore90, 1);
  assert.equal(match.score.homeScoreFinal, 2);
  assert.equal(match.score.awayScoreFinal, 1);
});

test("mock provider resolves match details by provider external ID", async () => {
  const provider = new MockSportsDataProvider(basePayload(), "2026-05-22T12:00:00.000Z");
  const match = await provider.fetchMatchDetails(request, "match-001");

  assert.equal(match.provider.externalId, "match-001");
  assert.equal(match.status, "FINISHED");

  await assert.rejects(() => provider.fetchMatchDetails(request, "missing-match"), /not found/);
});

test("invalid provider data is rejected before persistence", async () => {
  const writer = new InMemorySportsDataWriter();
  const provider = new MockSportsDataProvider(
    basePayload({
      matches: [
        {
          externalId: "match-001",
          homeExternalId: "usa",
          awayExternalId: "mex",
          kickoffAt: "2026-06-12T20:00:00.000Z",
          status: "scheduled",
          stage: "GROUP_STAGE",
        },
      ],
    }),
    "2026-05-22T12:00:00.000Z",
  );

  await assert.rejects(
    () => ingestCompetitionSeason({ provider, writer, request }),
    /unknown team/,
  );
  assert.equal(writer.documents.size, 0);
});

test("non-UTC provider timestamps are rejected", () => {
  assert.throws(
    () =>
      mapMockProviderPayload(
        basePayload({
          matches: [
            {
              externalId: "match-001",
              homeExternalId: "usa",
              awayExternalId: "can",
              kickoffAt: "2026-06-12T20:00:00.000+02:00",
              status: "scheduled",
              stage: "GROUP_STAGE",
            },
          ],
        }),
        request,
        "2026-05-22T12:00:00.000Z",
      ),
    /ISO UTC/,
  );
});
