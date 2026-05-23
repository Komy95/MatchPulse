import "server-only";
import { notFound } from "next/navigation";
import { getFirebaseAdminFirestore } from "@/lib/firebase/admin";
import {
  buildGroupsWithTeams,
  buildTeamFixtureMap,
  groupFixturesByGroup,
  groupNodesByStage,
  sortBracketNodes,
  sortFixtures,
  sortTeams,
} from "@/lib/world-cup/view-model";

export const WORLD_CUP_COMPETITION_ID = "fifa-world-cup";
export const WORLD_CUP_SEASON_ID = "world-cup-2026";

export type WorldCupSeason = {
  id: string;
  competitionId: string;
  label: string;
  startsAt: string | null;
  endsAt: string | null;
  hosts: string[];
  format: WorldCupFormat | null;
  status: string | null;
  teamCount: number;
  tournamentGroupCount: number;
  matchCount: number;
  source: WorldCupSource | null;
  freshness: WorldCupFreshness | null;
  updatedAt: string | null;
  sources: WorldCupSource[];
};

export type WorldCupFormat = {
  teamCount: number | null;
  groupCount: number | null;
  teamsPerGroup: number | null;
  knockoutStartsAt: string | null;
  advancementRule: string | null;
};

export type WorldCupSource = {
  sourceId: string;
  name: string;
  url: string | null;
  accessedAt: string | null;
  usage: string | null;
};

export type WorldCupFreshness = {
  fetchedAt: string | null;
  staleAfter: string | null;
  providerUpdatedAt: string | null;
};

export type WorldCupTeam = {
  id: string;
  name: string;
  shortName: string;
  countryCode: string | null;
  fifaCode: string | null;
  confederation: string | null;
  groupCode: string | null;
  groupPosition: string | null;
  status: string | null;
  coachName: string | null;
  source: WorldCupSource | null;
  freshness: WorldCupFreshness | null;
  updatedAt: string | null;
};

export type WorldCupGroup = {
  id: string;
  code: string;
  name: string;
  teamIds: string[];
  sortOrder: number;
  source: WorldCupSource | null;
  freshness: WorldCupFreshness | null;
  updatedAt: string | null;
};

export type WorldCupSquad = {
  id: string;
  teamId: string;
  status: string;
  playerIds: string[];
  publishedAt: string | null;
  notes: string | null;
  source: WorldCupSource | null;
  freshness: WorldCupFreshness | null;
  updatedAt: string | null;
};

export type WorldCupPlayer = {
  id: string;
  teamId: string;
  displayName: string;
  countryCode: string | null;
  position: string;
  shirtNumber: number | null;
  status: string;
};

export type WorldCupMatch = {
  id: string;
  competitionId: string;
  seasonId: string;
  stage: string;
  groupCode: string | null;
  matchday: number | null;
  homeTeamId: string | null;
  awayTeamId: string | null;
  homeTeam: WorldCupTeam | null;
  awayTeam: WorldCupTeam | null;
  homeSource: string | null;
  awaySource: string | null;
  kickoffAt: string | null;
  lockAt: string | null;
  venue: {
    name: string;
    city?: string;
    countryCode?: string;
  } | null;
  status: string;
  lifecycleStatus: string | null;
  score: {
    homeScore90: number | null;
    awayScore90: number | null;
    homeScoreFinal: number | null;
    awayScoreFinal: number | null;
  };
  winnerTeamId: string | null;
  source: WorldCupSource | null;
  freshness: WorldCupFreshness | null;
  updatedAt: string | null;
};

export type WorldCupBracketNode = {
  id: string;
  stage: string;
  position: number;
  matchId: string | null;
  match: WorldCupMatch | null;
  status: string;
  homeSource: string | null;
  awaySource: string | null;
  homeTeamId: string | null;
  awayTeamId: string | null;
  homeTeam: WorldCupTeam | null;
  awayTeam: WorldCupTeam | null;
  winnerTargetNodeId: string | null;
  loserTargetNodeId: string | null;
  mappingStatus: string | null;
  source: WorldCupSource | null;
  freshness: WorldCupFreshness | null;
  updatedAt: string | null;
};

