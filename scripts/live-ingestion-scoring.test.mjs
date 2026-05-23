import assert from "node:assert/strict";
import { createRequire } from "node:module";
import { readFileSync } from "node:fs";
import test, { beforeEach } from "node:test";
import vm from "node:vm";
import ts from "typescript";
import { initializeApp as initializeAdminApp, getApps } from "firebase-admin/app";
import { getFirestore, Timestamp } from "firebase-admin/firestore";

const require = createRequire(import.meta.url);
const projectId = process.env.GCLOUD_PROJECT ?? process.env.FIREBASE_PROJECT_ID ?? "matchpulse-test";
const firestoreHost = process.env.FIRESTORE_EMULATOR_HOST ?? "127.0.0.1:8080";

if (!process.env.FIRESTORE_EMULATOR_HOST) {
  throw new Error("FIRESTORE_EMULATOR_HOST is required for emulator-backed tests.");
}

if (!getApps().length) {
  initializeAdminApp({ projectId });
}

const adminFirestore = getFirestore();
const eventBusListeners = new Map();
const eventBus = {
  on(topic, listener) {
    const listeners = eventBusListeners.get(topic) ?? [];
    listeners.push(listener);
    eventBusListeners.set(topic, listeners);

    return () => {
      eventBusListeners.set(
        topic,
        (eventBusListeners.get(topic) ?? []).filter((candidate) => candidate !== listener),
      );
    };
  },
  emit(topic, payload) {
    for (const listener of eventBusListeners.get(topic) ?? []) {
      void listener(payload);
    }
  },
};

const request = {
  competitionId: "fifa-world-cup",
  seasonId: "world-cup-2026",
};
const groupId = "group-live-1";
const groupSeasonId = "group-season-live-1";
const matchId = "mock-match-001";

beforeEach(async () => {
  eventBusListeners.clear();
  await clearFirestore();
});

test("live ingestion emits match-finished and recalculates group leaderboard", async () => {
  const provider = new MockSportsDataProvider(basePayload(), "2026-05-22T12:00:00.000Z");
  const writer = new FirestoreSportsDataWriter();

  await ingestCompetitionSeason({ provider, writer, request });
  await seedGroupAndPredictions();
  initializeEventSubscribers();

  const scheduledSummary = await ingestLiveUpdates({ provider, writer, request });
  let matchSnap = await matchDoc().get();

  assert.equal(scheduledSummary.matchesUpserted, 0);
  assert.equal(matchSnap.data().status, "SCHEDULED");

  provider.setMockMatchState("match-001", {
    status: "LIVE",
    score: {
      homeScore90: 1,
      awayScore90: 0,
      homeScoreFinal: null,
      awayScoreFinal: null,
    },
  });

  const liveSummary = await ingestLiveUpdates({ provider, writer, request });
  matchSnap = await matchDoc().get();

  assert.equal(liveSummary.matchesUpserted, 1);
  assert.equal(liveSummary.finishedEventsPublished, 0);
  assert.equal(matchSnap.data().status, "LIVE");
  assert.equal((await snapshotDoc().get()).exists, false);

  provider.setMockMatchState("match-001", {
    status: "FINISHED",
    score: {
      homeScore90: 2,
      awayScore90: 1,
      homeScoreFinal: 2,
      awayScoreFinal: 1,
    },
  });

  const finishedSummary = await ingestLiveUpdates({ provider, writer, request });

  assert.equal(finishedSummary.matchesUpserted, 1);
  assert.equal(finishedSummary.finishedEventsPublished, 1);

  const snapshot = await waitForSnapshot();

  assert.equal(snapshot.generatedBy, "SYSTEM_EVENT");
  assert.deepEqual(
    snapshot.entries.map(({ userId, points, exactCount, tendencyCount, rank }) => ({
      userId,
      points,
      exactCount,
      tendencyCount,
      rank,
    })),
    [
      { userId: "user-a", points: 3, exactCount: 1, tendencyCount: 0, rank: 1 },
      { userId: "user-b", points: 1, exactCount: 0, tendencyCount: 1, rank: 2 },
    ],
  );
});

async function seedGroupAndPredictions() {
  const now = Timestamp.now();
  const groupRef = adminFirestore.collection("groups").doc(groupId);
  const groupSeasonRef = groupRef.collection("seasons").doc(groupSeasonId);
  const batch = adminFirestore.batch();

  batch.set(groupRef, {
    name: "Live Test Group",
    slug: "live-test-group",
    ownerId: "user-a",
    memberCount: 2,
    activeGroupSeasonId: groupSeasonId,
    createdAt: now,
    updatedAt: now,
    archivedAt: null,
  });
  batch.set(groupRef.collection("members").doc("user-a"), member("user-a", "Alex", "OWNER", now));
  batch.set(groupRef.collection("members").doc("user-b"), member("user-b", "Blair", "MEMBER", now));
  batch.set(groupSeasonRef, {
    groupId,
    competitionId: request.competitionId,
    seasonId: request.seasonId,
    label: "FIFA World Cup 2026",
    status: "ACTIVE",
    scoringPreset: "HYBRID_321",
    predictionMode: "EXACT_SCORE",
    allowBooster: true,
    predictionVisibility: "AFTER_LOCK",
    createdAt: now,
    updatedAt: now,
    startsAt: Timestamp.fromDate(new Date("2026-06-11T00:00:00.000Z")),
    endsAt: Timestamp.fromDate(new Date("2026-07-19T23:59:59.000Z")),
  });
  batch.set(
    groupSeasonRef.collection("predictions").doc(`${matchId}_user-a`),
    prediction("user-a", 2, 1, now),
  );
  batch.set(
    groupSeasonRef.collection("predictions").doc(`${matchId}_user-b`),
    prediction("user-b", 3, 1, now),
  );

  await batch.commit();
}

