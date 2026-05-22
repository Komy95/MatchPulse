import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";
import vm from "node:vm";
import ts from "typescript";

const policySource = readFileSync("lib/groups/join-policy.ts", "utf8");
const serviceSource = readFileSync("lib/groups/service.ts", "utf8");
const transpiled = ts.transpileModule(policySource, {
  compilerOptions: {
    module: ts.ModuleKind.CommonJS,
    target: ts.ScriptTarget.ES2020,
  },
});
const sandbox = {
  exports: {},
};

vm.runInNewContext(transpiled.outputText, sandbox);

const { evaluateInviteJoinPolicy } = sandbox.exports;

function validInput(overrides = {}) {
  return {
    code: "ABC12345",
    nowMs: 1_000,
    registry: {
      code: "ABC12345",
      groupId: "group-1",
      groupSeasonId: "season-1",
      inviteId: "invite-1",
      expiresAtMs: 2_000,
      revoked: false,
    },
    invite: {
      id: "invite-1",
      code: "ABC12345",
      groupId: "group-1",
      groupSeasonId: "season-1",
      expiresAtMs: 2_000,
      revoked: false,
    },
    groupExists: true,
    groupSeasonExists: true,
    existingMember: null,
    ...overrides,
  };
}

function assertRejected(result, errorCode) {
  assertJsonEqual(result, { errorCode });
}

function assertJsonEqual(actual, expected) {
  assert.equal(JSON.stringify(actual), JSON.stringify(expected));
}

test("valid invite joins group season successfully", () => {
  assertJsonEqual(evaluateInviteJoinPolicy(validInput()), {
    action: "JOIN",
    incrementMemberCount: true,
    role: "MEMBER",
  });
});

test("already active member join is idempotent and does not increment memberCount", () => {
  assertJsonEqual(
    evaluateInviteJoinPolicy(
      validInput({
        existingMember: {
          status: "ACTIVE",
          role: "ADMIN",
        },
      }),
    ),
    {
      action: "NOOP_ACTIVE",
      incrementMemberCount: false,
      role: "ADMIN",
    },
  );
});

test("LEFT member rejoin activates membership and increments memberCount", () => {
  assertJsonEqual(
    evaluateInviteJoinPolicy(
      validInput({
        existingMember: {
          status: "LEFT",
          role: "MEMBER",
        },
      }),
    ),
    {
      action: "JOIN",
      incrementMemberCount: true,
      role: "MEMBER",
    },
  );
});

test("REMOVED member cannot rejoin via invite", () => {
  assertRejected(
    evaluateInviteJoinPolicy(
      validInput({
        existingMember: {
          status: "REMOVED",
          role: "MEMBER",
        },
      }),
    ),
    "INVITE_INVALID",
  );
});

test("expired invite is rejected", () => {
  assertRejected(
    evaluateInviteJoinPolicy(
      validInput({
        invite: {
          id: "invite-1",
          code: "ABC12345",
          groupId: "group-1",
          groupSeasonId: "season-1",
          expiresAtMs: 999,
          revoked: false,
        },
      }),
    ),
    "INVITE_EXPIRED",
  );
});

test("revoked invite is rejected", () => {
  assertRejected(
    evaluateInviteJoinPolicy(
      validInput({
        registry: {
          code: "ABC12345",
          groupId: "group-1",
          groupSeasonId: "season-1",
          inviteId: "invite-1",
          expiresAtMs: 2_000,
          revoked: true,
        },
      }),
    ),
    "INVITE_REVOKED",
  );
});

test("missing invite code is rejected", () => {
  assertRejected(evaluateInviteJoinPolicy(validInput({ registry: null })), "INVITE_INVALID");
});

test("registry mismatch is rejected", () => {
  assertRejected(
    evaluateInviteJoinPolicy(
      validInput({
        registry: {
          code: "ABC12345",
          groupId: "group-1",
          groupSeasonId: "season-1",
          inviteId: "different-invite",
          expiresAtMs: 2_000,
          revoked: false,
        },
      }),
    ),
    "INVITE_INVALID",
  );
});

test("invite document mismatch against registry is rejected", () => {
  assertRejected(
    evaluateInviteJoinPolicy(
      validInput({
        invite: {
          id: "invite-1",
          code: "ABC12345",
          groupId: "group-1",
          groupSeasonId: "different-season",
          expiresAtMs: 2_000,
          revoked: false,
        },
      }),
    ),
    "INVITE_INVALID",
  );
});

test("failed joins do not produce membership or memberCount mutations", () => {
  const rejectedCases = [
    validInput({ groupExists: false }),
    validInput({ groupSeasonExists: false }),
    validInput({ invite: null }),
  ];

  for (const input of rejectedCases) {
    const result = evaluateInviteJoinPolicy(input);
    assert.equal("errorCode" in result, true);
    assert.equal("incrementMemberCount" in result, false);
    assert.equal("action" in result, false);
  }
});

test("service reads registry and invite authorization state inside transaction", () => {
  const transactionStart = serviceSource.indexOf("await firestore.runTransaction");
  const registryRead = serviceSource.indexOf("transaction.get(registryRef)");
  const inviteRead = serviceSource.indexOf("transaction.get(inviteRef)");
  const oldPreTransactionRead = ".collection(\"inviteCodes\").doc(code).get()";

  assert.notEqual(transactionStart, -1);
  assert.ok(registryRead > transactionStart);
  assert.ok(inviteRead > transactionStart);
  assert.equal(serviceSource.includes(oldPreTransactionRead), false);
});
