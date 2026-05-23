import "server-only";
import { notFound } from "next/navigation";
import { getFirebaseAdminFirestore } from "@/lib/firebase/admin";
import { buildGroupsWithTeams, sortTeams } from "@/lib/world-cup/view-model";

export const WORLD_CUP_COMPETITION_ID = "fifa-world-cup";
export const WORLD_CUP_SEASON_ID = "world-cup-2026";

export type WorldCupSeason = {
  id: string;
  competitionId: string;
  label: string;
  startsAt: string | null;
  endsAt: string | null;
  hosts: string[];
  status: string | null;
  teamCount: number;
  tournamentGroupCount: number;
  matchCount: number;
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
};

export type WorldCupGroup = {
  id: string;
  code: string;
  name: string;
  teamIds: string[];
  sortOrder: number;
};

export type WorldCupSquad = {
  id: string;
  teamId: string;
  status: string;
  playerIds: string[];
  publishedAt: string | null;
  notes: string | null;
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

export type WorldCupGroupWithTeams = WorldCupGroup & {
  teams: WorldCupTeam[];
};

export type WorldCupOverview = {
  season: WorldCupSeason | null;
  groups: WorldCupGroupWithTeams[];
  teams: WorldCupTeam[];
};

export type WorldCupTeamDetail = {
  team: WorldCupTeam;
  group: WorldCupGroupWithTeams | null;
  squad: WorldCupSquad | null;
  players: WorldCupPlayer[];
};

export async function getWorldCupOverview(): Promise<WorldCupOverview> {
  const seasonRef = getSeasonRef();
  const [seasonSnap, groupsSnap, teamsSnap] = await Promise.all([
    seasonRef.get(),
    seasonRef.collection("tournamentGroups").get(),
    seasonRef.collection("teams").get(),
  ]);

  const season = seasonSnap.exists ? toSeason(seasonSnap.id, seasonSnap.data() ?? {}) : null;
  const teams = teamsSnap.docs.map((doc) => toTeam(doc.id, doc.data()));
  const groups = buildGroupsWithTeams(
    groupsSnap.docs.map((doc) => toGroup(doc.id, doc.data())),
    teams,
  );

  return {
    season,
    groups,
    teams: sortTeams(teams),
  };
}

export async function getWorldCupTeamDetail(teamId: string): Promise<WorldCupTeamDetail> {
  const seasonRef = getSeasonRef();
  const teamRef = seasonRef.collection("teams").doc(teamId);
  const [teamSnap, groupsSnap, teamsSnap, squadsSnap, playersSnap] = await Promise.all([
    teamRef.get(),
    seasonRef.collection("tournamentGroups").get(),
    seasonRef.collection("teams").get(),
    seasonRef.collection("squads").where("teamId", "==", teamId).limit(1).get(),
    seasonRef.collection("players").where("teamId", "==", teamId).get(),
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

  return {
    team,
    group,
    squad,
    players,
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
    status: nullableString(data.status),
    teamCount: numberValue(data.teamCount),
    tournamentGroupCount: numberValue(data.tournamentGroupCount),
    matchCount: numberValue(data.matchCount),
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
  };
}

function toGroup(id: string, data: FirebaseFirestore.DocumentData): WorldCupGroup {
  return {
    id,
    code: stringValue(data.code, id),
    name: stringValue(data.name, `Group ${stringValue(data.code, id)}`),
    teamIds: Array.isArray(data.teamIds) ? data.teamIds.filter((teamId): teamId is string => typeof teamId === "string") : [],
    sortOrder: numberValue(data.sortOrder),
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
