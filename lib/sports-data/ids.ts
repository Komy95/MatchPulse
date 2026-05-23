export function deterministicSportsDocumentId(parts: string[]) {
  const normalized = parts
    .map((part) => normalizeIdPart(part))
    .filter(Boolean)
    .join("-");

  if (!normalized) {
    throw new Error("Cannot build deterministic ID from empty parts.");
  }

  return normalized.slice(0, 180);
}

export function normalizeIdPart(value: string) {
  return value
    .trim()
    .toLowerCase()
    .replace(/&/g, "and")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

export function deterministicProviderEntityId({
  providerId,
  externalId,
  fallbackParts,
}: {
  providerId: string;
  externalId?: string | null;
  fallbackParts: string[];
}) {
  return deterministicSportsDocumentId([
    providerId,
    externalId && externalId.trim() ? externalId : fallbackParts.join("-"),
  ]);
}

export function competitionDocumentId(name: string) {
  return deterministicSportsDocumentId([name]);
}

export function seasonDocumentId(competitionId: string, seasonLabel: string) {
  return deterministicSportsDocumentId([competitionId, seasonLabel]);
}

export function teamDocumentId(competitionId: string, seasonId: string, teamName: string) {
  return deterministicSportsDocumentId([competitionId, seasonId, "team", teamName]);
}

export function matchDocumentId({
  competitionId,
  seasonId,
  stage,
  homeTeamId,
  awayTeamId,
  kickoffAt,
}: {
  competitionId: string;
  seasonId: string;
  stage: string;
  homeTeamId: string;
  awayTeamId: string;
  kickoffAt: string;
}) {
  return deterministicSportsDocumentId([
    competitionId,
    seasonId,
    "match",
    stage,
    homeTeamId,
    awayTeamId,
    kickoffAt,
  ]);
}

export function tournamentGroupDocumentId(
  competitionId: string,
  seasonId: string,
  groupCode: string,
) {
  return deterministicSportsDocumentId([competitionId, seasonId, "group", groupCode]);
}

export function squadDocumentId(competitionId: string, seasonId: string, teamId: string) {
  return deterministicSportsDocumentId([competitionId, seasonId, "squad", teamId]);
}

export function playerDocumentId(
  competitionId: string,
  seasonId: string,
  teamId: string,
  playerName: string,
) {
  return deterministicSportsDocumentId([competitionId, seasonId, "player", teamId, playerName]);
}

export function bracketNodeDocumentId(
  competitionId: string,
  seasonId: string,
  stage: string,
  sortOrder: number,
) {
  return deterministicSportsDocumentId([
    competitionId,
    seasonId,
    "bracket",
    stage,
    sortOrder.toString().padStart(2, "0"),
  ]);
}
