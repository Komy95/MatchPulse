# Tournament simulator skill

## Purpose

Build and test the World Cup 2026 probability simulator.

## Use this skill when

- Working on `lib/simulator/*`
- Implementing public or custom simulation endpoints
- Changing model assumptions

## Inputs

- `docs/SIMULATOR.md`
- Team strengths
- Fixtures
- Competition ruleset
- Current match state

## Process

1. Compute match probabilities.
2. Simulate group matches.
3. Apply group ranking and best-third logic.
4. Simulate knockouts with extra-time and penalty assumptions.
5. Aggregate stage probabilities.
6. Store model version, assumptions, runs, and input hash.

## Output

- Simulation engine code
- Public probability output
- Tests for group and knockout logic

## Acceptance checklist

- [ ] Probabilities are valid
- [ ] 48-team format supported
- [ ] 12 groups supported
- [ ] Eight third-placed teams advance
- [ ] Knockouts always produce winner
- [ ] Results are reproducible by input hash
