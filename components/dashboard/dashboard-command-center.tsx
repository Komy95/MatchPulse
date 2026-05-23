import Link from "next/link";
import type {
  DashboardLeaderboardSummary,
  DashboardMatchSummary,
  DashboardViewModel,
} from "@/lib/dashboard/types";
import { Badge, ButtonLink, Card, FixtureCard } from "@/components/ui/primitives";

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
    <Card
      className="overflow-hidden border-stadiumNavy/10 bg-[linear-gradient(135deg,#07111F_0%,#0B1730_58%,#0E7A4F_140%)] text-white shadow-elevated"
      tone="dark"
    >
      <p className="text-sm font-semibold text-white/72">Matchday command</p>
      <h1 className="mt-3 text-3xl font-semibold leading-tight">{dashboard.nextAction.title}</h1>
      <p className="mt-3 text-base leading-7 text-white/74">{dashboard.nextAction.body}</p>
      <ButtonLink
        className="mt-5 w-full focus:ring-white focus:ring-offset-stadiumNavy"
        href={dashboard.nextAction.href}
      >
        {dashboard.nextAction.ctaLabel}
      </ButtonLink>
      {dashboard.groups.length === 0 ? (
        <ButtonLink
          className="mt-3 w-full"
          href="/join"
          variant="dark"
        >
          Join with invite code
        </ButtonLink>
      ) : null}
    </Card>
  );
}

function PredictionProgressCard({ dashboard }: { dashboard: DashboardViewModel }) {
  const progress = dashboard.predictionProgress;

  return (
    <Card tone="pitch">
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="text-sm font-semibold text-pitchGreen">Continue predicting</p>
          <h2 className="mt-2 text-2xl font-semibold leading-tight">
            {progress.missingOpen} open pick{progress.missingOpen === 1 ? "" : "s"} missing
          </h2>
        </div>
        <Badge tone="blue">
          {progress.savedOpen}/{progress.totalOpen} saved
        </Badge>
      </div>

      {progress.nextLockAt ? (
        <p className="mt-3 text-sm leading-6 text-secondaryText">
          Next lock: {formatDate(progress.nextLockAt)}
        </p>
      ) : null}

      {dashboard.continuePredicting.length === 0 ? (
        <EmptyPanel
          body="Your next match windows will stay visible here."
          title="No editable picks are missing."
        />
      ) : (
        <div className="mt-5 space-y-3">
          {dashboard.continuePredicting.map((match) => (
            <MatchRow key={`${match.groupId}-${match.id}`} match={match} />
          ))}
        </div>
      )}
    </Card>
  );
}

function NextLocksCard({ matches }: { matches: DashboardMatchSummary[] }) {
  return (
    <Card>
      <p className="text-sm font-semibold text-pitchGreen">Next locks</p>
      <h2 className="mt-2 text-2xl font-semibold leading-tight">Upcoming match windows</h2>
      {matches.length === 0 ? (
        <div className="mt-5 rounded-md border border-borderSoft bg-cardWarm p-5 text-sm text-secondaryText">
          No upcoming match locks are available yet.
        </div>
      ) : (
        <div className="mt-5 space-y-3">
          {matches.map((match) => (
            <MatchRow key={`${match.groupId}-${match.id}`} match={match} />
          ))}
        </div>
      )}
    </Card>
  );
}

function PrivateStandingsCard({ summaries }: { summaries: DashboardLeaderboardSummary[] }) {
  return (
    <Card>
      <p className="text-sm font-semibold text-pitchGreen">Private standings</p>
      <h2 className="mt-2 text-2xl font-semibold leading-tight">Leaderboard summary</h2>
      {summaries.length === 0 ? (
        <EmptyPanel
          body="Finished matches will update your group leaderboard."
          title="Standings appear after scoring."
        />
      ) : (
        <div className="mt-5 space-y-3">
          {summaries.map((summary) => (
            <Link
              className="block rounded-lg border border-line bg-cardWarm p-4 transition hover:border-pitchGreen/35 hover:bg-pitchMist focus:outline-none focus:ring-2 focus:ring-worldCupBlue focus:ring-offset-2"
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
                  <p className="text-3xl font-semibold tabular-nums text-stadiumNavy">
                    {summary.userPoints ?? 0}
                  </p>
                  <p className="text-xs font-semibold text-secondaryText">pts</p>
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
    </Card>
  );
}

function MatchRow({ match }: { match: DashboardMatchSummary }) {
  return (
    <Link className="block focus:outline-none focus:ring-2 focus:ring-worldCupBlue focus:ring-offset-2" href={match.href}>
      <FixtureCard className="transition hover:border-pitchGreen/40 hover:bg-pitchMist">
        <div className="relative flex items-start justify-between gap-3">
          <div className="min-w-0">
            <p className="text-xs font-semibold uppercase text-mutedText">{match.groupName}</p>
            <h3 className="mt-2 text-lg font-semibold leading-snug text-stadiumNavy">
              {match.homeTeam} <span className="text-mutedText">vs</span> {match.awayTeam}
            </h3>
            <p className="mt-2 text-xs text-secondaryText">Locks {formatDate(match.lockAt)}</p>
          </div>
          <Badge tone={badgeTone(match)}>{predictionLabel(match)}</Badge>
        </div>
      </FixtureCard>
    </Link>
  );
}

function EmptyPanel({ title, body }: { title: string; body: string }) {
  return (
    <div className="mt-5 rounded-md border border-borderSoft bg-cardWarm p-5">
      <h3 className="text-lg font-semibold">{title}</h3>
      <p className="mt-2 text-sm leading-6 text-secondaryText">{body}</p>
    </div>
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

function badgeTone(match: DashboardMatchSummary) {
  switch (match.predictionState) {
    case "SAVED":
    case "LOCKED_SAVED":
      return "green";
    case "LOCKED_MISSING":
      return "red";
    case "MISSING":
      return "blue";
  }
}

function formatDate(value: string) {
  return new Intl.DateTimeFormat(undefined, {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(new Date(value));
}
