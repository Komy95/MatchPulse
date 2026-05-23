import Link from "next/link";
import { Badge, ButtonLink, Card, FixtureCard, cn } from "@/components/ui/primitives";
import type {
  WorldCupBracket,
  WorldCupBracketNode,
  WorldCupFixtures,
  WorldCupGroupWithTeams,
  WorldCupMatch,
  WorldCupOverview,
  WorldCupPlayer,
  WorldCupSeason,
  WorldCupSource,
  WorldCupSquad,
  WorldCupTeam,
  WorldCupTeamDetail,
} from "@/lib/world-cup/reference-data";
import { readableBracketSource, readableSquadStatus, readableStage } from "@/lib/world-cup/view-model";

export function WorldCupShell({
  children,
  eyebrow = "Central Reference Data",
  title,
  description,
}: {
  children: React.ReactNode;
  eyebrow?: string;
  title: string;
  description: string;
}) {
  return (
    <main className="min-h-screen bg-[linear-gradient(180deg,#020712_0%,#071527_42%,#F6F8F7_42%,#F6F8F7_100%)] text-primaryText">
      <section className="px-4 pb-10 pt-5 text-white sm:px-6 lg:px-8">
        <div className="mx-auto max-w-7xl">
          <header className="flex items-center justify-between gap-4">
            <Link
              className="text-lg font-semibold text-white focus:outline-none focus:ring-2 focus:ring-white focus:ring-offset-2 focus:ring-offset-stadiumNavy"
              href="/"
            >
              MatchPulse
            </Link>
            <nav className="flex items-center gap-2 text-sm font-semibold">
              <Link
                className="rounded-sm px-3 py-2 text-white/78 transition hover:text-white focus:outline-none focus:ring-2 focus:ring-white focus:ring-offset-2 focus:ring-offset-stadiumNavy"
                href="/world-cup-2026/groups"
              >
                Groups
              </Link>
              <Link
                className="rounded-sm px-3 py-2 text-white/78 transition hover:text-white focus:outline-none focus:ring-2 focus:ring-white focus:ring-offset-2 focus:ring-offset-stadiumNavy"
                href="/world-cup-2026/teams"
              >
                Teams
              </Link>
              <Link
                className="hidden rounded-sm px-3 py-2 text-white/78 transition hover:text-white focus:outline-none focus:ring-2 focus:ring-white focus:ring-offset-2 focus:ring-offset-stadiumNavy sm:inline-flex"
                href="/world-cup-2026/fixtures"
              >
                Fixtures
              </Link>
              <Link
                className="hidden rounded-sm px-3 py-2 text-white/78 transition hover:text-white focus:outline-none focus:ring-2 focus:ring-white focus:ring-offset-2 focus:ring-offset-stadiumNavy sm:inline-flex"
                href="/world-cup-2026/bracket"
              >
                Bracket
              </Link>
            </nav>
          </header>

          <div className="max-w-3xl py-12 sm:py-16">
            <p className="text-sm font-semibold text-pitchGreen">{eyebrow}</p>
            <h1 className="mt-4 text-4xl font-semibold leading-tight text-white sm:text-6xl">{title}</h1>
            <p className="mt-5 max-w-2xl text-base leading-7 text-white/76 sm:text-lg sm:leading-8">{description}</p>
          </div>
        </div>
      </section>

      <section className="-mt-8 px-4 pb-16 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-7xl">{children}</div>
      </section>
    </main>
  );
}

