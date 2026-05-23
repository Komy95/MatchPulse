import Link from "next/link";
import type {
  DashboardLeaderboardSummary,
  DashboardMatchSummary,
  DashboardViewModel,
} from "@/lib/dashboard/types";

export function DashboardCommandCenter({ dashboard }: { dashboard: DashboardViewModel }) {
  return (
    <div className="space-y-5">
      <NextActionCard dashboard={dashboard} />
      <PredictionProgressCard dashboard={dashboard} />
      <NextLocksCard matches={dashboard.nextLocks} />
      <PrivateStandingsCard summaries={dashboard.leaderboardSummaries} />
    </div>
  );
}

function NextActionCard({ dashboard }: { dashboard: DashboardViewModel }) {
  return (
    <section className="rounded-xl border border-borderSoft bg-card p-6 shadow-[0_18px_60px_rgba(17,17,17,0.06)]">
      <p className="text-sm font-medium text-worldCupBlue">Next action</p>
      <h1 className="mt-3 text-3xl font-semibold">{dashboard.nextAction.title}</h1>
      <p className="mt-3 text-base leading-7 text-secondaryText">{dashboard.nextAction.body}</p>
      <Link
        className="mt-5 block rounded-md bg-worldCupBlue px-5 py-4 text-center text-base font-semibold text-white transition hover:bg-[#1742d6] focus:outline-none focus:ring-2 focus:ring-worldCupBlue focus:ring-offset-2"
        href={dashboard.nextAction.href}
      >
        {dashboard.nextAction.ctaLabel}
      </Link>
      {dashboard.groups.length === 0 ? (
        <Link
          className="mt-3 block rounded-md border border-borderSoft px-5 py-4 text-center text-sm font-semibold transition hover:bg-softSky focus:outline-none focus:ring-2 focus:ring-worldCupBlue focus:ring-offset-2"
          href="/join"
        >
          Join with invite code
        </Link>
      ) : null}
    </section>
  );
}

function PredictionProgressCard({ dashboard }: { dashboard: DashboardViewModel }) {
  const progress = dashboard.predictionProgress;

  return (
    <section className="rounded-xl border border-borderSoft bg-card p-6 shadow-[0_18px_60px_rgba(17,17,17,0.06)]">
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="text-sm font-medium text-worldCupBlue">Continue predicting</p>
          <h2 className="mt-2 text-2xl font-semibold">
            {progress.missingOpen} open pick{progress.missingOpen === 1 ? "" : "s"} missing
          </h2>
        </div>
        <span className="rounded-full bg-softSky px-3 py-1 text-xs font-medium">
          {progress.savedOpen}/{progress.totalOpen} saved
        </span>
      </div>

      {progress.nextLockAt ? (
        <p className="mt-3 text-sm leading-6 text-secondaryText">
          Next lock: {formatDate(progress.nextLockAt)}
        </p>
      ) : null}

      {dashboard.continuePredicting.length === 0 ? (
        <div className="mt-5 rounded-lg border border-borderSoft bg-base p-5">
          <h3 className="text-lg font-semibold">No editable picks are missing.</h3>
          <p className="mt-2 text-sm leading-6 text-secondaryText">
            Your next match windows will stay visible here.
          </p>
        </div>
      ) : (
        <div className="mt-5 space-y-3">
          {dashboard.continuePredicting.map((match) => (
            <MatchRow key={`${match.groupId}-${match.id}`} match={match} />
          ))}
        </div>
      )}
    </section>
  );
}

function NextLocksCard({ matches }: { matches: DashboardMatchSummary[] }) {
  return (
    <section className="rounded-xl border border-borderSoft bg-card p-6 shadow-[0_18px_60px_rgba(17,17,17,0.06)]">
      <p className="text-sm font-medium text-worldCupBlue">Next locks</p>
      <h2 className="mt-2 text-2xl font-semibold">Upcoming match windows</h2>
      {matches.length === 0 ? (
        <div className="mt-5 rounded-lg border border-borderSoft bg-base p-5 text-sm text-secondaryText">
          No upcoming match locks are available yet.
        </div>
      ) : (
        <div className="mt-5 space-y-3">
          {matches.map((match) => (
            <MatchRow key={`${match.groupId}-${match.id}`} match={match} />
          ))}
        </div>
      )}
    </section>
  );
}

