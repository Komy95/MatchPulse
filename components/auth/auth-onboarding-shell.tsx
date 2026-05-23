import Image from "next/image";
import type { ReactNode } from "react";
import { Badge, Card } from "@/components/ui/primitives";

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
    <main className="relative min-h-screen overflow-hidden bg-stadiumNavy text-white">
      <Image
        alt=""
        className="absolute inset-0 h-full w-full object-cover"
        fill
        priority
        sizes="100vw"
        src="/images/auth/hero-worldcup-2026.webp"
      />
      <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(2,7,18,0.66)_0%,rgba(2,7,18,0.34)_38%,rgba(2,7,18,0.86)_100%)]" />
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_24%,rgba(14,122,79,0.22),transparent_32%)]" />

      <section className="relative z-10 mx-auto flex min-h-screen w-full max-w-6xl flex-col px-4 py-5 sm:px-6 sm:py-8 lg:grid lg:grid-cols-[1fr_440px] lg:items-end lg:gap-10 lg:py-10">
        <div className="flex min-h-[42vh] flex-1 flex-col justify-between lg:min-h-[calc(100vh-5rem)]">
          <div className="flex items-center justify-between">
            <p className="text-lg font-semibold tracking-[0.01em]">MatchPulse</p>
            <Badge tone="dark">No betting</Badge>
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
                <Badge className="min-h-9" key={badge} tone="dark">
                  {badge}
                </Badge>
              ))}
            </div>
          </div>
        </div>

        <Card className="border-white/28 bg-white/[0.92] text-primaryText shadow-elevated backdrop-blur-xl lg:mb-2">
          <div className="mb-5 space-y-2">
            <p className="text-sm font-semibold text-worldCupBlue">{title}</p>
            <h2 className="text-2xl font-semibold leading-tight">{body}</h2>
          </div>
          {children}
        </Card>
      </section>
    </main>
  );
}
