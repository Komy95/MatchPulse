# UX Principles

These principles guide MatchPulse MVP product decisions. The app should feel focused, fast, and useful during FIFA World Cup 2026 without turning into a general social network.

## Core Principles

1. **Always show the next useful action.**
   Every major screen should answer: what should I do next? Prioritize unfinished predictions, upcoming locks, matchday review, and relevant group/global leaderboard movement.

2. **The signed-in dashboard is the command center.**
   The dashboard is not a generic feed. It combines prediction urgency, group context, global rank, personalized team news, AI insight highlights, and simulator entry points.

3. **Prediction completion must be fast and obvious.**
   Users should be able to complete today's picks quickly, understand what remains, save confidently, and see a rewarding completion state.

4. **Insight features support picks.**
   AI insights, team pages, news, and simulator results should help users decide predictions. They should not compete with prediction completion as the primary task.

5. **Empty states must remain useful.**
   A user with no group, no news, no predictions, or no live matches should still have a clear path: follow teams, create or join a group, view insights, use the simulator, or learn how scoring works.

6. **Private groups stay private.**
   Group data, member predictions, and private standings must only appear to active members according to group visibility settings.

7. **Global leaderboard participation must be transparent.**
   Users should understand what public profile information appears, how scoring works, and how to opt out or anonymize where supported.

8. **Avoid gambling patterns.**
   Do not use betting language, odds-led calls to action, paid entry, prize framing, or wagering-style mechanics. Probabilities should be framed as model insights for friendly prediction confidence.

9. **Use data freshness honestly.**
   Show stale or incomplete data warnings where data affects predictions, insights, scores, or simulations.

10. **MVP avoids unnecessary social features.**
    Do not add chat, public feeds, reactions, comments, DMs, or complex notifications in MVP. Retention should come from predictions, matchdays, group competition, global rank, news, and simulator updates.

## UX Priority Order

When screen space is limited, prioritize:

1. Locked or soon-to-lock predictions.
2. Incomplete predictions.
3. Next matches and matchday status.
4. Private group standing.
5. Global rank movement.
6. AI insight that directly supports a pending pick.
7. Personalized team news.
8. Simulator shortcut.
9. Secondary profile or settings tasks.

## Writing Guidelines

- Use direct action labels: `Make picks`, `Review points`, `Create group`, `Join group`, `View insight`.
- Avoid vague labels such as `Explore`, `Discover`, or `Learn more` when a specific action exists.
- Use neutral model language: `model probability`, `simulation assumption`, `confidence`, `data freshness`.
- Avoid gambling vocabulary such as bet, wager, odds boost, payout, stake, ticket, parlay, or cash prize.

## Navigation Principles

- The dashboard should be reachable from every signed-in route.
- Group pages should link back to dashboard and prediction entry.
- Match pages should link to prediction entry when the match is unlocked.
- News items should link to team pages, match pages, or prediction entry when relevant.
- Simulator output should link to team pages and upcoming matches, not standalone speculation loops.

## Measurement Signals

Use these signals to evaluate UX quality:

- New user reaches first useful action within one minute.
- Group creator can generate an invite link in under 30 seconds.
- User can complete today's unlocked predictions without opening individual match pages.
- User can tell which matches are locked, pending, live, or finished at a glance.
- Empty dashboard still offers useful paths.
- Users can understand their private group rank and global rank without reading documentation.
- AI insight and simulator entry points increase prediction completion rather than distract from it.