function member(userId, displayName, role, now) {
  return {
    userId,
    displayName,
    photoUrl: null,
    role,
    status: "ACTIVE",
    joinedAt: now,
    updatedAt: now,
  };
}

function prediction(userId, homeGoals, awayGoals, now) {
  return {
    groupId,
    groupSeasonId,
    matchId,
    userId,
    homeGoals,
    awayGoals,
    predictionMode: "EXACT_SCORE",
    booster: false,
    savedAt: Timestamp.fromMillis(Date.parse("2026-06-12T19:00:00.000Z")),
    updatedAt: now,
    lockAt: "2026-06-12T20:00:00.000Z",
    status: "SAVED",
  };
}

function basePayload() {
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
        status: "scheduled",
        stage: "GROUP_STAGE",
        groupCode: "A",
      },
    ],
  };
}

function matchDoc() {
  return adminFirestore
    .collection("competitions")
    .doc(request.competitionId)
    .collection("seasons")
    .doc(request.seasonId)
    .collection("matches")
    .doc(matchId);
}

function snapshotDoc() {
  return adminFirestore
    .collection("groups")
    .doc(groupId)
    .collection("seasons")
    .doc(groupSeasonId)
    .collection("leaderboardSnapshots")
    .doc("latest");
}

async function waitForSnapshot() {
  const startedAt = Date.now();

  while (Date.now() - startedAt < 5_000) {
    const snapshot = await snapshotDoc().get();

    if (snapshot.exists) {
      return snapshot.data();
    }

    await new Promise((resolve) => setTimeout(resolve, 50));
  }

  throw new Error("Timed out waiting for leaderboard snapshot.");
}

async function clearFirestore() {
  const response = await fetch(
    `http://${firestoreHost}/emulator/v1/projects/${projectId}/databases/(default)/documents`,
    {
      method: "DELETE",
    },
  );

  if (!response.ok) {
    throw new Error(`Could not clear Firestore emulator: ${response.status}`);
  }
}

const moduleFiles = new Map([
  ["$/lib/api/errors", "lib/api/errors.ts"],
  ["$/lib/events/subscribers", "lib/events/subscribers.ts"],
  ["$/lib/leaderboard/domain", "lib/leaderboard/domain.ts"],
  ["$/lib/leaderboard/service", "lib/leaderboard/service.ts"],
  ["$/lib/scoring/domain", "lib/scoring/domain.ts"],
  ["$/lib/sports-data/firestore/writer", "lib/sports-data/firestore/writer.ts"],
  ["$/lib/sports-data/ids", "lib/sports-data/ids.ts"],
  ["$/lib/sports-data/ingestion/service", "lib/sports-data/ingestion/service.ts"],
  ["$/lib/sports-data/providers/mock", "lib/sports-data/providers/mock.ts"],
  ["$/lib/sports-data/providers/types", "lib/sports-data/providers/types.ts"],
]);
const moduleCache = new Map();
const { MockSportsDataProvider } = load("$/lib/sports-data/providers/mock");
const { FirestoreSportsDataWriter } = load("$/lib/sports-data/firestore/writer");
const {
  ingestCompetitionSeason,
  ingestLiveUpdates,
} = load("$/lib/sports-data/ingestion/service");
const { initializeEventSubscribers } = load("$/lib/events/subscribers");

function load(specifier) {
  if (specifier === "@/lib/firebase/admin") {
    return {
      getFirebaseAdminFirestore() {
        return adminFirestore;
      },
    };
  }

  if (specifier === "@/lib/events" || specifier === "$/lib/events") {
    return { eventBus };
  }

  if (specifier === "@/lib/api/errors" || specifier === "$/lib/api/errors") {
    class ApiError extends Error {
      constructor(code, message, details = {}) {
        super(message);
        this.name = "ApiError";
        this.code = code;
        this.details = details;
      }
    }

    return { ApiError };
  }

  if (specifier === "firebase-admin/firestore") {
    return require("firebase-admin/firestore");
  }

  if (specifier === "node:crypto") {
    return require("node:crypto");
  }

  const normalizedSpecifier = specifier.replace(/^@\//, "$/");
  const file = moduleFiles.get(normalizedSpecifier);

  if (!file) {
    throw new Error(`Unsupported test module import: ${specifier}`);
  }

  if (moduleCache.has(normalizedSpecifier)) {
    return moduleCache.get(normalizedSpecifier).exports;
  }

  const loadedModule = { exports: {} };
  moduleCache.set(normalizedSpecifier, loadedModule);
  const source = readFileSync(file, "utf8");
  const transpiled = ts.transpileModule(source, {
    compilerOptions: {
      module: ts.ModuleKind.CommonJS,
      target: ts.ScriptTarget.ES2020,
    },
  });
  const sandbox = {
    console,
    exports: loadedModule.exports,
    module: loadedModule,
    require: load,
  };

  vm.runInNewContext(transpiled.outputText, sandbox, { filename: file });

  return loadedModule.exports;
}
