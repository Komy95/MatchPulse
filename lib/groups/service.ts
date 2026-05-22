import crypto from "node:crypto";
import {
  FieldValue,
  Timestamp,
  type DocumentReference,
} from "firebase-admin/firestore";
import { env } from "@/lib/env";
import { getFirebaseAdminFirestore } from "@/lib/firebase/admin";
import { ApiError } from "@/lib/api/errors";
import {
  defaultGroupSeason,
  inviteTtlMs,
  worldCup2026Season,
  worldCupCompetition,
} from "@/lib/groups/constants";
import type {
  GroupDashboardCard,
  GroupDocument,
  GroupInviteDocument,
  GroupInviteSummary,
  InviteCodeRegistryDocument,
  GroupMemberDocument,
  GroupMemberSummary,
  GroupRole,
  GroupSeasonDocument,
  GroupSeasonSummary,
} from "@/lib/groups/types";
import type { AuthenticatedUserContext } from "@/lib/auth/user-context";

type CreateGroupInput = {
  name: string;
};

const inviteCodeAlphabet = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
const inviteCodeMaxAttempts = 8;

export async function createGroup(input: CreateGroupInput, user: AuthenticatedUserContext) {
  for (let attempt = 0; attempt < inviteCodeMaxAttempts; attempt += 1) {
    try {
      return await createGroupAttempt(input, user);
    } catch (error) {
      if (!isAlreadyExistsError(error) || attempt === inviteCodeMaxAttempts - 1) {
        throw error;
      }
    }
  }

  throw new ApiError("INVITE_CODE_COLLISION", "Could not allocate an invite code.");
}

async function createGroupAttempt(input: CreateGroupInput, user: AuthenticatedUserContext) {
  const firestore = getFirebaseAdminFirestore();
  const groupRef = firestore.collection("groups").doc();
  const groupSeasonRef = groupRef.collection("seasons").doc();
  const ownerMemberRef = groupRef.collection("members").doc(user.uid);
  const inviteRef = groupSeasonRef.collection("invites").doc();
  const inviteCode = generateInviteCode();
  const inviteRegistryRef = firestore.collection("inviteCodes").doc(inviteCode);
  const now = FieldValue.serverTimestamp();
  const slug = `${slugify(input.name)}-${groupRef.id.slice(0, 6).toLowerCase()}`;
  const inviteExpiresAt = Timestamp.fromDate(new Date(Date.now() + inviteTtlMs));
  const startsAt = Timestamp.fromDate(new Date(worldCup2026Season.startsAtIso));
  const endsAt = Timestamp.fromDate(new Date(worldCup2026Season.endsAtIso));
  const batch = firestore.batch();

  batch.set(firestore.collection("competitions").doc(worldCupCompetition.id), {
    name: worldCupCompetition.name,
    updatedAt: now,
  });
  batch.set(firestore.collection("seasons").doc(worldCup2026Season.id), {
    competitionId: worldCup2026Season.competitionId,
    label: worldCup2026Season.label,
    startsAt,
    endsAt,
    updatedAt: now,
  });
  batch.set(groupRef, {
    name: input.name,
    slug,
    ownerId: user.uid,
    memberCount: 1,
    activeGroupSeasonId: groupSeasonRef.id,
    createdAt: now,
    updatedAt: now,
    archivedAt: null,
  });
  batch.set(ownerMemberRef, {
    userId: user.uid,
    displayName: user.displayName ?? user.email ?? "Member",
    photoUrl: user.photoUrl ?? null,
    role: "OWNER",
    status: "ACTIVE",
    joinedAt: now,
    updatedAt: now,
  });
  batch.set(groupSeasonRef, {
    ...defaultGroupSeason,
    groupId: groupRef.id,
    createdAt: now,
    updatedAt: now,
    startsAt,
    endsAt,
  });
  batch.set(inviteRef, {
    code: inviteCode,
    groupId: groupRef.id,
    groupSeasonId: groupSeasonRef.id,
    createdBy: user.uid,
    createdAt: now,
    expiresAt: inviteExpiresAt,
    revokedAt: null,
    usageCount: 0,
  });
  batch.create(inviteRegistryRef, {
    code: inviteCode,
    groupId: groupRef.id,
    groupSeasonId: groupSeasonRef.id,
    inviteId: inviteRef.id,
    createdAt: now,
    expiresAt: inviteExpiresAt,
    revokedAt: null,
  });

  await batch.commit();

  return {
    id: groupRef.id,
    slug,
    activeGroupSeasonId: groupSeasonRef.id,
    inviteCode,
    inviteUrl: getInviteUrl(inviteCode),
    ownerRole: "OWNER" as const,
  };
}

