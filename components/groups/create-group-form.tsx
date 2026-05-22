"use client";

import { useRouter } from "next/navigation";
import { FormEvent, useState } from "react";

export function CreateGroupForm() {
  const router = useRouter();
  const [name, setName] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);
    setSubmitting(true);

    try {
      const response = await fetch("/api/v1/groups", {
        method: "POST",
        headers: {
          "content-type": "application/json",
        },
        body: JSON.stringify({ name }),
      });
      const payload = await response.json();

      if (!response.ok) {
        throw new Error(payload.error?.message ?? "Group could not be created.");
      }

      router.replace(`/groups/${payload.group.id}`);
      router.refresh();
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : "Group could not be created.");
      setSubmitting(false);
    }
  }

  return (
    <form
      className="rounded-xl border border-borderSoft bg-card p-6 shadow-[0_18px_60px_rgba(17,17,17,0.06)]"
      onSubmit={handleSubmit}
    >
      <label className="block space-y-2">
        <span className="text-sm font-medium">Group name</span>
        <input
          className="w-full rounded-md border-borderSoft bg-base px-4 py-4 text-base"
          maxLength={80}
          placeholder="Family & Friends"
          required
          value={name}
          onChange={(event) => setName(event.target.value)}
        />
      </label>

      <div className="mt-4 rounded-lg bg-softSky p-4 text-sm leading-6 text-primaryText">
        Scoring starts with Hybrid 3-2-1 exact score rules for FIFA World Cup 2026. Group settings
        and future seasons stay server-managed.
      </div>

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
        {submitting ? "Creating..." : "Create group"}
      </button>
    </form>
  );
}