export type WorldCupGroupWithTeams = WorldCupGroup & {
  teams: WorldCupTeam[];
};

export type WorldCupOverview = {
  season: WorldCupSeason | null;
  groups: WorldCupGroupWithTeams[];
  teams: WorldCupTeam[];
  fixtures: WorldCupMatch[];
};

export type WorldCupTeamDetail = {
  team: WorldCupTeam;
  group: WorldCupGroupWithTeams | null;
  squad: WorldCupSquad | null;
  players: WorldCupPlayer[];
  fixtures: WorldCupMatch[];
};

export type WorldCupFixtures = {
  season: WorldCupSeason | null;
  groups: Array<{
    groupCode: string;
    matches: WorldCupMatch[];
  }>;
  matches: WorldCupMatch[];
};

export type WorldCupBracket = {
  season: WorldCupSeason | null;
  stages: Array<{
    stage: string;
    nodes: WorldCupBracketNode[];
  }>;
  nodes: WorldCupBracketNode[];
};

export async function getWorldCupOverview(): Promise<WorldCupOverview> {
  const seasonRef = getSeasonRef();
  const [seasonSnap, groupsSnap, teamsSnap, matchesSnap] = await Promise.all([
    seasonRef.get(),
    seasonRef.collection("tournamentGroups").get(),
    seasonRef.collection("teams").get(),
    seasonRef.collection("matches").get(),
  ]);

  const season = seasonSnap.exists ? toSeason(seasonSnap.id, seasonSnap.data() ?? {}) : null;
  const teams = teamsSnap.docs.map((doc) => toTeam(doc.id, doc.data()));
  const teamById = new Map(teams.map((team) => [team.id, team]));
  const groups = buildGroupsWithTeams(
    groupsSnap.docs.map((doc) => toGroup(doc.id, doc.data())),
    teams,
  );
  const fixtures = sortFixtures(matchesSnap.docs.map((doc) => toMatch(doc.id, doc.data(), teamById)));

  return {
    season,
    groups,
    teams: sortTeams(teams),
    fixtures,
  };
}

export async function getWorldCupTeamDetail(teamId: string): Promise<WorldCupTeamDetail> {
  const seasonRef = getSeasonRef();
  const teamRef = seasonRef.collection("teams").doc(teamId);
  const [teamSnap, groupsSnap, teamsSnap, squadsSnap, playersSnap, matchesSnap] = await Promise.all([
    teamRef.get(),
    seasonRef.collection("tournamentGroups").get(),
    seasonRef.collection("teams").get(),
    seasonRef.collection("squads").where("teamId", "==", teamId).limit(1).get(),
    seasonRef.collection("players").where("teamId", "==", teamId).get(),
    seasonRef.collection("matches").get(),
  ]);

  if (!teamSnap.exists) {
    notFound();
  }

  const team = toTeam(teamSnap.id, teamSnap.data() ?? {});
  const teams = teamsSnap.docs.map((doc) => toTeam(doc.id, doc.data()));
  const groups = buildGroupsWithTeams(
    groupsSnap.docs.map((doc) => toGroup(doc.id, doc.data())),
    teams,
  );
  const group = groups.find((candidate) => candidate.teamIds.includes(team.id)) ?? null;
  const squad = squadsSnap.docs[0] ? toSquad(squadsSnap.docs[0].id, squadsSnap.docs[0].data()) : null;
  const players = playersSnap.docs.map((doc) => toPlayer(doc.id, doc.data())).sort(comparePlayers);
  const teamById = new Map(teams.map((candidate) => [candidate.id, candidate]));
  const fixtureMap = buildTeamFixtureMap(
    matchesSnap.docs.map((doc) => toMatch(doc.id, doc.data(), teamById)),
  );

  return {
    team,
    group,
    squad,
    players,
    fixtures: fixtureMap.get(team.id) ?? [],
  };
}

