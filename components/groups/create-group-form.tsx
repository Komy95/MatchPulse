"use client";

import { useRouter } from "next/navigation";
import { FormEvent, useState } from "react";
import { Button, Card, FieldLabel, Input } from "@/components/ui/primitives";

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
    <Card className="shadow-pitch" tone="pitch">
      <form onSubmit={handleSubmit}>
        <label className="block space-y-2">
          <FieldLabel>Group name</FieldLabel>
          <Input
            className="py-4"
            maxLength={80}
            placeholder="Family & Friends"
            required
            value={name}
            onChange={(event) => setName(event.target.value)}
          />
        </label>

        <div className="mt-4 rounded-md border border-worldCupBlue/15 bg-softSky p-4 text-sm leading-6 text-primaryText">
          After creation, share the invite from your group page. Everyone predicts World Cup scores,
          earns points, and climbs the same private leaderboard.
        </div>

        <div className="mt-3 grid gap-2 text-sm text-secondaryText">
          <p className="rounded-md border border-borderSoft bg-cardWarm px-4 py-3">
            Private prediction pool for invited members only.
          </p>
          <p className="rounded-md border border-borderSoft bg-cardWarm px-4 py-3">
            Points-only scoring. No wagers, stakes, or real-money betting.
          </p>
        </div>

        {error ? (
          <div className="mt-4 rounded-md border border-canadaRed/20 bg-softRed px-4 py-3 text-sm">
            {error}
          </div>
        ) : null}

        <Button className="mt-5 w-full" disabled={submitting} type="submit">
          {submitting ? "Creating..." : "Create Group"}
        </Button>
      </form>
    </Card>
  );
}
