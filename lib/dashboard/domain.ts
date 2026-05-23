import type {
  DashboardGroupInput,
  DashboardGroupSummary,
  DashboardMatchSummary,
  DashboardNextAction,
  DashboardViewModel,
} from "@/lib/dashboard/types";

const soonLockWindowMs = 24 * 60 * 60 * 1000;

export function buildDashboardViewModel({
  userId,
  groups,
  nowMs,
}: {
  userId: string;
  groups: DashboardGroupInput[];
  nowMs: number;
}): DashboardViewModel {
  const allMatches = groups.flatMap((group) => group.matches);
  const openMatches = allMatches.filter((match) => Date.parse(match.lockAt) > nowMs);
  const missingOpenMatches = openMatches
    .filter((match) => match.predictionState === "MISSING")
    .sort(compareByLock);
  const savedOpenMatches = openMatches.filter((match) => match.predictionState === "SAVED");
  const soonLockingMissing = missingOpenMatches.filter(
    (match) => Date.parse(match.lockAt) - nowMs <= soonLockWindowMs,
  );
  const nextLocks = allMatches
    .filter((match) => match.status !== "FINISHED")
    .sort(compareByLock)
    .slice(0, 5);
  const leaderboardSummaries = groups
    .map((group) => group.leaderboardSummary)
    .filter((summary) => summary !== null);
  const groupSummaries = groups.map((group): DashboardGroupSummary => {
    const missingMatches = group.matches.filter((match) => match.predictionState === "MISSING");
    const nextLockAt = group.matches
      .filter((match) => Date.parse(match.lockAt) > nowMs)
      .sort(compareByLock)[0]?.lockAt ?? null;

    return {
      id: group.id,
      name: group.name,
      memberCount: group.memberCount,
      activeGroupSeason: group.activeGroupSeason,
      missingPredictionCount: missingMatches.length,
      nextLockAt,
      href: `/groups/${group.id}`,
    };
  });

  return {
    userId,
    nextAction: chooseNextAction({
      hasGroups: groups.length > 0,
      missingOpenMatches,
      soonLockingMissingCount: soonLockingMissing.length,
      nextLocks,
      leaderboardSummaries,
    }),
    groups: groupSummaries,
    predictionProgress: {
      totalOpen: openMatches.length,
      missingOpen: missingOpenMatches.length,
      savedOpen: savedOpenMatches.length,
      soonLockingMissing: soonLockingMissing.length,
      nextLockAt: openMatches.sort(compareByLock)[0]?.lockAt ?? null,
    },
    continuePredicting: missingOpenMatches.slice(0, 4),
    nextLocks,
    leaderboardSummaries,
  };
}

function chooseNextAction({
  hasGroups,
  missingOpenMatches,
  soonLockingMissingCount,
  nextLocks,
  leaderboardSummaries,
}: {
  hasGroups: boolean;
  missingOpenMatches: DashboardMatchSummary[];
  soonLockingMissingCount: number;
  nextLocks: DashboardMatchSummary[];
  leaderboardSummaries: Array<{ href: string }>;
}): DashboardNextAction {
  if (!hasGroups) {
    return {
      kind: "CREATE_GROUP",
      title: "Create or join a World Cup group",
      body: "Start the private prediction loop with an invite link.",
      ctaLabel: "Create group",
      href: "/groups/new",
    };
  }

  if (missingOpenMatches.length > 0) {
    const target = missingOpenMatches[0];

    return {
      kind: "MAKE_PICKS",
      title:
        soonLockingMissingCount > 0
          ? `${soonLockingMissingCount} pick${soonLockingMissingCount === 1 ? "" : "s"} ${
              soonLockingMissingCount === 1 ? "locks" : "lock"
            } soon`
          : "Finish your open predictions",
      body: `${target.homeTeam} vs ${target.awayTeam} is the next missing pick.`,
      ctaLabel: "Make picks",
      href: target.href,
    };
  }

  if (nextLocks.length > 0) {
    return {
      kind: "VIEW_NEXT_MATCHES",
      title: "Your open picks are covered",
      body: "Keep an eye on the next lock window.",
      ctaLabel: "View next matches",
      href: nextLocks[0].href,
    };
  }

  if (leaderboardSummaries.length > 0) {
    return {
      kind: "VIEW_LEADERBOARD",
      title: "Review your group standings",
      body: "Scored matches are reflected in the private leaderboard.",
      ctaLabel: "View leaderboard",
      href: leaderboardSummaries[0].href,
    };
  }

  return {
    kind: "VIEW_NEXT_MATCHES",
    title: "World Cup groups are ready",
    body: "Matches will appear here as reference data is added.",
    ctaLabel: "Open group",
    href: "/dashboard",
  };
}

function compareByLock(left: DashboardMatchSummary, right: DashboardMatchSummary) {
  return Date.parse(left.lockAt) - Date.parse(right.lockAt) || left.id.localeCompare(right.id);
}