export function WorldCupOverviewPage({ overview }: { overview: WorldCupOverview }) {
  const { season, groups, teams } = overview;

  return (
    <div className="grid gap-5 lg:grid-cols-[minmax(0,1fr)_360px]">
      <Card className="p-5 sm:p-7" tone="pitch">
        <div className="grid gap-4 sm:grid-cols-3">
          <Stat label="Teams" value={season?.teamCount || teams.length} />
          <Stat label="Groups" value={season?.tournamentGroupCount || groups.length} />
          <Stat label="Group fixtures" value={season?.matchCount || 0} />
        </div>
        <div className="mt-8 grid gap-3 sm:grid-cols-2">
          <ButtonLink href="/world-cup-2026/groups">View groups</ButtonLink>
          <ButtonLink href="/world-cup-2026/teams" variant="secondary">
            View teams
          </ButtonLink>
          <ButtonLink href="/world-cup-2026/fixtures" variant="secondary">
            View fixtures
          </ButtonLink>
          <ButtonLink href="/world-cup-2026/bracket" variant="secondary">
            View bracket
          </ButtonLink>
        </div>
      </Card>

      <Card>
        <p className="text-sm font-semibold text-pitchGreen">Tournament window</p>
        <h2 className="mt-3 text-2xl font-semibold">{season?.label ?? "FIFA World Cup 2026"}</h2>
        <p className="mt-3 text-sm leading-6 text-secondaryText">
          {formatDateRange(season?.startsAt, season?.endsAt)}
        </p>
        {season?.hosts.length ? (
          <div className="mt-4 flex flex-wrap gap-2">
            {season.hosts.map((host) => (
              <Badge key={host} tone="green">
                {host}
              </Badge>
            ))}
          </div>
        ) : null}
        <SourceMeta className="mt-4" season={season} />
      </Card>

      {season?.format ? (
        <Card className="lg:col-span-2">
          <p className="text-sm font-semibold text-pitchGreen">Tournament format</p>
          <div className="mt-4 grid gap-3 sm:grid-cols-3">
            <InfoRow label="Teams" value={String(season.format.teamCount ?? season.teamCount)} />
            <InfoRow label="Groups" value={String(season.format.groupCount ?? season.tournamentGroupCount)} />
            <InfoRow label="Knockout starts" value={readableStage(season.format.knockoutStartsAt ?? "round_of_32")} />
          </div>
          {season.format.advancementRule ? (
            <p className="mt-4 text-sm leading-6 text-secondaryText">{season.format.advancementRule}</p>
          ) : null}
        </Card>
      ) : null}

      <div className="lg:col-span-2">
        <SectionHeader
          actionHref="/world-cup-2026/groups"
          actionLabel="All groups"
          eyebrow="Draw"
          title="Groups A-L"
        />
        <GroupGrid groups={groups.slice(0, 4)} compact />
      </div>
    </div>
  );
}

export function WorldCupGroupsPage({ groups }: { groups: WorldCupGroupWithTeams[] }) {
  return <GroupGrid groups={groups} />;
}

export function WorldCupTeamsPage({ teams }: { teams: WorldCupTeam[] }) {
  return (
    <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
      {teams.map((team) => (
        <TeamListCard key={team.id} team={team} />
      ))}
    </div>
  );
}

export function WorldCupFixturesPage({ fixtures }: { fixtures: WorldCupFixtures }) {
  return (
    <div className="space-y-5">
      <SourceMeta season={fixtures.season} />
      {fixtures.groups.length ? (
        fixtures.groups.map((group) => (
          <section key={group.groupCode}>
            <SectionHeader eyebrow={`Group ${group.groupCode}`} title={`${group.matches.length} fixtures`} />
            <div className="space-y-3">
              {group.matches.map((match) => (
                <MatchCard key={match.id} match={match} />
              ))}
            </div>
          </section>
        ))
      ) : (
        <EmptyState title="No fixtures published" body="Reference fixtures have not been seeded for this season yet." />
      )}
    </div>
  );
}

export function WorldCupBracketPage({ bracket }: { bracket: WorldCupBracket }) {
  return (
    <div className="space-y-5">
      <SourceMeta season={bracket.season} />
      {bracket.stages.length ? (
        bracket.stages.map((stage) => (
          <section key={stage.stage}>
            <SectionHeader eyebrow="Bracket" title={readableStage(stage.stage)} />
            <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-4">
              {stage.nodes.map((node) => (
                <BracketNodeCard key={node.id} node={node} />
              ))}
            </div>
          </section>
        ))
      ) : (
        <EmptyState title="No bracket nodes published" body="Bracket reference data has not been seeded yet." />
      )}
    </div>
  );
}

