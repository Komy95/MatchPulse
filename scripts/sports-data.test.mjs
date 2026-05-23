import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";
import vm from "node:vm";
import ts from "typescript";

const moduleFiles = new Map([
  ["@/lib/sports-data/ids", "lib/sports-data/ids.ts"],
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
  deterministicProviderEntityId,
  deterministicSportsDocumentId,
} = loadModule("@/lib/sports-data/ids");
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
  assert.equal(batch.teams.length, 2);
  assert.equal(batch.matches.length, 1);
  assert.equal(batch.matches[0].status, "FINISHED");
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
