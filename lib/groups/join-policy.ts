export type InviteJoinErrorCode =
  | "INVITE_INVALID"
  | "INVITE_EXPIRED"
  | "INVITE_REVOKED";

export type InviteJoinMemberStatus = "ACTIVE" | "LEFT" | "REMOVED";
export type InviteJoinMemberRole = "OWNER" | "ADMIN" | "MEMBER";

export type InviteJoinPolicyInput = {
  code: string;
  nowMs: number;
  registry:
    | {
        code: string;
        groupId: string;
        groupSeasonId: string;
        inviteId: string;
        expiresAtMs: number;
        revoked: boolean;
      }
    | null;
  invite:
    | {
        id: string;
        code: string;
        groupId: string;
        groupSeasonId: string;
        expiresAtMs: number;
        revoked: boolean;
      }
    | null;
  groupExists: boolean;
  groupSeasonExists: boolean;
  existingMember:
    | {
        status: InviteJoinMemberStatus;
        role: InviteJoinMemberRole;
      }
    | null;
};

export type InviteJoinPolicyResult =
  | {
      action: "NOOP_ACTIVE";
      incrementMemberCount: false;
      role: InviteJoinMemberRole;
    }
  | {
      action: "JOIN";
      incrementMemberCount: true;
      role: InviteJoinMemberRole;
    };

export function evaluateInviteJoinPolicy(
  input: InviteJoinPolicyInput,
): InviteJoinPolicyResult | { errorCode: InviteJoinErrorCode } {
  const { registry, invite } = input;

  if (!registry || registry.code !== input.code) {
    return { errorCode: "INVITE_INVALID" };
  }

  if (!invite) {
    return { errorCode: "INVITE_INVALID" };
  }

  const registryMatchesInvite =
    registry.inviteId === invite.id &&
    registry.groupId === invite.groupId &&
    registry.groupSeasonId === invite.groupSeasonId &&
    registry.code === invite.code &&
    invite.code === input.code;

  if (!registryMatchesInvite || !input.groupExists || !input.groupSeasonExists) {
    return { errorCode: "INVITE_INVALID" };
  }

  if (registry.revoked || invite.revoked) {
    return { errorCode: "INVITE_REVOKED" };
  }

  if (registry.expiresAtMs <= input.nowMs || invite.expiresAtMs <= input.nowMs) {
    return { errorCode: "INVITE_EXPIRED" };
  }

  if (input.existingMember?.status === "REMOVED") {
    return { errorCode: "INVITE_INVALID" };
  }

  if (input.existingMember?.status === "ACTIVE") {
    return {
      action: "NOOP_ACTIVE",
      incrementMemberCount: false,
      role: input.existingMember.role,
    };
  }

  return {
    action: "JOIN",
    incrementMemberCount: true,
    role: input.existingMember?.role ?? "MEMBER",
  };
}