export async function listUserGroups(userId: string): Promise<GroupDashboardCard[]> {
  const firestore = getFirebaseAdminFirestore();
  const memberships = await firestore
    .collectionGroup("members")
    .where("userId", "==", userId)
    .get();

  const cards = await Promise.all(
    memberships.docs.map(async (membershipDoc) => {
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
      const activeSeasonSnap = await groupRef
        .collection("seasons")
        .doc(group.activeGroupSeasonId)
        .get();

      return {
        id: groupSnap.id,
        name: group.name,
        slug: group.slug,
        memberCount: group.memberCount,
        activeGroupSeason: activeSeasonSnap.exists
          ? serializeGroupSeason(activeSeasonSnap.id, activeSeasonSnap.data() as GroupSeasonDocument)
          : null,
      };
    }),
  );

  return cards.filter((card): card is GroupDashboardCard => card !== null);
}

export async function getGroupDetail(groupId: string, userId: string) {
  const groupRef = await requireActiveMembership(groupId, userId);
  const [groupSnap, membersSnap] = await Promise.all([
    groupRef.get(),
    groupRef.collection("members").where("status", "==", "ACTIVE").get(),
  ]);

  if (!groupSnap.exists) {
    throw new ApiError("GROUP_NOT_FOUND", "Group not found.");
  }

  const group = groupSnap.data() as GroupDocument;
  const activeSeasonSnap = await groupRef.collection("seasons").doc(group.activeGroupSeasonId).get();

  if (!activeSeasonSnap.exists) {
    throw new ApiError("GROUP_SEASON_NOT_FOUND", "Group season not found.");
  }

  const activeSeason = serializeGroupSeason(
    activeSeasonSnap.id,
    activeSeasonSnap.data() as GroupSeasonDocument,
  );
  const invite = await getLatestValidInvite(groupRef, activeSeasonSnap.id);

  return {
    id: groupSnap.id,
    name: group.name,
    slug: group.slug,
    ownerId: group.ownerId,
    memberCount: group.memberCount,
    activeGroupSeason: activeSeason,
    members: membersSnap.docs.map((doc) =>
      serializeMember(doc.data() as GroupMemberDocument),
    ),
    invite,
  };
}

export async function listGroupSeasons(groupId: string, userId: string) {
  const groupRef = await requireActiveMembership(groupId, userId);
  const seasonsSnap = await groupRef.collection("seasons").orderBy("createdAt", "asc").get();

  return {
    groupId,
    seasons: seasonsSnap.docs.map((doc) =>
      serializeGroupSeason(doc.id, doc.data() as GroupSeasonDocument),
    ),
  };
}

export async function createGroupSeasonInvite(
  groupId: string,
  groupSeasonId: string,
  user: AuthenticatedUserContext,
) {
  const groupRef = await requireGroupRole(groupId, user.uid, ["OWNER", "ADMIN"]);
  const seasonRef = groupRef.collection("seasons").doc(groupSeasonId);
  const seasonSnap = await seasonRef.get();

  if (!seasonSnap.exists) {
    throw new ApiError("GROUP_SEASON_NOT_FOUND", "Group season not found.");
  }

  const inviteRef = seasonRef.collection("invites").doc();
  const { code: inviteCode, expiresAt } = await createReservedInvite({
    groupId,
    groupSeasonId,
    inviteId: inviteRef.id,
    createdBy: user.uid,
  });

  return {
    invite: serializeInvite(inviteRef.id, {
      code: inviteCode,
      groupId,
      groupSeasonId,
      createdBy: user.uid,
      createdAt: Timestamp.now(),
      expiresAt,
      revokedAt: null,
      usageCount: 0,
    }),
  };
}

