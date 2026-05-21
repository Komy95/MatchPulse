# Architecture Decision Records

Use this file to track important decisions.

## ADR-001: Use World Cup 2026 as the first competition

Decision: Build the MVP around FIFA World Cup 2026 only.

Reason: The World Cup has a clear deadline, high casual fan interest, and a complex format that makes simulation valuable.

Consequence: League and Champions League support must be modeled generically but not fully shipped in MVP.

## ADR-002: Use Next.js and Supabase

Decision: Use Next.js App Router with Supabase Auth, Postgres, and RLS.

Reason: This stack minimizes backend overhead while supporting authenticated private groups, public pages, route handlers, and background jobs.

Consequence: RLS policy design is a critical security deliverable.

## ADR-003: Use provider abstraction for sports data

Decision: Normalize all sports-provider data behind an adapter interface.

Reason: Provider choice is a major implementation and cost fork. The app should survive vendor changes.

Consequence: UI components must never depend on vendor payloads directly.

## ADR-004: Treat AI as explanation, not truth

Decision: AI insights explain structured evidence. They do not generate facts.

Reason: This reduces hallucination, compliance, and trust risk.

Consequence: Insight generation must use strict schemas, allowed claims, source freshness, and rejection handling.

## ADR-005: Use Elo-informed Poisson simulation for MVP

Decision: Start with Elo-informed independent Poisson plus Monte Carlo.

Reason: It is explainable, practical, fast, and good enough for first simulator release.

Consequence: Persist model version and assumptions so future model changes are auditable.