export async function getWorldCupFixtures(): Promise<WorldCupFixtures> {
  const seasonRef = getSeasonRef();
  const [seasonSnap, teamsSnap, matchesSnap] = await Promise.all([
    seasonRef.get(),
    seasonRef.collection("teams").get(),
    seasonRef.collection("matches").get(),
  ]);
  const season = seasonSnap.exists ? toSeason(seasonSnap.id, seasonSnap.data() ?? {}) : null;
  const teams = teamsSnap.docs.map((doc) => toTeam(doc.id, doc.data()));
  const teamById = new Map(teams.map((team) => [team.id, team]));
  const matches = sortFixtures(matchesSnap.docs.map((doc) => toMatch(doc.id, doc.data(), teamById)));

  return {
    season,
    groups: groupFixturesByGroup(matches),
    matches,
  };
}

export async function getWorldCupBracket(): Promise<WorldCupBracket> {
  const seasonRef = getSeasonRef();
  const [seasonSnap, teamsSnap, matchesSnap, bracketSnap] = await Promise.all([
    seasonRef.get(),
    seasonRef.collection("teams").get(),
    seasonRef.collection("matches").get(),
    seasonRef.collection("bracketNodes").get(),
  ]);
  const season = seasonSnap.exists ? toSeason(seasonSnap.id, seasonSnap.data() ?? {}) : null;
  const teams = teamsSnap.docs.map((doc) => toTeam(doc.id, doc.data()));
  const teamById = new Map(teams.map((team) => [team.id, team]));
  const matches = matchesSnap.docs.map((doc) => toMatch(doc.id, doc.data(), teamById));
  const matchById = new Map(matches.map((match) => [match.id, match]));
  const nodes = sortBracketNodes(
    bracketSnap.docs.map((doc) => toBracketNode(doc.id, doc.data(), teamById, matchById)),
  );

  return {
    season,
    stages: groupNodesByStage(nodes),
    nodes,
  };
}

function getSeasonRef() {
  return getFirebaseAdminFirestore()
    .collection("competitions")
    .doc(WORLD_CUP_COMPETITION_ID)
    .collection("seasons")
    .doc(WORLD_CUP_SEASON_ID);
}

function toSeason(id: string, data: FirebaseFirestore.DocumentData): WorldCupSeason {
  return {
    id,
    competitionId: stringValue(data.competitionId, WORLD_CUP_COMPETITION_ID),
    label: stringValue(data.label, "World Cup 2026"),
    startsAt: nullableString(data.startsAt),
    endsAt: nullableString(data.endsAt),
    hosts: Array.isArray(data.hosts) ? data.hosts.filter((host): host is string => typeof host === "string") : [],
    format: toFormat(data.format),
    status: nullableString(data.status),
    teamCount: numberValue(data.teamCount),
    tournamentGroupCount: numberValue(data.tournamentGroupCount),
    matchCount: numberValue(data.matchCount),
    source: toSource(data.source),
    freshness: toFreshness(data.freshness),
    updatedAt: nullableString(data.updatedAt),
    sources: Array.isArray(data.sources) ? data.sources.map(toSource).filter((source): source is WorldCupSource => Boolean(source)) : [],
  };
}

function toTeam(id: string, data: FirebaseFirestore.DocumentData): WorldCupTeam {
  return {
    id,
    name: stringValue(data.name, id),
    shortName: stringValue(data.shortName, stringValue(data.name, id)),
    countryCode: nullableString(data.countryCode),
    fifaCode: nullableString(data.fifaCode),
    confederation: nullableString(data.confederation),
    groupCode: nullableString(data.groupCode),
    groupPosition: nullableString(data.groupPosition),
    status: nullableString(data.status),
    coachName: nullableString(data.coachName),
    source: toSource(data.source),
    freshness: toFreshness(data.freshness),
    updatedAt: nullableString(data.updatedAt),
  };
}

