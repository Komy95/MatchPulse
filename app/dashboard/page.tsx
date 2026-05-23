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
    <main className="min-h-screen bg-base px-5 py-6 text-primaryText">
      <section className="mx-auto w-full max-w-md space-y-5">
        <DashboardCommandCenter dashboard={dashboard} />
        <DashboardGroups initialGroups={groups} />
        <DashboardProfile uid={user.uid} />
      </section>
    </main>
  );
}
