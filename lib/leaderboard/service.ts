import { FieldValue, Timestamp } from "firebase-admin/firestore";
import { ApiError } from "@/lib/api/errors";
import { getFirebaseAdminFirestore } from "@/lib/firebase/admin";
import { buildLeaderboardSnapshot, type LeaderboardMatchInput } from "@/lib/leaderboard/domain";
import type {
  LeaderboardGeneratedBy,
  LeaderboardSnapshot,
  LeaderboardSnapshotDocument,
} from "@/lib/leaderboard/types";
import type { GroupMemberDocument, GroupRole, GroupSeasonDocument } from "@/lib/groups/types";
import type { PredictionDocument } from "@/lib/predictions/types";

const latestSnapshotId = "latest";

export async function getLatestGroupSeasonLeaderboard({
  groupId,
  groupSeasonId,
  userId,
}: {
  groupId: string;
  groupSeasonId: string;
  userId: string;
}) {
  const { groupSeasonRef } = await requireActiveGroupSeason({
    groupId,
    groupSeasonId,
    userId,
  });
  const snapshotSnap = await groupSeasonRef
    .collection("leaderboardSnapshots")
    .doc(latestSnapshotId)
    .get();

  return {
    groupId,
    groupSeasonId,
    snapshot: snapshotSnap.exists
      ? serializeSnapshot(snapshotSnap.data() as LeaderboardSnapshotDocument)
      : null,
  };
}

export async function recalculateGroupSeasonLeaderboard({
  groupId,
  groupSeasonId,
  userId,
  generatedBy = "SERVER_ROUTE",
}: {
  groupId: string;
  groupSeasonId: string;
  userId: string;
  generatedBy?: LeaderboardGeneratedBy;
}) {
  const firestore = getFirebaseAdminFirestore();
  const { groupRef, groupSeasonRef, groupSeason } = await requireGroupSeasonRole({
    groupId,
    groupSeasonId,
    userId,
    roles: ["OWNER", "ADMIN"],
  });
  const seasonRef = firestore
    .collection("competitions")
    .doc(groupSeason.competitionId)
    .collection("seasons")
    .doc(groupSeason.seasonId);
  const [membersSnap, predictionsSnap, matchesSnap, previousSnapshotSnap] = await Promise.all([
    groupRef.collection("members").get(),
    groupSeasonRef.collection("predictions").get(),
    seasonRef.collection("matches").get(),
    groupSeasonRef.collection("leaderboardSnapshots").doc(latestSnapshotId).get(),
  ]);
  const previousSnapshot = previousSnapshotSnap.exists
    ? (previousSnapshotSnap.data() as LeaderboardSnapshotDocument)
    : null;
  const built = buildLeaderboardSnapshot({
    groupId,
    groupSeasonId,
    canonicalSeasonId: groupSeason.seasonId,
    scoringPreset: groupSeason.scoringPreset,
    members: membersSnap.docs.map((doc) => doc.data() as GroupMemberDocument),
    predictions: predictionsSnap.docs.map((doc) =>
      serializePredictionInput(doc.data() as PredictionDocument),
    ),
    matches: matchesSnap.docs.map((doc) => ({
      id: doc.id,
      ...(doc.data() as Omit<LeaderboardMatchInput, "id">),
    })),
    previousEntries: previousSnapshot?.entries ?? [],
  });

  if (previousSnapshot?.inputHash === built.inputHash) {
    return {
      changed: false,
      snapshot: serializeSnapshot(previousSnapshot),
    };
  }

  const now = Timestamp.now();
  const snapshotDocument: LeaderboardSnapshotDocument = {
    groupId,
    groupSeasonId,
    snapshotAt: now,
    scoringPreset: built.scoringPreset,
    scoredMatchIds: built.scoredMatchIds,
    generatedBy,
    entries: built.entries,
    inputHash: built.inputHash,
    createdAt: now,
  };

  await groupSeasonRef
    .collection("leaderboardSnapshots")
    .doc(latestSnapshotId)
    .set(snapshotDocument);
  await groupSeasonRef.update({
    updatedAt: FieldValue.serverTimestamp(),
  });

  return {
    changed: true,
    snapshot: serializeSnapshot(snapshotDocument),
  };
}

async function requireActiveGroupSeason({
  groupId,
  groupSeasonId,
  userId,
}: {
  groupId: string;
  groupSeasonId: string;
  userId: string;
}) {
  const firestore = getFirebaseAdminFirestore();
  const groupRef = firestore.collection("groups").doc(groupId);
  const groupSeasonRef = groupRef.collection("seasons").doc(groupSeasonId);
  const [memberSnap, groupSeasonSnap] = await Promise.all([
    groupRef.collection("members").doc(userId).get(),
    groupSeasonRef.get(),
  ]);

  if (!memberSnap.exists || (memberSnap.data() as GroupMemberDocument).status !== "ACTIVE") {
    throw new ApiError("GROUP_NOT_FOUND", "Group not found.");
  }

  if (!groupSeasonSnap.exists) {
    throw new ApiError("GROUP_SEASON_NOT_FOUND", "Group season not found.");
  }

  return {
    groupRef,
    groupSeasonRef,
    member: memberSnap.data() as GroupMemberDocument,
    groupSeason: groupSeasonSnap.data() as GroupSeasonDocument,
  };
}

async function requireGroupSeasonRole({
  groupId,
  groupSeasonId,
  userId,
  roles,
}: {
  groupId: string;
  groupSeasonId: string;
  userId: string;
  roles: GroupRole[];
}) {
  const context = await requireActiveGroupSeason({ groupId, groupSeasonId, userId });

  if (!roles.includes(context.member.role)) {
    throw new ApiError("FORBIDDEN", "You do not have access to this group action.");
  }

  return context;
}

function serializePredictionInput(prediction: PredictionDocument) {
  return {
    groupSeasonId: prediction.groupSeasonId,
    matchId: prediction.matchId,
    userId: prediction.userId,
    homeGoals: prediction.homeGoals,
    awayGoals: prediction.awayGoals,
    savedAtMs: prediction.savedAt.toMillis(),
    lockAtMs: Date.parse(prediction.lockAt),
    updatedAtMs: prediction.updatedAt.toMillis(),
  };
}

function serializeSnapshot(snapshot: LeaderboardSnapshotDocument): LeaderboardSnapshot {
  return {
    ...snapshot,
    snapshotAt: snapshot.snapshotAt.toDate().toISOString(),
    createdAt: snapshot.createdAt.toDate().toISOString(),
  };
}
