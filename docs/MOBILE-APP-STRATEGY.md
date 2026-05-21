# Mobile App Strategy

## Primary MVP Target

MatchPulse launches first as a mobile-first Progressive Web App.

Core decisions:

- MatchPulse is a mobile-first app experience, not a desktop-first website.
- The product must feel like a premium iPhone app.
- Desktop is supported responsively, but it is not the primary design target.
- Native iOS and Android packaging is post-MVP.
- Final distribution path: PWA-first MVP, then Capacitor wrapper for Apple App Store and Google Play Store if Phase 2 distribution is justified.
- Fully native Swift/Kotlin is out of scope unless traction or platform requirements justify it.
- MVP implementation should optimize the invite, prediction, matchday, leaderboard, insight, and simulator flows for phone usage first.

## Rationale

- World Cup usage happens mostly on phones during matches.
- Private group invite links need low-friction onboarding.
- A PWA avoids App Store friction for MVP.
- One codebase is faster and cheaper.
- App Store release can be added later if traction justifies it.
- Capacitor is the preferred future App Store path because it preserves the web codebase while enabling native distribution.
- The product's core loop is time-sensitive and lightweight: open, check locks, submit picks, review standings, read a short insight, return later.

## Core Mobile User Journey

1. User receives a private group invite link.
2. User opens the link on their phone.
3. User authenticates.
4. User joins the group.
5. User submits predictions.
6. User returns during matches to check leaderboard and insights.
7. User may add MatchPulse to their home screen.

This journey should be the primary UX benchmark for MVP quality.

## Mobile UX Principles

- iPhone-first layout.
- Thumb-first interactions.
- Bottom navigation.
- One primary action per screen.
- Match cards instead of tables.
- Large tap targets.
- Fast prediction entry.
- Minimal text during matchday flows.
- Strong empty states.
- Smooth but restrained motion.
- Works well next to watching live football.
- Dashboard prioritizes next locks, unfinished picks, private standings, global rank, match insights, and personalized news.
- Users should never need desktop screen width to complete core tasks.

## PWA Requirements Summary

PWA capability is planned for MVP, but this document does not create implementation files.

Planned:

- Web app manifest.
- App icon.
- Theme color.
- Standalone display mode.
- Offline app shell.
- Cached public reference data with freshness metadata.
- Add-to-home-screen guidance.

App identity:

- App icon should use an abstract MatchPulse mark.
- No FIFA logo.
- No official trophy imitation.
- No team crests.
- No player imagery.
- Recommended direction: white/off-white base with deep blue pulse or circular match signal, plus subtle green/red/gold accents.
- Theme color: `#1B4DFF`.
- Background color: `#FAFAF7`.

Caching constraints:

- Cached public reference data is allowed when freshness metadata is visible.
- Private predictions must not be aggressively cached.
- Private group data must not be aggressively cached.
- Auth-sensitive data must not be aggressively cached.
- Live match data must not be aggressively cached.
- AI insight data with stale provider freshness must not be aggressively cached.

Offline app shell scope:

- Cache app shell.
- Cache static assets.
- Cache public help/about/legal pages.
- Cache lightweight dashboard shell.

Target public reference data TTLs:

- Teams: 6-24h.
- Fixtures before tournament: 6-12h.
- Fixtures during tournament: 15-60min.
- Live match data: 5-15sec.
- Team pages: 1-6h.
- AI insights: until expiry or provider freshness changes.
- Public simulator: nightly plus invalidation on major provider updates.

Install education:

- Use soft education only.
- Do not use blocking popups.
- Show a small `Install MatchPulse` card after the user has created or joined a group.
- Prefer showing install guidance after activation, not on first visit.
- Install guidance may appear after the user joins or creates a group, submits the first prediction, or returns to the dashboard later.
- Do not show install guidance on first landing-page visit.

Deferred:

- Push notifications.
- Native iOS/Android packaging.

Push notification direction:

- Push notifications are deferred for MVP.
- MVP uses in-app reminders first.
- Phase 2 may add match lock reminders, missing prediction reminders, final score notifications, and leaderboard update notifications.
- Native/APNs push support is considered only when Capacitor packaging is introduced.

See `docs/PWA-REQUIREMENTS.md` for conceptual PWA requirements.

## Native App Roadmap

Native app packaging is not part of MVP.

Final post-MVP direction:

- Option 2 is selected: Capacitor wrapper later for Apple App Store and Google Play Store.
- Keep PWA only remains acceptable if traction does not justify app store distribution.
- React Native is not the preferred Phase 2 path.
- Fully native Swift/Kotlin is out of scope unless traction or platform requirements justify it.

Decision criteria for native:

- Strong user traction.
- Need for reliable push notifications.
- App Store presence becomes important.
- Native sharing or deeper device integration is required.
- Premium subscription economics justify platform complexity.

See `docs/NATIVE-APP-ROADMAP.md` for future native guidance.

## App Store Considerations

If native app packaging is pursued later:

- Apple Developer account is required.
- Privacy labels are required.
- Account deletion must be supported.
- Sign in with Apple may be required depending on auth methods.
- Native premium no-ads may trigger in-app purchase considerations.
- No betting, wagering, paid entry, or cash prize positioning.

## Pre-Sprint-1 Confirmation

Before Sprint 1 implementation, the confirmed strategy is:

- Mobile-first PWA.
- Premium iPhone-app feel.
- Safe caching boundaries.
- No native app scaffolding in Sprint 1.
- No push notifications in Sprint 1.
- Capacitor wrapper is post-MVP / Phase 2.

## Product Implications

- Landing pages should work on desktop, but signup and invite flows must be excellent on mobile.
- Dashboard is a mobile command center first.
- Prediction entry must be fast enough for users watching live football.
- Tables should be avoided as the default presentation for match lists, leaderboards, and simulator output.
- AI insights and simulator probabilities should be compact and readable on small screens.
- Install prompts should be helpful and optional, not blocking.

## Remaining Open Decisions

- Exact copy and placement for the `Install MatchPulse` card.
- Exact app icon artwork.
- Whether Phase 2 Capacitor packaging happens before or after premium no-ads.
- Whether Phase 2 push starts with web push, Capacitor/native push, or both.
