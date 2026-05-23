import { redirect } from "next/navigation";
import { JoinGroupForm } from "@/components/groups/join-group-form";
import { Card } from "@/components/ui/primitives";
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
    <main className="min-h-screen bg-[radial-gradient(circle_at_50%_0%,rgba(14,122,79,0.14),transparent_28rem),linear-gradient(180deg,#FBFBF8_0%,#F1F5EF_100%)] px-5 py-6 text-primaryText">
      <section className="mx-auto w-full max-w-md space-y-5">
        <Card>
          <p className="text-sm font-medium text-worldCupBlue">Join group</p>
          <h1 className="mt-3 text-3xl font-semibold leading-tight">Enter your invite code.</h1>
          <p className="mt-3 text-base leading-7 text-secondaryText">
            A valid invite adds you to the reusable group and its active World Cup season.
          </p>
        </Card>

        <JoinGroupForm initialCode={code ?? ""} />
      </section>
    </main>
  );
}
