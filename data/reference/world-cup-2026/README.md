# World Cup 2026 seed data

Generated: 2026-05-23T21:04:39.734687+00:00
Source freshness date: 2026-05-23

## Contents
- `worldcup_2026_seed.json`: single nested seed file for Codex/import scripts.
- `competition.csv`, `season.csv`, `teams.csv`, `tournament_groups.csv`, `matches.csv`, `squads.csv`, `players.csv`, `bracket_nodes.csv`, `sources.csv`: flat CSVs for validation or manual review.

## Important caveats
- Teams and tournament groups are populated.
- Squads and players are placeholders because official/final rosters are volatile and should be imported from federation/FIFA sources before launch.
- Group-stage pairings are included, but kickoff times and venues are not populated in this seed.
- Bracket nodes are structural placeholders. Replace Round-of-32 source mappings with official mapping before production.
- No logos/flags/assets are included to avoid licensing issues.
