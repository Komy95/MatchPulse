import Image from "next/image";
import type { ReactNode } from "react";

type AuthOnboardingShellProps = {
  children: ReactNode;
  eyebrow: string;
  title: string;
  body: string;
};

const badges = ["Private Groups", "World Cup 2026", "Live Leaderboards"];

export function AuthOnboardingShell({
  children,
  eyebrow,
  title,
  body,
}: AuthOnboardingShellProps) {
  return (
    <main className="relative min-h-screen overflow-hidden bg-primaryText text-white">
      <Image
        alt=""
        className="absolute inset-0 h-full w-full object-cover"
        fill
        priority
        sizes="100vw"
        src="/images/auth/hero-worldcup-2026.webp"
      />
      <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(0,0,0,0.58)_0%,rgba(0,0,0,0.28)_38%,rgba(0,0,0,0.78)_100%)]" />
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_24%,rgba(27,77,255,0.24),transparent_34%)]" />

      <section className="relative z-10 mx-auto flex min-h-screen w-full max-w-6xl flex-col px-4 py-5 sm:px-6 sm:py-8 lg:grid lg:grid-cols-[1fr_440px] lg:items-end lg:gap-10 lg:py-10">
        <div className="flex min-h-[42vh] flex-1 flex-col justify-between lg:min-h-[calc(100vh-5rem)]">
          <div className="flex items-center justify-between">
            <p className="text-lg font-semibold tracking-[0.01em]">MatchPulse</p>
            <p className="rounded-full border border-white/20 bg-white/12 px-3 py-2 text-xs font-semibold text-white shadow-[0_12px_32px_rgba(0,0,0,0.16)] backdrop-blur-md">
              No betting
            </p>
          </div>

          <div className="max-w-xl pb-8 pt-20 lg:pb-12">
            <p className="text-sm font-semibold text-white/82">{eyebrow}</p>
            <h1 className="mt-4 text-5xl font-semibold leading-[0.98] tracking-normal text-white sm:text-6xl lg:text-7xl">
              Predict every match.
            </h1>
            <p className="mt-5 max-w-md text-lg leading-8 text-white/88 sm:text-xl sm:leading-9">
              Create private groups, compete with friends and climb the World Cup leaderboard.
            </p>
            <div className="mt-6 flex flex-wrap gap-2">
              {badges.map((badge) => (
                <span
                  className="rounded-full border border-white/20 bg-white/14 px-3 py-2 text-sm font-semibold text-white shadow-[0_12px_32px_rgba(0,0,0,0.14)] backdrop-blur-md"
                  key={badge}
                >
                  <span aria-hidden="true">✓ </span>
                  {badge}
                </span>
              ))}
            </div>
          </div>
        </div>

        <div className="rounded-xl border border-white/26 bg-white/88 p-5 text-primaryText shadow-[0_24px_80px_rgba(0,0,0,0.32)] backdrop-blur-xl sm:p-6 lg:mb-2">
          <div className="mb-5 space-y-2">
            <p className="text-sm font-semibold text-worldCupBlue">{title}</p>
            <h2 className="text-2xl font-semibold leading-tight">{body}</h2>
          </div>
          {children}
        </div>
      </section>
    </main>
  );
}
