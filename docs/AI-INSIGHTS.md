# AI Insights

## Principle

The AI layer is a presentation layer over verified structured sports data. It must not act as the source of truth.

## Input flow

1. Load fixture, teams, provider freshness, rankings, and team metrics.
2. Compute deterministic features such as rating difference, form, rest days, and score probabilities.
3. Build a constrained evidence object.
4. Ask the model to produce a short explanation using Structured Outputs.
5. Validate JSON schema.
6. Store output with input hash and freshness metadata.
7. Render only validated output.

## Insight schema

```json
{
  "match_id": "wc26-m-0001",
  "generated_at": "2026-06-10T12:00:00Z",
  "freshness": {
    "provider_updated_at": "2026-06-10T11:55:00Z",
    "ranking_updated_at": "2026-06-01T00:00:00Z"
  },
  "prediction": {
    "home_win": 0.41,
    "draw": 0.29,
    "away_win": 0.30,
    "recommended_pick": "HOME_OR_DRAW"
  },
  "confidence": "medium",
  "summary": "Spain have the edge because they combine the stronger rating baseline with better recent results, but the draw probability remains material.",
  "evidence": [
    "Home team higher on model rating by 84 Elo-equivalent points",
    "Away team conceded more goals per match in the last 8 internationals",
    "No confirmed lineup disruption detected in the current provider payload"
  ],
  "warnings": [
    "Lineups not final",
    "Injury data unavailable from current provider"
  ],
  "citation_tokens": [
    "provider:fixture:12345",
    "provider:ranking:2026-06-01"
  ]
}
```

## Prompt template

```text
System:
You are an analyst writing short football match previews.
Use only the supplied structured evidence.
If evidence is missing or conflicting, say so explicitly.
Do not mention stats that are not present in the input.
Return JSON matching the schema exactly.

User:
Create a pre-match insight for this fixture.

Fixture:
{{fixture_json}}

Derived features:
{{feature_json}}

Allowed claims:
- form
- ranking difference
- rest days
- venue context
- historical matchup if supplied
- provider freshness and uncertainty

Forbidden:
- invented injuries
- invented quotes
- bookmaker claims unless odds are supplied
- player-specific claims unless player data is supplied
```

## Failure modes and mitigations

| Failure mode | Mitigation |
|---|---|
| Model invents injuries or lineups | Claims can only reference enumerated evidence fields |
| Model states unsupported favorite | Require evidence bullets for recommendation |
| Stale insight after provider update | Invalidate by provider timestamp and input hash |
| Conflicting provider payloads | Set confidence to low and display warnings |
| Broken JSON | Reject before render |
| Overconfident wording | Restrict confidence to `low`, `medium`, `high` |

## Cache and invalidation

Invalidate insight when:

- Fixture status changes.
- Provider `updated_at` changes.
- Team metric snapshot changes materially.
- Lineups become available.
- Model version changes.
- Prompt version changes.

## Implementation files

Suggested files:

```text
lib/insights/
  buildEvidence.ts
  insightSchema.ts
  generateInsight.ts
  cacheInsight.ts
  invalidateInsight.ts
  prompt.ts
app/api/v1/matches/[matchId]/insight/route.ts
```

## Tests

Required tests:

- Valid output passes schema.
- Unsupported claim causes rejection.
- Missing data creates warnings.
- Stale cache is invalidated after provider update.
- Confidence is clipped to supported values.
