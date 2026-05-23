import Image from "next/image";
import Link from "next/link";

const featurePills = ["Private Groups", "Live Leaderboards", "Match Predictions", "World Cup 2026"];

const features = [
  {
    title: "Private Groups",
    body: "Create invite-only prediction competitions for friends, family and work leagues.",
  },
  {
    title: "Live Standings",
    body: "Follow rankings after every matchday with a calm leaderboard built for quick checks.",
  },
  {
    title: "Mobile First",
    body: "Designed for fast score predictions from any device before the next match locks.",
  },
];

const stats = [
  { label: "Groups Created", value: "2.4K" },
  { label: "Predictions Made", value: "86K" },
  { label: "Matches Tracked", value: "104" },
];

const leaderboardRows = [
  { name: "Maya", points: 24, rank: 1 },
  { name: "Jonas", points: 21, rank: 2 },
  { name: "Sofia", points: 18, rank: 3 },
];

export default function HomePage() {
  return (
    <main className="min-h-screen bg-[#05070D] text-white">
      <section className="relative min-h-screen overflow-hidden">
        <Image
          alt=""
          className="absolute inset-0 h-full w-full scale-105 object-cover blur-[1px]"
          fill
          priority
          sizes="100vw"
          src="/images/auth/hero-worldcup-2026.webp"
        />
        <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(2,4,10,0.78)_0%,rgba(2,4,10,0.38)_44%,rgba(2,4,10,0.92)_100%)]" />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_62%_28%,rgba(27,77,255,0.32),transparent_34%)]" />

        <div className="relative z-10 mx-auto flex min-h-screen w-full max-w-7xl flex-col px-4 py-5 sm:px-6 sm:py-8 lg:px-8">
          <header className="flex items-center justify-between">
            <Link
              className="text-lg font-semibold tracking-[0.01em] focus:outline-none focus:ring-2 focus:ring-white focus:ring-offset-2 focus:ring-offset-primaryText"
              href="/"
            >
              MatchPulse
            </Link>
            <Link
              className="rounded-full border border-white/18 bg-[#0B2EA8] px-4 py-2.5 text-sm font-semibold text-white shadow-[0_12px_32px_rgba(11,46,168,0.34)] transition hover:bg-[#1742d6] focus:outline-none focus:ring-2 focus:ring-white focus:ring-offset-2 focus:ring-offset-primaryText"
              href="/login"
            >
              Sign in
            </Link>
          </header>

          <div className="grid flex-1 items-end gap-10 pb-8 pt-16 lg:grid-cols-[minmax(0,1fr)_430px] lg:pb-14 lg:pt-20">
            <div className="max-w-3xl">
              <p className="text-sm font-semibold text-white/82">World Cup 2026 Predictions</p>
              <h1 className="mt-4 text-5xl font-semibold leading-[0.98] tracking-normal text-white sm:text-7xl lg:text-8xl">
                Predict every match.
              </h1>
              <p className="mt-6 max-w-xl text-lg leading-8 text-white/88 sm:text-xl sm:leading-9">
                Create private groups, challenge friends and climb the World Cup leaderboard.
              </p>

              <div className="mt-8 grid gap-3 sm:flex sm:flex-wrap">
                <Link
                  className="min-h-14 rounded-md bg-worldCupBlue px-6 py-4 text-center text-base font-semibold text-white shadow-[0_18px_44px_rgba(27,77,255,0.34)] transition hover:bg-[#1742d6] focus:outline-none focus:ring-2 focus:ring-white focus:ring-offset-2 focus:ring-offset-primaryText"
                  href="/register"
                >
                  Create account
                </Link>
                <Link
                  className="min-h-14 rounded-md border border-white/18 bg-[#0B2EA8] px-6 py-4 text-center text-base font-semibold text-white shadow-[0_18px_44px_rgba(11,46,168,0.34)] transition hover:bg-[#1742d6] focus:outline-none focus:ring-2 focus:ring-white focus:ring-offset-2 focus:ring-offset-primaryText"
                  href="/login"
                >
                  Sign in
                </Link>
              </div>

              <div className="mt-7 flex flex-wrap gap-2">
                {featurePills.map((pill) => (
                  <span
                    className="rounded-full border border-white/20 bg-white/14 px-3 py-2 text-sm font-semibold text-white shadow-[0_12px_32px_rgba(0,0,0,0.14)] backdrop-blur-md"
                    key={pill}
                  >
                    <span aria-hidden="true">✓ </span>
                    {pill}
                  </span>
                ))}
              </div>
            </div>

            <LandingPreview />
          </div>
        </div>
      </section>

      <section className="px-4 py-16 sm:px-6 sm:py-20 lg:px-8">
        <div className="mx-auto max-w-7xl">
          <div className="max-w-2xl">
            <p className="text-sm font-semibold text-worldCupBlue">Built for matchday</p>
            <h2 className="mt-3 text-4xl font-semibold leading-tight sm:text-5xl">
              Everything you need for a private World Cup prediction league.
            </h2>
          </div>

          <div className="mt-8 grid gap-4 md:grid-cols-3">
            {features.map((feature) => (
              <article
                className="rounded-xl border border-white/12 bg-white/[0.07] p-6 shadow-[0_24px_80px_rgba(0,0,0,0.22)] backdrop-blur-md"
                key={feature.title}
              >
                <div className="mb-8 h-1.5 w-12 rounded-full bg-worldCupBlue" />
                <h3 className="text-2xl font-semibold">{feature.title}</h3>
                <p className="mt-3 text-base leading-7 text-white/72">{feature.body}</p>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className="px-4 py-10 sm:px-6 lg:px-8">
        <div className="mx-auto grid max-w-7xl gap-4 rounded-xl border border-white/12 bg-white/[0.06] p-5 shadow-[0_24px_80px_rgba(0,0,0,0.22)] backdrop-blur-md sm:grid-cols-3 sm:p-8">
          {stats.map((stat) => (
            <div className="rounded-lg border border-white/10 bg-white/[0.06] p-5" key={stat.label}>
              <p className="text-4xl font-semibold tabular-nums sm:text-5xl">{stat.value}</p>
              <p className="mt-2 text-sm font-semibold text-white/68">{stat.label}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="px-4 py-16 sm:px-6 sm:py-24 lg:px-8">
        <div className="mx-auto max-w-4xl rounded-xl border border-white/14 bg-[radial-gradient(circle_at_50%_0%,rgba(27,77,255,0.24),rgba(255,255,255,0.07)_44%,rgba(255,255,255,0.05)_100%)] p-6 text-center shadow-[0_28px_100px_rgba(0,0,0,0.3)] backdrop-blur-md sm:p-10">
          <h2 className="text-4xl font-semibold leading-tight sm:text-6xl">
            Ready for World Cup 2026?
          </h2>
          <p className="mx-auto mt-4 max-w-xl text-lg leading-8 text-white/76">
            Start a private group now and make every matchday feel personal.
          </p>
          <Link
            className="mt-8 inline-flex min-h-14 items-center justify-center rounded-md bg-worldCupBlue px-7 py-4 text-base font-semibold text-white shadow-[0_18px_44px_rgba(27,77,255,0.34)] transition hover:bg-[#1742d6] focus:outline-none focus:ring-2 focus:ring-white focus:ring-offset-2 focus:ring-offset-primaryText"
            href="/register"
          >
            Create account
          </Link>
        </div>
      </section>
    </main>
  );
}

function LandingPreview() {
  return (
    <div className="hidden lg:block">
      <div className="relative">
        <div className="absolute -left-10 top-10 h-40 w-40 rounded-full bg-worldCupBlue/30 blur-3xl" />
        <div className="relative rounded-xl border border-white/22 bg-white/12 p-5 shadow-[0_30px_100px_rgba(0,0,0,0.38)] backdrop-blur-xl">
          <div className="rounded-lg border border-white/16 bg-white/88 p-4 text-primaryText shadow-[0_20px_60px_rgba(0,0,0,0.26)]">
            <p className="text-sm font-semibold text-worldCupBlue">Tonight&apos;s pick</p>
            <div className="mt-4 grid grid-cols-[1fr_auto_1fr] items-center gap-3">
              <TeamScore name="Canada" score="2" />
              <span className="text-sm font-semibold text-secondaryText">vs</span>
              <TeamScore name="Japan" score="1" />
            </div>
            <div className="mt-4 rounded-md bg-softSky px-4 py-3 text-sm font-semibold text-primaryText">
              Locks in 2h 14m
            </div>
          </div>

          <div className="mt-4 rounded-lg border border-white/16 bg-white/88 p-4 text-primaryText shadow-[0_20px_60px_rgba(0,0,0,0.22)]">
            <div className="flex items-center justify-between">
              <p className="text-sm font-semibold text-worldCupBlue">Live leaderboard</p>
              <p className="rounded-full bg-softGreen px-3 py-1 text-xs font-semibold">Matchday 3</p>
            </div>
            <div className="mt-4 space-y-3">
              {leaderboardRows.map((row) => (
                <div className="flex items-center gap-3" key={row.name}>
                  <div className="flex h-9 w-9 items-center justify-center rounded-full bg-softSky text-sm font-semibold tabular-nums">
                    {row.rank}
                  </div>
                  <p className="flex-1 font-semibold">{row.name}</p>
                  <p className="font-semibold tabular-nums">{row.points} pts</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function TeamScore({ name, score }: { name: string; score: string }) {
  return (
    <div className="rounded-md border border-borderSoft bg-base p-3 text-center">
      <p className="text-sm font-semibold">{name}</p>
      <p className="mt-2 text-4xl font-semibold tabular-nums">{score}</p>
    </div>
  );
}
