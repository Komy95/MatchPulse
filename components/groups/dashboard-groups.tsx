"use client";

import Link from "next/link";
import { useState } from "react";
import type { GroupDashboardCard } from "@/lib/groups/types";

export function DashboardGroups({ initialGroups }: { initialGroups: GroupDashboardCard[] }) {
  const [groups] = useState(initialGroups);

  return (
    <section className="rounded-xl border border-borderSoft bg-card p-6 shadow-[0_18px_60px_rgba(17,17,17,0.06)]">
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="text-sm font-medium text-worldCupBlue">Private groups</p>
          <h2 className="mt-2 text-2xl font-semibold">Reusable groups</h2>
        </div>
        <Link
          className="shrink-0 rounded-sm bg-worldCupBlue px-4 py-3 text-sm font-semibold text-white transition hover:bg-[#1742d6] focus:outline-none focus:ring-2 focus:ring-worldCupBlue focus:ring-offset-2"
          href="/groups/new"
        >
          Create group
        </Link>
      </div>

      {groups.length === 0 ? (
        <div className="mt-5 rounded-lg border border-borderSoft bg-base p-5">
          <h3 className="text-lg font-semibold">Create your first World Cup group</h3>
          <p className="mt-2 text-sm leading-6 text-secondaryText">
            Start with FIFA World Cup 2026, then reuse the same group for future tournaments and
            seasons.
          </p>
        </div>
      ) : (
        <div className="mt-5 space-y-3">
          {groups.map((group) => (
            <Link
              className="block rounded-lg border border-borderSoft bg-base p-4 transition hover:bg-softSky focus:outline-none focus:ring-2 focus:ring-worldCupBlue focus:ring-offset-2"
              href={`/groups/${group.id}`}
              key={group.id}
            >
              <div className="flex items-start justify-between gap-3">
                <div>
                  <h3 className="text-lg font-semibold">{group.name}</h3>
                  <p className="mt-1 text-sm text-secondaryText">
                    {group.activeGroupSeason?.label ?? "No active season"}
                  </p>
                </div>
                <span className="rounded-full bg-softGreen px-3 py-1 text-xs font-medium text-primaryText">
                  {group.memberCount} member{group.memberCount === 1 ? "" : "s"}
                </span>
              </div>
            </Link>
          ))}
        </div>
      )}

      <Link
        className="mt-4 block rounded-md border border-borderSoft px-5 py-4 text-center text-sm font-semibold transition hover:bg-softSky focus:outline-none focus:ring-2 focus:ring-worldCupBlue focus:ring-offset-2"
        href="/join"
      >
        Join with invite code
      </Link>
    </section>
  );
}
