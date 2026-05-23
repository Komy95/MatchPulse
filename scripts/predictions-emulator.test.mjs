import assert from "node:assert/strict";
import { createRequire } from "node:module";
import { readFileSync } from "node:fs";
import { pathToFileURL } from "node:url";
import test, { beforeEach } from "node:test";
import vm from "node:vm";
import ts from "typescript";
import { initializeApp as initializeAdminApp, getApps } from "firebase-admin/app";
import { getFirestore, Timestamp } from "firebase-admin/firestore";
import {
  connectAuthEmulator,
  createUserWithEmailAndPassword,
  getAuth,
} from "firebase/auth";
import {
  connectFirestoreEmulator,
  doc,
  getDoc,
  getFirestore as getClientFirestore,
  setDoc,
} from "firebase/firestore";
import { deleteApp, initializeApp } from "firebase/app";

const require = createRequire(import.meta.url);
const projectId = process.env.GCLOUD_PROJECT ?? process.env.FIREBASE_PROJECT_ID ?? "matchpulse-test";
const firestoreHost = process.env.FIRESTORE_EMULATOR_HOST ?? "127.0.0.1:8080";
const authHost = process.env.FIREBASE_AUTH_EMULATOR_HOST ?? "127.0.0.1:9099";

if (!process.env.FIRESTORE_EMULATOR_HOST) {
  throw new Error("FIRESTORE_EMULATOR_HOST is required for emulator-backed tests.");
}

if (!process.env.FIREBASE_AUTH_EMULATOR_HOST) {
  throw new Error("FIREBASE_AUTH_EMULATOR_HOST is required for emulator-backed tests.");
}

if (!getApps().length) {
  initializeAdminApp({ projectId });
}

const adminFirestore = getFirestore();
const serviceModule = loadServiceModule();
const {
  listGroupSeasonMatchesWithPredictions,
  upsertPredictions,
} = serviceModule;

beforeEach(async () => {
  await clearFirestore();
});

test("member can view group-season matches and save before lock", async () => {
  await seedFixture({ memberUserId: "member-1" });

  const response = await listGroupSeasonMatchesWithPredictions({
    groupId: "group-1",
    groupSeasonId: "group-season-1",
    userId: "member-1",
  });

  assert.equal(response.matches.length, 3);
  assert.equal(response.matches[0].id, "open-match");

  const result = await upsertPredictions({
    groupId: "group-1",
    groupSeasonId: "group-season-1",
    user: { uid: "member-1", email: "member@example.com" },
    input: {
      predictions: [
        {
          matchId: "open-match",
          homeGoals: 2,
          awayGoals: 1,
          booster: false,
        },
      ],
    },
  });

  assertJsonEqual(result, { saved: 1, unchanged: 0, revisionsCreated: 0 });

  const predictionSnap = await predictionDoc("open-match_member-1").get();
  assert.equal(predictionSnap.exists, true);
  assert.equal(predictionSnap.data().groupSeasonId, "group-season-1");
  assert.equal(predictionSnap.data().matchId, "open-match");
  assert.equal(predictionSnap.data().userId, "member-1");
});

test("local reference seed creates canonical documents and is idempotent", async () => {
  const firstRun = await importSeedScript();
  const secondRun = await importSeedScript();
  const competitionSnap = await adminFirestore.collection("competitions").doc("fifa-world-cup").get();
  const seasonRef = competitionSnap.ref.collection("seasons").doc("world-cup-2026");
  const seasonSnap = await seasonRef.get();
  const teamsSnap = await seasonRef.collection("teams").get();
  const matchesSnap = await seasonRef.collection("matches").get();

  assert.equal(firstRun, true);
  assert.equal(secondRun, true);
  assert.equal(competitionSnap.exists, true);
  assert.equal(seasonSnap.exists, true);
  assert.equal(teamsSnap.size, 2);
  assert.equal(matchesSnap.size, 1);

  const match = matchesSnap.docs[0].data();
  assert.equal(typeof match.kickoffAt, "string");
  assert.equal(typeof match.lockAt, "string");
  assert.equal(isUtcTimestamp(match.kickoffAt), true);
  assert.equal(isUtcTimestamp(match.lockAt), true);
  assert.equal(match.competitionId, "fifa-world-cup");
  assert.equal(match.seasonId, "world-cup-2026");
  assert.equal(match.status, "SCHEDULED");
  assert.equal(match.stage, "GROUP_STAGE");
  assert.equal(match.groupCode, "A");
  assert.equal(typeof match.homeTeamId, "string");
  assert.equal(typeof match.awayTeamId, "string");
});

