import Link from "next/link";

const foundationChecks = [
  "Google sign-in",
  "Email/password sign-in when enabled",
  "Protected dashboard",
  "User profile bootstrap",
  "Profile-focused Firestore rules",
  "Auth context and logout",
];

export default function HomePage() {
  return (
    <main className="min-h-screen bg-base px-5 py-6 text-primaryText">
      <section className="mx-auto flex min-h-[calc(100vh-3rem)] w-full max-w-md flex-col justify-between rounded-xl border border-borderSoft bg-card p-6 shadow-[0_18px_60px_rgba(17,17,17,0.06)]">
        <div className="space-y-8">
          <div className="space-y-3">
            <p className="text-sm font-medium text-worldCupBlue">Sprint 2 auth</p>
            <h1 className="text-4xl font-semibold tracking-[-0.02em]">
              MatchPulse accounts are ready for local testing.
            </h1>
            <p className="text-base leading-7 text-secondaryText">
              Sign in, bootstrap your profile, and enter the protected dashboard.
            </p>
          </div>

          <div className="grid gap-3">
            <Link
              className="rounded-md bg-worldCupBlue px-5 py-4 text-center text-base font-semibold text-white transition hover:bg-[#1742d6] focus:outline-none focus:ring-2 focus:ring-worldCupBlue focus:ring-offset-2"
              href="/login"
            >
              Sign in
            </Link>
            <Link
              className="rounded-md border border-borderSoft bg-card px-5 py-4 text-center text-base font-semibold transition hover:bg-softSky focus:outline-none focus:ring-2 focus:ring-worldCupBlue focus:ring-offset-2"
              href="/dashboard"
            >
              Open dashboard
            </Link>
          </div>

          <div className="space-y-3">
            {foundationChecks.map((item) => (
              <div
                key={item}
                className="rounded-lg border border-borderSoft bg-base px-4 py-3 text-sm"
              >
                {item}
              </div>
            ))}
          </div>
        </div>

        <div className="mt-10 rounded-lg bg-softSky px-4 py-3 text-sm text-primaryText">
          Local emulators: <span className="font-mono tabular-nums">Auth + Firestore</span>
        </div>
      </section>
    </main>
  );
}
