import { redirect } from "next/navigation";
import { CreateGroupForm } from "@/components/groups/create-group-form";
import { getAuthenticatedUserContext } from "@/lib/auth/user-context";

export default async function NewGroupPage() {
  const user = await getAuthenticatedUserContext();

  if (!user) {
    redirect("/login?next=/groups/new");
  }

  return (
    <main className="min-h-screen bg-base px-5 py-6 text-primaryText">
      <section className="mx-auto w-full max-w-md space-y-5">
        <div className="rounded-xl border border-borderSoft bg-card p-6 shadow-[0_18px_60px_rgba(17,17,17,0.06)]">
          <p className="text-sm font-medium text-worldCupBlue">New group</p>
          <h1 className="mt-3 text-3xl font-semibold">Create a reusable group.</h1>
          <p className="mt-3 text-base leading-7 text-secondaryText">
            Your first season is FIFA World Cup 2026. After the tournament, this same group can
            start another season with the same members.
          </p>
        </div>

        <CreateGroupForm />
      </section>
    </main>
  );
}