test("prediction save after lock is rejected and does not write", async () => {
  await seedFixture({ memberUserId: "member-1" });

  await assert.rejects(
    () =>
      upsertPredictions({
        groupId: "group-1",
        groupSeasonId: "group-season-1",
        user: { uid: "member-1" },
        input: {
          predictions: [
            {
              matchId: "locked-match",
              homeGoals: 1,
              awayGoals: 0,
              booster: false,
            },
          ],
        },
      }),
    /Prediction could not be saved/,
  );

  assert.equal((await predictionDoc("locked-match_member-1").get()).exists, false);
});

test("duplicate save is idempotent and changed save creates revision", async () => {
  await seedFixture({ memberUserId: "member-1" });
  const baseInput = {
    groupId: "group-1",
    groupSeasonId: "group-season-1",
    user: { uid: "member-1" },
    input: {
      predictions: [
        {
          matchId: "open-match",
          homeGoals: 1,
          awayGoals: 1,
          booster: false,
        },
      ],
    },
  };

  assertJsonEqual(await upsertPredictions(baseInput), {
    saved: 1,
    unchanged: 0,
    revisionsCreated: 0,
  });
  assertJsonEqual(await upsertPredictions(baseInput), {
    saved: 0,
    unchanged: 1,
    revisionsCreated: 0,
  });
  assertJsonEqual(
    await upsertPredictions({
      ...baseInput,
      input: {
        predictions: [
          {
            matchId: "open-match",
            homeGoals: 2,
            awayGoals: 1,
            booster: false,
          },
        ],
      },
    }),
    {
      saved: 1,
      unchanged: 0,
      revisionsCreated: 1,
    },
  );

  const revisionsSnap = await adminFirestore
    .collection("groups")
    .doc("group-1")
    .collection("seasons")
    .doc("group-season-1")
    .collection("predictionRevisions")
    .get();

  assert.equal(revisionsSnap.size, 1);
  assert.equal(revisionsSnap.docs[0].data().predictionId, "open-match_member-1");
});

test("non-member cannot view or save group-season predictions", async () => {
  await seedFixture({ memberUserId: "member-1" });

  await assert.rejects(
    () =>
      listGroupSeasonMatchesWithPredictions({
        groupId: "group-1",
        groupSeasonId: "group-season-1",
        userId: "nonmember-1",
      }),
    /Group not found/,
  );
  await assert.rejects(
    () =>
      upsertPredictions({
        groupId: "group-1",
        groupSeasonId: "group-season-1",
        user: { uid: "nonmember-1" },
        input: {
          predictions: [
            {
              matchId: "open-match",
              homeGoals: 2,
              awayGoals: 1,
              booster: false,
            },
          ],
        },
      }),
    /Group not found/,
  );
});

test("match outside group season is rejected", async () => {
  await seedFixture({ memberUserId: "member-1" });

  await assert.rejects(
    () =>
      upsertPredictions({
        groupId: "group-1",
        groupSeasonId: "group-season-1",
        user: { uid: "member-1" },
        input: {
          predictions: [
            {
              matchId: "outside-season-match",
              homeGoals: 2,
              awayGoals: 1,
              booster: false,
            },
          ],
        },
      }),
    /Match does not belong to this group season/,
  );
});

test("invalid match is rejected and does not write", async () => {
  await seedFixture({ memberUserId: "member-1" });

  await assert.rejects(
    () =>
      upsertPredictions({
        groupId: "group-1",
        groupSeasonId: "group-season-1",
        user: { uid: "member-1" },
        input: {
          predictions: [
            {
              matchId: "missing-match",
              homeGoals: 2,
              awayGoals: 1,
              booster: false,
            },
          ],
        },
      }),
    /Match not found/,
  );

  assert.equal((await predictionDoc("missing-match_member-1").get()).exists, false);
});

