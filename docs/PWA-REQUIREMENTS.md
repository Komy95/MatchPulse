# PWA Requirements

This document defines conceptual Progressive Web App requirements for MatchPulse. It is documentation only.

Do not create manifest files, service workers, icons, app configuration files, or implementation code from this document during documentation-only work.

## PWA Goal

MatchPulse should launch as an installable mobile-first PWA that feels like a premium iPhone app while preserving the speed and low-friction onboarding of the web.

## Planned PWA Capabilities

- Web app manifest.
- App icon.
- Theme color.
- Standalone display mode.
- Offline app shell.
- Safe caching for public reference data.
- Freshness metadata for cached public data.
- Add-to-home-screen guidance.
- Push notifications are deferred for MVP.

## Manifest Requirements

Future implementation should define:

- App name.
- Short app name.
- Description.
- Start URL.
- Display mode: `standalone`.
- Theme color.
- Background color.
- App icons in required sizes.
- Appropriate orientation behavior, likely portrait-first.

Do not create a real manifest file during documentation-only work.

Locked values:

- Theme color: `#1B4DFF`.
- Background color: `#FAFAF7`.

## App Icon Requirements

Future icons should:

- Feel premium and simple.
- Work on iOS and Android home screens.
- Avoid official FIFA marks.
- Avoid official trophy imitation.
- Avoid official team crests.
- Avoid copyrighted assets.
- Avoid player imagery.
- Avoid betting/casino visual language.
- Use MatchPulse brand identity, not generic football clipart.
- Recommended direction: white/off-white base with deep blue pulse or circular match signal, plus subtle green/red/gold accents.

## Theme Color Requirements

Theme color should align with `docs/DESIGN-PHILOSOPHY.md`.

Locked guidance:

- Theme color is World Cup Blue: `#1B4DFF`.
- Background color is Base White: `#FAFAF7`.
- Avoid saturated full-screen red/green/gold browser chrome.
- Ensure status bar and installed-app frame feel premium and readable.

## Offline App Shell

The offline app shell should allow:

- App frame to load.
- Basic navigation shell to render.
- Helpful offline state.
- Public help/about/legal pages to load.
- Lightweight dashboard shell to render without private data.
- Previously cached public reference pages to show only when freshness is clear.

The offline app shell should not pretend live/private data is current.

Cache only:

- App shell.
- Static assets.
- Public help/about/legal pages.
- Lightweight dashboard shell.

## Caching Rules

Allowed with freshness metadata:

- Public competition reference data.
- Public team data.
- Public fixtures.
- Public team metric snapshots.
- Public match insights where expiry is respected.
- Public simulator output where generated timestamp is visible.
- Static assets.

Do not aggressively cache:

- Private predictions.
- Private group data.
- Auth-sensitive data.
- Live match data.
- Final scores during live windows.
- Private/custom simulation runs.
- Personalized profile data.
- AI insight data with stale provider freshness.

## Target Public Reference Data TTLs

| Data type | Target TTL |
|---|---:|
| Teams | 6-24h |
| Fixtures before tournament | 6-12h |
| Fixtures during tournament | 15-60min |
| Live match data | 5-15sec |
| Team pages | 1-6h |
| AI insights | Until expiry or provider freshness changes |
| Public simulator | Nightly plus invalidation on major provider updates |

## Freshness Rules

Cached public data must show:

- Last updated timestamp where relevant.
- Provider freshness when available.
- Generated timestamp for AI insights and simulations.
- Stale warning when cache age exceeds the surface threshold.

## Add-To-Home-Screen Guidance

Add-to-home-screen prompts should use soft education only after a user has experienced value.

Pattern:

- Do not use blocking popups.
- Show a small `Install MatchPulse` card.
- Prefer showing install guidance after activation, not on first visit.

Good moments:

- After creating a group.
- After joining a group.
- After saving first predictions.
- After returning to the dashboard later.
- After checking leaderboard on matchday.

Avoid:

- Blocking onboarding.
- Showing install guidance on first landing-page visit.
- Showing install prompts before users understand the product.
- Repeated nagging.

## Push Notifications

Push notifications are deferred for MVP.

MVP uses in-app reminders first.

Potential future use cases:

- Prediction lock reminders.
- Missing prediction reminders.
- Match result and points summary.
- Group leaderboard movement.
- Tournament phase transition updates.

Native/APNs push support is considered only when Capacitor packaging is introduced.

Push notifications require additional privacy, consent, platform, and reliability decisions.

## Acceptance Criteria For Future Implementation

- App is installable as a PWA on supported mobile browsers.
- Installed app opens in standalone mode.
- Core mobile routes remain readable and usable in installed mode.
- Offline state is clear and honest.
- Public cached data shows freshness.
- Private and auth-sensitive data are not aggressively cached.
- Add-to-home-screen guidance is optional and well-timed.
- Push notifications are absent in MVP.
- Install guidance is not shown on first landing-page visit.

## Remaining Open Decisions

- Browser support target.
- Exact `Install MatchPulse` card copy and placement.
- Whether Phase 2 push starts with web push, Capacitor/native push, or both.