export function WorldCupTeamDetailPage({ detail }: { detail: WorldCupTeamDetail }) {
  const { team, group, squad, players } = detail;

  return (
    <div className="grid gap-5 lg:grid-cols-[minmax(0,1fr)_360px]">
      <Card className="p-5 sm:p-7" tone="pitch">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <Badge tone="blue">{team.groupPosition ?? `Group ${team.groupCode ?? "-"}`}</Badge>
            <h2 className="mt-4 text-4xl font-semibold leading-tight sm:text-5xl">{team.name}</h2>
            <p className="mt-3 text-base font-semibold text-secondaryText">
              {[team.fifaCode, team.confederation, team.countryCode].filter(Boolean).join(" / ")}
            </p>
          </div>
          <TeamMark team={team} size="lg" />
        </div>
      </Card>

      <Card>
        <p className="text-sm font-semibold text-pitchGreen">Status</p>
        <div className="mt-4 space-y-3">
          <InfoRow label="Team" value={titleCase(team.status ?? "unknown")} />
          <InfoRow label="Squad" value={readableSquadStatus(squad?.status)} />
          <InfoRow label="Coach" value={team.coachName ?? "Not published"} />
        </div>
      </Card>

      {group ? (
        <div className="lg:col-span-2">
          <SectionHeader eyebrow={group.name} title="Group opponents" />
          <GroupCard group={group} />
        </div>
      ) : null}

      <div className="lg:col-span-2">
        <SectionHeader eyebrow="Fixtures" title="Team fixtures" />
        <div className="space-y-3">
          {detail.fixtures.length ? (
            detail.fixtures.map((match) => <MatchCard key={match.id} match={match} />)
          ) : (
            <EmptyState title="No fixtures available" body="This team does not have published central fixtures yet." />
          )}
        </div>
      </div>

      <div className="lg:col-span-2">
        <SectionHeader eyebrow="Squad" title="Players" />
        <SquadPanel players={players} squad={squad} />
      </div>

      <div className="lg:col-span-2">
        <SourceMeta source={team.source ?? squad?.source ?? null} freshness={team.freshness ?? squad?.freshness ?? null} />
      </div>
    </div>
  );
}

function GroupGrid({ groups, compact = false }: { groups: WorldCupGroupWithTeams[]; compact?: boolean }) {
  if (!groups.length) {
    return <EmptyState title="No groups published" body="Reference data has not been seeded for this season yet." />;
  }

  return (
    <div className={cn("grid gap-4", compact ? "md:grid-cols-2 xl:grid-cols-4" : "md:grid-cols-2 xl:grid-cols-3")}>
      {groups.map((group) => (
        <GroupCard group={group} key={group.id} />
      ))}
    </div>
  );
}

function MatchCard({ match }: { match: WorldCupMatch }) {
  return (
    <FixtureCard className="bg-card">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <p className="text-xs font-semibold uppercase text-mutedText">
            {match.groupCode ? `Group ${match.groupCode}` : readableStage(match.stage)}
            {match.matchday ? ` / Matchday ${match.matchday}` : ""}
          </p>
          <div className="mt-3 grid grid-cols-[minmax(0,1fr)_auto_minmax(0,1fr)] items-center gap-3">
            <TeamName team={match.homeTeam} fallback={match.homeSource} />
            <span className="text-sm font-semibold text-secondaryText">vs</span>
            <TeamName align="right" team={match.awayTeam} fallback={match.awaySource} />
          </div>
          <p className="mt-3 text-sm text-secondaryText">
            {match.kickoffAt ? formatDateTime(match.kickoffAt) : "Time TBD"}
            {" / "}
            {match.venue ? [match.venue.name, match.venue.city].filter(Boolean).join(", ") : "Venue TBD"}
          </p>
        </div>
        <Badge tone={match.lifecycleStatus === "finished" || match.status === "FINISHED" ? "green" : "blue"}>
          {titleCase(match.lifecycleStatus ?? match.status)}
        </Badge>
      </div>
      {match.score.homeScore90 != null && match.score.awayScore90 != null ? (
        <div className="mt-4 rounded-md border border-line bg-cardWarm px-4 py-3 text-sm font-semibold">
          Result: {match.score.homeScore90}-{match.score.awayScore90}
        </div>
      ) : null}
      <SourceMeta className="mt-3" freshness={match.freshness} source={match.source} compact />
    </FixtureCard>
  );
}

function BracketNodeCard({ node }: { node: WorldCupBracketNode }) {
  return (
    <FixtureCard className="bg-card">
      <div className="flex items-center justify-between gap-3">
        <p className="text-xs font-semibold uppercase text-mutedText">Match {node.position}</p>
        <Badge tone={node.status === "finished" ? "green" : "gold"}>{titleCase(node.status)}</Badge>
      </div>
      <div className="mt-4 space-y-3">
        <BracketParticipant team={node.homeTeam} source={node.homeSource} />
        <BracketParticipant team={node.awayTeam} source={node.awaySource} />
      </div>
      {node.winnerTargetNodeId ? (
        <p className="mt-4 text-xs leading-5 text-secondaryText">
          Winner advances to {node.winnerTargetNodeId}
        </p>
      ) : null}
      <SourceMeta className="mt-3" freshness={node.freshness} source={node.source} compact />
    </FixtureCard>
  );
}