test("direct Firestore client writes are denied by security rules", async () => {
  await seedFixture({ memberUserId: "member-client" });
  const { app, db } = await signedInClient("member-client");

  await assert.rejects(
    () =>
      setDoc(
        doc(
          db,
          "groups/group-1/seasons/group-season-1/predictions/open-match_member-client",
        ),
        {
          groupId: "group-1",
          groupSeasonId: "group-season-1",
          matchId: "open-match",
          userId: "member-client",
          homeGoals: 2,
          awayGoals: 1,
        },
      ),
    /permission-denied|PERMISSION_DENIED|Missing or insufficient permissions/,
  );
  await assert.rejects(
    () =>
      setDoc(doc(db, "groups/group-1/seasons/group-season-1/predictionRevisions/rev-1"), {
        predictionId: "open-match_member-client",
      }),
    /permission-denied|PERMISSION_DENIED|Missing or insufficient permissions/,
  );
  await assert.rejects(
    () =>
      setDoc(doc(db, "groups/group-1/seasons/group-season-1/leaderboardSnapshots/latest"), {
        groupId: "group-1",
        groupSeasonId: "group-season-1",
        entries: [],
      }),
    /permission-denied|PERMISSION_DENIED|Missing or insufficient permissions/,
  );
  await assert.rejects(
    () =>
      setDoc(doc(db, "competitions/fifa-world-cup/seasons/world-cup-2026/matches/new-match"), {
        status: "SCHEDULED",
      }),
    /permission-denied|PERMISSION_DENIED|Missing or insufficient permissions/,
  );

  await deleteApp(app);
});

test("non-member client reads are denied by security rules", async () => {
  await seedFixture({ memberUserId: "member-1" });
  await upsertPredictions({
    groupId: "group-1",
    groupSeasonId: "group-season-1",
    user: { uid: "member-1" },
    input: {
      predictions: [
        {
          matchId: "open-match",
          homeGoals: 2,
          awayGoals: 1,
          booster: false,
        },
      ],
    },
  });
  const { app, db } = await signedInClient("nonmember-client");

  await assert.rejects(
    () => getDoc(doc(db, "groups/group-1")),
    /permission-denied|PERMISSION_DENIED|Missing or insufficient permissions/,
  );
  await assert.rejects(
    () =>
      getDoc(
        doc(db, "groups/group-1/seasons/group-season-1/predictions/open-match_member-1"),
      ),
    /permission-denied|PERMISSION_DENIED|Missing or insufficient permissions/,
  );

  await deleteApp(app);
});

