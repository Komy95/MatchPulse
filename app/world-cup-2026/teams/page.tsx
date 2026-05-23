import type { Metadata } from "next";
import { WorldCupShell, WorldCupTeamsPage } from "@/components/world-cup/world-cup-public";
import { getWorldCupOverview } from "@/lib/world-cup/reference-data";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "World Cup 2026 Teams | MatchPulse",
  description: "All FIFA World Cup 2026 teams from MatchPulse central reference data.",
};

export default async function WorldCup2026TeamsPage() {
  const overview = await getWorldCupOverview();

  return (
    <WorldCupShell
      eyebrow="Teams"
      title="World Cup 2026 teams"
      description="Browse all 48 teams from the central season reference data and open their public team pages."
    >
      <WorldCupTeamsPage teams={overview.teams} />
    </WorldCupShell>
  );
}
