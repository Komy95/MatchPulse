# GitHub Copilot instructions

This repository builds FutureCast, a FIFA World Cup 2026 friendly prediction app.

Follow these priorities:

1. Private groups, predictions, leaderboards.
2. Team pages from structured football data.
3. AI insight cards with strict schema validation.
4. Transparent tournament simulation.
5. Ads, consent, attribution, and premium no-ads.

Coding guidance:

- Use TypeScript strictly.
- Keep route handlers thin.
- Put business logic in `lib/*`.
- Validate all API inputs.
- Enforce authorization for private group data.
- Use UTC for match locking.
- Do not invent football facts in AI output.
- Do not couple UI components directly to provider-specific data.
- Do not add gambling or paid-entry mechanics.
