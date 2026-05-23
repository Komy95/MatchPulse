import Link from "next/link";
import { redirect } from "next/navigation";
import { InviteCard } from "@/components/groups/invite-card";
import { GroupSeasonLeaderboard } from "@/components/leaderboard/group-season-leaderboard";
import { PredictionEntry } from "@/components/predictions/prediction-entry";
import { Badge, ButtonLink, Card } from "@/components/ui/primitives";
import { getAuthenticatedUserContext } from "@/lib/auth/user-context";
import { getGroupDetail, listGroupSeasons } from "@/lib/groups/service";
import { listGroupSeasonMatchesWithPredictions } from "@/lib/predictions/service";
import { getWorldCupOverview } from "@/lib/world-cup/reference-data";

export default async function GroupDetailPage({
  params,
  searchParams,
}: {
  params: Promise<{ groupId: string }>;
  searchParams: Promise<{ created?: string; joined?: string }>;
}) {
  const user = await getAuthenticatedUserContext();

  if (!user) {
    redirect("/login");
  }

  const { groupId } = await params;
  const [group, seasonsResponse, tournamentOverview] = await Promise.all([
    getGroupDetail(groupId, user.uid),
    listGroupSeasons(groupId, user.uid),
    getWorldCupOverview(),
  ]);
  const matchResponse = await listGroupSeasonMatchesWithPredictions({
    groupId,
    groupSeasonId: group.activeGroupSeason.id,
    userId: user.uid,
  });
  const currentMember = group.members.find((member) => member.userId === user.uid);
  const canRecalculate =
    currentMember?.role === "OWNER" || currentMember?.role === "ADMIN";
  const { created, joined } = await searchParams;
  const progress = predictionProgress(matchResponse.matches);

  return (
    <main className="min-h-screen bg-[radial-gradient(circle_at_50%_-8%,rgba(14,122,79,0.14),transparent_30rem),linear-gradient(180deg,#FBFBF8_0%,#F1F5EF_100%)] px-5 py-6 pb-12 text-primaryText">
      <section className="mx-auto w-full max-w-lg space-y-5">
        <Link className="block text-sm font-medium text-worldCupBlue" href="/dashboard">
          Back to dashboard
        </Link>

        <Card className="overflow-hidden border-stadiumNavy/10 bg-[linear-gradient(135deg,#07111F_0%,#0B1730_62%,#0E7A4F_145%)] text-white shadow-elevated" tone="dark">
          <div className="flex items-start justify-between gap-4">
            <div>
              <p className="text-sm font-medium text-white/72">Private group</p>
              <h1 className="mt-3 break-words text-3xl font-semibold">{group.name}</h1>
              <p className="mt-3 text-base leading-7 text-white/74">
                {group.memberCount} active member{group.memberCount === 1 ? "" : "s"} competing
                on points only.
              </p>
            </div>
            <Badge tone="dark">{group.memberCount} members</Badge>
          </div>
          <ButtonLink className="mt-5 w-full focus:ring-white focus:ring-offset-stadiumNavy" href="#invite">
            Invite friends
          </ButtonLink>
        </Card>

        {created === "1" ? (
          <SuccessPrompt
            body="Your group is ready. Generate or copy the invite below so friends can join before making picks."
            title="Group created"
          />
        ) : null}

        {joined === "1" ? (
          <SuccessPrompt
            body="You are in. Review the open matches, save your predictions, then watch the leaderboard after results are scored."
            title="Joined group"
          />
        ) : null}

        <Card tone="pitch">
          <p className="text-sm font-medium text-secondaryText">Active season</p>
          <h2 className="mt-2 text-2xl font-semibold">{group.activeGroupSeason.label}</h2>
          <div className="mt-4 grid grid-cols-2 gap-3">
            <SeasonMetric label="Scoring" value={group.activeGroupSeason.scoringPreset} />
            <SeasonMetric label="Picks" value={group.activeGroupSeason.predictionMode} />
            <SeasonMetric label="Booster" value={group.activeGroupSeason.allowBooster ? "On" : "Off"} />
            <SeasonMetric label="Visibility" value={group.activeGroupSeason.predictionVisibility} />
          </div>
        </Card>

        <Card>
          <p className="text-sm font-semibold text-pitchGreen">Tournament layer</p>
          <h2 className="mt-2 text-2xl font-semibold">World Cup 2026 inside this group</h2>
          <p className="mt-2 text-sm leading-6 text-secondaryText">
            This private pool references the central tournament season. Predictions and leaderboard
            entries stay private to this group.
          </p>
          <div className="mt-4 grid grid-cols-3 gap-3">
            <SeasonMetric label="Teams" value={`${tournamentOverview.teams.length}`} />
            <SeasonMetric label="Groups" value={`${tournamentOverview.groups.length}`} />
            <SeasonMetric label="Fixtures" value={`${tournamentOverview.fixtures.length}`} />
          </div>
          <div className="mt-4 grid gap-3 sm:grid-cols-2">
            <ButtonLink href="/world-cup-2026/fixtures" variant="secondary">
              View fixtures
            </ButtonLink>
            <ButtonLink href="/world-cup-2026/bracket" variant="secondary">
              View bracket
            </ButtonLink>
          </div>
        </Card>

        <PredictionProgressSummary progress={progress} />

        <div id="invite">
          <InviteCard
            groupId={group.id}
            groupSeasonId={group.activeGroupSeason.id}
            initialInvite={group.invite}
          />
        </div>

        <ScoringExplainer />

        <PredictionEntry
          allowBooster={matchResponse.allowBooster}
          groupId={group.id}
          groupSeasonId={group.activeGroupSeason.id}
          matches={matchResponse.matches}
        />

        <GroupSeasonLeaderboard
          canRecalculate={canRecalculate}
          groupId={group.id}
          groupSeasonId={group.activeGroupSeason.id}
          previewLimit={5}
        />

        <Card>
          <h2 className="text-2xl font-semibold">Members</h2>
          <div className="mt-4 space-y-3">
            {group.members.map((member) => (
              <div
                className="flex items-center justify-between gap-3 rounded-lg border border-line bg-cardWarm p-4"
                key={member.userId}
              >
                <div>
                  <p className="font-semibold">{member.displayName ?? "Member"}</p>
                  <p className="text-sm text-secondaryText">{member.role}</p>
                </div>
                <Badge tone="green">
                  {member.status}
                </Badge>
              </div>
            ))}
          </div>
        </Card>

        <Card>
          <h2 className="text-2xl font-semibold">Group seasons</h2>
          <div className="mt-4 space-y-3">
            {seasonsResponse.seasons.map((season) => (
              <div className="rounded-lg border border-line bg-cardWarm p-4" key={season.id}>
                <p className="font-semibold">{season.label}</p>
                <p className="mt-1 text-sm text-secondaryText">{season.status}</p>
              </div>
            ))}
          </div>
          <p className="mt-4 text-sm leading-6 text-secondaryText">
            After the World Cup, you can start a new season with the same group.
          </p>
        </Card>
      </section>
    </main>
  );
}

