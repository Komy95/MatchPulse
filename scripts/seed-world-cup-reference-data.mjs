import { readFile } from "node:fs/promises";
import { applicationDefault, getApps, initializeApp } from "firebase-admin/app";
import { getFirestore } from "firebase-admin/firestore";

const allowProduction = process.argv.includes("--allow-production");
const projectId =
  process.env.FIREBASE_PROJECT_ID ??
  process.env.GOOGLE_CLOUD_PROJECT ??
  process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID ??
  "matchpulse-local";

const seedFilePath = "data/reference/world-cup-2026/worldcup_2026_seed.json";
const competitionId = "fifa-world-cup";
const seasonId = "world-cup-2026";

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

const seed = await loadSeed(seedFilePath);
validateSeed(seed);

const firestore = getFirestore();
const fetchedAt = new Date().toISOString();
const staleAfter = new Date(Date.parse(fetchedAt) + 12 * 60 * 60 * 1000).toISOString();
const sourceById = new Map(seed.sources.map((source) => [source.sourceId, source]));
const freshness = {
  providerId: "mock",
  fetchedAt,
  staleAfter,
};
const competitionRef = firestore.collection("competitions").doc(competitionId);
const seasonRef = competitionRef.collection("seasons").doc(seasonId);
const batch = firestore.batch();

batch.set(
  competitionRef,
  {
    name: seed.competition.name,
    countryCode: null,
    sport: seed.competition.sport ?? "football",
    gender: seed.competition.gender ?? null,
    governingBody: seed.competition.governingBody ?? null,
    source: sourceDocument(seed.competition.sourceId),
    sources: seed.sources,
    provider: providerMetadata(seed.competition.sourceId),
    freshness,
    updatedAt: fetchedAt,
  },
  { merge: true },
);

batch.set(
  seasonRef,
  {
    competitionId,
    label: seed.season.name,
    startsAt: dateToUtcStart(seed.season.startDate),
    endsAt: dateToUtcEnd(seed.season.endDate),
    year: seed.season.year,
    hosts: seed.season.hosts,
    format: seed.season.format,
    status: seed.season.status,
    source: sourceDocument(seed.season.sourceId),
    sources: seed.sources,
    provider: providerMetadata(seed.season.sourceId),
    freshness,
    lastIngestedAt: fetchedAt,
    updatedAt: fetchedAt,
    teamCount: seed.teams.length,
    tournamentGroupCount: seed.tournamentGroups.length,
    squadCount: seed.squads.length,
    playerCount: seed.players.length,
    matchCount: seed.matches.length,
    bracketNodeCount: seed.bracketNodes.length,
    finalMatchCount: seed.matches.filter((match) => match.status === "finished").length,
  },
  { merge: true },
);

for (const group of seed.tournamentGroups) {
  batch.set(
    seasonRef.collection("tournamentGroups").doc(group.id),
    {
      competitionId,
      seasonId,
      code: group.code,
      name: group.name,
      teamIds: group.teamIds,
      startDate: group.startDate ?? null,
      endDate: group.endDate ?? null,
      sortOrder: group.sortOrder,
      visibility: "published",
      source: sourceDocument(group.sourceId),
      provider: providerMetadata(group.sourceId),
      freshness,
      updatedAt: fetchedAt,
    },
    { merge: true },
  );
}

for (const team of seed.teams) {
  batch.set(
    seasonRef.collection("teams").doc(team.id),
    {
      competitionId,
      seasonId,
      name: team.name,
      shortName: team.shortName,
      countryCode: team.countryCode,
      fifaCode: team.fifaCode ?? null,
      confederation: team.confederation ?? null,
      groupCode: team.groupCode,
      groupPosition: team.groupPosition ?? null,
      status: team.status ?? "confirmed",
      coachName: team.coachName ?? null,
      flagAssetStatus: team.flagAssetStatus ?? "not_included_unlicensed_safe",
      source: sourceDocument(team.sourceId),
      provider: providerMetadata(team.sourceId),
      freshness,
      updatedAt: fetchedAt,
    },
    { merge: true },
  );
}