async function seedFixture({ memberUserId }) {
  const now = Timestamp.now();
  const futureLockAt = new Date(Date.now() + 60 * 60 * 1000).toISOString();
  const pastLockAt = new Date(Date.now() - 60 * 60 * 1000).toISOString();
  const batch = adminFirestore.batch();
  const groupRef = adminFirestore.collection("groups").doc("group-1");
  const groupSeasonRef = groupRef.collection("seasons").doc("group-season-1");
  const seasonRef = adminFirestore
    .collection("competitions")
    .doc("fifa-world-cup")
    .collection("seasons")
    .doc("world-cup-2026");

  batch.set(groupRef, {
    name: "Test Group",
    slug: "test-group",
    ownerId: memberUserId,
    memberCount: 1,
    activeGroupSeasonId: "group-season-1",
    createdAt: now,
    updatedAt: now,
    archivedAt: null,
  });
  batch.set(groupRef.collection("members").doc(memberUserId), {
    userId: memberUserId,
    displayName: "Member",
    photoUrl: null,
    role: "OWNER",
    status: "ACTIVE",
    joinedAt: now,
    updatedAt: now,
  });
  batch.set(groupSeasonRef, {
    groupId: "group-1",
    competitionId: "fifa-world-cup",
    seasonId: "world-cup-2026",
    label: "FIFA World Cup 2026",
    status: "UPCOMING",
    scoringPreset: "HYBRID_321",
    predictionMode: "EXACT_SCORE",
    allowBooster: true,
    predictionVisibility: "AFTER_LOCK",
    createdAt: now,
    updatedAt: now,
    startsAt: Timestamp.fromDate(new Date("2026-06-11T00:00:00.000Z")),
    endsAt: Timestamp.fromDate(new Date("2026-07-19T23:59:59.000Z")),
  });
  batch.set(seasonRef, {
    competitionId: "fifa-world-cup",
    label: "FIFA World Cup 2026",
    startsAt: "2026-06-11T00:00:00.000Z",
    endsAt: "2026-07-19T23:59:59.000Z",
    updatedAt: now.toDate().toISOString(),
  });
  batch.set(seasonRef.collection("teams").doc("mock-usa"), {
    name: "United States",
    shortName: "USA",
    countryCode: "US",
  });
  batch.set(seasonRef.collection("teams").doc("mock-can"), {
    name: "Canada",
    shortName: "CAN",
    countryCode: "CA",
  });
  batch.set(seasonRef.collection("matches").doc("open-match"), {
    competitionId: "fifa-world-cup",
    seasonId: "world-cup-2026",
    homeTeamId: "mock-usa",
    awayTeamId: "mock-can",
    kickoffAt: futureLockAt,
    lockAt: futureLockAt,
    status: "SCHEDULED",
    stage: "GROUP_STAGE",
    groupCode: "A",
    venue: null,
  });
  batch.set(seasonRef.collection("matches").doc("locked-match"), {
    competitionId: "fifa-world-cup",
    seasonId: "world-cup-2026",
    homeTeamId: "mock-usa",
    awayTeamId: "mock-can",
    kickoffAt: pastLockAt,
    lockAt: pastLockAt,
    status: "SCHEDULED",
    stage: "GROUP_STAGE",
    groupCode: "A",
    venue: null,
  });
  batch.set(seasonRef.collection("matches").doc("outside-season-match"), {
    competitionId: "fifa-world-cup",
    seasonId: "other-season",
    homeTeamId: "mock-usa",
    awayTeamId: "mock-can",
    kickoffAt: futureLockAt,
    lockAt: futureLockAt,
    status: "SCHEDULED",
    stage: "GROUP_STAGE",
    groupCode: "A",
    venue: null,
  });

  await batch.commit();
}

function predictionDoc(predictionId) {
  return adminFirestore
    .collection("groups")
    .doc("group-1")
    .collection("seasons")
    .doc("group-season-1")
    .collection("predictions")
    .doc(predictionId);
}

async function signedInClient(userId) {
  const app = initializeApp(
    {
      apiKey: "demo",
      projectId,
      authDomain: `${projectId}.firebaseapp.com`,
    },
    `client-${userId}-${Date.now()}-${Math.random()}`,
  );
  const auth = getAuth(app);
  connectAuthEmulator(auth, `http://${authHost}`, { disableWarnings: true });
  await createUserWithEmailAndPassword(
    auth,
    `${userId}-${Date.now()}@example.com`,
    "password-123456",
  );
  const db = getClientFirestore(app);
  const [host, port] = firestoreHost.split(":");
  connectFirestoreEmulator(db, host, Number(port));

  return { app, db };
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

function loadServiceModule() {
  const moduleCache = new Map();

  function load(specifier) {
    if (specifier === "@/lib/firebase/admin") {
      return {
        getFirebaseAdminFirestore() {
          return adminFirestore;
        },
      };
    }

    if (specifier === "@/lib/api/errors") {
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

    if (specifier === "@/lib/predictions/policy") {
      return loadTsModule("lib/predictions/policy.ts", load, moduleCache);
    }

    throw new Error(`Unsupported test module import: ${specifier}`);
  }

  return loadTsModule("lib/predictions/service.ts", load, moduleCache);
}

function loadTsModule(file, requireFunction, moduleCache) {
  if (moduleCache.has(file)) {
    return moduleCache.get(file).exports;
  }

  const loadedModule = { exports: {} };
  moduleCache.set(file, loadedModule);
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
    require: requireFunction,
  };

  vm.runInNewContext(transpiled.outputText, sandbox, { filename: file });

  return loadedModule.exports;
}

function assertJsonEqual(actual, expected) {
  assert.equal(JSON.stringify(actual), JSON.stringify(expected));
}

async function importSeedScript() {
  const url = `${pathToFileURL("scripts/seed-world-cup-reference-data.mjs").href}?run=${Date.now()}-${Math.random()}`;
  await import(url);
  return true;
}

function isUtcTimestamp(value) {
  return typeof value === "string" && value.endsWith("Z") && Number.isFinite(Date.parse(value));
}
