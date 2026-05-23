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
          Scoring starts with Hybrid 3-2-1 exact score rules for FIFA World Cup 2026. Group settings
          and future seasons stay server-managed.
        </div>

        {error ? (
          <div className="mt-4 rounded-md border border-canadaRed/20 bg-softRed px-4 py-3 text-sm">
            {error}
          </div>
        ) : null}

        <Button className="mt-5 w-full" disabled={submitting} type="submit">
          {submitting ? "Creating..." : "Create group"}
        </Button>
      </form>
    </Card>
  );
}
