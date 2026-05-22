export const worldCupCompetition = {
  id: "fifa-world-cup",
  name: "FIFA World Cup",
};

export const worldCup2026Season = {
  id: "world-cup-2026",
  competitionId: worldCupCompetition.id,
  label: "FIFA World Cup 2026",
  startsAtIso: "2026-06-11T00:00:00.000Z",
  endsAtIso: "2026-07-19T23:59:59.000Z",
};

export const defaultGroupSeason = {
  competitionId: worldCupCompetition.id,
  seasonId: worldCup2026Season.id,
  label: worldCup2026Season.label,
  status: "UPCOMING" as const,
  scoringPreset: "HYBRID_321" as const,
  predictionMode: "EXACT_SCORE" as const,
  allowBooster: true,
  predictionVisibility: "AFTER_LOCK" as const,
};

export const inviteTtlMs = 1000 * 60 * 60 * 24 * 30;
