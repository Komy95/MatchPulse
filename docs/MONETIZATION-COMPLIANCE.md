# Monetization and Compliance

## Monetization baseline

Use ads first and premium no-ads second.

| Stream | MVP fit | Rule |
|---|---|---|
| Display ads | Strong | Use consent-aware rendering |
| Premium no-ads | Strong | Keep implementation simple |
| Sponsored hubs | Later | Only after traffic exists |
| Affiliate odds or betting links | Weak | Avoid in MVP |
| Paid entry or cash prizes | Avoid | Requires legal review |

## Product safety baseline

For Germany/EU, start with:

- No entry fee.
- No cash prize.
- No wagering of value.
- Points-only leaderboards.
- Friendly competition framing.

Avoid gambling-like flows in MVP.

## Privacy and ads

- Core app functionality must work without non-essential tracking.
- Use a consent banner for analytics and personalized ads.
- Keep ad identifiers separate from private group data.
- Do not expose member-level behavior unnecessarily to ad systems.
- Avoid sending private group names or prediction details to third-party ad providers.

## Data licensing rules

- Do not ship official crests, logos, FIFA marks, or copyrighted assets unless rights are confirmed.
- Store fact extractions, not article bodies.
- Generate AI output only from structured, licensed facts in the database.
- Keep provider abstraction so a contract or license change does not force a rewrite.
- Add attribution where required by provider terms.

## Required legal pages

- Privacy policy
- Imprint
- Terms of use
- Data attribution page
- Cookie and consent settings

## MVP compliance checklist

- [ ] No paid entry mechanic
- [ ] No cash-prize mechanic
- [ ] Consent layer implemented before ads/analytics
- [ ] Provider attribution visible where needed
- [ ] Team logos disabled or license-confirmed
- [ ] Private group data excluded from ad payloads
- [ ] AI output generated only from structured allowed evidence
