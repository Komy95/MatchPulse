import { redirect } from "next/navigation";
import { CreateGroupForm } from "@/components/groups/create-group-form";
import { Card } from "@/components/ui/primitives";
import { getAuthenticatedUserContext } from "@/lib/auth/user-context";

export default async function NewGroupPage() {
  const user = await getAuthenticatedUserContext();

  if (!user) {
    redirect("/login?next=/groups/new");
  }

  return (
    <main className="min-h-screen bg-[radial-gradient(circle_at_50%_0%,rgba(14,122,79,0.14),transparent_28rem),linear-gradient(180deg,#FBFBF8_0%,#F1F5EF_100%)] px-5 py-6 text-primaryText">
      <section className="mx-auto w-full max-w-md space-y-5">
        <Card>
          <p className="text-sm font-medium text-worldCupBlue">New group</p>
          <h1 className="mt-3 text-3xl font-semibold leading-tight">
            Build your private matchday room.
          </h1>
          <p className="mt-3 text-base leading-7 text-secondaryText">
            Your first season is FIFA World Cup 2026. After the tournament, this same group can
            start another season with the same members.
          </p>
        </Card>

        <CreateGroupForm />
      </section>
    </main>
  );
}
