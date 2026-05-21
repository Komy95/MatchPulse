# Firestore data and rules skill

## Purpose

Create safe Firestore data-model changes and conceptual Firestore Security Rules guidance.

## Use this skill when

- Adding Firestore collections or subcollections
- Changing private data access
- Implementing group, prediction, leaderboard, insight, news, or simulation storage

## Inputs

- `docs/FIRESTORE-DATA-MODEL.md`
- `docs/FIREBASE-SECURITY-RULES.md`
- Access rules from product requirements

## Process

1. Define documents around access patterns and query needs.
2. Add denormalized read models only where they reduce meaningful read complexity.
3. Identify required composite indexes as documentation or implementation tasks.
4. Define least-privilege Firestore Security Rules behavior.
5. Verify anonymous, member, admin, owner, requester, and server-only behavior.
6. Add seed data only if it does not include private user data.

## Output

- Firestore collection/subcollection design
- Security rule behavior notes
- Required index notes
- Test notes for access behavior

## Acceptance checklist

- [ ] Non-members blocked from private group data
- [ ] Members can access only allowed documents
- [ ] Owners/admins have scoped write access through server validation
- [ ] Server-only jobs own ingestion, scoring, AI, news, and simulation writes
- [ ] Indexes support main queries
