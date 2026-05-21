# AI insight generation skill

## Purpose

Generate safe, schema-bound match insight cards.

## Use this skill when

- Creating or modifying insight prompts
- Building evidence payloads
- Rendering AI match previews

## Inputs

- `docs/AI-INSIGHTS.md`
- Fixture data
- Team metrics
- Simulation or match probabilities
- Provider freshness data

## Process

1. Build structured evidence first.
2. Enumerate allowed claims.
3. Generate insight with Structured Outputs.
4. Validate schema.
5. Reject unsupported or malformed output.
6. Store output with input hash, model version, and timestamps.

## Output

- Evidence builder
- Prompt or schema update
- Validated insight object
- Cache/invalidation logic

## Acceptance checklist

- [ ] No invented injuries
- [ ] No invented lineups
- [ ] No unsupported player claims
- [ ] Schema validation exists
- [ ] Warnings shown for missing data
- [ ] Input hash and model version stored
