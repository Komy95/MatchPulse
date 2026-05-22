import { redirect } from "next/navigation";
import { DashboardGroups } from "@/components/groups/dashboard-groups";
import { DashboardProfile } from "@/components/profile/dashboard-profile";
import { getAuthenticatedUserContext } from "@/lib/auth/user-context";
import { listUserGroups } from "@/lib/groups/service";

export default async function DashboardPage() {
  const user = await getAuthenticatedUserContext();

  if (!user) {
    redirect("/login?next=/dashboard");
  }

  const groups = await listUserGroups(user.uid);

  return (
    <main className="min-h-screen bg-base px-5 py-6 text-primaryText">
      <section className="mx-auto w-full max-w-md space-y-5">
        <div className="rounded-xl border border-borderSoft bg-card p-6 shadow-[0_18px_60px_rgba(17,17,17,0.06)]">
          <p className="text-sm font-medium text-worldCupBlue">Dashboard</p>
          <h1 className="mt-3 text-3xl font-semibold">Your World Cup command center.</h1>
          <p className="mt-3 text-base leading-7 text-secondaryText">
            Create or join reusable groups, then come back for picks and standings as the
            tournament gets closer.
          </p>
        </div>

        <DashboardGroups initialGroups={groups} />
        <DashboardProfile uid={user.uid} />
      </section>
    </main>
  );
}
