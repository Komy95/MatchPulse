"use client";

import { useState } from "react";
import type { GroupInviteSummary } from "@/lib/groups/types";

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
    <section className="rounded-xl border border-borderSoft bg-card p-6 shadow-[0_18px_60px_rgba(17,17,17,0.06)]">
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="text-sm font-medium text-secondaryText">Season invite</p>
          <h2 className="mt-2 text-2xl font-semibold">Invite link</h2>
        </div>
        <button
          className="shrink-0 rounded-sm border border-borderSoft px-4 py-2 text-sm font-semibold transition hover:bg-softSky disabled:cursor-not-allowed disabled:opacity-60"
          disabled={loading}
          type="button"
          onClick={createInvite}
        >
          {invite ? "Refresh" : "Generate"}
        </button>
      </div>

      {invite ? (
        <div className="mt-5 space-y-3">
          <div className="rounded-lg border border-borderSoft bg-base p-4">
            <p className="text-xs text-secondaryText">Code</p>
            <p className="mt-1 font-mono text-2xl font-semibold tracking-[0.12em]">
              {invite.code}
            </p>
          </div>
          <div className="break-all rounded-lg border border-borderSoft bg-base p-4 text-sm">
            {invite.inviteUrl}
          </div>
          <button
            className="w-full rounded-md bg-worldCupBlue px-5 py-4 text-base font-semibold text-white transition hover:bg-[#1742d6] focus:outline-none focus:ring-2 focus:ring-worldCupBlue focus:ring-offset-2"
            type="button"
            onClick={copyInvite}
          >
            Copy invite link
          </button>
        </div>
      ) : (
        <p className="mt-4 text-sm leading-6 text-secondaryText">
          Generate a season-scoped invite code for this group season.
        </p>
      )}

      {message ? (
        <div className="mt-4 rounded-md border border-borderSoft bg-softSky px-4 py-3 text-sm">
          {message}
        </div>
      ) : null}
    </section>
  );
}
