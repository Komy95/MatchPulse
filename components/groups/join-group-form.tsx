"use client";

import { useRouter } from "next/navigation";
import { FormEvent, useState } from "react";
import { Button, Card, FieldLabel, Input } from "@/components/ui/primitives";

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
    <Card className="shadow-pitch" tone="pitch">
      <form onSubmit={handleSubmit}>
        <label className="block space-y-2">
          <FieldLabel>Invite code</FieldLabel>
          <Input
            className="py-4 font-mono text-xl tracking-[0.12em] uppercase"
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

        <Button className="mt-5 w-full" disabled={submitting} type="submit">
          {submitting ? "Joining..." : "Join group"}
        </Button>
      </form>
    </Card>
  );
}
