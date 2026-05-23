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
const moduleFiles = new Map([
  ["$/lib/dashboard/domain", "lib/dashboard/domain.ts"],
  ["$/lib/dashboard/service", "lib/dashboard/service.ts"],
]);
const moduleCache = new Map();
const { getUserDashboard } = load("$/lib/dashboard/service");

beforeEach(async () => {
  await clearFirestore();
});

test("dashboard aggregates only active member groups and excludes locked missing picks", async () => {
  await seedDashboardFixture();

  const dashboard = await getUserDashboard("member-1");

  assert.equal(JSON.stringify(dashboard.groups.map((group) => group.name)), "[\"Member Group\"]");
  assert.equal(dashboard.predictionProgress.totalOpen, 1);
  assert.equal(dashboard.predictionProgress.missingOpen, 1);
  assert.equal(dashboard.continuePredicting.length, 1);
  assert.equal(dashboard.continuePredicting[0].id, "open-match");
  assert.equal(dashboard.nextAction.kind, "MAKE_PICKS");
  assert.equal(dashboard.nextLocks.some((match) => match.id === "locked-match"), true);
  assert.equal(
    dashboard.continuePredicting.some((match) => match.id === "locked-match"),
    false,
  );
  assert.equal(dashboard.leaderboardSummaries.length, 1);
  assert.equal(dashboard.leaderboardSummaries[0].userRank, 2);
});

async function seedDashboardFixture() {
  const now = Timestamp.now();
  const batch = adminFirestore.batch();

  seedReferenceData(batch);
  seedGroup({
    batch,
    groupId: "group-member",
    groupName: "Member Group",
    memberUserId: "member-1",
    includeMember: true,
    now,
  });
  seedGroup({
    batch,
    groupId: "group-nonmember",
    groupName: "Hidden Group",
    memberUserId: "other-user",
    includeMember: true,
    now,
  });

  await batch.commit();
}

function seedReferenceData(batch) {
  const seasonRef = adminFirestore
    .collection("competitions")
    .doc("fifa-world-cup")
    .collection("seasons")
    .doc("world-cup-2026");

  batch.set(seasonRef, {
    competitionId: "fifa-world-cup",
    label: "FIFA World Cup 2026",
    startsAt: "2026-06-11T00:00:00.000Z",
    endsAt: "2026-07-19T23:59:59.000Z",
    updatedAt: "2026-05-22T00:00:00.000Z",
  });
  batch.set(seasonRef.collection("teams").doc("team-usa"), {
    name: "United States",
    shortName: "USA",
    countryCode: "US",
  });
  batch.set(seasonRef.collection("teams").doc("team-can"), {
    name: "Canada",
    shortName: "CAN",
    countryCode: "CA",
  });
  batch.set(seasonRef.collection("matches").doc("open-match"), {
    competitionId: "fifa-world-cup",
    seasonId: "world-cup-2026",
    homeTeamId: "team-usa",
    awayTeamId: "team-can",
    kickoffAt: "2099-06-12T20:00:00.000Z",
    lockAt: "2099-06-12T20:00:00.000Z",
    status: "SCHEDULED",
    stage: "GROUP_STAGE",
    groupCode: "A",
    venue: null,
  });
  batch.set(seasonRef.collection("matches").doc("locked-match"), {
    competitionId: "fifa-world-cup",
    seasonId: "world-cup-2026",
    homeTeamId: "team-usa",
    awayTeamId: "team-can",
    kickoffAt: "2020-06-12T20:00:00.000Z",
    lockAt: "2020-06-12T20:00:00.000Z",
    status: "SCHEDULED",
    stage: "GROUP_STAGE",
    groupCode: "A",
    venue: null,
  });
}

function seedGroup({ batch, groupId, groupName, memberUserId, includeMember, now }) {
  const groupRef = adminFirestore.collection("groups").doc(groupId);
  const groupSeasonRef = groupRef.collection("seasons").doc("group-season-1");

  batch.set(groupRef, {
    name: groupName,
    slug: groupName.toLowerCase().replace(/\s+/g, "-"),
    ownerId: memberUserId,
    memberCount: 1,
    activeGroupSeasonId: "group-season-1",
    createdAt: now,
    updatedAt: now,
    archivedAt: null,
  });
  batch.set(groupSeasonRef, {
    groupId,
    competitionId: "fifa-world-cup",
    seasonId: "world-cup-2026",
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

  if (includeMember) {
    batch.set(groupRef.collection("members").doc(memberUserId), {
      userId: memberUserId,
      displayName: memberUserId,
      photoUrl: null,
      role: "OWNER",
      status: "ACTIVE",
      joinedAt: now,
      updatedAt: now,
    });
  }

  batch.set(groupSeasonRef.collection("leaderboardSnapshots").doc("latest"), {
    groupId,
    groupSeasonId: "group-season-1",
    snapshotAt: now,
    scoringPreset: "HYBRID_321",
    scoredMatchIds: ["finished-match"],
    generatedBy: "TRUSTED_JOB",
    entries: [
      {
        userId: "other-user",
        displayName: "Other",
        photoUrl: null,
        rank: 1,
        previousRank: null,
        points: 6,
        exactCount: 2,
        goalDifferenceCount: 0,
        tendencyCount: 0,
        missCount: 0,
        scoredPredictionCount: 2,
        lastScoredAt: now.toDate().toISOString(),
      },
      {
        userId: memberUserId,
        displayName: memberUserId,
        photoUrl: null,
        rank: 2,
        previousRank: null,
        points: 3,
        exactCount: 1,
        goalDifferenceCount: 0,
        tendencyCount: 0,
        missCount: 0,
        scoredPredictionCount: 1,
        lastScoredAt: now.toDate().toISOString(),
      },
    ],
    inputHash: `${groupId}-hash`,
    createdAt: now,
  });
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

function load(specifier) {
  if (specifier === "@/lib/firebase/admin") {
    return {
      getFirebaseAdminFirestore() {
        return adminFirestore;
      },
    };
  }

  if (specifier === "firebase-admin/firestore") {
    return require("firebase-admin/firestore");
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
      target: ts.ScriptTarget.ES2016,
    },
  });
  const sandbox = {
    exports: loadedModule.exports,
    module: loadedModule,
    Promise,
    require: load,
  };

  vm.runInNewContext(transpiled.outputText, sandbox, { filename: file });

  return loadedModule.exports;
}
