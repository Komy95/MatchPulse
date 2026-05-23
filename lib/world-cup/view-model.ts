import type {
  WorldCupBracketNode,
  WorldCupGroup,
  WorldCupGroupWithTeams,
  WorldCupMatch,
  WorldCupTeam,
} from "@/lib/world-cup/reference-data";

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

export function sortFixtures(matches: WorldCupMatch[]) {
  return [...matches].sort((a, b) => {
    const groupCompare = (a.groupCode ?? "").localeCompare(b.groupCode ?? "");

    if (groupCompare !== 0) {
      return groupCompare;
    }

    if ((a.matchday ?? 0) !== (b.matchday ?? 0)) {
      return (a.matchday ?? 0) - (b.matchday ?? 0);
    }

    const leftTime = a.kickoffAt ? Date.parse(a.kickoffAt) : Number.POSITIVE_INFINITY;
    const rightTime = b.kickoffAt ? Date.parse(b.kickoffAt) : Number.POSITIVE_INFINITY;

    return leftTime - rightTime || a.id.localeCompare(b.id);
  });
}

export function groupFixturesByGroup(matches: WorldCupMatch[]) {
  const groups = new Map<string, WorldCupMatch[]>();

  for (const match of sortFixtures(matches)) {
    const groupCode = match.groupCode ?? "TBD";
    groups.set(groupCode, [...(groups.get(groupCode) ?? []), match]);
  }

  return [...groups.entries()].map(([groupCode, groupedMatches]) => ({
    groupCode,
    matches: groupedMatches,
  }));
}

export function buildTeamFixtureMap(matches: WorldCupMatch[]) {
  const byTeam = new Map<string, WorldCupMatch[]>();

  for (const match of sortFixtures(matches)) {
    for (const teamId of [match.homeTeamId, match.awayTeamId]) {
      if (!teamId) {
        continue;
      }

      byTeam.set(teamId, [...(byTeam.get(teamId) ?? []), match]);
    }
  }

  return byTeam;
}

export function sortBracketNodes(nodes: WorldCupBracketNode[]) {
  return [...nodes].sort((a, b) => {
    const stageCompare = stageOrder(a.stage) - stageOrder(b.stage);

    if (stageCompare !== 0) {
      return stageCompare;
    }

    return a.position - b.position || a.id.localeCompare(b.id);
  });
}

export function groupNodesByStage(nodes: WorldCupBracketNode[]) {
  const stages = new Map<string, WorldCupBracketNode[]>();

  for (const node of sortBracketNodes(nodes)) {
    stages.set(node.stage, [...(stages.get(node.stage) ?? []), node]);
  }

  return [...stages.entries()].map(([stage, groupedNodes]) => ({
    stage,
    nodes: groupedNodes,
  }));
}

export function readableStage(value: string) {
  return titleCase(value.replace(/_/g, " ").replace(/-/g, " "));
}

export function readableBracketSource(source: string | null | undefined) {
  if (!source) {
    return "Unresolved";
  }

  if (source.startsWith("TBD_R32_")) {
    return "Round of 32 place to be confirmed";
  }

  return titleCase(source.replace(/_/g, " "));
}

export function readableSquadStatus(status: string | null | undefined) {
  return titleCase(status ?? "unknown");
}

function titleCase(value: string) {
  return value
    .replace(/[-_]/g, " ")
    .replace(/\b\w/g, (letter) => letter.toUpperCase());
}

function stageOrder(stage: string) {
  switch (stage) {
    case "round_of_32":
    case "round-of-32":
      return 1;
    case "round_of_16":
    case "round-of-16":
      return 2;
    case "quarter_final":
    case "quarter-final":
      return 3;
    case "semi_final":
    case "semi-final":
      return 4;
    case "third_place":
    case "third-place":
      return 5;
    case "final":
      return 6;
    default:
      return 99;
  }
}
