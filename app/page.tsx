import Link from "next/link";

const foundationChecks = [
  "Private group score predictions",
  "Hybrid 3-2-1 scoring",
  "World Cup 2026 first",
  "No betting or cash pools",
];

export default function HomePage() {
  return (
    <main className="min-h-screen bg-base px-4 py-5 text-primaryText sm:px-6 sm:py-8">
      <section className="mx-auto flex min-h-[calc(100vh-2.5rem)] w-full max-w-md flex-col justify-between rounded-xl border border-borderSoft bg-card p-6 shadow-[0_18px_60px_rgba(17,17,17,0.06)] sm:min-h-[calc(100vh-4rem)] sm:p-8">
        <div className="space-y-7">
          <div className="space-y-4">
            <p className="text-sm font-semibold text-worldCupBlue">MatchPulse</p>
            <h1 className="text-4xl font-semibold leading-tight sm:text-[2.75rem]">
              Predict the World Cup with your people.
            </h1>
            <p className="text-lg leading-8 text-secondaryText">
              Create private groups, save score picks, and follow calm leaderboards for FIFA World
              Cup 2026.
            </p>
          </div>

          <div className="grid gap-3">
            <Link
              className="min-h-14 rounded-md bg-worldCupBlue px-5 py-4 text-center text-base font-semibold text-white shadow-[0_10px_24px_rgba(27,77,255,0.18)] transition hover:bg-[#1742d6] focus:outline-none focus:ring-2 focus:ring-worldCupBlue focus:ring-offset-2"
              href="/register"
            >
              Create account
            </Link>
            <Link
              className="min-h-14 rounded-md border border-borderSoft bg-card px-5 py-4 text-center text-base font-semibold transition hover:bg-softSky focus:outline-none focus:ring-2 focus:ring-worldCupBlue focus:ring-offset-2"
              href="/login"
            >
              Sign in
            </Link>
          </div>

          <div className="grid gap-3">
            {foundationChecks.map((item) => (
              <div
                key={item}
                className="rounded-lg border border-borderSoft bg-base px-4 py-3 text-base font-medium"
              >
                {item}
              </div>
            ))}
          </div>
        </div>

        <div className="mt-10 rounded-lg bg-softSky px-4 py-3 text-sm leading-6 text-primaryText">
          Built mobile-first for invite links, matchday picks, and private standings.
        </div>
      </section>
    </main>
  );
}