function PrivateStandingsCard({ summaries }: { summaries: DashboardLeaderboardSummary[] }) {
  return (
    <section className="rounded-xl border border-borderSoft bg-card p-6 shadow-[0_18px_60px_rgba(17,17,17,0.06)]">
      <p className="text-sm font-medium text-worldCupBlue">Private standings</p>
      <h2 className="mt-2 text-2xl font-semibold">Leaderboard summary</h2>
      {summaries.length === 0 ? (
        <div className="mt-5 rounded-lg border border-borderSoft bg-base p-5">
          <h3 className="text-lg font-semibold">Standings appear after scoring.</h3>
          <p className="mt-2 text-sm leading-6 text-secondaryText">
            Finished matches will update your group leaderboard.
          </p>
        </div>
      ) : (
        <div className="mt-5 space-y-3">
          {summaries.map((summary) => (
            <Link
              className="block rounded-lg border border-borderSoft bg-base p-4 transition hover:bg-softSky focus:outline-none focus:ring-2 focus:ring-worldCupBlue focus:ring-offset-2"
              href={summary.href}
              key={`${summary.groupId}-${summary.groupSeasonId}`}
            >
              <div className="flex items-start justify-between gap-4">
                <div>
                  <h3 className="text-lg font-semibold">{summary.groupName}</h3>
                  <p className="mt-1 text-sm text-secondaryText">
                    Your rank: {summary.userRank ? `#${summary.userRank}` : "Not ranked yet"}
                  </p>
                </div>
                <div className="text-right">
                  <p className="text-2xl font-semibold tabular-nums">
                    {summary.userPoints ?? 0}
                  </p>
                  <p className="text-xs text-secondaryText">pts</p>
                </div>
              </div>
              {summary.leaderName ? (
                <p className="mt-3 text-sm text-secondaryText">
                  Leader: {summary.leaderName} ({summary.leaderPoints} pts)
                </p>
              ) : null}
            </Link>
          ))}
        </div>
      )}
    </section>
  );
}

function MatchRow({ match }: { match: DashboardMatchSummary }) {
  return (
    <Link
      className="block rounded-lg border border-borderSoft bg-base p-4 transition hover:bg-softSky focus:outline-none focus:ring-2 focus:ring-worldCupBlue focus:ring-offset-2"
      href={match.href}
    >
      <div className="flex items-start justify-between gap-3">
        <div>
          <h3 className="text-lg font-semibold">
            {match.homeTeam} vs {match.awayTeam}
          </h3>
          <p className="mt-1 text-sm text-secondaryText">{match.groupName}</p>
          <p className="mt-2 text-xs text-secondaryText">Locks {formatDate(match.lockAt)}</p>
        </div>
        <span className={`rounded-full px-3 py-1 text-xs font-medium ${badgeClass(match)}`}>
          {predictionLabel(match)}
        </span>
      </div>
    </Link>
  );
}

function predictionLabel(match: DashboardMatchSummary) {
  switch (match.predictionState) {
    case "SAVED":
      return "Saved";
    case "LOCKED_SAVED":
      return "Locked";
    case "LOCKED_MISSING":
      return "Missed";
    case "MISSING":
      return "Pick";
  }
}

function badgeClass(match: DashboardMatchSummary) {
  switch (match.predictionState) {
    case "SAVED":
    case "LOCKED_SAVED":
      return "bg-softGreen";
    case "LOCKED_MISSING":
      return "bg-softRed";
    case "MISSING":
      return "bg-softSky";
  }
}

function formatDate(value: string) {
  return new Intl.DateTimeFormat(undefined, {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(new Date(value));
}
