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
const tournamentGroups = [
  {
    id: "fifa-world-cup-world-cup-2026-group-a",
    code: "A",
    name: "Group A",
    teamIds: teams.map((team) => team.id),
    sortOrder: 0,
  },
];
const players = [
  {
    id: "fifa-world-cup-world-cup-2026-player-mock-usa-local-forward",
    teamId: "mock-usa",
    displayName: "Local Forward",
    countryCode: "US",
    position: "forward",
    shirtNumber: 9,
    status: "active",
  },
  {
    id: "fifa-world-cup-world-cup-2026-player-mock-can-local-goalkeeper",
    teamId: "mock-can",
    displayName: "Local Goalkeeper",
    countryCode: "CA",
    position: "goalkeeper",
    shirtNumber: 1,
    status: "active",
  },
];
const squads = [
  {
    id: "fifa-world-cup-world-cup-2026-squad-mock-usa",
    teamId: "mock-usa",
    status: "provisional",
    playerIds: ["fifa-world-cup-world-cup-2026-player-mock-usa-local-forward"],
    publishedAt: null,
  },
  {
    id: "fifa-world-cup-world-cup-2026-squad-mock-can",
    teamId: "mock-can",
    status: "provisional",
    playerIds: ["fifa-world-cup-world-cup-2026-player-mock-can-local-goalkeeper"],
    publishedAt: null,
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
    lifecycleStatus: "scheduled",
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
const bracketNodes = [
  {
    id: "fifa-world-cup-world-cup-2026-bracket-round-of-32-01",
    stage: "round-of-32",
    matchId: null,
    status: "unresolved",
    sortOrder: 1,
    homeSource: {
      type: "group-rank",
      groupId: "fifa-world-cup-world-cup-2026-group-a",
      rank: 1,
    },
    awaySource: {
      type: "placeholder",
      label: "Best third-placed team",
    },
    winnerTargetNodeId: null,
    loserTargetNodeId: null,
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
    tournamentGroupCount: tournamentGroups.length,
    squadCount: squads.length,
    playerCount: players.length,
    matchCount: matches.length,
    bracketNodeCount: bracketNodes.length,
    finalMatchCount: 0,
  },
  { merge: true },
);

for (const group of tournamentGroups) {
  batch.set(
    seasonRef.collection("tournamentGroups").doc(group.id),
    {
      competitionId,
      seasonId,
      code: group.code,
      name: group.name,
      teamIds: group.teamIds,
      sortOrder: group.sortOrder,
      visibility: "published",
      provider: null,
      freshness,
      updatedAt: fetchedAt,
    },
    { merge: true },
  );
}

for (const team of teams) {
  batch.set(
    seasonRef.collection("teams").doc(team.id),
    {
      competitionId,
      seasonId,
      name: team.name,
      shortName: team.shortName,
      countryCode: team.countryCode,
      status: "confirmed",
      groupCode: team.groupCode,
      provider: providerMetadata(team.providerExternalId),
      freshness,
      updatedAt: fetchedAt,
    },
    { merge: true },
  );
}

for (const player of players) {
  batch.set(
    seasonRef.collection("players").doc(player.id),
    {
      competitionId,
      seasonId,
      teamId: player.teamId,
      displayName: player.displayName,
      countryCode: player.countryCode,
      position: player.position,
      shirtNumber: player.shirtNumber,
      status: player.status,
      provider: null,
      freshness,
      updatedAt: fetchedAt,
    },
    { merge: true },
  );
}

for (const squad of squads) {
  batch.set(
    seasonRef.collection("squads").doc(squad.id),
    {
      competitionId,
      seasonId,
      teamId: squad.teamId,
      status: squad.status,
      playerIds: squad.playerIds,
      publishedAt: squad.publishedAt,
      provider: null,
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
      lifecycleStatus: match.lifecycleStatus,
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

for (const node of bracketNodes) {
  batch.set(
    seasonRef.collection("bracketNodes").doc(node.id),
    {
      competitionId,
      seasonId,
      stage: node.stage,
      matchId: node.matchId,
      status: node.status,
      sortOrder: node.sortOrder,
      homeSource: node.homeSource,
      awaySource: node.awaySource,
      winnerTargetNodeId: node.winnerTargetNodeId,
      loserTargetNodeId: node.loserTargetNodeId,
      provider: null,
      freshness,
      updatedAt: fetchedAt,
    },
    { merge: true },
  );
}

await batch.commit();

console.log(
  `Seeded ${competitionId}/${seasonId}: ${teams.length} teams, ${matches.length} matches, ${tournamentGroups.length} groups, ${squads.length} squads, ${players.length} players, ${bracketNodes.length} bracket nodes.`,
);

function providerMetadata(externalId) {
  return {
    providerId: "mock",
    externalId,
    sourceName: "MatchPulse local seed",
    fetchedAt,
  };
}
