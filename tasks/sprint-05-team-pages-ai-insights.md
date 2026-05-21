# Sprint 05: Team Pages and AI Insights

## Goal

Add useful team pages and schema-bound AI match previews.

## Tasks

- Create team metric snapshot table.
- Build team detail endpoint and page.
- Show schedule, group, ranking, recent form, and freshness.
- Create AI insight schema.
- Build evidence payload generator.
- Add OpenAI Structured Outputs integration.
- Store insight output with input hash and model version.
- Add match insight API route and component.

## Acceptance criteria

- Team page loads from cached structured data.
- Missing metrics produce graceful fallback.
- Insight response validates against schema.
- Unsupported claims are rejected.
- Stale insights invalidate after provider update.
