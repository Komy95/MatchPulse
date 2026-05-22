import { FieldValue, Timestamp } from "firebase-admin/firestore";
import { ApiError } from "@/lib/api/errors";
import { getFirebaseAdminFirestore } from "@/lib/firebase/admin";
import { evaluatePredictionUpsertPolicy } from "@/lib/predictions/policy";
import type { BulkPredictionInput } from "@/lib/predictions/validation";
import type {
  MatchPredictionSummary,
  PredictionDocument,
  PredictionRevisionDocument,
  TeamSummary,
} from "@/lib/predictions/types";
import type { GroupMemberDocument, GroupSeasonDocument } from "@/lib/groups/types";
import type { MatchStatus, NormalizedVenue } from "@/lib/sports-data/domain";
import type { AuthenticatedUserContext } from "@/lib/auth/user-context";

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

export async function listGroupSeasonMatchesWithPredictions({
  groupId,
  groupSeasonId,
  userId,
}: {
  groupId: string;
  groupSeasonId: string;
  userId: string;
}) {
  const firestore = getFirebaseAdminFirestore();
  const { groupSeason } = await requireActiveGroupSeason({
    groupId,
    groupSeasonId,
    userId,
  });
  const seasonRef = firestore
    .collection("competitions")
    .doc(groupSeason.competitionId)
    .collection("seasons")
    .doc(groupSeason.seasonId);
  const [matchesSnap, teamsSnap] = await Promise.all([
    seasonRef.collection("matches").orderBy("kickoffAt", "asc").get(),
    seasonRef.collection("teams").get(),
  ]);
  const teams = new Map(
    teamsSnap.docs.map((doc) => [doc.id, serializeTeam(doc.id, doc.data() as ReferenceTeamDocument)]),
  );
  const predictionRefs = matchesSnap.docs.map((doc) =>
    predictionRef(groupId, groupSeasonId, `${doc.id}_${userId}`),
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

  return {
    groupId,
    groupSeasonId,
    competitionId: groupSeason.competitionId,
    seasonId: groupSeason.seasonId,
    predictionMode: groupSeason.predictionMode,
    allowBooster: groupSeason.allowBooster,
    matches: matchesSnap.docs.map((doc) =>
      serializeMatch({
        id: doc.id,
        match: doc.data() as ReferenceMatchDocument,
        teams,
        prediction: predictionsByMatchId.get(doc.id) ?? null,
      }),
    ),
  };
}

export async function upsertPredictions({
  groupId,
  groupSeasonId,
  user,
  input,
}: {
  groupId: string;
  groupSeasonId: string;
  user: AuthenticatedUserContext;
  input: BulkPredictionInput;
}) {
  const firestore = getFirebaseAdminFirestore();

  return firestore.runTransaction(async (transaction) => {
    const groupRef = firestore.collection("groups").doc(groupId);
    const memberRef = groupRef.collection("members").doc(user.uid);
    const groupSeasonRef = groupRef.collection("seasons").doc(groupSeasonId);
    const [memberSnap, groupSeasonSnap] = await Promise.all([
      transaction.get(memberRef),
      transaction.get(groupSeasonRef),
    ]);

    if (!memberSnap.exists || (memberSnap.data() as GroupMemberDocument).status !== "ACTIVE") {
      throw new ApiError("GROUP_NOT_FOUND", "Group not found.");
    }

    if (!groupSeasonSnap.exists) {
      throw new ApiError("GROUP_SEASON_NOT_FOUND", "Group season not found.");
    }

    const groupSeason = groupSeasonSnap.data() as GroupSeasonDocument;
    const seasonRef = firestore
      .collection("competitions")
      .doc(groupSeason.competitionId)
      .collection("seasons")
      .doc(groupSeason.seasonId);
    const now = Timestamp.now();
    let saved = 0;
    let unchanged = 0;
    let revisionsCreated = 0;

    for (const requested of input.predictions) {
      const matchRef = seasonRef.collection("matches").doc(requested.matchId);
      const predictionDocumentId = `${requested.matchId}_${user.uid}`;
      const userPredictionRef = predictionRef(groupId, groupSeasonId, predictionDocumentId);
      const [matchSnap, existingPredictionSnap] = await Promise.all([
        transaction.get(matchRef),
        transaction.get(userPredictionRef),
      ]);

      if (!matchSnap.exists) {
        throw new ApiError("MATCH_NOT_FOUND", "Match not found.");
      }

      const match = matchSnap.data() as ReferenceMatchDocument;

      if (match.competitionId !== groupSeason.competitionId || match.seasonId !== groupSeason.seasonId) {
        throw new ApiError(
          "MATCH_OUTSIDE_GROUP_SEASON",
          "Match does not belong to this group season.",
        );
      }

      const lockAtMs = Date.parse(match.lockAt);

      if (!Number.isFinite(lockAtMs)) {
        throw new ApiError("PREDICTION_INVALID", "Match lock time is invalid.");
      }

      const existingPrediction = existingPredictionSnap.exists
        ? (existingPredictionSnap.data() as PredictionDocument)
        : null;
      const nextValue = {
        homeGoals: requested.homeGoals,
        awayGoals: requested.awayGoals,
        booster: requested.booster,
      };
      const previousValue = existingPrediction
        ? {
            homeGoals: existingPrediction.homeGoals,
            awayGoals: existingPrediction.awayGoals,
            booster: existingPrediction.booster,
          }
        : null;
      const policy = evaluatePredictionUpsertPolicy({
        nowMs: now.toMillis(),
        lockAtMs,
        groupPredictionMode: groupSeason.predictionMode,
        requestedPredictionMode: groupSeason.predictionMode,
        allowBooster: groupSeason.allowBooster,
        requested: nextValue,
        existing: previousValue,
      });

      if ("errorCode" in policy) {
        throw new ApiError(policy.errorCode, "Prediction could not be saved.");
      }

      if (policy.action === "NOOP") {
        unchanged += 1;
        continue;
      }

      transaction.set(
        userPredictionRef,
        {
          groupId,
          groupSeasonId,
          matchId: requested.matchId,
          userId: user.uid,
          homeGoals: requested.homeGoals,
          awayGoals: requested.awayGoals,
          predictionMode: groupSeason.predictionMode,
          booster: requested.booster,
          savedAt: existingPrediction?.savedAt ?? now,
          updatedAt: now,
          lockAt: match.lockAt,
          status: "SAVED",
        } satisfies PredictionDocument,
        { merge: true },
      );
      saved += 1;

      if (policy.createRevision && previousValue) {
        const revisionRef = groupSeasonRef.collection("predictionRevisions").doc();
        transaction.set(revisionRef, {
          predictionId: predictionDocumentId,
          matchId: requested.matchId,
          userId: user.uid,
          previousValue,
          nextValue,
          changedAt: now,
          changedBy: user.uid,
          reason: "USER_EDIT",
        } satisfies PredictionRevisionDocument);
        revisionsCreated += 1;
      }
    }

    transaction.update(groupSeasonRef, {
      updatedAt: FieldValue.serverTimestamp(),
    });

    return {
      saved,
      unchanged,
      revisionsCreated,
    };
  });
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
  const [memberSnap, groupSeasonSnap] = await Promise.all([
    groupRef.collection("members").doc(userId).get(),
    groupRef.collection("seasons").doc(groupSeasonId).get(),
  ]);

  if (!memberSnap.exists || (memberSnap.data() as GroupMemberDocument).status !== "ACTIVE") {
    throw new ApiError("GROUP_NOT_FOUND", "Group not found.");
  }

  if (!groupSeasonSnap.exists) {
    throw new ApiError("GROUP_SEASON_NOT_FOUND", "Group season not found.");
  }

  return {
    groupSeason: groupSeasonSnap.data() as GroupSeasonDocument,
  };
}

function predictionRef(groupId: string, groupSeasonId: string, predictionId: string) {
  return getFirebaseAdminFirestore()
    .collection("groups")
    .doc(groupId)
    .collection("seasons")
    .doc(groupSeasonId)
    .collection("predictions")
    .doc(predictionId);
}

function serializeMatch({
  id,
  match,
  teams,
  prediction,
}: {
  id: string;
  match: ReferenceMatchDocument;
  teams: Map<string, TeamSummary>;
  prediction: PredictionDocument | null;
}): MatchPredictionSummary {
  return {
    id,
    kickoffAt: match.kickoffAt,
    lockAt: match.lockAt,
    locked: Date.now() >= Date.parse(match.lockAt),
    status: match.status,
    stage: match.stage,
    groupCode: match.groupCode ?? null,
    venue: match.venue ?? null,
    homeTeam: teams.get(match.homeTeamId) ?? missingTeam(match.homeTeamId),
    awayTeam: teams.get(match.awayTeamId) ?? missingTeam(match.awayTeamId),
    prediction: prediction
      ? {
          homeGoals: prediction.homeGoals,
          awayGoals: prediction.awayGoals,
          booster: prediction.booster,
          updatedAt: prediction.updatedAt.toDate().toISOString(),
        }
      : null,
  };
}

function serializeTeam(id: string, team: ReferenceTeamDocument): TeamSummary {
  return {
    id,
    name: team.name,
    shortName: team.shortName,
    countryCode: team.countryCode,
  };
}

function missingTeam(id: string): TeamSummary {
  return {
    id,
    name: "Unknown team",
    shortName: "TBD",
    countryCode: null,
  };
}