function BracketParticipant({ team, source }: { team: WorldCupTeam | null; source: string | null }) {
  if (team) {
    return <TeamRow team={team} />;
  }

  return (
    <div className="rounded-md border border-borderSoft bg-cardWarm px-3 py-3">
      <p className="text-sm font-semibold">{readableBracketSource(source)}</p>
      <p className="mt-1 text-xs text-secondaryText">Unresolved placeholder</p>
    </div>
  );
}

function TeamName({
  team,
  fallback,
  align = "left",
}: {
  team: WorldCupTeam | null;
  fallback: string | null;
  align?: "left" | "right";
}) {
  const content = team ? (
    <Link className="font-semibold text-stadiumNavy hover:text-worldCupBlue" href={`/world-cup-2026/teams/${team.id}`}>
      {team.shortName}
    </Link>
  ) : (
    <span className="font-semibold text-secondaryText">{fallback ?? "TBD"}</span>
  );

  return <div className={cn("min-w-0", align === "right" && "text-right")}>{content}</div>;
}

function GroupCard({ group }: { group: WorldCupGroupWithTeams }) {
  return (
    <FixtureCard className="bg-card">
      <div className="flex items-center justify-between gap-3">
        <div>
          <p className="text-xs font-semibold uppercase text-pitchGreen">Group {group.code}</p>
          <h2 className="mt-1 text-2xl font-semibold">{group.name}</h2>
        </div>
        <Badge tone="green">{group.teams.length}/4 teams</Badge>
      </div>

      <div className="mt-5 space-y-3">
        {group.teams.map((team) => (
          <TeamRow key={team.id} team={team} />
        ))}
      </div>
    </FixtureCard>
  );
}

function TeamListCard({ team }: { team: WorldCupTeam }) {
  return (
    <Link
      className="group block rounded-lg border border-borderSoft bg-card p-4 shadow-card transition hover:border-line hover:bg-pitchMist focus:outline-none focus:ring-2 focus:ring-worldCupBlue focus:ring-offset-2"
      href={`/world-cup-2026/teams/${team.id}`}
    >
      <div className="flex items-center gap-4">
        <TeamMark team={team} />
        <div className="min-w-0 flex-1">
          <h2 className="truncate text-lg font-semibold group-hover:text-worldCupBlue">{team.name}</h2>
          <p className="mt-1 text-sm font-semibold text-secondaryText">
            {[team.groupPosition, team.fifaCode, team.confederation].filter(Boolean).join(" / ")}
          </p>
        </div>
      </div>
    </Link>
  );
}

function TeamRow({ team }: { team: WorldCupTeam }) {
  return (
    <Link
      className="flex min-h-14 items-center gap-3 rounded-md border border-borderSoft bg-cardWarm px-3 py-2 transition hover:border-worldCupBlue/30 hover:bg-softSky focus:outline-none focus:ring-2 focus:ring-worldCupBlue focus:ring-offset-2"
      href={`/world-cup-2026/teams/${team.id}`}
    >
      <TeamMark team={team} />
      <div className="min-w-0 flex-1">
        <p className="truncate font-semibold">{team.name}</p>
        <p className="text-xs font-semibold text-secondaryText">
          {[team.groupPosition, team.fifaCode].filter(Boolean).join(" / ")}
        </p>
      </div>
    </Link>
  );
}

function SquadPanel({ squad, players }: { squad: WorldCupSquad | null; players: WorldCupPlayer[] }) {
  if (!players.length) {
    return (
      <Card>
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <p className="text-sm font-semibold text-pitchGreen">Squad list</p>
            <h2 className="mt-2 text-2xl font-semibold">No players published yet</h2>
          </div>
          <Badge tone={squad?.status === "final" ? "green" : "gold"}>{readableSquadStatus(squad?.status)}</Badge>
        </div>
        <p className="mt-4 text-sm leading-6 text-secondaryText">
          This team has a squad reference, but the player list is not available in the central reference data yet.
        </p>
      </Card>
    );
  }

  return (
    <Card>
      <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
        <p className="text-sm font-semibold text-pitchGreen">{players.length} players</p>
        <Badge tone={squad?.status === "final" ? "green" : "gold"}>{readableSquadStatus(squad?.status)}</Badge>
      </div>
      <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
        {players.map((player) => (
          <div className="rounded-md border border-borderSoft bg-cardWarm p-3" key={player.id}>
            <p className="font-semibold">{player.displayName}</p>
            <p className="mt-1 text-sm text-secondaryText">
              {[player.shirtNumber != null ? `#${player.shirtNumber}` : null, titleCase(player.position), titleCase(player.status)]
                .filter(Boolean)
                .join(" / ")}
            </p>
          </div>
        ))}
      </div>
    </Card>
  );
}

