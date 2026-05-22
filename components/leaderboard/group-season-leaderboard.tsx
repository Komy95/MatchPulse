"use client";

import { useEffect, useState } from "react";
import type { LeaderboardSnapshot } from "@/lib/leaderboard/types";

type LeaderboardResponse = {
  groupId: string;
  groupSeasonId: string;
  snapshot: LeaderboardSnapshot | null;
};

export function GroupSeasonLeaderboard({
  groupId,
  groupSeasonId,
  canRecalculate,
}: {
  groupId: string;
  groupSeasonId: string;
  canRecalculate: boolean;
}) {
  const [snapshot, setSnapshot] = useState<LeaderboardSnapshot | null>(null);
  const [loading, setLoading] = useState(true);
  const [recalculating, setRecalculating] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let active = true;

    async function loadLeaderboard() {
      setLoading(true);
      setError(null);

      try {
        const response = await fetch(
          `/api/v1/groups/${groupId}/seasons/${groupSeasonId}/leaderboard`,
          { credentials: "same-origin" },
        );
        const payload = (await response.json()) as LeaderboardResponse & {
          error?: { message?: string };
        };

        if (!response.ok) {
          throw new Error(payload.error?.message ?? "Leaderboard could not be loaded.");
        }

        if (active) {
          setSnapshot(payload.snapshot);
        }
      } catch (caught) {
        if (active) {
          setError(caught instanceof Error ? caught.message : "Leaderboard could not be loaded.");
        }
      } finally {
        if (active) {
          setLoading(false);
        }
      }
    }

    void loadLeaderboard();

    return () => {
      active = false;
    };
  }, [groupId, groupSeasonId]);

  async function recalculate() {
    setRecalculating(true);
    setError(null);

    try {
      const response = await fetch(
        `/api/v1/groups/${groupId}/seasons/${groupSeasonId}/leaderboard/recalculate`,
        {
          method: "POST",
          credentials: "same-origin",
        },
      );
      const payload = (await response.json()) as {
        snapshot?: LeaderboardSnapshot;
        error?: { message?: string };
      };

      if (!response.ok || !payload.snapshot) {
        throw new Error(payload.error?.message ?? "Leaderboard could not be recalculated.");
      }

      setSnapshot(payload.snapshot);
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : "Leaderboard could not be recalculated.");
    } finally {
      setRecalculating(false);
    }
  }

  return (
    <section className="rounded-xl border border-borderSoft bg-card p-6 shadow-[0_18px_60px_rgba(17,17,17,0.06)]">
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="text-sm font-medium text-worldCupBlue">Leaderboard</p>
          <h2 className="mt-2 text-2xl font-semibold">Group standings</h2>
        </div>
        {snapshot ? (
          <span className="rounded-full bg-softSky px-3 py-1 text-xs font-medium">
            {snapshot.entries.length} ranked
          </span>
        ) : null}
      </div>

      {loading ? (
        <div className="mt-5 rounded-lg border border-borderSoft bg-base p-5 text-sm text-secondaryText">
          Loading leaderboard...
        </div>
      ) : error ? (
        <div className="mt-5 rounded-lg border border-[#E7B6AE] bg-softRed p-5 text-sm">
          {error}
        </div>
      ) : !snapshot ? (
        <EmptyLeaderboard />
      ) : (
        <div className="mt-5 space-y-3">
          {snapshot.entries.length === 0 ? (
            <EmptyLeaderboard />
          ) : (
            snapshot.entries.map((entry) => (
              <article
                className="rounded-lg border border-borderSoft bg-base p-4"
                key={entry.userId}
              >
                <div className="flex items-center gap-3">
                  <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-softSky text-base font-semibold tabular-nums">
                    {entry.rank}
                  </div>
                  <div className="min-w-0 flex-1">
                    <h3 className="truncate text-base font-semibold">
                      {entry.displayName ?? "Member"}
                    </h3>
                    <p className="mt-1 text-xs text-secondaryText">
                      Exact {entry.exactCount} · GD {entry.goalDifferenceCount} · Tend{" "}
                      {entry.tendencyCount}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-2xl font-semibold tabular-nums">{entry.points}</p>
                    <p className="text-xs text-secondaryText">pts</p>
                  </div>
                </div>
              </article>
            ))
          )}
          <p className="pt-1 text-xs leading-5 text-secondaryText">
            Updated {formatDate(snapshot.snapshotAt)}
          </p>
        </div>
      )}

      {canRecalculate ? (
        <button
          className="mt-5 w-full rounded-md border border-borderSoft px-5 py-4 text-sm font-semibold transition hover:bg-softSky focus:outline-none focus:ring-2 focus:ring-worldCupBlue focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-60"
          disabled={loading || recalculating}
          type="button"
          onClick={recalculate}
        >
          {recalculating ? "Recalculating..." : "Recalculate leaderboard"}
        </button>
      ) : null}
    </section>
  );
}

function EmptyLeaderboard() {
  return (
    <div className="mt-5 rounded-lg border border-borderSoft bg-base p-5">
      <h3 className="text-lg font-semibold">Leaderboard will appear after matches are scored.</h3>
    </div>
  );
}

function formatDate(value: string) {
  return new Intl.DateTimeFormat(undefined, {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(new Date(value));
}
