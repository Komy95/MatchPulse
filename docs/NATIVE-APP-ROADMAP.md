# Native App Roadmap

This document is future guidance only. Native iOS and Android apps are not part of the MatchPulse MVP.

Do not create Capacitor, React Native, Swift, Kotlin, App Store, Play Store, or native configuration files during documentation-only work.

## Current Decision

MatchPulse launches as a mobile-first Progressive Web App.

Option 2 is selected for future distribution: PWA-first MVP, then a Capacitor wrapper later for Apple App Store and Google Play Store if traction or platform needs justify it.

Fully native Swift/Kotlin is out of scope unless traction or platform requirements justify it.

## Future Options

### Option 1: Keep PWA Only

Best when:

- PWA install and retention are strong.
- Push notifications are not critical.
- Users mostly arrive through links.
- Product changes quickly during tournament development.

Tradeoff:

- Less App Store presence.
- Less reliable push behavior than native.
- Fewer device integration options.

### Option 2: Capacitor Wrapper

Best when:

- The team wants App Store presence while preserving the web codebase.
- Native requirements are light.
- The primary product remains the PWA.

Tradeoff:

- App Store review and native shell complexity.
- Platform-specific issues still exist.
- In-app purchase rules may apply to native premium features.

Decision: selected as the preferred Phase 2 native distribution path.

### Option 3: React Native App

Best when:

- Mobile retention is strong.
- Native navigation, notifications, and device APIs become important.
- The team can justify maintaining a separate mobile app layer.

Tradeoff:

- More implementation cost.
- More QA surface.
- Shared business logic must be carefully structured.

Decision: not preferred for Phase 2 unless Capacitor cannot meet product needs.

### Option 4: Fully Native Swift/Kotlin Apps

Best when:

- MatchPulse becomes a large mobile-first product.
- Platform-native polish and deep integrations are critical.
- Separate iOS and Android investment is justified.

Tradeoff:

- Highest cost.
- Slowest iteration.
- Most duplicated product work.

Decision: out of scope unless traction or platform requirements justify it.

## Decision Criteria For Native

Capacitor packaging should be considered when one or more are true:

- Strong user traction.
- Need for reliable push notifications.
- App Store presence becomes important.
- Native sharing or deeper device integration is required.
- Premium subscription economics justify platform complexity.
- PWA limitations are measurably hurting retention or conversion.

Fully native Swift/Kotlin should be considered only if Capacitor and PWA approaches cannot satisfy proven platform requirements.

## App Store Considerations

Future native packaging may require:

- Apple Developer account.
- Google Play Developer account.
- Privacy labels.
- App privacy disclosures.
- Account deletion flow.
- Data export or deletion support if legally required.
- Sign in with Apple depending on enabled auth methods.
- Review of premium no-ads monetization and in-app purchase rules.
- Clear no-betting positioning.

## Product Safety Rules

Native listings and app metadata must preserve the same product constraints:

- No betting positioning.
- No wagering.
- No paid entry pools.
- No cash prizes.
- No casino-style screenshots.
- No official FIFA marks or team crests unless rights are confirmed.

## Recommended Revisit Points

Revisit native packaging after:

- First meaningful beta usage.
- First full prediction flow validation.
- First matchday retention data.
- Confirmation that add-to-home-screen behavior is insufficient.
- Confirmation that push notifications are strategically necessary.
- Decision on premium no-ads monetization.

## Phase 2 Push Direction

- Push notifications are deferred for MVP.
- MVP uses in-app reminders first.
- Phase 2 may add match lock reminders, missing prediction reminders, final score notifications, and leaderboard update notifications.
- Native/APNs push support is considered only when Capacitor packaging is introduced.

## Remaining Open Decisions

- Whether premium subscriptions are web-only or native-supported.
- Whether App Store presence is required before World Cup 2026 launch.
- Whether Phase 2 push starts with web push, Capacitor/native push, or both.
- Whether Capacitor packaging happens before or after premium no-ads.
