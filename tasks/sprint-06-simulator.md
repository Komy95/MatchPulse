# Sprint 06: Tournament Simulator

## Goal

Ship a transparent World Cup 2026 simulator with public probabilities and authenticated custom runs.

## Tasks

- Implement Poisson probability functions.
- Implement group-stage simulation.
- Implement best-third-placed ranking.
- Implement knockout advancement.
- Create simulation run tables.
- Add public simulation cache.
- Add on-demand simulation endpoint.
- Build simulator page and team probability UI.

## Acceptance criteria

- Match probabilities sum to approximately 1.
- Group standings produce valid qualifiers.
- Eight best third-placed teams advance.
- Knockout matches always produce a winner.
- Public simulation response includes model version and assumptions.
- Results are cached by input hash.
