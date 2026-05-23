import type {
  BracketNode,
  BracketNodeLifecycleStatus,
  BracketParticipantSource,
  MatchLifecycleStatus,
  NormalizedMatch,
  NormalizedSeason,
  NormalizedTeam,
  Player,
  PlayerLifecycleStatus,
  Squad,
  SquadLifecycleStatus,
  TeamLifecycleStatus,
  TournamentGroup,
} from "@/lib/sports-data/domain";

const teamStatuses = new Set<TeamLifecycleStatus>(["confirmed", "placeholder", "eliminated"]);
const squadStatuses = new Set<SquadLifecycleStatus>([
  "unknown",
  "provisional",
  "final",
  "updated",
]);
const playerStatuses = new Set<PlayerLifecycleStatus>([
  "active",
  "replaced",
  "withdrawn",
  "injured",
]);
const matchLifecycleStatuses = new Set<MatchLifecycleStatus>([
  "scheduled",
  "live",
  "finished",
  "corrected",
  "postponed",
  "cancelled",
  "abandoned",
  "void",
]);
const bracketStatuses = new Set<BracketNodeLifecycleStatus>([
  "unresolved",
  "scheduled",
  "live",
  "finished",
]);

export type TournamentReferenceValidationInput = {
  season: Pick<NormalizedSeason, "competitionId" | "id">;
  tournamentGroups?: TournamentGroup[];
  teams: NormalizedTeam[];
  matches?: NormalizedMatch[];
  squads?: Squad[];
  players?: Player[];
  bracketNodes?: BracketNode[];
};

export function validateTournamentReferenceData(input: TournamentReferenceValidationInput) {
  const teamIds = new Set(input.teams.map((team) => team.id));
  const groupIds = new Set((input.tournamentGroups ?? []).map((group) => group.id));
  const playerIds = new Set((input.players ?? []).map((player) => player.id));
  const matchIds = new Set((input.matches ?? []).map((match) => match.id));
  const bracketNodeIds = new Set((input.bracketNodes ?? []).map((node) => node.id));

  for (const team of input.teams) {
    validateTeam(team, input.season);
  }

  for (const group of input.tournamentGroups ?? []) {
    validateTournamentGroup(group, input.season, teamIds);
  }

  for (const player of input.players ?? []) {
    validatePlayer(player, input.season, teamIds);
  }

  for (const squad of input.squads ?? []) {
    validateSquad(squad, input.season, teamIds, playerIds);
  }

  for (const match of input.matches ?? []) {
    validateMatch(match, input.season, teamIds, groupIds);
  }

  for (const node of input.bracketNodes ?? []) {
    validateBracketNode(node, input.season, matchIds, bracketNodeIds, teamIds, groupIds);
  }
}

export function validateTeam(team: NormalizedTeam, season: Pick<NormalizedSeason, "competitionId" | "id">) {
  assertScoped(team, season, `team ${team.id}`);
  assertNonEmpty(team.name, "team.name");
  assertNonEmpty(team.shortName, "team.shortName");

  if (!teamStatuses.has(team.status ?? "confirmed")) {
    throw new Error(`Invalid team status: ${team.status}`);
  }

  if (team.countryCode != null && team.countryCode.length !== 2) {
    throw new Error("team.countryCode must be a two-letter country code or null.");
  }
}

export function validateTournamentGroup(
  group: TournamentGroup,
  season: Pick<NormalizedSeason, "competitionId" | "id">,
  teamIds: Set<string>,
) {
  assertScoped(group, season, `tournament group ${group.id}`);
  assertNonEmpty(group.code, "tournamentGroup.code");
  assertNonEmpty(group.name, "tournamentGroup.name");
  assertNonNegativeInteger(group.sortOrder, "tournamentGroup.sortOrder");

  if (!Array.isArray(group.teamIds) || group.teamIds.length > 4) {
    throw new Error("tournamentGroup.teamIds must contain at most four teams.");
  }

  for (const teamId of group.teamIds) {
    if (!teamIds.has(teamId)) {
      throw new Error(`Tournament group ${group.id} references unknown team ${teamId}.`);
    }
  }
}

export function validatePlayer(
  player: Player,
  season: Pick<NormalizedSeason, "competitionId" | "id">,
  teamIds: Set<string>,
) {
  assertScoped(player, season, `player ${player.id}`);
  assertReference(teamIds, player.teamId, `Player ${player.id} references unknown team`);
  assertNonEmpty(player.displayName, "player.displayName");

  if (!playerStatuses.has(player.status)) {
    throw new Error(`Invalid player status: ${player.status}`);
  }

  if (player.shirtNumber != null) {
    assertNonNegativeInteger(player.shirtNumber, "player.shirtNumber");
  }
}

export function validateSquad(
  squad: Squad,
  season: Pick<NormalizedSeason, "competitionId" | "id">,
  teamIds: Set<string>,
  playerIds: Set<string>,
) {
  assertScoped(squad, season, `squad ${squad.id}`);
  assertReference(teamIds, squad.teamId, `Squad ${squad.id} references unknown team`);

  if (!squadStatuses.has(squad.status)) {
    throw new Error(`Invalid squad status: ${squad.status}`);
  }

  for (const playerId of squad.playerIds) {
    assertReference(playerIds, playerId, `Squad ${squad.id} references unknown player`);
  }

  if (squad.publishedAt != null) {
    assertIsoUtc(squad.publishedAt, "squad.publishedAt");
  }
}

