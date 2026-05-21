# Empty States

Empty states in MatchPulse should keep users oriented and productive. They should explain what is missing, why it matters, and what the user can do next.

## Empty State Principles

- Always provide a useful next action.
- Prefer actions tied to prediction completion or onboarding.
- Avoid decorative filler.
- Do not imply data exists when it does not.
- Include freshness or availability context where data is delayed.
- Keep copy short and specific.

## Core Empty States

### No Account Preferences

User context: signed in, no favorite teams or news preferences.

Message: `Choose teams to personalize your World Cup home.`

Primary action: `Choose teams`

Secondary action: `Skip for now`

Backend support:

- `user_preferences`
- preference update endpoint

Acceptance criteria:

- User can continue without preferences.
- Dashboard remains useful with generic World Cup matches and news.

### No Private Group

User context: signed in, no active group memberships.

Message: `Create a private group or join one when you receive an invite.`

Primary action: `Create group`

Secondary actions:

- `Join with invite`
- `View global leaderboard`
- `Try simulator`

Acceptance criteria:

- User can still view team pages, news, insights, simulator, and global leaderboard if opted in.

### Empty Group Leaderboard

User context: group exists, no scored matches or not enough members.

Message: `The leaderboard starts when World Cup results are scored.`

Primary action: `Invite members`

Secondary action: `Make first predictions`

Acceptance criteria:

- Show member count.
- Show scoring preset.
- Do not show fake placeholder ranks.

### No Predictions Due

User context: all currently available picks are complete or no matches are open.

Message: `You're caught up. Next picks open when upcoming fixtures are ready.`

Primary action: `View next matches`

Secondary actions:

- `Read team news`
- `Open simulator`

Acceptance criteria:

- Show next known kickoff or lock time when available.

### No Personalized News

User context: followed teams have no available news.

Message: `No fresh stories for your teams right now.`

Primary action: `View followed teams`

Secondary actions:

- `Manage teams`
- `Show World Cup news`

Acceptance criteria:

- Show source/freshness context if news ingestion is delayed.

### No AI Insight

User context: match exists but insight unavailable.

Message: `Insight is unavailable until enough reliable data is ready.`

Primary action: `View team pages`

Secondary action: `Check match details`

Acceptance criteria:

- Do not render partial or schema-invalid AI output.
- Show data freshness timestamps when available.

### No Global Rank

User context: user has not opted in or has no scored predictions.

Message: `Join the global leaderboard to compare your World Cup score.`

Primary action: `Join global leaderboard`

Secondary action: `How scoring works`

Acceptance criteria:

- Explain public display name and privacy before opt-in.
- If opted in but no score yet, show pending first scored match.

### No Simulator Result

User context: public simulation unavailable or custom run pending.

Message: `Simulation results are being generated.`

Primary action: `View teams`

Secondary action: `Try again`

Acceptance criteria:

- Show last generated simulation if available.
- Show model version and generated timestamp when available.

## Error States

### Prediction Locked During Edit

Message: `This match locked while you were editing. Your saved pick remains unchanged.`

Action: `Review locked picks`

Requirement:

- Preserve unlocked edits for other matches.

### Prediction Save Failed

Message: `Your picks were not saved. Check your connection and try again.`

Action: `Retry save`

Requirement:

- Keep local edited values visible.

### Invite Invalid

Message: `This invite is no longer available.`

Actions:

- `Request a new invite`
- `Create your own group`

Requirement:

- Do not reveal private group data.

### Provider Data Stale

Message: `Some match data may be out of date.`

Action: `View details`

Requirement:

- Show last updated timestamp and affected surface.

### Session Expired

Message: `Sign in again to continue.`

Action: `Sign in`

Requirement:

- Preserve intended destination after authentication.
