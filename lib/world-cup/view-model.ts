import type { WorldCupGroup, WorldCupGroupWithTeams, WorldCupTeam } from "@/lib/world-cup/reference-data";

export function buildGroupsWithTeams(groups: WorldCupGroup[], teams: WorldCupTeam[]): WorldCupGroupWithTeams[] {
  const teamById = new Map(teams.map((team) => [team.id, team]));

  return [...groups]
    .sort((a, b) => a.sortOrder - b.sortOrder || a.code.localeCompare(b.code))
    .map((group) => ({
      ...group,
      teams: group.teamIds.map((teamId) => teamById.get(teamId)).filter((team): team is WorldCupTeam => Boolean(team)),
    }));
}

export function sortTeams(teams: WorldCupTeam[]) {
  return [...teams].sort((a, b) => {
    const groupCompare = (a.groupCode ?? "").localeCompare(b.groupCode ?? "");

    if (groupCompare !== 0) {
      return groupCompare;
    }

    return (a.groupPosition ?? a.name).localeCompare(b.groupPosition ?? b.name);
  });
}

export function readableSquadStatus(status: string | null | undefined) {
  return titleCase(status ?? "unknown");
}

function titleCase(value: string) {
  return value
    .replace(/[-_]/g, " ")
    .replace(/\b\w/g, (letter) => letter.toUpperCase());
}