for (const player of seed.players) {
  batch.set(
    seasonRef.collection("players").doc(player.id),
    {
      competitionId,
      seasonId,
      teamId: player.teamId,
      displayName: player.displayName,
      countryCode: player.countryCode ?? null,
      position: player.position ?? "unknown",
      shirtNumber: player.shirtNumber ?? null,
      status: player.status,
      source: sourceDocument(player.sourceId),
      provider: providerMetadata(player.sourceId),
      freshness,
      updatedAt: fetchedAt,
    },
    { merge: true },
  );
}

for (const squad of seed.squads) {
  batch.set(
    seasonRef.collection("squads").doc(squad.id),
    {
      competitionId,
      seasonId,
      teamId: squad.teamId,
      status: squad.status,
      playerIds: squad.playerIds,
      publishedAt: squad.publishedAt,
      announcedAt: squad.announcedAt ?? null,
      sourceName: squad.sourceName ?? null,
      sourceUrl: squad.sourceUrl ?? null,
      notes: squad.notes ?? null,
      source: sourceDocument(squad.sourceId),
      provider: providerMetadata(squad.sourceId),
      freshness,
      updatedAt: fetchedAt,
    },
    { merge: true },
  );
}

for (const match of seed.matches) {
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
      groupCode: match.groupCode ?? null,
      matchday: match.matchday ?? null,
      homeSource: match.homeSource ?? null,
      awaySource: match.awaySource ?? null,
      venue: match.venue ?? null,
      score: {
        homeScore90: match.homeScore ?? null,
        awayScore90: match.awayScore ?? null,
        homeScoreFinal: match.homeScore ?? null,
        awayScoreFinal: match.awayScore ?? null,
      },
      winnerTeamId: match.winnerTeamId ?? null,
      resultSource: match.resultSource ?? null,
      resultLastUpdatedAt: match.resultLastUpdatedAt ?? null,
      dataQuality: match.dataQuality ?? null,
      source: sourceDocument(match.sourceId),
      provider: providerMetadata(match.sourceId),
      freshness,
      updatedAt: fetchedAt,
    },
    { merge: true },
  );
}

for (const node of seed.bracketNodes) {
  batch.set(
    seasonRef.collection("bracketNodes").doc(node.id),
    {
      competitionId,
      seasonId,
      stage: node.stage,
      matchId: node.matchId,
      status: node.status,
      sortOrder: node.sortOrder,
      position: node.position,
      homeSource: node.homeSource,
      awaySource: node.awaySource,
      homeTeamId: node.homeTeamId,
      awayTeamId: node.awayTeamId,
      winnerTargetNodeId: node.winnerTargetNodeId,
      loserTargetNodeId: node.loserTargetNodeId,
      mappingStatus: node.mappingStatus ?? null,
      source: sourceDocument(node.sourceId),
      provider: providerMetadata(node.sourceId),
      freshness,
      updatedAt: fetchedAt,
    },
    { merge: true },
  );
}

await batch.commit();

console.log(
  [
    `Seeded ${competitionId}/${seasonId} from ${seedFilePath}.`,
    `competition=1`,
    `season=1`,
    `tournamentGroups=${seed.tournamentGroups.length}`,
    `teams=${seed.teams.length}`,
    `players=${seed.players.length}`,
    `squads=${seed.squads.length}`,
    `matches=${seed.matches.length}`,
    `bracketNodes=${seed.bracketNodes.length}`,
    `sources=${seed.sources.length}`,
  ].join(" "),
);

async function loadSeed(path) {
  let parsed;

  try {
    parsed = JSON.parse(await readFile(path, "utf8"));
  } catch (error) {
    throw new Error(
      `Could not read or parse ${path}: ${error instanceof Error ? error.message : String(error)}`,
    );
  }

  return normalizeSeed(parsed);
}

function normalizeSeed(raw) {
  assertObject(raw, "seed root");

  return {
    competition: normalizeCompetition(raw.competition),
    season: normalizeSeason(raw.season),
    tournamentGroups: arrayOf(raw.tournamentGroups, "tournamentGroups").map(normalizeTournamentGroup),
    teams: arrayOf(raw.teams, "teams").map(normalizeTeam),
    players: arrayOf(raw.players, "players").map(normalizePlayer),
    squads: arrayOf(raw.squads, "squads").map(normalizeSquad),
    matches: arrayOf(raw.matches, "matches").map(normalizeMatch),
    bracketNodes: arrayOf(raw.bracketNodes, "bracketNodes").map(normalizeBracketNode),
    sources: arrayOf(raw.sources, "sources").map(normalizeSource),
  };
}

