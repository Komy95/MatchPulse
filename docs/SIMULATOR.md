# Tournament Simulator

## Goal

Build a transparent FIFA World Cup 2026 simulator that shows each team’s probability of reaching every stage.

## MVP model

Use an Elo-informed independent Poisson model.

Why this is the correct MVP choice:

- Easier to explain to users.
- Strong enough for a first public simulator.
- Fast enough for repeated Monte Carlo runs.
- Can later be replaced with Dixon-Coles, bivariate Poisson, or ensemble models.

## World Cup 2026 format

The simulator must support:

- 48 teams
- 12 groups of four
- Top two from each group advance
- Eight best third-placed teams advance
- Round of 32
- Round of 16
- Quarter-finals
- Semi-finals
- Third-place match
- Final

## Match probability model

```ts
type TeamStrength = {
  teamId: string;
  rating: number;
  attackAdj: number;
  defenseAdj: number;
  hostAdvantage?: number;
};

type MatchProbabilities = {
  homeWin: number;
  draw: number;
  awayWin: number;
  scoreMatrix: number[][];
  lambdaHome: number;
  lambdaAway: number;
};
```

MVP formula:

```ts
function lambdas(a: TeamStrength, b: TeamStrength, baselineGoals = 2.45) {
  const diff = (a.rating - b.rating) / 400;
  const venue = (a.hostAdvantage ?? 0) - (b.hostAdvantage ?? 0);

  const lambdaHome = Math.max(
    0.15,
    Math.exp(Math.log(baselineGoals / 2) + 0.55 * diff + a.attackAdj - b.defenseAdj + venue)
  );

  const lambdaAway = Math.max(
    0.15,
    Math.exp(Math.log(baselineGoals / 2) - 0.55 * diff + b.attackAdj - a.defenseAdj - venue)
  );

  return { lambdaHome, lambdaAway };
}
```

## Simulation modes

| Mode | Purpose | Runs | Cache policy |
|---|---|---:|---|
| Public tournament probabilities | Main public simulator and team pages | 100,000 | Cache aggressively |
| On-demand user run | Custom assumptions from current state | 10,000 immediate | Store for 24h |
| Admin offline analysis | Calibration and model comparison | 500,000+ | Not user-facing |

## Simulation output

```json
{
  "simulation_id": "sim_wc26_public_2026_06_10",
  "model_version": "elo_poisson_v1",
  "runs": 100000,
  "generated_at": "2026-06-10T12:15:00Z",
  "assumptions": {
    "host_advantage": true,
    "extra_time_scaling": 0.33,
    "penalty_shootout_rating_weight": 0.15
  },
  "teams": [
    {
      "team_id": "esp",
      "name": "Spain",
      "group": "H",
      "probabilities": {
        "reach_round_of_32": 0.88,
        "reach_round_of_16": 0.62,
        "reach_quarter_final": 0.39,
        "reach_semi_final": 0.22,
        "reach_final": 0.11,
        "win_tournament": 0.06
      }
    }
  ]
}
```

## Implementation files

```text
lib/simulator/
  poisson.ts
  matchProbabilities.ts
  groupStage.ts
  thirdPlaceRanking.ts
  knockout.ts
  runSimulation.ts
  simulationSchema.ts
  assumptions.ts
workers/
  simulateTournament.ts
app/simulator/page.tsx
app/api/v1/simulations/route.ts
app/api/v1/simulations/[simulationId]/route.ts
```

## Acceptance tests

- Match probabilities sum to approximately 1.
- Group ranking handles points, goal difference, goals scored, and required tiebreaker placeholders.
- Best third-placed team ranking returns eight teams.
- Knockout advancement never returns a draw.
- Same input hash and model version can reuse cached output.
- Public probabilities have stage probabilities in valid ranges.
