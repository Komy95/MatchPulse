# Security and compliance skill

## Purpose

Keep the app safe for private groups, EU users, ads, and data licensing.

## Use this skill when

- Adding ads, analytics, legal pages, provider assets, auth, or private group data flows

## Inputs

- `docs/MONETIZATION-COMPLIANCE.md`
- Current route/component implementation
- Provider licensing notes

## Process

1. Identify whether data is private, public, personal, or provider-owned.
2. Keep private group data out of ad and analytics payloads.
3. Require consent for non-essential tracking.
4. Avoid unlicensed logos and official marks.
5. Avoid paid-entry, cash-prize, or betting-like mechanics in MVP.
6. Add clear attribution where required.

## Output

- Safer implementation
- Consent-aware behavior
- Compliance checklist update

## Acceptance checklist

- [ ] No private data leaked to ads
- [ ] Consent respected
- [ ] No unlicensed assets added
- [ ] No gambling mechanic introduced
- [ ] Attribution preserved
- [ ] Public/private data boundary is clear