export async function joinGroupByInvite(code: string, user: AuthenticatedUserContext) {
  const firestore = getFirebaseAdminFirestore();
  const inviteRegistrySnap = await firestore.collection("inviteCodes").doc(code).get();

  if (!inviteRegistrySnap.exists) {
    throw new ApiError("INVITE_INVALID", "Invite code is invalid.");
  }

  const inviteRegistry = inviteRegistrySnap.data() as InviteCodeRegistryDocument;
  const inviteDoc = await firestore
    .collection("groups")
    .doc(inviteRegistry.groupId)
    .collection("seasons")
    .doc(inviteRegistry.groupSeasonId)
    .collection("invites")
    .doc(inviteRegistry.inviteId)
    .get();

  if (!inviteDoc.exists) {
    throw new ApiError("INVITE_INVALID", "Invite code is invalid.");
  }

  const invite = inviteDoc.data() as GroupInviteDocument;
  const now = Timestamp.now();

  if (invite.revokedAt || inviteRegistry.revokedAt) {
    throw new ApiError("INVITE_REVOKED", "Invite code is invalid.");
  }

  if (
    invite.expiresAt.toMillis() <= now.toMillis() ||
    inviteRegistry.expiresAt.toMillis() <= now.toMillis()
  ) {
    throw new ApiError("INVITE_EXPIRED", "Invite code is invalid.");
  }

  const groupRef = firestore.collection("groups").doc(invite.groupId);
  const memberRef = groupRef.collection("members").doc(user.uid);

  await firestore.runTransaction(async (transaction) => {
    const [groupSnap, seasonSnap, memberSnap] = await Promise.all([
      transaction.get(groupRef),
      transaction.get(groupRef.collection("seasons").doc(invite.groupSeasonId)),
      transaction.get(memberRef),
    ]);

    if (!groupSnap.exists || !seasonSnap.exists) {
      throw new ApiError("INVITE_INVALID", "Invite code is invalid.");
    }

    const existingMember = memberSnap.exists
      ? (memberSnap.data() as GroupMemberDocument)
      : null;

    if (existingMember?.status === "ACTIVE") {
      return;
    }

    if (existingMember?.status === "REMOVED") {
      throw new ApiError("INVITE_INVALID", "Invite code is invalid.");
    }

    transaction.set(
      memberRef,
      {
        userId: user.uid,
        displayName: user.displayName ?? user.email ?? "Member",
        photoUrl: user.photoUrl ?? null,
        role: existingMember?.role ?? "MEMBER",
        status: "ACTIVE",
        joinedAt: existingMember?.joinedAt ?? FieldValue.serverTimestamp(),
        updatedAt: FieldValue.serverTimestamp(),
      },
      { merge: true },
    );
    transaction.update(groupRef, {
      memberCount: FieldValue.increment(1),
      updatedAt: FieldValue.serverTimestamp(),
    });
    transaction.update(inviteDoc.ref, {
      usageCount: FieldValue.increment(1),
    });
  });

  const memberSnap = await memberRef.get();
  const member = memberSnap.data() as GroupMemberDocument | undefined;

  return {
    groupId: invite.groupId,
    groupSeasonId: invite.groupSeasonId,
    membershipStatus: "ACTIVE" as const,
    role: member?.role ?? "MEMBER",
  };
}

async function createReservedInvite({
  groupId,
  groupSeasonId,
  inviteId,
  createdBy,
}: {
  groupId: string;
  groupSeasonId: string;
  inviteId: string;
  createdBy: string;
}) {
  const firestore = getFirebaseAdminFirestore();
  const expiresAt = Timestamp.fromDate(new Date(Date.now() + inviteTtlMs));

  for (let attempt = 0; attempt < inviteCodeMaxAttempts; attempt += 1) {
    const code = generateInviteCode();

    try {
      await firestore.runTransaction(async (transaction) => {
        const registryRef = firestore.collection("inviteCodes").doc(code);
        const inviteRef = firestore
          .collection("groups")
          .doc(groupId)
          .collection("seasons")
          .doc(groupSeasonId)
          .collection("invites")
          .doc(inviteId);
        const registrySnap = await transaction.get(registryRef);

        if (registrySnap.exists) {
          throw new ApiError("INVITE_CODE_COLLISION", "Invite code collision.");
        }

        transaction.create(inviteRef, {
          code,
          groupId,
          groupSeasonId,
          createdBy,
          createdAt: FieldValue.serverTimestamp(),
          expiresAt,
          revokedAt: null,
          usageCount: 0,
        });
        transaction.create(registryRef, {
          code,
          groupId,
          groupSeasonId,
          inviteId,
          createdAt: FieldValue.serverTimestamp(),
          expiresAt,
          revokedAt: null,
        });
      });

      return { code, expiresAt };
    } catch (error) {
      if (
        !(error instanceof ApiError && error.code === "INVITE_CODE_COLLISION") ||
        attempt === inviteCodeMaxAttempts - 1
      ) {
        throw error;
      }
    }
  }

  throw new ApiError("INVITE_CODE_COLLISION", "Could not allocate an invite code.");
}

