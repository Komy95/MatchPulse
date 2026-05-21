# Dashboard Spec

The signed-in dashboard is the central command center for MatchPulse. It should combine next locks, unfinished picks, personalized team news, private group standings, global rank, match insights, and simulator entry points without becoming a social feed.

## Dashboard Goals

- Make the user's next action obvious.
- Drive prediction completion before lock.
- Give quick confidence-building context through AI insights, team news, and simulator shortcuts.
- Summarize private group and global competition status.
- Provide useful value even when the user has not joined a group.
- Keep the World Cup 2026 MVP focused.

## Information Priority

1. Urgent lock warning and unfinished predictions.
2. Today's and next matches.
3. Private group standing and group-specific next action.
4. Global rank movement if opted in.
5. AI insight highlights for upcoming unlocked matches.
6. Personalized team news.
7. Simulator shortcut.
8. Account, preferences, and consent reminders.

## Primary Layout

### Desktop

Use a two-column command-center layout:

- Main column:
  - Next action banner.
  - Prediction completion module.
  - Next matches.
  - AI insight highlights.
  - Personalized team news.
- Side column:
  - Private group standings summary.
  - Global rank card.
  - Simulator card.
  - Preference or onboarding reminders.

### Mobile

Use a single-column priority stack:

1. Next action banner.
2. Prediction completion module.
3. Next matches.
4. Private group standings.
5. Global rank.
6. AI insight highlights.
7. Personalized news.
8. Simulator shortcut.

Avoid hiding prediction actions behind tabs on mobile.

## Core Components

### Next Action Banner

Purpose: one clear task based on user state.

Examples:

- `3 picks lock in 42 minutes`
- `Finish today's predictions`
- `Review points from Spain vs Japan`
- `Create or join a group`
- `Choose teams to personalize your news`

Primary CTA rules:

- If predictions are incomplete and lock within 24 hours, CTA is `Make picks`.
- If matches finished since last visit, CTA is `Review points`.
- If user has no group, CTA is `Create group` with secondary `Join with invite`.
- If no preferences exist, CTA is `Choose teams`.
- If all daily tasks are done, CTA is `View next matches`.

### Prediction Completion Module

Shows:

- Number of unlocked matches needing predictions.
- Nearest lock time in UTC-aware display.
- Progress indicator: `8 of 12 picks saved`.
- Group selector when user has multiple groups.
- Fast entry rows for the next unlocked matches.
- Save status: unsaved, saving, saved, failed.
- Locked state for matches past `lock_at`.

Actions:

- `Make picks`
- `Save picks`
- `Review locked picks`
- `Switch group`

Rules:

- Do not show other users' predictions before the group's visibility policy allows it.
- Preserve partial entries locally until saved or explicitly discarded.
- Surface lock warnings at 24 hours, 1 hour, and 10 minutes before lock.
- If a match locks while the page is open, disable editing and explain why.

### Next Matches Module

Shows:

- Upcoming matches in chronological order.
- Match status: scheduled, locking soon, locked, live, finished.
- User prediction status per active group where relevant.
- AI insight availability.
- Data freshness warning when provider data is stale.

Actions:

- `Predict`
- `View insight`
- `Team pages`
- `Review result`

### Private Group Standings Module

Shows:

- Active group selector.
- User rank, points, movement, and leader.
- Top three entries.
- Exact hits and tendency hits.
- Last snapshot time.
- Link to full leaderboard.

States:

- Empty group: show invite CTA and explain leaderboard appears after members join or matches finish.
- No scored matches: show members and pending first result.
- Multiple groups: show active group with compact switcher.

### Global Rank Module

Shows when opted in:

- Global rank.
- Points.
- Movement since last scored matchday.
- Country or region rank if selected and allowed.
- Link to scoring explanation.

Shows when not opted in:

- Short explanation of global leaderboard.
- Display name and country requirements.
- CTA: `Join global leaderboard`.

Privacy rules:

- Do not expose email.
- Use public display name only.
- Allow opt-out from profile settings.
- If country is optional, allow `Prefer not to show`.

### AI Insight Highlights

Purpose: help users make pending predictions.

Shows:

- 1 to 3 upcoming matches with concise model summary.
- Confidence level.
- Freshness warning if applicable.
- Link to full match insight.

Rules:

- Prioritize matches the user has not predicted.
- Do not invent injuries, lineups, odds, quotes, or player-specific claims.
- Show low-confidence or missing-data warnings clearly.

### Personalized Team News

Shows:

