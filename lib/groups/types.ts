import type { Timestamp } from "firebase-admin/firestore";

export type GroupRole = "OWNER" | "ADMIN" | "MEMBER";
export type GroupMemberStatus = "ACTIVE" | "LEFT" | "REMOVED";
export type GroupSeasonStatus = "UPCOMING" | "ACTIVE" | "COMPLETED" | "ARCHIVED";

export type GroupDocument = {
  name: string;
  slug: string;
  ownerId: string;
  memberCount: number;
  activeGroupSeasonId: string;
  createdAt: Timestamp;
  updatedAt: Timestamp;
  archivedAt: Timestamp | null;
};

export type GroupMemberDocument = {
  userId: string;
  displayName: string | null;
  photoUrl: string | null;
  role: GroupRole;
  status: GroupMemberStatus;
  joinedAt: Timestamp;
  updatedAt: Timestamp;
};

export type GroupSeasonDocument = {
  groupId: string;
  competitionId: string;
  seasonId: string;
  label: string;
  status: GroupSeasonStatus;
  scoringPreset: "HYBRID_321";
  predictionMode: "EXACT_SCORE";
  allowBooster: boolean;
  predictionVisibility: "AFTER_LOCK";
  createdAt: Timestamp;
  updatedAt: Timestamp;
  startsAt: Timestamp;
  endsAt: Timestamp;
};

export type GroupInviteDocument = {
  code: string;
  groupId: string;
  groupSeasonId: string;
  createdBy: string;
  createdAt: Timestamp;
  expiresAt: Timestamp;
  revokedAt: Timestamp | null;
  usageCount: number;
};

export type InviteCodeRegistryDocument = {
  code: string;
  groupId: string;
  groupSeasonId: string;
  inviteId: string;
  createdAt: Timestamp;
  expiresAt: Timestamp;
  revokedAt: Timestamp | null;
};

export type GroupSeasonSummary = {
  id: string;
  competitionId: string;
  seasonId: string;
  label: string;
  status: GroupSeasonStatus;
  scoringPreset: string;
  predictionMode: string;
  allowBooster: boolean;
  predictionVisibility: string;
  startsAt: string;
  endsAt: string;
};

export type GroupDashboardCard = {
  id: string;
  name: string;
  slug: string;
  memberCount: number;
  activeGroupSeason: GroupSeasonSummary | null;
};

export type GroupMemberSummary = {
  userId: string;
  displayName: string | null;
  photoUrl: string | null;
  role: GroupRole;
  status: GroupMemberStatus;
  joinedAt: string;
};

export type GroupInviteSummary = {
  id: string;
  code: string;
  inviteUrl: string;
  expiresAt: string;
  usageCount: number;
};