async function requireActiveMembership(groupId: string, userId: string) {
  const groupRef = getFirebaseAdminFirestore().collection("groups").doc(groupId);
  const memberSnap = await groupRef.collection("members").doc(userId).get();

  if (!memberSnap.exists) {
    throw new ApiError("GROUP_NOT_FOUND", "Group not found.");
  }

  const member = memberSnap.data() as GroupMemberDocument;

  if (member.status !== "ACTIVE") {
    throw new ApiError("GROUP_NOT_FOUND", "Group not found.");
  }

  return groupRef;
}

async function requireGroupRole(groupId: string, userId: string, roles: GroupRole[]) {
  const groupRef = await requireActiveMembership(groupId, userId);
  const memberSnap = await groupRef.collection("members").doc(userId).get();
  const member = memberSnap.data() as GroupMemberDocument;

  if (!roles.includes(member.role)) {
    throw new ApiError("FORBIDDEN", "You do not have access to this group action.");
  }

  return groupRef;
}

async function getLatestValidInvite(
  groupRef: DocumentReference,
  groupSeasonId: string,
): Promise<GroupInviteSummary | null> {
  const invitesSnap = await groupRef
    .collection("seasons")
    .doc(groupSeasonId)
    .collection("invites")
    .where("revokedAt", "==", null)
    .limit(10)
    .get();

  if (invitesSnap.empty) {
    return null;
  }

  const now = Timestamp.now().toMillis();
  const latestInvite = invitesSnap.docs
    .map((doc) => ({
      id: doc.id,
      invite: doc.data() as GroupInviteDocument,
    }))
    .filter(({ invite }) => invite.expiresAt.toMillis() > now)
    .sort((left, right) => right.invite.createdAt.toMillis() - left.invite.createdAt.toMillis())[0];

  if (!latestInvite) {
    return null;
  }

  return serializeInvite(latestInvite.id, latestInvite.invite);
}

function serializeGroupSeason(id: string, season: GroupSeasonDocument): GroupSeasonSummary {
  return {
    id,
    competitionId: season.competitionId,
    seasonId: season.seasonId,
    label: season.label,
    status: season.status,
    scoringPreset: season.scoringPreset,
    predictionMode: season.predictionMode,
    allowBooster: season.allowBooster,
    predictionVisibility: season.predictionVisibility,
    startsAt: season.startsAt.toDate().toISOString(),
    endsAt: season.endsAt.toDate().toISOString(),
  };
}

function serializeMember(member: GroupMemberDocument): GroupMemberSummary {
  return {
    userId: member.userId,
    displayName: member.displayName,
    photoUrl: member.photoUrl,
    role: member.role,
    status: member.status,
    joinedAt: member.joinedAt.toDate().toISOString(),
  };
}

function serializeInvite(id: string, invite: GroupInviteDocument): GroupInviteSummary {
  return {
    id,
    code: invite.code,
    inviteUrl: getInviteUrl(invite.code),
    expiresAt: invite.expiresAt.toDate().toISOString(),
    usageCount: invite.usageCount,
  };
}

function getInviteUrl(code: string) {
  return `${env.NEXT_PUBLIC_APP_URL}/join?code=${encodeURIComponent(code)}`;
}

function generateInviteCode() {
  return Array.from({ length: 8 }, () => {
    const index = crypto.randomInt(0, inviteCodeAlphabet.length);
    return inviteCodeAlphabet[index];
  }).join("");
}

function isAlreadyExistsError(error: unknown) {
  if (typeof error !== "object" || error === null) {
    return false;
  }

  const maybeError = error as { code?: unknown; message?: unknown };

  return maybeError.code === 6 || String(maybeError.message ?? "").includes("ALREADY_EXISTS");
}

function slugify(value: string) {
  const slug = value
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 48);

  return slug || "group";
}
