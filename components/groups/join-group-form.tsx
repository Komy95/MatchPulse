"use client";

import { useRouter } from "next/navigation";
import { FormEvent, useState } from "react";

export function JoinGroupForm({ initialCode }: { initialCode: string }) {
  const router = useRouter();
  const [code, setCode] = useState(initialCode);
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);
    setSubmitting(true);

    try {
      const response = await fetch("/api/v1/groups/join", {
        method: "POST",
        headers: {
          "content-type": "application/json",
        },
        body: JSON.stringify({ code }),
      });
      const payload = await response.json();

      if (!response.ok) {
        throw new Error(payload.error?.message ?? "Invite code is invalid.");
      }

      router.replace(`/groups/${payload.membership.groupId}`);
      router.refresh();
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : "Invite code is invalid.");
      setSubmitting(false);
    }
  }

  return (
    <form
      className="rounded-xl border border-borderSoft bg-card p-6 shadow-[0_18px_60px_rgba(17,17,17,0.06)]"
      onSubmit={handleSubmit}
    >
      <label className="block space-y-2">
        <span className="text-sm font-medium">Invite code</span>
        <input
          className="w-full rounded-md border-borderSoft bg-base px-4 py-4 font-mono text-xl tracking-[0.12em] uppercase"
          required
          value={code}
          onChange={(event) => setCode(event.target.value.toUpperCase())}
        />
      </label>

      {error ? (
        <div className="mt-4 rounded-md border border-canadaRed/20 bg-softRed px-4 py-3 text-sm">
          {error}
        </div>
      ) : null}

      <button
        className="mt-5 w-full rounded-md bg-worldCupBlue px-5 py-4 text-base font-semibold text-white transition hover:bg-[#1742d6] focus:outline-none focus:ring-2 focus:ring-worldCupBlue focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-60"
        disabled={submitting}
        type="submit"
      >
        {submitting ? "Joining..." : "Join group"}
      </button>
    </form>
  );
}
