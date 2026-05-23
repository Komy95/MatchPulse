import { deterministicProviderEntityId } from "@/lib/sports-data/ids";
import type {
  MatchStatus,
  NormalizedMatch,
  NormalizedSportsDataBatch,
  NormalizedTeam,
  ProviderMetadata,
  SportsDataIngestionRequest,
} from "@/lib/sports-data/domain";
import { ProviderDataError, type SportsDataProvider } from "@/lib/sports-data/providers/types";

type MockTeam = {
  externalId: string;
  name: string;
  shortName: string;
  countryCode: string;
  groupCode?: string;
};

export type MockMatch = {
  externalId: string;
  homeExternalId: string;
  awayExternalId: string;
  kickoffAt: string;
  status: string;
  stage: string;
  groupCode?: string;
  venue?: {
    name: string;
    city?: string;
    countryCode?: string;
  };
  score?: {
    homeScore90?: number | null;
    awayScore90?: number | null;
    homeScoreFinal?: number | null;
    awayScoreFinal?: number | null;
  };
  providerUpdatedAt?: string;
};

export type MockProviderPayload = {
  competition: {
    externalId: string;
    name: string;
    countryCode?: string | null;
  };
  season: {
    externalId: string;
    label: string;
    startsAt: string;
    endsAt: string;
  };
  teams: MockTeam[];
  matches: MockMatch[];
};

export class MockSportsDataProvider implements SportsDataProvider {
  readonly id = "mock" as const;
  private readonly mockMatchStates = new Map<string, Partial<MockMatch>>();

  constructor(
    private readonly payload: MockProviderPayload = createDefaultMockWorldCupPayload(),
    private readonly fetchedAt = "2026-05-22T00:00:00.000Z",
  ) {}

  async fetchCompetitionSeason(
    request: SportsDataIngestionRequest,
  ): Promise<NormalizedSportsDataBatch> {
    return mapMockProviderPayload(this.payloadWithOverrides(), request, this.fetchedAt);
  }

  async fetchLiveMatches(request: SportsDataIngestionRequest): Promise<NormalizedMatch[]> {
    const batch = mapMockProviderPayload(this.payloadWithOverrides(), request, this.fetchedAt);

    return batch.matches.filter((match) => isLiveUpdateStatus(match.status));
  }

  async fetchMatchDetails(
    request: SportsDataIngestionRequest,
    externalMatchId: string,
  ): Promise<NormalizedMatch> {
    const batch = mapMockProviderPayload(this.payloadWithOverrides(), request, this.fetchedAt);
    const match = batch.matches.find((candidate) => candidate.provider.externalId === externalMatchId);

    if (!match) {
      throw new ProviderDataError(`Mock match not found: ${externalMatchId}`);
    }

    return match;
  }

  setMockMatchState(externalId: string, overrides: Partial<MockMatch>): void {
    this.mockMatchStates.set(externalId, {
      ...this.mockMatchStates.get(externalId),
      ...overrides,
    });
  }

  private payloadWithOverrides(): MockProviderPayload {
    if (this.mockMatchStates.size === 0) {
      return this.payload;
    }

    return {
      ...this.payload,
      matches: this.payload.matches.map((match) => ({
        ...match,
        ...this.mockMatchStates.get(match.externalId),
      })),
    };
  }
}

export function mapMockProviderPayload(
  payload: MockProviderPayload,
  request: SportsDataIngestionRequest,
  fetchedAt: string,
): NormalizedSportsDataBatch {
  assertIsoUtc(fetchedAt, "fetchedAt");
  assertIsoUtc(payload.season.startsAt, "season.startsAt");
  assertIsoUtc(payload.season.endsAt, "season.endsAt");

  const staleAfter = addHours(fetchedAt, 12);
  const freshness = {
    providerId: "mock" as const,
    fetchedAt,
    staleAfter,
  };
  const competitionProvider = providerMetadata(payload.competition.externalId, fetchedAt);
  const seasonProvider = providerMetadata(payload.season.externalId, fetchedAt);
  const teamByExternalId = new Map<string, NormalizedTeam>();
  const teams = payload.teams.map((team) => {
    if (!team.externalId || !team.name || !team.shortName) {
      throw new ProviderDataError("Mock team is missing required provider fields.");
    }

    const normalizedTeam: NormalizedTeam = {
      id: deterministicProviderEntityId({
        providerId: "mock",
        externalId: team.externalId,
        fallbackParts: [team.name],
      }),
      competitionId: request.competitionId,
      seasonId: request.seasonId,
      name: team.name,
      shortName: team.shortName,
      countryCode: team.countryCode || null,
      groupCode: team.groupCode,
      provider: providerMetadata(team.externalId, fetchedAt),
      freshness,
      updatedAt: fetchedAt,
    };

    teamByExternalId.set(team.externalId, normalizedTeam);
    return normalizedTeam;
  });
  const matches = payload.matches.map((match) =>
    mapMockMatch(match, request, teamByExternalId, fetchedAt, freshness),
  );

  return {
    competition: {
      id: request.competitionId,
      name: payload.competition.name,
      countryCode: payload.competition.countryCode ?? null,
      provider: competitionProvider,
      freshness,
      updatedAt: fetchedAt,
    },
    season: {
      id: request.seasonId,
      competitionId: request.competitionId,
      label: payload.season.label,
      startsAt: payload.season.startsAt,
      endsAt: payload.season.endsAt,
      provider: seasonProvider,
      freshness,
      updatedAt: fetchedAt,
    },
    teams,
    matches,
    fetchedAt,
    freshness,
  };
}