function SectionHeader({
  eyebrow,
  title,
  actionHref,
  actionLabel,
}: {
  eyebrow: string;
  title: string;
  actionHref?: string;
  actionLabel?: string;
}) {
  return (
    <div className="mb-4 flex items-end justify-between gap-4">
      <div>
        <p className="text-sm font-semibold text-pitchGreen">{eyebrow}</p>
        <h2 className="mt-1 text-3xl font-semibold">{title}</h2>
      </div>
      {actionHref && actionLabel ? (
        <Link className="text-sm font-semibold text-worldCupBlue hover:text-worldCupBlueDark" href={actionHref}>
          {actionLabel}
        </Link>
      ) : null}
    </div>
  );
}

function Stat({ label, value }: { label: string; value: number }) {
  return (
    <div className="rounded-md border border-line bg-card/80 p-4">
      <p className="text-4xl font-semibold tabular-nums">{value}</p>
      <p className="mt-1 text-sm font-semibold text-secondaryText">{label}</p>
    </div>
  );
}

function InfoRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between gap-4 rounded-md border border-borderSoft bg-cardWarm px-3 py-2">
      <span className="text-sm font-semibold text-secondaryText">{label}</span>
      <span className="text-right text-sm font-semibold">{value}</span>
    </div>
  );
}

function SourceMeta({
  season,
  source,
  freshness,
  className,
  compact = false,
}: {
  season?: WorldCupSeason | null;
  source?: WorldCupSource | null;
  freshness?: { fetchedAt: string | null; staleAfter: string | null; providerUpdatedAt: string | null } | null;
  className?: string;
  compact?: boolean;
}) {
  const resolvedSource = source ?? season?.source ?? null;
  const resolvedFreshness = freshness ?? season?.freshness ?? null;

  if (!resolvedSource && !resolvedFreshness) {
    return null;
  }

  return (
    <div
      className={cn(
        compact ? "text-xs leading-5 text-secondaryText" : "rounded-md border border-borderSoft bg-cardWarm p-4 text-sm leading-6 text-secondaryText",
        className,
      )}
    >
      {resolvedSource ? (
        <p>
          Source:{" "}
          {resolvedSource.url ? (
            <a className="font-semibold text-worldCupBlue hover:text-worldCupBlueDark" href={resolvedSource.url}>
              {resolvedSource.name}
            </a>
          ) : (
            <span className="font-semibold text-primaryText">{resolvedSource.name}</span>
          )}
        </p>
      ) : null}
      {resolvedFreshness?.fetchedAt ? <p>Updated: {formatDate(resolvedFreshness.fetchedAt)}</p> : null}
    </div>
  );
}

function TeamMark({ team, size = "md" }: { team: WorldCupTeam; size?: "md" | "lg" }) {
  return (
    <div
      className={cn(
        "flex shrink-0 items-center justify-center rounded-full border border-worldCupBlue/20 bg-softSky font-semibold text-worldCupBlue",
        size === "lg" ? "h-20 w-20 text-2xl" : "h-11 w-11 text-sm",
      )}
      aria-hidden="true"
    >
      {team.fifaCode ?? team.countryCode ?? team.shortName.slice(0, 3)}
    </div>
  );
}

function EmptyState({ title, body }: { title: string; body: string }) {
  return (
    <Card>
      <h2 className="text-2xl font-semibold">{title}</h2>
      <p className="mt-2 text-sm leading-6 text-secondaryText">{body}</p>
    </Card>
  );
}

function formatDateRange(startsAt: string | null | undefined, endsAt: string | null | undefined) {
  if (!startsAt || !endsAt) {
    return "Tournament dates not published";
  }

  return `${formatDate(startsAt)} to ${formatDate(endsAt)}`;
}

function formatDate(value: string) {
  return new Intl.DateTimeFormat("en", {
    month: "short",
    day: "numeric",
    year: "numeric",
    timeZone: "UTC",
  }).format(new Date(value));
}

function formatDateTime(value: string) {
  return new Intl.DateTimeFormat("en", {
    month: "short",
    day: "numeric",
    year: "numeric",
    hour: "numeric",
    minute: "2-digit",
    timeZone: "UTC",
  }).format(new Date(value));
}

function titleCase(value: string) {
  return value
    .replace(/[-_]/g, " ")
    .replace(/\b\w/g, (letter) => letter.toUpperCase());
}