function normalizeCompetition(competition) {
  assertObject(competition, "competition");

  return {
    ...competition,
    competitionId: requiredString(competition.competitionId, "competition.competitionId"),
    name: requiredString(competition.name, "competition.name"),
    sourceId: requiredString(competition.sourceId, "competition.sourceId"),
  };
}

function normalizeSeason(season) {
  assertObject(season, "season");

  return {
    ...season,
    seasonId: requiredString(season.seasonId, "season.seasonId"),
    competitionId: requiredString(season.competitionId, "season.competitionId"),
    name: requiredString(season.name, "season.name"),
    startDate: requiredString(season.startDate, "season.startDate"),
    endDate: requiredString(season.endDate, "season.endDate"),
    sourceId: requiredString(season.sourceId, "season.sourceId"),
  };
}

function normalizeTournamentGroup(group) {
  assertObject(group, "tournamentGroup");

  return {
    ...group,
    id: requiredString(group.id ?? group.groupId, "tournamentGroup.id"),
    code: requiredString(group.code ?? group.groupCode, "tournamentGroup.code"),
    name: requiredString(group.name, "tournamentGroup.name"),
    teamIds: arrayOf(group.teamIds, `tournamentGroup ${group.id ?? group.groupId}.teamIds`),
    sortOrder: group.sortOrder ?? group.position ?? groupCodeSortOrder(group.code ?? group.groupCode),
    sourceId: requiredString(group.sourceId, `tournamentGroup ${group.id ?? group.groupId}.sourceId`),
  };
}

function normalizeTeam(team) {
  assertObject(team, "team");

  return {
    ...team,
    id: requiredString(team.id ?? team.teamId, "team.id"),
    name: requiredString(team.name, "team.name"),
    shortName: requiredString(team.shortName, "team.shortName"),
    countryCode: requiredString(team.countryCode, "team.countryCode"),
    groupCode: requiredString(team.groupCode, "team.groupCode"),
    sourceId: requiredString(team.sourceId, `team ${team.id ?? team.teamId}.sourceId`),
  };
}

function normalizePlayer(player) {
  assertObject(player, "player");

  return {
    ...player,
    id: requiredString(player.id ?? player.playerId, "player.id"),
    teamId: requiredString(player.teamId, "player.teamId"),
    displayName: requiredString(player.displayName ?? player.name, "player.displayName"),
    status: requiredString(player.status, "player.status"),
    sourceId: requiredString(player.sourceId, `player ${player.id ?? player.playerId}.sourceId`),
  };
}

function normalizeSquad(squad) {
  assertObject(squad, "squad");

  const embeddedPlayers = arrayOf(squad.players ?? [], `squad ${squad.id ?? squad.squadId}.players`);

  return {
    ...squad,
    id: requiredString(squad.id ?? squad.squadId, "squad.id"),
    teamId: requiredString(squad.teamId, "squad.teamId"),
    status: requiredString(squad.status, "squad.status"),
    playerIds: arrayOf(
      squad.playerIds ?? embeddedPlayers.map((player) => player.id ?? player.playerId).filter(Boolean),
      `squad ${squad.id ?? squad.squadId}.playerIds`,
    ),
    publishedAt: squad.publishedAt ?? squad.announcedAt ?? null,
    sourceId: requiredString(squad.sourceId, `squad ${squad.id ?? squad.squadId}.sourceId`),
  };
}

function normalizeMatch(match) {
  assertObject(match, "match");
  const status = requiredString(match.status, "match.status");

  return {
    ...match,
    id: requiredString(match.id ?? match.matchId, "match.id"),
    stage: requiredString(match.stage, `match ${match.id ?? match.matchId}.stage`),
    status: status.toUpperCase().replace(/-/g, "_"),
    lifecycleStatus: requiredString(
      match.lifecycleStatus ?? normalizeLifecycleStatus(status),
      `match ${match.id ?? match.matchId}.lifecycleStatus`,
    ),
    homeTeamId: nullableString(match.homeTeamId, `match ${match.id ?? match.matchId}.homeTeamId`),
    awayTeamId: nullableString(match.awayTeamId, `match ${match.id ?? match.matchId}.awayTeamId`),
    kickoffAt: nullableUtc(match.kickoffAt, `match ${match.id ?? match.matchId}.kickoffAt`),
    lockAt: nullableUtc(match.lockAt ?? match.kickoffAt, `match ${match.id ?? match.matchId}.lockAt`),
    sourceId: requiredString(match.sourceId, `match ${match.id ?? match.matchId}.sourceId`),
  };
}