export function validateMatch(
  match: NormalizedMatch,
  season: Pick<NormalizedSeason, "competitionId" | "id">,
  teamIds: Set<string>,
  groupIds: Set<string>,
) {
  assertScoped(match, season, `match ${match.id}`);
  assertReference(teamIds, match.homeTeamId, `Match ${match.id} references unknown home team`);
  assertReference(teamIds, match.awayTeamId, `Match ${match.id} references unknown away team`);
  assertIsoUtc(match.kickoffAt, "match.kickoffAt");
  assertIsoUtc(match.lockAt, "match.lockAt");

  if (!matchLifecycleStatuses.has(match.lifecycleStatus ?? matchLifecycleStatusFromMatchStatus(match.status))) {
    throw new Error(`Invalid match lifecycle status: ${match.lifecycleStatus}`);
  }

  const groupCode = match.groupCode;

  if (groupCode) {
    const groupId = [...groupIds].find((candidate) => candidate.endsWith(`-${groupCode.toLowerCase()}`));

    if (groupIds.size > 0 && !groupId) {
      throw new Error(`Match ${match.id} references unknown tournament group ${groupCode}.`);
    }
  }
}

export function validateBracketNode(
  node: BracketNode,
  season: Pick<NormalizedSeason, "competitionId" | "id">,
  matchIds: Set<string>,
  bracketNodeIds: Set<string>,
  teamIds: Set<string>,
  groupIds: Set<string>,
) {
  assertScoped(node, season, `bracket node ${node.id}`);
  assertNonNegativeInteger(node.sortOrder, "bracketNode.sortOrder");

  if (!bracketStatuses.has(node.status)) {
    throw new Error(`Invalid bracket node status: ${node.status}`);
  }

  if (node.matchId != null) {
    assertReference(matchIds, node.matchId, `Bracket node ${node.id} references unknown match`);
  }

  validateParticipantSource(node.homeSource, teamIds, groupIds, bracketNodeIds, `Bracket node ${node.id}.homeSource`);
  validateParticipantSource(node.awaySource, teamIds, groupIds, bracketNodeIds, `Bracket node ${node.id}.awaySource`);

  if (node.winnerTargetNodeId != null) {
    assertReference(bracketNodeIds, node.winnerTargetNodeId, `Bracket node ${node.id} references unknown winner target`);
  }

  if (node.loserTargetNodeId != null) {
    assertReference(bracketNodeIds, node.loserTargetNodeId, `Bracket node ${node.id} references unknown loser target`);
  }
}

export function matchLifecycleStatusFromMatchStatus(status: string): MatchLifecycleStatus {
  switch (status) {
    case "LIVE":
    case "HALFTIME":
      return "live";
    case "FINISHED":
      return "finished";
    case "CORRECTED":
      return "corrected";
    case "POSTPONED":
      return "postponed";
    case "CANCELLED":
      return "cancelled";
    case "ABANDONED":
      return "abandoned";
    case "VOID":
      return "void";
    case "SCHEDULED":
    case "LINEUPS_PENDING":
    default:
      return "scheduled";
  }
}

function validateParticipantSource(
  source: BracketParticipantSource,
  teamIds: Set<string>,
  groupIds: Set<string>,
  bracketNodeIds: Set<string>,
  field: string,
) {
  switch (source.type) {
    case "team":
      assertReference(teamIds, source.teamId, `${field} references unknown team`);
      return;
    case "group-rank":
      assertReference(groupIds, source.groupId, `${field} references unknown tournament group`);
      assertNonNegativeInteger(source.rank, `${field}.rank`);
      return;
    case "best-third":
      assertNonNegativeInteger(source.slot, `${field}.slot`);
      return;
    case "winner":
    case "loser":
      assertReference(bracketNodeIds, source.bracketNodeId, `${field} references unknown bracket node`);
      return;
    case "placeholder":
      assertNonEmpty(source.label, `${field}.label`);
      return;
  }
}

function assertScoped(
  entity: { competitionId: string; seasonId: string },
  season: Pick<NormalizedSeason, "competitionId" | "id">,
  label: string,
) {
  if (entity.competitionId !== season.competitionId || entity.seasonId !== season.id) {
    throw new Error(`${label} is outside the requested competition season.`);
  }
}

function assertReference(allowedIds: Set<string>, value: string, message: string) {
  if (!allowedIds.has(value)) {
    throw new Error(`${message} ${value}.`);
  }
}

function assertNonEmpty(value: string, field: string) {
  if (!value.trim()) {
    throw new Error(`${field} is required.`);
  }
}

function assertNonNegativeInteger(value: number, field: string) {
  if (!Number.isInteger(value) || value < 0) {
    throw new Error(`${field} must be a non-negative integer.`);
  }
}

function assertIsoUtc(value: string, field: string) {
  if (!Number.isFinite(Date.parse(value)) || !value.endsWith("Z")) {
    throw new Error(`${field} must be an ISO UTC timestamp.`);
  }
}
