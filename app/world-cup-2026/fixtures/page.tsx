import type { Metadata } from "next";
import { WorldCupFixturesPage, WorldCupShell } from "@/components/world-cup/world-cup-public";
import { getWorldCupFixtures } from "@/lib/world-cup/reference-data";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "World Cup 2026 Fixtures | MatchPulse",
  description: "FIFA World Cup 2026 group-stage fixtures from MatchPulse central reference data.",
};

export default async function WorldCup2026FixturesPage() {
  const fixtures = await getWorldCupFixtures();

  return (
    <WorldCupShell
      eyebrow="Fixtures"
      title="World Cup 2026 fixtures"
      description="Group-stage match pairings rendered from the central tournament reference data."
    >
      <WorldCupFixturesPage fixtures={fixtures} />
    </WorldCupShell>
  );
}
