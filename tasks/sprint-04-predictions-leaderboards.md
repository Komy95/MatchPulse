# Sprint 04: Predictions and Leaderboards

## Goal

Users can submit predictions, and the system can score matches and produce leaderboards.

## Tasks

- Create predictions and prediction revisions tables.
- Add bulk upsert endpoint.
- Enforce UTC lock time.
- Add prediction cards and bulk save UI.
- Implement Hybrid 3-2-1 scoring.
- Add leaderboard snapshot tables.
- Add scoring recalculation job.
- Add leaderboard page.

## Acceptance criteria

- Predictions can be saved before lock.
- Predictions after lock are rejected.
- Bulk save is idempotent.
- Revisions are retained.
- Finished matches trigger points calculation.
- Leaderboard ranks are stable and visible to members.
