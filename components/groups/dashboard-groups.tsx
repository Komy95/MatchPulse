"use client";

import Link from "next/link";
import { useState } from "react";
import type { GroupDashboardCard } from "@/lib/groups/types";
import { Badge, ButtonLink, Card } from "@/components/ui/primitives";

export function DashboardGroups({ initialGroups }: { initialGroups: GroupDashboardCard[] }) {
  const [groups] = useState(initialGroups);

  return (
    <Card>
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="text-sm font-semibold text-pitchGreen">Private groups</p>
          <h2 className="mt-2 text-2xl font-semibold leading-tight">Your prediction pools</h2>
        </div>
        <ButtonLink className="shrink-0 px-4" href="/groups/new">
          Create Group
        </ButtonLink>
      </div>

      {groups.length === 0 ? (
        <div className="mt-5 rounded-md border border-borderSoft bg-cardWarm p-5">
          <h3 className="text-lg font-semibold">No groups yet</h3>
          <p className="mt-2 text-sm leading-6 text-secondaryText">
            Create a private World Cup prediction pool or join one with an invite code. Pools are
            points-only and never real-money betting.
          </p>
          <div className="mt-4 grid gap-3 sm:grid-cols-2">
            <ButtonLink href="/groups/new">Create Group</ButtonLink>
            <ButtonLink href="/join" variant="secondary">
              Join Group
            </ButtonLink>
          </div>
        </div>
      ) : (
        <div className="mt-5 space-y-3">
          {groups.map((group) => (
            <Link
              className="block rounded-lg border border-line bg-cardWarm p-4 transition hover:border-pitchGreen/35 hover:bg-pitchMist focus:outline-none focus:ring-2 focus:ring-worldCupBlue focus:ring-offset-2"
              href={`/groups/${group.id}`}
              key={group.id}
            >
              <div className="flex items-start justify-between gap-3">
                <div>
                  <h3 className="text-lg font-semibold leading-snug">{group.name}</h3>
                  <p className="mt-1 text-sm text-secondaryText">
                    {group.activeGroupSeason?.label ?? "No active season"}
                  </p>
                </div>
                <Badge tone="green">
                  {group.memberCount} member{group.memberCount === 1 ? "" : "s"}
                </Badge>
              </div>
            </Link>
          ))}
        </div>
      )}

      <ButtonLink
        className="mt-4 w-full"
        href="/join"
        variant="secondary"
      >
        Join Group
      </ButtonLink>
    </Card>
  );
}
