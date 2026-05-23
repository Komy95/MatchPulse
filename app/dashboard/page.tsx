import { redirect } from "next/navigation";
import { DashboardCommandCenter } from "@/components/dashboard/dashboard-command-center";
import { DashboardGroups } from "@/components/groups/dashboard-groups";
import { DashboardProfile } from "@/components/profile/dashboard-profile";
import { getAuthenticatedUserContext } from "@/lib/auth/user-context";
import { getUserDashboard } from "@/lib/dashboard/service";
import { listUserGroups } from "@/lib/groups/service";

export default async function DashboardPage() {
  const user = await getAuthenticatedUserContext();

  if (!user) {
    redirect("/login?next=/dashboard");
  }

  const [groups, dashboard] = await Promise.all([
    listUserGroups(user.uid),
    getUserDashboard(user.uid),
  ]);

  return (
    <main className="min-h-screen bg-[radial-gradient(circle_at_50%_-8%,rgba(14,122,79,0.14),transparent_30rem),linear-gradient(180deg,#FBFBF8_0%,#F1F5EF_100%)] px-4 py-5 text-primaryText sm:px-6 sm:py-8">
      <section className="mx-auto w-full max-w-lg space-y-5 pb-10">
        <DashboardCommandCenter dashboard={dashboard} />
        <DashboardGroups initialGroups={groups} />
        <DashboardProfile uid={user.uid} />
      </section>
    </main>
  );
}
