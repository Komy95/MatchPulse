import { getApps, initializeApp, applicationDefault } from "firebase-admin/app";
import { getFirestore } from "firebase-admin/firestore";

const allowProduction = process.argv.includes("--allow-production");
const projectId =
  process.env.FIREBASE_PROJECT_ID ??
  process.env.GOOGLE_CLOUD_PROJECT ??
  process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID ??
  "matchpulse-local";

if (!process.env.FIRESTORE_EMULATOR_HOST && !allowProduction) {
  console.error(
    "Refusing to seed without FIRESTORE_EMULATOR_HOST. Pass --allow-production only for an intentional deployed-project seed.",
  );
  process.exit(1);
}

if (!getApps().length) {
  initializeApp(
    process.env.FIRESTORE_EMULATOR_HOST
      ? { projectId }
      : { projectId, credential: applicationDefault() },
  );
}

const firestore = getFirestore();
const fetchedAt = new Date().toISOString();
const staleAfter = new Date(Date.parse(fetchedAt) + 12 * 60 * 60 * 1000).toISOString();
const freshness = {
  providerId: "mock",
  fetchedAt,
  staleAfter,
};

const competitionId = "fifa-world-cup";
const seasonId = "world-cup-2026";
const competitionRef = firestore.collection("competitions").doc(competitionId);
const seasonRef = competitionRef.collection("seasons").doc(seasonId);
const teams = [
  {
    id: "mock-usa",
    name: "United States",
    shortName: "USA",
    countryCode: "US",
    groupCode: "A",
    providerExternalId: "usa",
  },
  {
    id: "mock-can",
    name: "Canada",
    shortName: "CAN",
    countryCode: "CA",
    groupCode: "A",
    providerExternalId: "can",
  },
];
const matches = [
  {
    id: "mock-match-001",
    homeTeamId: "mock-usa",
    awayTeamId: "mock-can",
    kickoffAt: "2026-06-12T20:00:00.000Z",
    lockAt: "2026-06-12T20:00:00.000Z",
    status: "SCHEDULED",
    stage: "GROUP_STAGE",
    groupCode: "A",
    providerExternalId: "match-001",
    venue: {
      name: "Local Test Stadium",
      city: "Seattle",
      countryCode: "US",
    },
  },
];

const batch = firestore.batch();

batch.set(
  competitionRef,
  {
    name: "FIFA World Cup",
    countryCode: null,
    provider: providerMetadata("mock-wc"),
    freshness,
    updatedAt: fetchedAt,
  },
  { merge: true },
);
batch.set(
  seasonRef,
  {
    competitionId,
    label: "FIFA World Cup 2026",
    startsAt: "2026-06-11T00:00:00.000Z",
    endsAt: "2026-07-19T23:59:59.000Z",
    provider: providerMetadata("mock-wc-2026"),
    freshness,
    lastIngestedAt: fetchedAt,
    updatedAt: fetchedAt,
    teamCount: teams.length,
    matchCount: matches.length,
    finalMatchCount: 0,
  },
  { merge: true },
);

for (const team of teams) {
  batch.set(
    seasonRef.collection("teams").doc(team.id),
    {
      competitionId,
      seasonId,
      name: team.name,
      shortName: team.shortName,
      countryCode: team.countryCode,
      groupCode: team.groupCode,
      provider: providerMetadata(team.providerExternalId),
      freshness,
      updatedAt: fetchedAt,
    },
    { merge: true },
  );
}

for (const match of matches) {
  batch.set(
    seasonRef.collection("matches").doc(match.id),
    {
      competitionId,
      seasonId,
      homeTeamId: match.homeTeamId,
      awayTeamId: match.awayTeamId,
      kickoffAt: match.kickoffAt,
      lockAt: match.lockAt,
      status: match.status,
      stage: match.stage,
      groupCode: match.groupCode,
      venue: match.venue,
      score: {
        homeScore90: null,
        awayScore90: null,
        homeScoreFinal: null,
        awayScoreFinal: null,
      },
      provider: providerMetadata(match.providerExternalId),
      freshness,
      updatedAt: fetchedAt,
    },
    { merge: true },
  );
}

await batch.commit();

console.log(
  `Seeded ${competitionId}/${seasonId}: ${teams.length} teams, ${matches.length} matches.`,
);

function providerMetadata(externalId) {
  return {
    providerId: "mock",
    externalId,
    sourceName: "MatchPulse local seed",
    fetchedAt,
  };
}
