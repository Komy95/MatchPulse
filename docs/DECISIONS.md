# Architecture Decision Records

Use this file to track important decisions.

## ADR-001: Use World Cup 2026 as the first competition

Decision: Build the MVP around FIFA World Cup 2026 only.

Reason: The World Cup has a clear deadline, high casual fan interest, and a complex format that makes simulation valuable.

Consequence: League and Champions League support must be modeled generically but not fully shipped in MVP.

## ADR-002: Use Firebase Auth over Supabase Auth

Decision: Use Firebase Auth for MVP authentication.

Reason: Firebase Auth integrates directly with the target Firebase/GCP architecture, supports web authentication flows, works with Firestore Security Rules, and can be verified server-side in Cloud Run route handlers.

Consequence: User identity is keyed by Firebase UID. Auth-aware data access must be modeled in Firestore Security Rules and enforced again in server-side Cloud Run validation for private mutable operations.

## ADR-003: Use Cloud Firestore over Supabase Postgres for MVP

Decision: Use Cloud Firestore as the primary application database for MVP.

Reason: Firestore fits the Firebase/GCP target architecture, supports real-time and document-oriented read models, and works well for dashboard, group, prediction, leaderboard, insight, news, and simulator documents when designed around access patterns.

Consequence: Data modeling must favor denormalized documents, query-specific indexes, explicit public/private read models, and server-owned derived data. Relational migration and RLS design are not part of the MVP architecture.

## ADR-004: Use Cloud Run for the full-stack Next.js runtime

Decision: Run the Next.js 15 App Router application on Cloud Run, optionally fronted by Firebase Hosting or Firebase App Hosting.

Reason: Cloud Run supports server-side route handlers, Firebase Admin SDK, OpenAI calls, provider APIs, and runtime flexibility for full-stack Next.js.

Consequence: API routes run server-side and must validate Firebase Auth tokens, enforce authorization, and use Secret Manager for sensitive configuration.

## ADR-005: Use Cloud Run Jobs for background processing

Decision: Use Cloud Run Jobs for provider ingestion, scoring, global leaderboard generation, AI refreshes, simulations, news ingestion, and maintenance tasks.

Reason: These tasks are asynchronous, idempotent, and often scheduled or event-driven. Cloud Run Jobs pair well with Cloud Scheduler, Pub/Sub, Secret Manager, Firestore, and Cloud Logging.

Consequence: Background processing must be designed around idempotent jobs, structured logging, retry behavior, and clear job metadata.

## ADR-006: Use provider abstraction independent from vendor payloads

Decision: Normalize all sports-provider data behind an adapter interface.

Reason: Provider choice is a major implementation and cost fork. The app should survive vendor changes across Sportmonks, API-Football, and football-data.org.

Consequence: UI components must never depend on vendor payloads directly. Provider IDs, freshness timestamps, and attribution requirements must be stored with normalized Firestore documents.

## ADR-007: Treat AI as explanation, not truth

Decision: AI insights explain structured evidence. They do not generate facts.

Reason: This reduces hallucination, compliance, and trust risk.

Consequence: Insight generation must use strict schemas, allowed claims, source freshness, input hashes, model versions, and rejection handling.

## ADR-008: Use Elo-informed Poisson simulation for MVP

Decision: Start with Elo-informed independent Poisson plus Monte Carlo.

Reason: It is explainable, practical, fast, and good enough for first simulator release.

Consequence: Persist model version, assumptions, input hash, run count, and generated timestamp so future model changes are auditable.