function SuccessPrompt({ title, body }: { title: string; body: string }) {
  return (
    <Card className="border-worldCupBlue/20 bg-softSky">
      <h2 className="text-2xl font-semibold">{title}</h2>
      <p className="mt-2 text-sm leading-6 text-secondaryText">{body}</p>
    </Card>
  );
}

function PredictionProgressSummary({
  progress,
}: {
  progress: {
    total: number;
    saved: number;
    open: number;
    scored: number;
  };
}) {
  return (
    <Card>
      <p className="text-sm font-semibold text-pitchGreen">Prediction progress</p>
      <h2 className="mt-2 text-2xl font-semibold">Your picks this season</h2>
      <div className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-4">
        <SeasonMetric label="Matches" value={`${progress.total}`} />
        <SeasonMetric label="Saved" value={`${progress.saved}`} />
        <SeasonMetric label="Open" value={`${progress.open}`} />
        <SeasonMetric label="Scored" value={`${progress.scored}`} />
      </div>
    </Card>
  );
}

function ScoringExplainer() {
  const rows = [
    {
      label: "Exact Score",
      points: "3 pts",
      body: "Both teams' goals match the final 90-minute score.",
    },
    {
      label: "Goal Difference",
      points: "2 pts",
      body: "The winning margin or draw margin is correct, but not the exact score.",
    },
    {
      label: "Tendency",
      points: "1 pt",
      body: "The winner or draw is correct, but the margin is not.",
    },
    {
      label: "Miss",
      points: "0 pts",
      body: "The prediction does not match the result tendency.",
    },
  ];

  return (
    <Card>
      <p className="text-sm font-semibold text-pitchGreen">Scoring transparency</p>
      <h2 className="mt-2 text-2xl font-semibold">How points are awarded</h2>
      <div className="mt-4 space-y-3">
        {rows.map((row) => (
          <div className="rounded-lg border border-line bg-cardWarm p-4" key={row.label}>
            <div className="flex items-center justify-between gap-3">
              <h3 className="font-semibold">{row.label}</h3>
              <Badge tone="blue">{row.points}</Badge>
            </div>
            <p className="mt-2 text-sm leading-6 text-secondaryText">{row.body}</p>
          </div>
        ))}
      </div>
    </Card>
  );
}

function SeasonMetric({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-lg border border-line bg-cardWarm p-3">
      <p className="text-xs text-secondaryText">{label}</p>
      <p className="mt-1 break-words text-sm font-semibold">{value}</p>
    </div>
  );
}

function predictionProgress(
  matches: Array<{
    locked: boolean;
    prediction: unknown;
    result: { status: string } | null;
  }>,
) {
  return {
    total: matches.length,
    saved: matches.filter((match) => match.prediction !== null).length,
    open: matches.filter((match) => !match.locked).length,
    scored: matches.filter((match) => match.result?.status === "SCORED").length,
  };
}
