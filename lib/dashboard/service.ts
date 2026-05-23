import { getFirebaseAdminFirestore } from "@/lib/firebase/admin";
import { buildDashboardViewModel } from "@/lib/dashboard/domain";
import type {
  DashboardGroupInput,
  DashboardLeaderboardSummary,
  DashboardMatchSummary,
  DashboardPredictionState,
  DashboardViewModel,
} from "@/lib/dashboard/types";
import type { GroupDocument, GroupMemberDocument, GroupSeasonDocument } from "@/lib/groups/types";
import type { LeaderboardSnapshotDocument } from "@/lib/leaderboard/types";
import type { PredictionDocument } from "@/lib/predictions/types";
import type { MatchStatus, NormalizedVenue } from "@/lib/sports-data/domain";

type ReferenceMatchDocument = {
  competitionId: string;
  seasonId: string;
  homeTeamId: string;
  awayTeamId: string;
  kickoffAt: string;
  lockAt: string;
  status: MatchStatus;
  stage: string;
  groupCode?: string | null;
  venue?: NormalizedVenue | null;
};

type ReferenceTeamDocument = {
  name: string;
  shortName: string;
  countryCode: string | null;
};

export async function getUserDashboard(userId: string): Promise<DashboardViewModel> {
  const firestore = getFirebaseAdminFirestore();
  const memberships = await firestore
    .collectionGroup("members")
    .where("userId", "==", userId)
    .get();
  const groups = await Promise.all(
    memberships.docs.map(async (membershipDoc): Promise<DashboardGroupInput | null> => {
      const membership = membershipDoc.data() as GroupMemberDocument;
      const groupRef = membershipDoc.ref.parent.parent;

      if (!groupRef || membership.status !== "ACTIVE") {
        return null;
      }

      const groupSnap = await groupRef.get();

      if (!groupSnap.exists) {
        return null;
      }

      const group = groupSnap.data() as GroupDocument;
      const groupSeasonSnap = await groupRef.collection("seasons").doc(group.activeGroupSeasonId).get();

      if (!groupSeasonSnap.exists) {
        return {
          id: groupSnap.id,
          name: group.name,
          memberCount: group.memberCount,
          activeGroupSeason: null,
          matches: [],
          leaderboardSummary: null,
        };
      }

      const groupSeason = groupSeasonSnap.data() as GroupSeasonDocument;
      const [matches, leaderboardSummary] = await Promise.all([
        listDashboardMatches({
          groupId: groupSnap.id,
          groupName: group.name,
          groupSeasonId: groupSeasonSnap.id,
          groupSeason,
          userId,
        }),
        getLeaderboardSummary({
          groupId: groupSnap.id,
          groupName: group.name,
          groupSeasonId: groupSeasonSnap.id,
          userId,
        }),
      ]);

      return {
        id: groupSnap.id,
        name: group.name,
        memberCount: group.memberCount,
        activeGroupSeason: {
          id: groupSeasonSnap.id,
          label: groupSeason.label,
          status: groupSeason.status,
        },
        matches,
        leaderboardSummary,
      };
    }),
  );

  return buildDashboardViewModel({
    userId,
    groups: groups.filter((group): group is DashboardGroupInput => group !== null),
    nowMs: Date.now(),
  });
}

async function listDashboardMatches({
  groupId,
  groupName,
  groupSeasonId,
  groupSeason,
  userId,
}: {
  groupId: string;
  groupName: string;
  groupSeasonId: string;
  groupSeason: GroupSeasonDocument;
  userId: string;
}): Promise<DashboardMatchSummary[]> {
  const firestore = getFirebaseAdminFirestore();
  const seasonRef = firestore
    .collection("competitions")
    .doc(groupSeason.competitionId)
    .collection("seasons")
    .doc(groupSeason.seasonId);
  const [matchesSnap, teamsSnap] = await Promise.all([
    seasonRef.collection("matches").orderBy("kickoffAt", "asc").limit(12).get(),
    seasonRef.collection("teams").get(),
  ]);
  const teams = new Map(
    teamsSnap.docs.map((doc) => [doc.id, doc.data() as ReferenceTeamDocument]),
  );
  const predictionRefs = matchesSnap.docs.map((doc) =>
    firestore
      .collection("groups")
      .doc(groupId)
      .collection("seasons")
      .doc(groupSeasonId)
      .collection("predictions")
      .doc(`${doc.id}_${userId}`),
  );
  const predictionSnaps =
    predictionRefs.length > 0 ? await firestore.getAll(...predictionRefs) : [];
  const predictionsByMatchId = new Map<string, PredictionDocument>();

  for (const predictionSnap of predictionSnaps) {
    if (!predictionSnap.exists) {
      continue;
    }

    const prediction = predictionSnap.data() as PredictionDocument;
    predictionsByMatchId.set(prediction.matchId, prediction);
  }

  return matchesSnap.docs.map((doc) => {
    const match = doc.data() as ReferenceMatchDocument;
    const prediction = predictionsByMatchId.get(doc.id) ?? null;
    const homeTeam = teams.get(match.homeTeamId);
    const awayTeam = teams.get(match.awayTeamId);

    return {
      id: doc.id,
      groupId,
      groupName,
      groupSeasonId,
      groupSeasonLabel: groupSeason.label,
      homeTeam: homeTeam?.shortName ?? "TBD",
      awayTeam: awayTeam?.shortName ?? "TBD",
      kickoffAt: match.kickoffAt,
      lockAt: match.lockAt,
      status: match.status,
      predictionState: getPredictionState(match.lockAt, prediction),
      href: `/groups/${groupId}`,
    };
  });
}

async function getLeaderboardSummary({
  groupId,
  groupName,
  groupSeasonId,
  userId,
}: {
  groupId: string;
  groupName: string;
  groupSeasonId: string;
  userId: string;
}): Promise<DashboardLeaderboardSummary | null> {
  const snapshotSnap = await getFirebaseAdminFirestore()
    .collection("groups")
    .doc(groupId)
    .collection("seasons")
    .doc(groupSeasonId)
    .collection("leaderboardSnapshots")
    .doc("latest")
    .get();

  if (!snapshotSnap.exists) {
    return null;
  }

  const snapshot = snapshotSnap.data() as LeaderboardSnapshotDocument;
  const userEntry = snapshot.entries.find((entry) => entry.userId === userId) ?? null;
  const leader = snapshot.entries[0] ?? null;

  return {
    groupId,
    groupName,
    groupSeasonId,
    snapshotAt: snapshot.snapshotAt.toDate().toISOString(),
    userRank: userEntry?.rank ?? null,
    userPoints: userEntry?.points ?? null,
    leaderName: leader?.displayName ?? null,
    leaderPoints: leader?.points ?? null,
    topEntries: snapshot.entries.slice(0, 3).map((entry) => ({
      userId: entry.userId,
      displayName: entry.displayName,
      rank: entry.rank,
      points: entry.points,
    })),
    href: `/groups/${groupId}`,
  };
}

function getPredictionState(
  lockAt: string,
  prediction: PredictionDocument | null,
): DashboardPredictionState {
  const locked = Date.now() >= Date.parse(lockAt);

  if (locked && prediction) {
    return "LOCKED_SAVED";
  }

  if (locked) {
    return "LOCKED_MISSING";
  }

  return prediction ? "SAVED" : "MISSING";
}