function toGroup(id: string, data: FirebaseFirestore.DocumentData): WorldCupGroup {
  return {
    id,
    code: stringValue(data.code, id),
    name: stringValue(data.name, `Group ${stringValue(data.code, id)}`),
    teamIds: Array.isArray(data.teamIds) ? data.teamIds.filter((teamId): teamId is string => typeof teamId === "string") : [],
    sortOrder: numberValue(data.sortOrder),
    source: toSource(data.source),
    freshness: toFreshness(data.freshness),
    updatedAt: nullableString(data.updatedAt),
  };
}

function toSquad(id: string, data: FirebaseFirestore.DocumentData): WorldCupSquad {
  return {
    id,
    teamId: stringValue(data.teamId, ""),
    status: stringValue(data.status, "unknown"),
    playerIds: Array.isArray(data.playerIds)
      ? data.playerIds.filter((playerId): playerId is string => typeof playerId === "string")
      : [],
    publishedAt: nullableString(data.publishedAt),
    notes: nullableString(data.notes),
    source: toSource(data.source),
    freshness: toFreshness(data.freshness),
    updatedAt: nullableString(data.updatedAt),
  };
}

function toMatch(
  id: string,
  data: FirebaseFirestore.DocumentData,
  teamById: Map<string, WorldCupTeam>,
): WorldCupMatch {
  const homeTeamId = nullableString(data.homeTeamId);
  const awayTeamId = nullableString(data.awayTeamId);
  const score = data.score && typeof data.score === "object" ? data.score : {};

  return {
    id,
    competitionId: stringValue(data.competitionId, WORLD_CUP_COMPETITION_ID),
    seasonId: stringValue(data.seasonId, WORLD_CUP_SEASON_ID),
    stage: stringValue(data.stage, "group"),
    groupCode: nullableString(data.groupCode),
    matchday: typeof data.matchday === "number" ? data.matchday : null,
    homeTeamId,
    awayTeamId,
    homeTeam: homeTeamId ? teamById.get(homeTeamId) ?? null : null,
    awayTeam: awayTeamId ? teamById.get(awayTeamId) ?? null : null,
    homeSource: nullableString(data.homeSource),
    awaySource: nullableString(data.awaySource),
    kickoffAt: nullableString(data.kickoffAt),
    lockAt: nullableString(data.lockAt),
    venue: toVenue(data.venue),
    status: stringValue(data.status, "SCHEDULED"),
    lifecycleStatus: nullableString(data.lifecycleStatus),
    score: {
      homeScore90: nullableNumber(score.homeScore90),
      awayScore90: nullableNumber(score.awayScore90),
      homeScoreFinal: nullableNumber(score.homeScoreFinal),
      awayScoreFinal: nullableNumber(score.awayScoreFinal),
    },
    winnerTeamId: nullableString(data.winnerTeamId),
    source: toSource(data.source),
    freshness: toFreshness(data.freshness),
    updatedAt: nullableString(data.updatedAt),
  };
}

function toBracketNode(
  id: string,
  data: FirebaseFirestore.DocumentData,
  teamById: Map<string, WorldCupTeam>,
  matchById: Map<string, WorldCupMatch>,
): WorldCupBracketNode {
  const homeTeamId = nullableString(data.homeTeamId);
  const awayTeamId = nullableString(data.awayTeamId);
  const matchId = nullableString(data.matchId);

  return {
    id,
    stage: stringValue(data.stage, "round_of_32"),
    position: numberValue(data.position || data.sortOrder),
    matchId,
    match: matchId ? matchById.get(matchId) ?? null : null,
    status: stringValue(data.status, "unresolved"),
    homeSource: nullableString(data.homeSource),
    awaySource: nullableString(data.awaySource),
    homeTeamId,
    awayTeamId,
    homeTeam: homeTeamId ? teamById.get(homeTeamId) ?? null : null,
    awayTeam: awayTeamId ? teamById.get(awayTeamId) ?? null : null,
    winnerTargetNodeId: nullableString(data.winnerTargetNodeId),
    loserTargetNodeId: nullableString(data.loserTargetNodeId),
    mappingStatus: nullableString(data.mappingStatus),
    source: toSource(data.source),
    freshness: toFreshness(data.freshness),
    updatedAt: nullableString(data.updatedAt),
  };
}

