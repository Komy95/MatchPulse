# Sprint 01: Foundation

## Goal

Create the project foundation: app shell, auth, profile bootstrap, base database schema, and RLS structure.

## Tasks

- Initialize Next.js App Router with TypeScript and Tailwind.
- Add Supabase browser and server clients.
- Implement auth flow.
- Create `profiles` table and profile bootstrap.
- Add protected dashboard route.
- Add base layout and navigation.
- Add first RLS policies.
- Add environment variable template.

## Acceptance criteria

- Anonymous users cannot access dashboard.
- Authenticated users get or create a profile row.
- Service role key is never exposed to client.
- RLS is enabled on private tables.
- App has a basic responsive shell.
