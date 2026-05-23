import type { MatchStatus } from "@/lib/sports-data/domain";

export type DashboardPredictionState = "MISSING" | "SAVED" | "LOCKED_MISSING" | "LOCKED_SAVED";

export type DashboardMatchSummary = {
  id: string;
  groupId: string;
  groupName: string;
  groupSeasonId: string;
  groupSeasonLabel: string;
  homeTeam: string;
  awayTeam: string;
  kickoffAt: string;
  lockAt: string;
  status: MatchStatus;
  predictionState: DashboardPredictionState;
  href: string;
};

export type DashboardLeaderboardSummary = {
  groupId: string;
  groupName: string;
  groupSeasonId: string;
  snapshotAt: string;
  userRank: number | null;
  userPoints: number | null;
  leaderName: string | null;
  leaderPoints: number | null;
  topEntries: Array<{
    userId: string;
    displayName: string | null;
    rank: number;
    points: number;
  }>;
  href: string;
};

export type DashboardGroupSummary = {
  id: string;
  name: string;
  memberCount: number;
  activeGroupSeason: {
    id: string;
    label: string;
    status: string;
  } | null;
  missingPredictionCount: number;
  nextLockAt: string | null;
  href: string;
};

export type DashboardNextAction = {
  kind: "CREATE_GROUP" | "MAKE_PICKS" | "VIEW_NEXT_MATCHES" | "VIEW_LEADERBOARD";
  title: string;
  body: string;
  ctaLabel: string;
  href: string;
};

export type DashboardViewModel = {
  userId: string;
  nextAction: DashboardNextAction;
  groups: DashboardGroupSummary[];
  predictionProgress: {
    totalOpen: number;
    missingOpen: number;
    savedOpen: number;
    soonLockingMissing: number;
    nextLockAt: string | null;
  };
  continuePredicting: DashboardMatchSummary[];
  nextLocks: DashboardMatchSummary[];
  leaderboardSummaries: DashboardLeaderboardSummary[];
};

export type DashboardGroupInput = {
  id: string;
  name: string;
  memberCount: number;
  activeGroupSeason: {
    id: string;
    label: string;
    status: string;
  } | null;
  matches: DashboardMatchSummary[];
  leaderboardSummary: DashboardLeaderboardSummary | null;
};
