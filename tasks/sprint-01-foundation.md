# Sprint 01: Foundation

## Goal

Create the project foundation: app shell, Firebase Auth, profile bootstrap, initial Firestore data model, Firestore Security Rules plan, emulator setup, and Cloud Run-compatible runtime.

## Tasks

- Initialize Next.js App Router with TypeScript and Tailwind.
- Add Firebase client SDK setup.
- Add Firebase Admin SDK server setup.
- Implement Firebase Auth flow.
- Create `users/{userId}` profile bootstrap plan.
- Add protected dashboard route.
- Add base layout and navigation.
- Add initial Firestore Security Rules.
- Add Firestore emulator setup.
- Add Firebase Auth emulator setup.
- Align project structure with Cloud Run deployment.
- Add environment variable template.

## Acceptance criteria

- Anonymous users cannot access dashboard.
- Authenticated users get or create a user profile document.
- Server credentials are never exposed to client code.
- Firestore Security Rules protect private documents.
- App has a basic responsive shell.
