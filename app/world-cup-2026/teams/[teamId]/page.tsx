import type { Metadata } from "next";
import { WorldCupShell, WorldCupTeamDetailPage } from "@/components/world-cup/world-cup-public";
import { getWorldCupTeamDetail } from "@/lib/world-cup/reference-data";

export const dynamic = "force-dynamic";

type TeamPageProps = {
  params: Promise<{
    teamId: string;
  }>;
};

export async function generateMetadata({ params }: TeamPageProps): Promise<Metadata> {
  const { teamId } = await params;
  const detail = await getWorldCupTeamDetail(teamId);

  return {
    title: `${detail.team.name} | World Cup 2026 | MatchPulse`,
    description: `Public World Cup 2026 reference page for ${detail.team.name}.`,
  };
}

export default async function WorldCup2026TeamPage({ params }: TeamPageProps) {
  const { teamId } = await params;
  const detail = await getWorldCupTeamDetail(teamId);

  return (
    <WorldCupShell
      eyebrow="Team Reference"
      title={detail.team.name}
      description="Public team, group and squad reference data for the FIFA World Cup 2026 season."
    >
      <WorldCupTeamDetailPage detail={detail} />
    </WorldCupShell>
  );
}
