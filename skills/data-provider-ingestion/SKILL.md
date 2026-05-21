# Data provider ingestion skill

## Purpose

Normalize and ingest football provider data safely.

## Use this skill when

- Adding provider adapters
- Building fixture, team, or metric ingestion
- Updating provider normalization logic

## Inputs

- `docs/DATA-PROVIDERS.md`
- Provider API payloads
- Existing normalized types

## Process

1. Keep provider-specific logic inside adapter files.
2. Normalize into canonical app types.
3. Upsert by provider and provider ID.
4. Store provider freshness timestamps.
5. Handle missing optional fields gracefully.
6. Add tests with sample payloads.

## Output

- Provider adapter
- Normalization function
- Idempotent ingestion logic
- Sample payload tests

## Acceptance checklist

- [ ] UI remains provider-agnostic
- [ ] Ingestion is idempotent
- [ ] Provider freshness stored
- [ ] Missing fields do not crash ingestion
- [ ] Attribution requirements are preserved where needed
