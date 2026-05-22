import { redirect } from "next/navigation";
import { JoinGroupForm } from "@/components/groups/join-group-form";
import { getAuthenticatedUserContext } from "@/lib/auth/user-context";

export default async function JoinPage({
  searchParams,
}: {
  searchParams: Promise<{ code?: string }>;
}) {
  const user = await getAuthenticatedUserContext();

  if (!user) {
    redirect("/login?next=/join");
  }

  const { code } = await searchParams;

  return (
    <main className="min-h-screen bg-base px-5 py-6 text-primaryText">
      <section className="mx-auto w-full max-w-md space-y-5">
        <div className="rounded-xl border border-borderSoft bg-card p-6 shadow-[0_18px_60px_rgba(17,17,17,0.06)]">
          <p className="text-sm font-medium text-worldCupBlue">Join group</p>
          <h1 className="mt-3 text-3xl font-semibold">Enter your invite code.</h1>
          <p className="mt-3 text-base leading-7 text-secondaryText">
            A valid invite adds you to the reusable group and its active World Cup season.
          </p>
        </div>

        <JoinGroupForm initialCode={code ?? ""} />
      </section>
    </main>
  );
}
