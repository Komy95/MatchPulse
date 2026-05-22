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
      "allow read, write: if false;",
    ],
  },
  {
    file: "lib/groups/service.ts",
    includes: [
      "inviteCodes",
      "createReservedInvite",
      "existingMember?.status === \"REMOVED\"",
      "FieldValue.increment(1)",
    ],
    excludes: [".collectionGroup(\"invites\")"],
  },
  {
    file: "lib/env.ts",
    includes: ["APP_ENV", "staging", "production", "requiredDeployedEnvVars"],
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