function normalizeBracketNode(node) {
  assertObject(node, "bracketNode");

  return {
    ...node,
    id: requiredString(node.id ?? node.bracketNodeId, "bracketNode.id"),
    stage: requiredString(node.stage, `bracketNode ${node.id ?? node.bracketNodeId}.stage`),
    matchId: nullableString(node.matchId, `bracketNode ${node.id ?? node.bracketNodeId}.matchId`),
    status: requiredString(node.status, `bracketNode ${node.id ?? node.bracketNodeId}.status`),
    sortOrder: node.sortOrder ?? node.position,
    position: node.position ?? node.sortOrder,
    homeTeamId: nullableString(node.homeTeamId, `bracketNode ${node.id ?? node.bracketNodeId}.homeTeamId`),
    awayTeamId: nullableString(node.awayTeamId, `bracketNode ${node.id ?? node.bracketNodeId}.awayTeamId`),
    winnerTargetNodeId: node.winnerTargetNodeId ?? node.winnerAdvancesTo ?? null,
    loserTargetNodeId: node.loserTargetNodeId ?? node.loserAdvancesTo ?? null,
    sourceId: requiredString(node.sourceId, `bracketNode ${node.id ?? node.bracketNodeId}.sourceId`),
  };
}

function normalizeSource(source) {
  assertObject(source, "source");

  return {
    ...source,
    sourceId: requiredString(source.sourceId, "source.sourceId"),
    name: requiredString(source.name, `source ${source.sourceId}.name`),
  };
}

function validateSeed(seed) {
  const failures = [];
  const teamIds = new Set(seed.teams.map((team) => team.id));
  const sourceIds = new Set(seed.sources.map((source) => source.sourceId));
  const groupStageMatches = seed.matches.filter((match) => match.stage === "group");

  expect(seed.competition.competitionId === competitionId, `competition.competitionId must be ${competitionId}`);
  expect(seed.season.competitionId === competitionId, `season.competitionId must be ${competitionId}`);
  expect(seed.teams.length === 48, `expected exactly 48 teams, found ${seed.teams.length}`);
  expect(
    seed.tournamentGroups.length === 12,
    `expected exactly 12 tournamentGroups, found ${seed.tournamentGroups.length}`,
  );
  expect(
    groupStageMatches.length === 72,
    `expected exactly 72 group-stage matches, found ${groupStageMatches.length}`,
  );

  for (const source of seed.sources) {
    expect(Boolean(source.sourceId), "every source must have sourceId");
  }

  assertKnownSource(seed.competition, "competition");
  assertKnownSource(seed.season, "season");

  for (const team of seed.teams) {
    expect(Boolean(team.id), "every team has id");
    expect(Boolean(team.name), `team ${team.id} has name`);
    expect(Boolean(team.shortName), `team ${team.id} has shortName`);
    expect(Boolean(team.countryCode), `team ${team.id} has countryCode`);
    expect(Boolean(team.groupCode), `team ${team.id} has groupCode`);
    assertKnownSource(team, `team ${team.id}`);
  }

  for (const group of seed.tournamentGroups) {
    expect(Boolean(group.id), "every tournament group has id");
    expect(Boolean(group.code), `tournament group ${group.id} has code`);
    expect(Boolean(group.name), `tournament group ${group.id} has name`);
    expect(Array.isArray(group.teamIds), `tournament group ${group.id} has teamIds`);
    expect(group.teamIds.length === 4, `tournament group ${group.id} must have exactly 4 teamIds`);

    for (const teamId of group.teamIds) {
      expect(teamIds.has(teamId), `tournament group ${group.id} references unknown teamId ${teamId}`);
    }

    assertKnownSource(group, `tournament group ${group.id}`);
  }

  for (const match of seed.matches) {
    expect(Boolean(match.id), "every match has id");
    expect(Boolean(match.stage), `match ${match.id} has stage`);
    expect(Boolean(match.status), `match ${match.id} has status`);
    expect(Boolean(match.lifecycleStatus), `match ${match.id} has lifecycleStatus`);
    expect(
      match.homeTeamId == null || teamIds.has(match.homeTeamId),
      `match ${match.id} homeTeamId must reference an existing team or be null`,
    );
    expect(
      match.awayTeamId == null || teamIds.has(match.awayTeamId),
      `match ${match.id} awayTeamId must reference an existing team or be null`,
    );
    assertKnownSource(match, `match ${match.id}`);
  }

  for (const squad of seed.squads) {
    expect(teamIds.has(squad.teamId), `squad ${squad.id} references unknown teamId ${squad.teamId}`);
    assertKnownSource(squad, `squad ${squad.id}`);
  }

  for (const player of seed.players) {
    expect(teamIds.has(player.teamId), `player ${player.id} references unknown teamId ${player.teamId}`);
    assertKnownSource(player, `player ${player.id}`);
  }

  for (const node of seed.bracketNodes) {
    expect(Boolean(node.id), "every bracket node has id");
    expect(Boolean(node.stage), `bracket node ${node.id} has stage`);
    expect(Boolean(node.status), `bracket node ${node.id} has status`);
    expect(
      node.homeTeamId == null || teamIds.has(node.homeTeamId),
      `bracket node ${node.id} homeTeamId must reference an existing team or be null`,
    );
    expect(
      node.awayTeamId == null || teamIds.has(node.awayTeamId),
      `bracket node ${node.id} awayTeamId must reference an existing team or be null`,
    );
    assertKnownSource(node, `bracket node ${node.id}`);
  }

  if (failures.length > 0) {
    throw new Error(`Invalid World Cup seed data:\n- ${failures.join("\n- ")}`);
  }

  function expect(condition, message) {
    if (!condition) {
      failures.push(message);
    }
  }

  function assertKnownSource(entity, label) {
    expect(Boolean(entity.sourceId), `${label} has sourceId`);
    expect(sourceIds.has(entity.sourceId), `${label} references unknown sourceId ${entity.sourceId}`);
  }
}

