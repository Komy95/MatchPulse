# Sprint 03: Private Groups

## Goal

Users can create private groups, invite members, and manage basic settings.

## Tasks

- Create Firestore group, member, and invite document model.
- Add Firestore Security Rules for group member reads.
- Build create-group API route.
- Build join-by-invite API route.
- Build group detail page.
- Add group settings for prediction mode and scoring preset.
- Add invite code generation and revocation.

## Acceptance criteria

- Authenticated user can create a group.
- Owner is automatically added as group owner.
- Invite link allows a new user to join.
- Non-members cannot read group data.
- Owner/admin can update settings.
