# Database and RLS skill

## Purpose

Create safe Supabase migrations and Row Level Security policies.

## Use this skill when

- Adding tables
- Changing private data access
- Implementing group, prediction, leaderboard, insight, or simulation storage

## Inputs

- `docs/DATABASE.md`
- Current Supabase migrations
- Access rules from product requirements

## Process

1. Define tables with clear ownership and foreign keys.
2. Add indexes for expected access patterns.
3. Enable RLS on private tables.
4. Write least-privilege policies.
5. Verify anonymous, member, admin, owner, and service-role behavior.
6. Add seed data only if it does not include private user data.

## Output

- SQL migration
- RLS policies
- Test notes for access behavior

## Acceptance checklist

- [ ] RLS enabled on private tables
- [ ] Non-members blocked
- [ ] Members can access only allowed rows
- [ ] Owners/admins have scoped write access
- [ ] Service role can run jobs
- [ ] Indexes support main queries