function providerMetadata(sourceId) {
  const source = sourceDocument(sourceId);

  return {
    providerId: "mock",
    externalId: sourceId,
    sourceName: source?.name ?? "MatchPulse local seed",
    fetchedAt,
    ...(source?.url ? { sourceUrl: source.url } : {}),
    ...(source?.accessedAt ? { providerUpdatedAt: dateToUtcEnd(source.accessedAt) } : {}),
  };
}

function sourceDocument(sourceId) {
  if (!sourceId) {
    return null;
  }

  return sourceById.get(sourceId) ?? null;
}

function normalizeLifecycleStatus(status) {
  switch (status.trim().toLowerCase().replace(/[\s_-]+/g, "-")) {
    case "live":
    case "in-play":
    case "halftime":
      return "live";
    case "finished":
    case "ft":
      return "finished";
    case "corrected":
      return "corrected";
    case "postponed":
      return "postponed";
    case "cancelled":
    case "canceled":
      return "cancelled";
    case "abandoned":
      return "abandoned";
    case "void":
      return "void";
    case "scheduled":
    case "unresolved":
    default:
      return "scheduled";
  }
}

function dateToUtcStart(value) {
  return `${value}T00:00:00.000Z`;
}

function dateToUtcEnd(value) {
  return `${value}T23:59:59.000Z`;
}

function groupCodeSortOrder(code) {
  return requiredString(code, "tournamentGroup.code").toUpperCase().charCodeAt(0) - 65;
}

function arrayOf(value, field) {
  if (!Array.isArray(value)) {
    throw new Error(`${field} must be an array.`);
  }

  return value;
}

function assertObject(value, field) {
  if (!value || typeof value !== "object" || Array.isArray(value)) {
    throw new Error(`${field} must be an object.`);
  }
}

function requiredString(value, field) {
  if (typeof value !== "string" || !value.trim()) {
    throw new Error(`${field} must be a non-empty string.`);
  }

  return value;
}

function nullableString(value, field) {
  if (value == null) {
    return null;
  }

  return requiredString(value, field);
}

function nullableUtc(value, field) {
  if (value == null) {
    return null;
  }

  const normalized = requiredString(value, field);

  if (!normalized.endsWith("Z") || !Number.isFinite(Date.parse(normalized))) {
    throw new Error(`${field} must be an ISO UTC timestamp or null.`);
  }

  return normalized;
}