function toPlayer(id: string, data: FirebaseFirestore.DocumentData): WorldCupPlayer {
  return {
    id,
    teamId: stringValue(data.teamId, ""),
    displayName: stringValue(data.displayName, id),
    countryCode: nullableString(data.countryCode),
    position: stringValue(data.position, "unknown"),
    shirtNumber: typeof data.shirtNumber === "number" ? data.shirtNumber : null,
    status: stringValue(data.status, "active"),
  };
}

function comparePlayers(a: WorldCupPlayer, b: WorldCupPlayer) {
  if (a.shirtNumber != null && b.shirtNumber != null && a.shirtNumber !== b.shirtNumber) {
    return a.shirtNumber - b.shirtNumber;
  }

  if (a.shirtNumber != null && b.shirtNumber == null) {
    return -1;
  }

  if (a.shirtNumber == null && b.shirtNumber != null) {
    return 1;
  }

  return a.displayName.localeCompare(b.displayName);
}

function stringValue(value: unknown, fallback: string) {
  return typeof value === "string" && value.trim() ? value : fallback;
}

function nullableString(value: unknown) {
  return typeof value === "string" && value.trim() ? value : null;
}

function numberValue(value: unknown) {
  return typeof value === "number" && Number.isFinite(value) ? value : 0;
}

function nullableNumber(value: unknown) {
  return typeof value === "number" && Number.isFinite(value) ? value : null;
}

function toFormat(value: unknown): WorldCupFormat | null {
  if (!value || typeof value !== "object" || Array.isArray(value)) {
    return null;
  }

  const data = value as Record<string, unknown>;

  return {
    teamCount: nullableNumber(data.teamCount),
    groupCount: nullableNumber(data.groupCount),
    teamsPerGroup: nullableNumber(data.teamsPerGroup),
    knockoutStartsAt: nullableString(data.knockoutStartsAt),
    advancementRule: nullableString(data.advancementRule),
  };
}

function toSource(value: unknown): WorldCupSource | null {
  if (!value || typeof value !== "object" || Array.isArray(value)) {
    return null;
  }

  const data = value as Record<string, unknown>;
  const sourceId = nullableString(data.sourceId);
  const name = nullableString(data.name);

  if (!sourceId || !name) {
    return null;
  }

  return {
    sourceId,
    name,
    url: nullableString(data.url),
    accessedAt: nullableString(data.accessedAt),
    usage: nullableString(data.usage),
  };
}

function toFreshness(value: unknown): WorldCupFreshness | null {
  if (!value || typeof value !== "object" || Array.isArray(value)) {
    return null;
  }

  const data = value as Record<string, unknown>;

  return {
    fetchedAt: nullableString(data.fetchedAt),
    staleAfter: nullableString(data.staleAfter),
    providerUpdatedAt: nullableString(data.providerUpdatedAt),
  };
}

function toVenue(value: unknown): WorldCupMatch["venue"] {
  if (!value || typeof value !== "object" || Array.isArray(value)) {
    return null;
  }

  const data = value as Record<string, unknown>;
  const name = nullableString(data.name);

  if (!name) {
    return null;
  }

  return {
    name,
    city: nullableString(data.city) ?? undefined,
    countryCode: nullableString(data.countryCode) ?? undefined,
  };
}
