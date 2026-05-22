import { readFileSync } from "node:fs";

const checks = [
  {
    file: "docs/FIRESTORE-DATA-MODEL.md",
    includes: [
      "groups/{groupId}/seasons/{groupSeasonId}/predictions/{predictionId}",
      "groups/{groupId}/seasons/{groupSeasonId}/leaderboardSnapshots/{snapshotId}",
      "inviteCodes/{code}",
    ],
    excludes: [
      "`groups/{groupId}/predictions/{predictionId}`",
      "`groups/{groupId}/leaderboardSnapshots/{snapshotId}`",
      "`groups/{groupId}/invites/{inviteId}`",
    ],
  },
  {
    file: "docs/API-SPECS.md",
    includes: [
      "/api/v1/groups/join",
      "/api/v1/groups/{groupId}/seasons/{groupSeasonId}/invites",
      "/api/v1/groups/{groupId}/seasons/{groupSeasonId}/predictions",
    ],
    excludes: ["/api/v1/groups/{groupId}/join"],
  },
  {
    file: "firestore.rules",
    includes: [
      "match /inviteCodes/{code}",
      "match /seasons/{groupSeasonId}",
      "match /invites/{inviteId}",
      "resource.data.userId == request.auth.uid",
      "allow read, write: if false;",
    ],
  },
  {
    file: "lib/groups/service.ts",
    includes: [
      "inviteCodes",
      "createReservedInvite",
      "evaluateInviteJoinPolicy",
      "transaction.get(registryRef)",
      "FieldValue.increment(1)",
    ],
    excludes: [".collectionGroup(\"invites\")", ".collection(\"inviteCodes\").doc(code).get()"],
  },
  {
    file: "lib/groups/join-policy.ts",
    includes: [
      "existingMember?.status === \"REMOVED\"",
      "INVITE_EXPIRED",
      "INVITE_REVOKED",
      "incrementMemberCount: false",
    ],
  },
  {
    file: "lib/env.ts",
    includes: ["APP_ENV", "staging", "production", "requiredDeployedEnvVars"],
  },
  {
    file: "lib/sports-data/domain.ts",
    includes: [
      "NormalizedCompetition",
      "NormalizedSeason",
      "NormalizedTeam",
      "NormalizedMatch",
      "FreshnessMetadata",
    ],
  },
  {
    file: "lib/sports-data/providers/types.ts",
    includes: ["interface SportsDataProvider", "fetchCompetitionSeason"],
  },
  {
    file: "lib/sports-data/firestore/writer.ts",
    includes: [
      'collection("competitions")',
      'collection("seasons")',
      'collection("teams")',
      'collection("matches")',
      "merge: true",
    ],
  },
  {
    file: "docs/SPORTS-DATA-INGESTION.md",
    includes: [
      "competitions/{competitionId}/seasons/{seasonId}/matches/{matchId}",
      "Cloud Run Job",
      "Pub/Sub",
      "SPORTS_PROVIDER_API_KEY",
    ],
  },
  {
    file: "scripts/seed-world-cup-reference-data.mjs",
    includes: [
      "competitions",
      "world-cup-2026",
      "FIRESTORE_EMULATOR_HOST",
      "merge: true",
    ],
  },
  {
    file: "lib/predictions/service.ts",
    includes: [
      "nowMs: now.toMillis()",
      "lockAtMs",
      "predictionRevisions",
      "MATCH_OUTSIDE_GROUP_SEASON",
      "evaluatePredictionUpsertPolicy",
    ],
  },
  {
    file: "lib/predictions/policy.ts",
    includes: [
      "PREDICTION_LOCKED",
      "BOOSTER_NOT_ALLOWED",
      "PREDICTION_INVALID",
    ],
  },
  {
    file: "docs/API-SPECS.md",
    includes: [
      "/api/v1/groups/{groupId}/seasons/{groupSeasonId}/matches",
      "/api/v1/groups/{groupId}/seasons/{groupSeasonId}/predictions",
      "Other users' predictions are not exposed in Sprint 5.",
    ],
  },
];

const failures = [];

for (const check of checks) {
  const content = readFileSync(check.file, "utf8");

  for (const expected of check.includes ?? []) {
    if (!content.includes(expected)) {
      failures.push(`${check.file}: missing "${expected}"`);
    }
  }

  for (const forbidden of check.excludes ?? []) {
    if (content.includes(forbidden)) {
      failures.push(`${check.file}: still contains outdated "${forbidden}"`);
    }
  }
}

if (failures.length > 0) {
  console.error("Foundation validation failed:");
  for (const failure of failures) {
    console.error(`- ${failure}`);
  }
  process.exit(1);
}

console.log("Foundation validation passed.");
