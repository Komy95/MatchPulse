import Link from "next/link";
import { redirect } from "next/navigation";
import { InviteCard } from "@/components/groups/invite-card";
import { GroupSeasonLeaderboard } from "@/components/leaderboard/group-season-leaderboard";
import { PredictionEntry } from "@/components/predictions/prediction-entry";
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
    <main className="min-h-screen bg-base px-5 py-6 pb-12 text-primaryText">
      <section className="mx-auto w-full max-w-md space-y-5">
        <Link className="block text-sm font-medium text-worldCupBlue" href="/dashboard">
          Back to dashboard
        </Link>

        <div className="rounded-xl border border-borderSoft bg-card p-6 shadow-[0_18px_60px_rgba(17,17,17,0.06)]">
          <p className="text-sm font-medium text-worldCupBlue">Private group</p>
          <h1 className="mt-3 break-words text-3xl font-semibold">{group.name}</h1>
          <p className="mt-3 text-base leading-7 text-secondaryText">
            Reusable group with {group.memberCount} active member
            {group.memberCount === 1 ? "" : "s"}.
          </p>
        </div>

        <section className="rounded-xl border border-borderSoft bg-card p-6 shadow-[0_18px_60px_rgba(17,17,17,0.06)]">
          <p className="text-sm font-medium text-secondaryText">Active season</p>
          <h2 className="mt-2 text-2xl font-semibold">{group.activeGroupSeason.label}</h2>
          <div className="mt-4 grid grid-cols-2 gap-3">
            <SeasonMetric label="Scoring" value={group.activeGroupSeason.scoringPreset} />
            <SeasonMetric label="Picks" value={group.activeGroupSeason.predictionMode} />
            <SeasonMetric label="Booster" value={group.activeGroupSeason.allowBooster ? "On" : "Off"} />
            <SeasonMetric label="Visibility" value={group.activeGroupSeason.predictionVisibility} />
          </div>
        </section>

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

        <section className="rounded-xl border border-borderSoft bg-card p-6 shadow-[0_18px_60px_rgba(17,17,17,0.06)]">
          <h2 className="text-2xl font-semibold">Members</h2>
          <div className="mt-4 space-y-3">
            {group.members.map((member) => (
              <div
                className="flex items-center justify-between gap-3 rounded-lg border border-borderSoft bg-base p-4"
                key={member.userId}
              >
                <div>
                  <p className="font-semibold">{member.displayName ?? "Member"}</p>
                  <p className="text-sm text-secondaryText">{member.role}</p>
                </div>
                <span className="rounded-full bg-softGreen px-3 py-1 text-xs font-medium">
                  {member.status}
                </span>
              </div>
            ))}
          </div>
        </section>

        <section className="rounded-xl border border-borderSoft bg-card p-6 shadow-[0_18px_60px_rgba(17,17,17,0.06)]">
          <h2 className="text-2xl font-semibold">Group seasons</h2>
          <div className="mt-4 space-y-3">
            {seasonsResponse.seasons.map((season) => (
              <div className="rounded-lg border border-borderSoft bg-base p-4" key={season.id}>
                <p className="font-semibold">{season.label}</p>
                <p className="mt-1 text-sm text-secondaryText">{season.status}</p>
              </div>
            ))}
          </div>
          <p className="mt-4 text-sm leading-6 text-secondaryText">
            After the World Cup, you can start a new season with the same group.
          </p>
        </section>

        <section className="rounded-xl border border-borderSoft bg-card p-6 shadow-[0_18px_60px_rgba(17,17,17,0.06)]">
          <h2 className="text-2xl font-semibold">Coming next</h2>
          <div className="mt-4 grid grid-cols-2 gap-3">
            {futureTabs.map((tab) => (
              <button
                className="rounded-md border border-borderSoft bg-base px-4 py-3 text-sm font-semibold text-secondaryText"
                disabled
                key={tab}
                type="button"
              >
                {tab}
              </button>
            ))}
          </div>
        </section>
      </section>
    </main>
  );
}

function SeasonMetric({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-lg border border-borderSoft bg-base p-3">
      <p className="text-xs text-secondaryText">{label}</p>
      <p className="mt-1 break-words text-sm font-semibold">{value}</p>
    </div>
  );
}
