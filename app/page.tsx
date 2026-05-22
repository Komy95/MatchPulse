const foundationChecks = [
  "Next.js 15 App Router",
  "TypeScript strict mode",
  "Tailwind CSS",
  "Firebase client and Admin SDK helpers",
  "Auth and Firestore emulator configuration",
  "Cloud Run-compatible standalone build",
];

export default function HomePage() {
  return (
    <main className="min-h-screen bg-base px-5 py-6 text-primaryText">
      <section className="mx-auto flex min-h-[calc(100vh-3rem)] w-full max-w-md flex-col justify-between rounded-xl border border-borderSoft bg-card p-6 shadow-[0_18px_60px_rgba(17,17,17,0.06)]">
        <div className="space-y-8">
          <div className="space-y-3">
            <p className="text-sm font-medium text-worldCupBlue">Sprint 1 foundation</p>
            <h1 className="text-4xl font-semibold tracking-[-0.02em]">
              MatchPulse is ready for local setup.
            </h1>
            <p className="text-base leading-7 text-secondaryText">
              Mobile-first PWA foundation for the World Cup 2026 prediction experience.
            </p>
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
          Health endpoint: <span className="font-mono tabular-nums">/api/health</span>
        </div>
      </section>
    </main>
  );
}