- News for favorite and followed teams.
- Tournament context items.
- Source attribution.
- Published time.
- Language or locale where available.

Actions:

- `Open source`
- `View team`
- `Predict related match`
- `Hide source`
- `Manage teams`

Rules:

- Do not republish full unlicensed articles.
- Use licensed content or compliant snippets and links.
- Deduplicate repeated stories across sources.
- If no personalized news exists, show followed team schedule and preference CTA.

### Simulator Shortcut

Shows:

- Public simulation timestamp.
- One useful insight, such as biggest mover or dark horse.
- Link to full simulator.
- Link to user's followed team probability where available.

Rules:

- Position as prediction support, not betting advice.
- Surface assumptions and model version from the simulator page.

## Dashboard States

### New User Without Group

Priority:

1. Choose favorite teams if missing.
2. Create or join a group.
3. Explore next matches.
4. View personalized or starter news.
5. Join global leaderboard if eligible.
6. Try simulator.

Empty copy should emphasize that the app is still useful without a group.

### User With One Group

Priority:

1. Finish predictions for that group.
2. Show nearest lock.
3. Show group rank or first-empty leaderboard state.
4. Show global rank.
5. Show match insights and team news.

### User With Multiple Groups

Priority:

1. Aggregate unfinished predictions across groups.
2. Show group selector.
3. Highlight the group with the nearest lock or most unfinished picks.
4. Show compact standings for each active group.

Rules:

- Avoid forcing users to repeat identical predictions unnecessarily unless group settings differ.
- If group prediction modes or booster rules differ, make that visible before saving.

### User With Incomplete Predictions

Priority:

1. Next action banner: `Finish picks`.
2. Prediction module expanded.
3. AI insight highlights for incomplete matches.
4. News and simulator lower on page.

### User On Matchday

Priority:

1. Live and soon-to-lock matches.
2. Locked prediction status.
3. Live score if available.
4. Group leaderboard snapshot status.
5. Next unlocked picks.

### User After Matches Finished

Priority:

1. Points earned.
2. Rank movement in private group and global leaderboard.
3. Prediction result comparison.
4. Explanation of scoring.
5. CTA to make next predictions.

## Empty States

- No group: create group, join invite, follow teams, try simulator.
- No predictions due: show next match date, news, simulator, leaderboard.
- No news: show followed team schedule and manage preferences.
- No global rank: explain opt-in and privacy.
- No AI insight: show data freshness status and team pages.
- No simulator run: show last known assumptions or pending generation status.

## Error States

- Prediction save failed: keep local edits, show retry, explain if lock passed.
- Session expired: prompt sign-in, preserve intended destination.
- Provider data stale: show warning and last updated timestamp.
- Leaderboard unavailable: show last snapshot if available.
- News source unavailable: hide failed item and keep other modules usable.
- Insight schema invalid: do not render malformed insight; show unavailable state.

## Required Data

- Auth session and profile.
- User preferences.
- Active group memberships and roles.
- Group settings and prediction visibility policy.
- Upcoming matches and lock times.
- User prediction status by match and group.
- Leaderboard snapshots.
- Global leaderboard status and opt-in flag.
- Match insights and freshness metadata.
- Personalized news items and source metadata.
- Public simulation summary.
- Consent and privacy settings.

## Acceptance Criteria

- Dashboard always shows one primary next action.
- A user with incomplete predictions can reach prediction entry in one click.
- A no-group user sees at least three useful actions.
- Private group standings never leak to non-members.
- Global leaderboard card respects opt-in and display-name settings.
- News items include source attribution and do not show full unlicensed articles.
- AI insight highlights are hidden or downgraded when data is stale or invalid.
- The mobile dashboard shows unfinished predictions before news and simulator content.
- Post-match users can see points earned and the next prediction CTA.

## Suggested Implementation Tasks for Codex

- Create dashboard route and layout under the signed-in app shell.
- Define dashboard data loader/service in `lib/dashboard`.
- Add typed dashboard view model that aggregates groups, predictions, matches, insights, news, global rank, and simulator summary.
- Build `NextActionBanner`.
- Build `PredictionCompletionCard`.
- Build `NextMatchesList`.
- Build `PrivateGroupStandingsCard`.
- Build `GlobalRankCard`.
- Build `InsightHighlights`.
- Build `PersonalizedNewsPanel`.
- Build `SimulatorShortcutCard`.
- Add empty and error state components.
- Add API or server actions for profile preferences and global leaderboard opt-in.
- Add tests for dashboard view-model priority ordering.
- Add authorization tests for private group data shown on dashboard.
