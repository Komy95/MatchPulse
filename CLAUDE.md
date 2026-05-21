# Claude-specific project instructions

Use `AGENTS.md` as the source of truth.

When working in this repository:

- Start by reading `AGENTS.md`, then the most relevant file in `docs/`, then the relevant `skills/*/SKILL.md`.
- Prefer implementation plans that produce small, reviewable pull requests.
- Before modifying code, identify the domain area: groups, predictions, scoring, providers, insights, simulator, ads, or compliance.
- Avoid broad refactors unless they directly reduce risk for the current task.
- When uncertain, preserve the MVP scope and choose the simplest implementation that supports World Cup 2026 correctly.
