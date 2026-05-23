import type { Metadata } from "next";
import { WorldCupGroupsPage, WorldCupShell } from "@/components/world-cup/world-cup-public";
import { getWorldCupOverview } from "@/lib/world-cup/reference-data";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "World Cup 2026 Groups | MatchPulse",
  description: "All FIFA World Cup 2026 groups from MatchPulse central reference data.",
};

export default async function WorldCup2026GroupsPage() {
  const overview = await getWorldCupOverview();

  return (
    <WorldCupShell
      eyebrow="Groups"
      title="World Cup 2026 groups"
      description="Twelve public groups, each rendered from the central tournament reference data store."
    >
      <WorldCupGroupsPage groups={overview.groups} />
    </WorldCupShell>
  );
}
