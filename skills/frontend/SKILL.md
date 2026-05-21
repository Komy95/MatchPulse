# Frontend implementation skill

## Purpose

Build mobile-first Next.js screens and components for the prediction app.

## Use this skill when

- Creating pages under `app/`
- Building components under `components/`
- Implementing prediction, group, team, insight, or simulator UI

## Inputs

- Product requirements from `docs/PRD.md`
- API contracts from `docs/API-SPECS.md`
- Existing components and design tokens

## Process

1. Identify the screen and primary user action.
2. Keep navigation simple and mobile-first.
3. Use typed props and server/client component boundaries deliberately.
4. Show loading, empty, stale-data, and error states.
5. Avoid direct provider payloads in UI.
6. Do not expose private group data outside authenticated views.

## Output

- Page or component implementation
- Minimal tests or documented test steps
- Clear empty/loading/error states

## Acceptance checklist

- [ ] Mobile layout works
- [ ] Data shape is typed
- [ ] Empty state exists
- [ ] Loading state exists
- [ ] Private data is not leaked
- [ ] No vendor-specific data shape leaks into UI