function mapMockMatch(
  match: MockMatch,
  request: SportsDataIngestionRequest,
  teamByExternalId: Map<string, NormalizedTeam>,
  fetchedAt: string,
  freshness: NormalizedSportsDataBatch["freshness"],
): NormalizedMatch {
  const homeTeam = teamByExternalId.get(match.homeExternalId);
  const awayTeam = teamByExternalId.get(match.awayExternalId);

  if (!homeTeam || !awayTeam) {
    throw new ProviderDataError("Mock match references an unknown team.");
  }

  assertIsoUtc(match.kickoffAt, "match.kickoffAt");

  const status = normalizeMockMatchStatus(match.status);
  const score = match.score ?? {};

  return {
    id: deterministicProviderEntityId({
      providerId: "mock",
      externalId: match.externalId,
      fallbackParts: [request.seasonId, homeTeam.id, awayTeam.id, match.kickoffAt],
    }),
    competitionId: request.competitionId,
    seasonId: request.seasonId,
    homeTeamId: homeTeam.id,
    awayTeamId: awayTeam.id,
    kickoffAt: match.kickoffAt,
    lockAt: match.kickoffAt,
    status,
    stage: match.stage,
    groupCode: match.groupCode,
    venue: match.venue,
    score: {
      homeScore90: score.homeScore90 ?? null,
      awayScore90: score.awayScore90 ?? null,
      homeScoreFinal: score.homeScoreFinal ?? null,
      awayScoreFinal: score.awayScoreFinal ?? null,
    },
    provider: providerMetadata(match.externalId, fetchedAt, match.providerUpdatedAt),
    freshness: match.providerUpdatedAt
      ? {
          ...freshness,
          providerUpdatedAt: match.providerUpdatedAt,
        }
      : freshness,
    updatedAt: fetchedAt,
  };
}

export function normalizeMockMatchStatus(status: string): MatchStatus {
  const normalized = status.trim().toUpperCase().replace(/[\s-]+/g, "_");

  switch (normalized) {
    case "TIMED":
    case "SCHEDULED":
    case "NOT_STARTED":
      return "SCHEDULED";
    case "LINEUPS_PENDING":
      return "LINEUPS_PENDING";
    case "IN_PLAY":
    case "LIVE":
      return "LIVE";
    case "HALFTIME":
    case "HALF_TIME":
      return "HALFTIME";
    case "FINISHED":
    case "FT":
      return "FINISHED";
    case "POSTPONED":
      return "POSTPONED";
    case "CANCELLED":
    case "CANCELED":
      return "CANCELLED";
    case "ABANDONED":
      return "ABANDONED";
    default:
      throw new ProviderDataError(`Unsupported mock match status: ${status}`);
  }
}

function isLiveUpdateStatus(status: MatchStatus) {
  return status === "LIVE" || status === "HALFTIME" || status === "FINISHED";
}

function providerMetadata(
  externalId: string,
  fetchedAt: string,
  providerUpdatedAt?: string,
): ProviderMetadata {
  if (!externalId) {
    throw new ProviderDataError("Provider external ID is required.");
  }

  if (providerUpdatedAt) {
    assertIsoUtc(providerUpdatedAt, "providerUpdatedAt");
  }

  return {
    providerId: "mock",
    externalId,
    sourceName: "MatchPulse local mock provider",
    fetchedAt,
    ...(providerUpdatedAt ? { providerUpdatedAt } : {}),
  };
}

function assertIsoUtc(value: string, field: string) {
  if (!Number.isFinite(Date.parse(value)) || !value.endsWith("Z")) {
    throw new ProviderDataError(`${field} must be an ISO UTC timestamp.`);
  }
}

function addHours(value: string, hours: number) {
  return new Date(Date.parse(value) + hours * 60 * 60 * 1000).toISOString();
}

function createDefaultMockWorldCupPayload(): MockProviderPayload {
  return {
    competition: {
      externalId: "mock-wc",
      name: "FIFA World Cup",
    },
    season: {
      externalId: "mock-wc-2026",
      label: "FIFA World Cup 2026",
      startsAt: "2026-06-11T00:00:00.000Z",
      endsAt: "2026-07-19T23:59:59.000Z",
    },
    teams: [
      {
        externalId: "usa",
        name: "United States",
        shortName: "USA",
        countryCode: "US",
        groupCode: "A",
      },
      {
        externalId: "can",
        name: "Canada",
        shortName: "CAN",
        countryCode: "CA",
        groupCode: "A",
      },
    ],
    matches: [
      {
        externalId: "match-001",
        homeExternalId: "usa",
        awayExternalId: "can",
        kickoffAt: "2026-06-12T20:00:00.000Z",
        status: "scheduled",
        stage: "GROUP_STAGE",
        groupCode: "A",
        venue: {
          name: "Local Test Stadium",
          city: "Seattle",
          countryCode: "US",
        },
      },
    ],
  };
}
