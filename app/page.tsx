import Image from "next/image";
import Link from "next/link";
import { Badge, ButtonLink, Card, FixtureCard } from "@/components/ui/primitives";

const featurePills = ["Private Groups", "Live Leaderboards", "Match Predictions", "World Cup 2026"];

const features = [
  {
    title: "Predict before kickoff",
    body: "Fast score entry for every fixture window, with lock timing kept clear on mobile.",
  },
  {
    title: "Private group pressure",
    body: "Invite-only standings turn each matchday into a small competition with people you know.",
  },
  {
    title: "World Cup first",
    body: "Built around the 2026 tournament rhythm, then ready for reusable seasons later.",
  },
];

const stats = [
  { label: "World Cup fixtures", value: "104" },
  { label: "Scoring preset", value: "3-2-1" },
  { label: "Primary mode", value: "Private" },
];

const leaderboardRows = [
  { name: "Maya", points: 24, rank: 1 },
  { name: "Jonas", points: 21, rank: 2 },
  { name: "Sofia", points: 18, rank: 3 },
];

export default function HomePage() {
  return (
    <main className="min-h-screen bg-nightNavy text-white">
      <section className="relative min-h-screen overflow-hidden">
        <Image
          alt=""
          className="absolute inset-0 h-full w-full scale-105 object-cover"
          fill
          priority
          sizes="100vw"
          src="/images/auth/hero-worldcup-2026.webp"
        />
        <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(2,7,18,0.82)_0%,rgba(2,7,18,0.42)_42%,rgba(2,7,18,0.94)_100%)]" />
        <div className="absolute inset-x-0 bottom-0 h-56 bg-[linear-gradient(180deg,transparent_0%,#020712_82%)]" />

        <div className="relative z-10 mx-auto flex min-h-screen w-full max-w-7xl flex-col px-4 py-5 sm:px-6 sm:py-8 lg:px-8">
          <header className="flex items-center justify-between">
            <Link
              className="text-lg font-semibold tracking-[0.01em] focus:outline-none focus:ring-2 focus:ring-white focus:ring-offset-2 focus:ring-offset-stadiumNavy"
              href="/"
            >
              MatchPulse
            </Link>
            <ButtonLink className="min-h-10 px-4 py-2" href="/login" variant="dark">
              Sign in
            </ButtonLink>
          </header>

          <div className="grid flex-1 items-end gap-10 pb-8 pt-16 lg:grid-cols-[minmax(0,1fr)_430px] lg:pb-14 lg:pt-20">
            <div className="max-w-3xl">
              <p className="text-sm font-semibold text-white/78">World Cup 2026 Predictions</p>
              <h1 className="mt-4 text-5xl font-semibold leading-[0.98] tracking-normal text-white sm:text-7xl lg:text-8xl">
                Make every fixture count.
              </h1>
              <p className="mt-6 max-w-xl text-lg leading-8 text-white/82 sm:text-xl sm:leading-9">
                Create a private matchday table, lock in score predictions and track the World Cup
                with a calm, mobile-first dashboard.
              </p>

              <div className="mt-8 grid gap-3 sm:flex sm:flex-wrap">
                <ButtonLink className="min-h-14 px-6 py-4 text-base" href="/register">
                  Create account
                </ButtonLink>
                <ButtonLink className="min-h-14 px-6 py-4 text-base" href="/login" variant="dark">
                  Sign in
                </ButtonLink>
              </div>

              <div className="mt-7 flex flex-wrap gap-2">
                {featurePills.map((pill) => (
                  <Badge className="min-h-9" key={pill} tone="dark">
                    {pill}
                  </Badge>
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
            <p className="text-sm font-semibold text-pitchGreen">Built for matchday</p>
            <h2 className="mt-3 text-4xl font-semibold leading-tight sm:text-5xl">
              A private World Cup table that feels alive without feeling loud.
            </h2>
          </div>

          <div className="mt-8 grid gap-4 md:grid-cols-3">
            {features.map((feature) => (
              <Card className="border-white/12 bg-white/[0.07]" key={feature.title} tone="dark">
                <div className="mb-8 h-1.5 w-12 rounded-full bg-pitchGreen" />
                <h3 className="text-2xl font-semibold">{feature.title}</h3>
                <p className="mt-3 text-base leading-7 text-white/72">{feature.body}</p>
              </Card>
            ))}
          </div>
        </div>
      </section>

      <section className="px-4 py-10 sm:px-6 lg:px-8">
        <div className="mx-auto grid max-w-7xl gap-4 rounded-lg border border-white/12 bg-white/[0.06] p-5 shadow-elevated backdrop-blur-md sm:grid-cols-3 sm:p-8">
          {stats.map((stat) => (
            <div className="rounded-md border border-white/10 bg-white/[0.06] p-5" key={stat.label}>
              <p className="text-4xl font-semibold tabular-nums sm:text-5xl">{stat.value}</p>
              <p className="mt-2 text-sm font-semibold text-white/68">{stat.label}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="px-4 py-16 sm:px-6 sm:py-24 lg:px-8">
        <div className="mx-auto max-w-4xl rounded-lg border border-white/14 bg-[linear-gradient(135deg,rgba(14,122,79,0.22),rgba(255,255,255,0.07)_52%,rgba(27,77,255,0.18)_100%)] p-6 text-center shadow-elevated backdrop-blur-md sm:p-10">
          <h2 className="text-4xl font-semibold leading-tight sm:text-6xl">
            Ready for World Cup 2026?
          </h2>
          <p className="mx-auto mt-4 max-w-xl text-lg leading-8 text-white/76">
            Start a private group and make each fixture a reason to check back.
          </p>
          <ButtonLink className="mt-8 min-h-14 px-7 py-4 text-base" href="/register">
            Create account
          </ButtonLink>
        </div>
      </section>
    </main>
  );
}

function LandingPreview() {
  return (
    <div className="hidden lg:block">
      <div className="rounded-lg border border-white/22 bg-white/12 p-5 shadow-elevated backdrop-blur-xl">
        <FixtureCard className="border-white/16 bg-white/[0.92] text-primaryText shadow-elevated">
          <p className="text-sm font-semibold text-pitchGreen">Tonight&apos;s pick</p>
          <div className="mt-4 grid grid-cols-[1fr_auto_1fr] items-center gap-3">
            <TeamScore name="Canada" score="2" />
            <span className="text-sm font-semibold text-secondaryText">vs</span>
            <TeamScore name="Japan" score="1" />
          </div>
          <div className="mt-4 rounded-md border border-worldCupBlue/15 bg-softSky px-4 py-3 text-sm font-semibold text-primaryText">
            Locks in 2h 14m
          </div>
        </FixtureCard>

        <div className="mt-4 rounded-lg border border-white/16 bg-white/[0.92] p-4 text-primaryText shadow-elevated">
          <div className="flex items-center justify-between">
            <p className="text-sm font-semibold text-pitchGreen">Live leaderboard</p>
            <Badge tone="green">Matchday 3</Badge>
          </div>
          <div className="mt-4 space-y-3">
            {leaderboardRows.map((row) => (
              <div className="flex items-center gap-3" key={row.name}>
                <div className="flex h-9 w-9 items-center justify-center rounded-full border border-worldCupBlue/20 bg-softSky text-sm font-semibold tabular-nums text-worldCupBlue">
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
  );
}

function TeamScore({ name, score }: { name: string; score: string }) {
  return (
    <div className="rounded-md border border-line bg-cardWarm p-3 text-center">
      <p className="text-sm font-semibold">{name}</p>
      <p className="mt-2 text-4xl font-semibold tabular-nums">{score}</p>
    </div>
  );
}
