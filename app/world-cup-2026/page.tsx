import type { Metadata } from "next";
import { WorldCupOverviewPage, WorldCupShell } from "@/components/world-cup/world-cup-public";
import { getWorldCupOverview } from "@/lib/world-cup/reference-data";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "World Cup 2026 | MatchPulse",
  description: "Public central reference data for the FIFA World Cup 2026 tournament.",
};

export default async function WorldCup2026Page() {
  const overview = await getWorldCupOverview();

  return (
    <WorldCupShell
      title="World Cup 2026 reference hub"
      description="The canonical MatchPulse tournament layer for groups, teams, squads and public season context."
    >
      <WorldCupOverviewPage overview={overview} />
    </WorldCupShell>
  );
}
