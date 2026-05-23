import type { Metadata } from "next";
import { WorldCupBracketPage, WorldCupShell } from "@/components/world-cup/world-cup-public";
import { getWorldCupBracket } from "@/lib/world-cup/reference-data";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "World Cup 2026 Bracket | MatchPulse",
  description: "FIFA World Cup 2026 bracket reference nodes from MatchPulse central data.",
};

export default async function WorldCup2026BracketPage() {
  const bracket = await getWorldCupBracket();

  return (
    <WorldCupShell
      eyebrow="Bracket"
      title="World Cup 2026 bracket"
      description="Knockout reference slots from the central tournament layer, including unresolved placeholders."
    >
      <WorldCupBracketPage bracket={bracket} />
    </WorldCupShell>
  );
}
