import Link from "next/link";
import { redirect } from "next/navigation";
import { InviteCard } from "@/components/groups/invite-card";
import { GroupSeasonLeaderboard } from "@/components/leaderboard/group-season-leaderboard";
import { PredictionEntry } from "@/components/predictions/prediction-entry";
import { Badge, Card } from "@/components/ui/primitives";
import { getAuthenticatedUserContext } from "@/lib/auth/user-context";
import { getGroupDetail, listGroupSeasons } from "@/lib/groups/service";
import { listGroupSeasonMatchesWithPredictions } from "@/lib/predictions/service";

const futureTabs = ["Insights", "Settings"];

export default async function GroupDetailPage({
  params,
}: {
  params: Promise<{ groupId: string }>;
}) {
  const user = await getAuthenticatedUserContext();

  if (!user) {
    redirect("/login");
  }

  const { groupId } = await params;
  const [group, seasonsResponse] = await Promise.all([
    getGroupDetail(groupId, user.uid),
    listGroupSeasons(groupId, user.uid),
  ]);
  const matchResponse = await listGroupSeasonMatchesWithPredictions({
    groupId,
    groupSeasonId: group.activeGroupSeason.id,
    userId: user.uid,
  });
  const currentMember = group.members.find((member) => member.userId === user.uid);
  const canRecalculate =
    currentMember?.role === "OWNER" || currentMember?.role === "ADMIN";

  return (
    <main className="min-h-screen bg-[radial-gradient(circle_at_50%_-8%,rgba(14,122,79,0.14),transparent_30rem),linear-gradient(180deg,#FBFBF8_0%,#F1F5EF_100%)] px-5 py-6 pb-12 text-primaryText">
      <section className="mx-auto w-full max-w-lg space-y-5">
        <Link className="block text-sm font-medium text-worldCupBlue" href="/dashboard">
          Back to dashboard
        </Link>

        <Card className="overflow-hidden border-stadiumNavy/10 bg-[linear-gradient(135deg,#07111F_0%,#0B1730_62%,#0E7A4F_145%)] text-white shadow-elevated" tone="dark">
          <p className="text-sm font-medium text-white/72">Private group</p>
          <h1 className="mt-3 break-words text-3xl font-semibold">{group.name}</h1>
          <p className="mt-3 text-base leading-7 text-white/74">
            Reusable group with {group.memberCount} active member
            {group.memberCount === 1 ? "" : "s"}.
          </p>
        </Card>

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

        <InviteCard
          groupId={group.id}
          groupSeasonId={group.activeGroupSeason.id}
          initialInvite={group.invite}
        />

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

        <Card>
          <h2 className="text-2xl font-semibold">Coming next</h2>
          <div className="mt-4 grid grid-cols-2 gap-3">
            {futureTabs.map((tab) => (
              <button
                className="rounded-md border border-borderSoft bg-cardWarm px-4 py-3 text-sm font-semibold text-secondaryText"
                disabled
                key={tab}
                type="button"
              >
                {tab}
              </button>
            ))}
          </div>
        </Card>
      </section>
    </main>
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
