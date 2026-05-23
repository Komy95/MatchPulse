"use client";

import { useState } from "react";
import type { GroupInviteSummary } from "@/lib/groups/types";
import { Button, Card } from "@/components/ui/primitives";

export function InviteCard({
  groupId,
  groupSeasonId,
  initialInvite,
}: {
  groupId: string;
  groupSeasonId: string;
  initialInvite: GroupInviteSummary | null;
}) {
  const [invite, setInvite] = useState(initialInvite);
  const [message, setMessage] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function createInvite() {
    setLoading(true);
    setMessage(null);

    try {
      const response = await fetch(
        `/api/v1/groups/${groupId}/seasons/${groupSeasonId}/invites`,
        {
          method: "POST",
          headers: {
            "content-type": "application/json",
          },
          body: JSON.stringify({ refresh: true }),
        },
      );
      const payload = await response.json();

      if (!response.ok) {
        throw new Error(payload.error?.message ?? "Invite could not be created.");
      }

      setInvite(payload.invite);
      setMessage("Invite ready.");
    } catch (caught) {
      setMessage(caught instanceof Error ? caught.message : "Invite could not be created.");
    } finally {
      setLoading(false);
    }
  }

  async function copyInvite() {
    if (!invite) {
      return;
    }

    await navigator.clipboard?.writeText(invite.inviteUrl);
    setMessage("Invite link copied.");
  }

  return (
    <Card>
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="text-sm font-medium text-secondaryText">Season invite</p>
          <h2 className="mt-2 text-2xl font-semibold">Invite link</h2>
        </div>
        <Button
          className="shrink-0"
          variant="ghost"
          disabled={loading}
          type="button"
          onClick={createInvite}
        >
          {invite ? "Refresh" : "Generate"}
        </Button>
      </div>

      {invite ? (
        <div className="mt-5 space-y-3">
          <div className="rounded-lg border border-line bg-cardWarm p-4">
            <p className="text-xs text-secondaryText">Code</p>
            <p className="mt-1 font-mono text-2xl font-semibold tracking-[0.12em]">
              {invite.code}
            </p>
          </div>
          <div className="break-all rounded-lg border border-line bg-cardWarm p-4 text-sm">
            {invite.inviteUrl}
          </div>
          <Button
            className="w-full"
            type="button"
            onClick={copyInvite}
          >
            Copy invite link
          </Button>
        </div>
      ) : (
        <p className="mt-4 text-sm leading-6 text-secondaryText">
          Generate a season-scoped invite code for this group season.
        </p>
      )}

      {message ? (
        <div className="mt-4 rounded-md border border-worldCupBlue/15 bg-softSky px-4 py-3 text-sm">
          {message}
        </div>
      ) : null}
    </Card>
  );
}
