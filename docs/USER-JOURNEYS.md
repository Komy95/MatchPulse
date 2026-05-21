# User Journeys

These journeys define the canonical MVP experience for MatchPulse. The goal is a focused World Cup 2026 prediction product where users always know what to do next, prediction completion is fast, and intelligence features support better picks.

## 1. First-Time Onboarding

### User Goal

Start using MatchPulse quickly, personalize the experience, join or create a group, and make a first prediction.

### Entry Points

- Public landing page.
- Invite link.
- Shared match, team, news, or simulator link.

### Step-by-Step Flow

1. User lands on a clear World Cup prediction page.
2. User signs up or signs in.
3. User sets display name.
4. User chooses favorite and followed teams.
5. User selects language, locale, and news preference basics.
6. User chooses to create a group, join by invite, or continue without a group.
7. Dashboard shows the next useful action.
8. User makes first available prediction or explores upcoming matches if no predictions are open.

### Primary UI Screens/Components

- Landing page.
- Auth screens.
- Profile setup.
- Team preference picker.
- News preference controls.
- Create group or join group prompt.
- Dashboard next action banner.
- Prediction completion card.

### Empty States

- No teams selected: show generic World Cup matches and ask user to choose teams.
- No group joined: show create/join group CTAs plus simulator, news, and global leaderboard options.
- No available predictions: show next match schedule and team pages.

### Error States

- Auth failure.
- Display name unavailable or invalid.
- Preference save failure.
- Invite expired or revoked.

### Success States

- Profile completed.
- Preferences saved.
- Group created or joined, if selected.
- First prediction saved, or dashboard shows a clear next action.

### Required Data or Backend Support

- Auth session.
- `profiles`.
- `user_preferences`.
- Teams and competition reference data.
- Invite validation.
- Group membership.
- Upcoming matches.
- Prediction write endpoint.

### Acceptance Criteria

- User can reach dashboard after signup without joining a group.
- User can skip team preferences and add them later.
- Invite link users resume invite flow after auth.
- First prediction CTA appears when unlocked matches exist.

### Suggested Implementation Tasks for Codex

- Build onboarding state model.
- Add profile setup route.
- Add favorite team picker.
- Add preference save endpoint.
- Add post-auth redirect handling for invites and shared links.
- Add dashboard state for new users.

## 2. Signed-In Home Dashboard

### User Goal

Understand what needs attention now and move quickly to predictions, match review, group standings, global rank, news, insights, or simulator.

### Entry Points

- App home after sign-in.
- Dashboard nav.
- Post-auth redirect.
- Return from group, prediction, match, team, news, or simulator pages.

### Step-by-Step Flow

1. Dashboard loads a prioritized next action.
2. User sees unfinished predictions and nearest locks first.
3. User reviews next matches and match statuses.
4. User checks private group standing.
5. User checks global rank movement if opted in.
6. User reads relevant AI insight highlights or personalized news.
7. User opens simulator if they want broader tournament context.

### Primary UI Screens/Components

- Dashboard route.
- Next action banner.
- Prediction completion module.
- Next matches list.
- Private group standings card.
- Global rank card.
- AI insight highlights.
- Personalized news panel.
- Simulator shortcut.

### Dashboard Variants

- New user without group: show choose teams, create/join group, global leaderboard, news, simulator.
- User with one group: show that group's unfinished predictions and standing.
- User with multiple groups: show aggregate unfinished predictions and group switcher.
- User with incomplete predictions: expand prediction module and prioritize AI insights for those matches.
- User on matchday: show live, locking, and locked match status.
- User after matches finished: show points earned, rank movement, and next prediction CTA.

### Empty States

- No group.
- No predictions due.
- No personalized news.
- No global rank.
- No AI insights.
- No simulator result.

### Error States

- Dashboard data partially unavailable.
- Prediction save failed.
- Leaderboard snapshot missing.
- News provider unavailable.
- Insight invalid or stale.

### Success States

- User completes predictions.
- User reviews points after final result.
- User joins or creates group.
- User opts into global leaderboard.
- User opens a relevant insight, team page, or simulator view.

### Required Data or Backend Support

- Dashboard aggregate service.
- Group memberships.
- Prediction statuses.
- Match statuses and lock times.
- Private leaderboard snapshots.
- Global leaderboard status.
- News feed.
- Insight summaries.
- Simulation summary.

### Acceptance Criteria

- Dashboard always has one primary next action.
- Incomplete predictions appear above news and simulator.
- No-group users still have useful actions.
- Private group data is only visible to members.
- Global leaderboard respects privacy settings.

### Suggested Implementation Tasks for Codex

- Implement `lib/dashboard` view-model builder.
- Build dashboard components listed in `docs/DASHBOARD-SPEC.md`.
- Add tests for next-action priority.
- Add dashboard authorization tests.
- Add responsive layout checks.

## 3. No-Group User Journey

### User Goal

Use MatchPulse meaningfully before joining a private group.

### Entry Points

- Signup without invite.
- User leaves or is removed from all groups.
- User skips group creation.

### Step-by-Step Flow

1. Dashboard explains that groups are optional but recommended.
2. User follows teams and receives personalized news.
3. User views match insights and team pages.
4. User uses simulator.
5. User opts into global leaderboard if desired.
6. User can create or join a group later.

### Primary UI Screens/Components

- Dashboard no-group state.
- Team preference picker.
- Personalized news panel.
- Global rank card.
- Simulator shortcut.
- Create/join group CTAs.

### Empty States

- No teams followed.
- No news available.
- No global leaderboard opt-in.

### Error States

- Preference save failure.
- Global opt-in validation failure.
- Invite invalid when joining later.

### Success States

- Preferences saved.
- Global leaderboard opt-in completed.
- Group created or joined later.

### Required Data or Backend Support

- User preferences.
- Public matches.
- Public insights.
- Public simulator.
- Global leaderboard opt-in.

### Acceptance Criteria

- No-group dashboard is not a dead end.
- User can reach create/join group in one click.
- User can use news, team pages, insights, and simulator without private group membership.

### Suggested Implementation Tasks for Codex

- Add no-group dashboard state.
- Add create/join CTAs.
- Add global leaderboard opt-in card.
- Add generic World Cup news fallback.

## 4. Create Private Group Journey

### User Goal

Create a private prediction group quickly and invite members.

### Entry Points

- Dashboard CTA.
- Navigation.
- Post-onboarding prompt.

### Step-by-Step Flow

1. User enters group name.
2. User selects competition, defaulting to FIFA World Cup 2026.
3. User selects scoring preset, defaulting to Hybrid 3-2-1.
4. User chooses privacy and prediction visibility settings.
5. User chooses booster availability if MVP booster is enabled.
6. Group is created.
7. Invite link/code is generated.
8. User lands on admin group view.
9. Empty leaderboard explains when rankings begin.

### Primary UI Screens/Components

- Create group form.
- Scoring preset selector.
- Privacy settings panel.
- Invite link card.
- Group admin overview.
- Empty leaderboard.

### Empty States

- No members yet.
- No predictions yet.
- No scored matches yet.

### Error States

- Invalid group name.
- Unsupported competition.
- Invite generation failure.
- Permission error.

### Success States

- Group created.
- Owner membership created.
- Invite link copied or displayed.
- User can make first prediction.

### Required Data or Backend Support

- Group create endpoint.
- Group settings validation.
- Invite generation.
- Owner membership creation.
- Firestore Security Rules.

### Acceptance Criteria

- Group can be created in under 30 seconds.
- FIFA World Cup 2026 is the default competition.
- Invite link is available immediately after creation.
- Empty leaderboard is clear and useful.

### Suggested Implementation Tasks for Codex

- Build create group route and form.
- Add group validation schema.
- Implement invite creation.
- Add group admin empty states.
- Add tests for owner creation and Firestore access rules.

## 5. Join By Invite Journey

### User Goal

Join a private group from an invite with minimal friction and no privacy leakage.

### Entry Points

- Invite link.
- Manual invite code entry.

### Step-by-Step Flow

1. User opens invite.
2. App validates invite status without exposing private data.
3. Logged-out user signs in and resumes invite.
4. Logged-in user confirms they want to join.
5. Existing member is sent to group.
6. New member joins and lands on group dashboard or prediction entry.

### Invite Cases

- Logged out user: authenticate, then resume invite.
- Logged in user: show group name if permitted by invite rules, then join.
- Different account than expected: warn user which account is active before joining.
- Expired invite: show invalid state and request-new-invite guidance.
- Revoked invite: show unavailable state.
- User already joined: redirect to group.
- User previously removed: block or require admin approval based on group policy.

### Primary UI Screens/Components

- Invite landing.
- Auth redirect.
- Join confirmation.
- Invalid invite state.
- Group overview.

### Empty States

- Invite valid but group has no scored matches.
- Invite valid but no upcoming matches.

### Error States

- Expired invite.
- Revoked invite.
- Removed user.
- Group full if member limits exist later.

### Success States

- Membership active.
- User lands on group page.
- User sees first prediction CTA.

### Required Data or Backend Support

- Invite lookup.
- Invite expiration and revocation.
- Membership status.
- Removed-user policy.
- Auth redirect preservation.

### Acceptance Criteria

- Logged-out invite users resume join after auth.
- Invalid invite never exposes member list or private leaderboard.
- Duplicate joins are idempotent.
- Removed users cannot silently rejoin unless policy allows it.

### Suggested Implementation Tasks for Codex

- Implement invite landing route.
- Add join endpoint idempotency.
- Add invalid invite components.
- Add tests for invite edge cases.

## 6. Prediction Journey

### User Goal

Enter, save, edit, and complete predictions quickly before matches lock.

### Entry Points

- Dashboard next action.
- Group page.
- Match page.
- News or insight CTA.

### Step-by-Step Flow

1. User opens prediction entry.
2. Matches are grouped by date and lock status.
3. User enters scores in bulk.
4. Save state confirms progress.
5. User can leave with partial completion.
6. Changed picks are visible before saving.
7. Lock warnings appear near deadline.
8. Locked matches become read-only.
9. Completion state confirms user is done for today.

### Primary UI Screens/Components

- Prediction entry page.
- Bulk prediction table or list.
- Match row score inputs.
- Group selector.
- Save bar.
- Lock warning.
- Completion state.

### Empty States

- No open matches.
- All predictions complete.
- No group yet.

### Error States

- Prediction locked.
- Invalid score.
- Booster conflict.
- Save failed.
- Unauthorized group access.

### Success States

- Picks saved.
- Partial progress saved.
- All today's picks complete.
- Locked picks viewable.

### Required Data or Backend Support

- Group matches.
- Lock times.
- Prediction upsert endpoint.
- Prediction revision history.
- Group scoring and booster settings.

### Acceptance Criteria

- User can save multiple predictions in one action.
- Save is idempotent.
- Locked matches cannot be edited.
- Lock checks use UTC.
- Completion state appears when no action remains for today.

### Suggested Implementation Tasks for Codex

- Build bulk prediction UI.
- Add prediction validation schema.
- Implement idempotent upsert.
- Add revision history.
- Add lock-warning logic.
- Add tests for locking and idempotency.

## 7. Matchday and Post-Match Review

### User Goal

Understand what happened, how many points were earned, and what to do next.

### Entry Points

- Dashboard after match start or finish.
- Match detail page.
- Group leaderboard.

### Step-by-Step Flow

1. Match starts and prediction becomes locked.
2. User sees locked pick and live or final score.
3. After final result, scoring runs.
4. User sees points earned.
5. User compares against group average where allowed.
6. Leaderboard movement appears.
7. User sees scoring explanation.
8. User is prompted to make next predictions.

### Primary UI Screens/Components

- Match detail.
- Post-match result card.
- Points earned card.
- Group comparison.
- Leaderboard movement card.
- Scoring explanation.
- Next prediction CTA.

### Empty States

- Scoring pending.
- No group comparison available.
- No next prediction open.

### Error States

- Final score delayed.
- Scoring recalculation failed.
- Provider data stale.

### Success States

- Points awarded.
- Leaderboard snapshot updated.
- Next prediction CTA shown.

### Required Data or Backend Support

- Match status updates.
- Final score ingestion.
- Scoring recalculation.
- Leaderboard snapshots.
- User prediction and scoring result.

### Acceptance Criteria

- User can see actual score and their pick.
- Points earned are explained.
- Leaderboard movement is visible after scoring.
- Next action is available after review.

### Suggested Implementation Tasks for Codex

- Build post-match review card.
- Add score explanation helper.
- Add leaderboard movement calculation.
- Add scoring pending state.
- Add tests for scoring display.

## 8. Global Leaderboard Journey

### User Goal

Compare performance against all opted-in users while controlling public profile visibility.

### Entry Points

- Dashboard global rank card.
- Leaderboard nav.
- Post-onboarding prompt.
- Post-match review.

### Step-by-Step Flow

1. User sees global leaderboard invitation.
2. User reviews public display name and country/region choice.
3. User opts in or declines.
4. User sees rank, points, movement, and filters.
5. User can open scoring explanation.
6. User can opt out or update display settings later.

### Primary UI Screens/Components

- Global rank card.
- Global leaderboard page.
- Opt-in dialog.
- Public profile display controls.
- Scoring explanation.
- Country filter.

### Empty States

- User not opted in.
- No scored predictions yet.
- No users in selected filter.

### Error States

- Display name invalid.
- Country selection invalid.
- Leaderboard snapshot unavailable.

### Success States

- User opted in.
- Rank visible.
- Privacy settings saved.
- Opt-out applied.

### Required Data or Backend Support

- Global leaderboard opt-in flag.
- Public display name.
- Optional country/region.
- Global scoring snapshots.
- Ranking filters.

### Acceptance Criteria

- User understands what is public before opting in.
- Email and private group data are never shown.
- Global scoring rules are independent and explainable.
- User can opt out from profile settings.

### Suggested Implementation Tasks for Codex

- Add global leaderboard schema.
- Add opt-in endpoint.
- Build global leaderboard page.
- Add privacy settings controls.
- Add ranking and filter tests.

## 9. Personalized News and Team Intelligence Journey

### User Goal

Follow teams, read relevant news, and move from context to predictions or team pages.

### Entry Points

- Onboarding.
- Dashboard news panel.
- Team page.
- Profile preferences.

### Step-by-Step Flow

1. User selects favorite and followed teams.
2. User chooses language and locale.
3. Dashboard shows relevant news.
4. User opens source, team page, match insight, or prediction CTA.
5. User hides topics or sources if unwanted.
6. User updates preferences later.

### Primary UI Screens/Components

- Team preference picker.
- News preference controls.
- Personalized news panel.
- Team page.
- Source hide controls.

### Empty States

- No followed teams.
- No fresh stories.
- Source unavailable.

### Error States

- News ingestion stale.
- Preference save failure.
- Unsupported locale.

### Success States

- Preferences updated.
- News personalized.
- User moves from story to team or prediction.

### Required Data or Backend Support

- `user_preferences`.
- `news_sources`.
- `news_items`.
- Team mappings.
- Source hide list.
- Language and locale settings.

### Acceptance Criteria

- News items have attribution.
- Full unlicensed articles are not copied.
- User can manage teams and hidden sources.
- News links to team pages, match pages, or prediction entry when relevant.

### Suggested Implementation Tasks for Codex

- Add news data model.
- Add preference controls.
- Add news aggregation service.
- Add dashboard news panel.
- Add source attribution tests.

## 10. Simulator Journey

### User Goal

Understand tournament probabilities and use them to make better predictions.

### Entry Points

- Dashboard simulator shortcut.
- Team page.
- Match page.
- Navigation.

### Step-by-Step Flow

1. User opens public simulation view.
2. User sees stage probabilities and generated timestamp.
3. User opens a team probability page or detail.
4. User can view dark horse teams.
5. User can read assumptions.
6. User can navigate to team pages or upcoming predictions.
7. Authenticated user can start custom simulation if supported in MVP.

### Primary UI Screens/Components

- Public simulator page.
- Stage probability table.
- Team probability detail.
- Dark horse view.
- Assumptions panel.
- Prediction links.

### Empty States

- Simulation generating.
- Team eliminated.
- No custom simulation available.

### Error States

- Simulation stale.
- Custom run failed.
- Missing team data.

### Success States

- Public simulation loaded.
- User understands assumptions.
- User navigates to team or prediction page.

### Required Data or Backend Support

- Public simulation run.
- `simulation_team_probs`.
- Model assumptions.
- Input hash and model version.
- Custom simulation endpoint.

### Acceptance Criteria

- Simulation displays generated timestamp, run count, model version, and assumptions.
- Output links to teams and predictions.
- Probabilities are not presented as betting odds.
- Custom runs are authenticated and stored.

### Suggested Implementation Tasks for Codex

- Build simulator page.
- Build team probability detail.
- Build dark horse view.
- Add assumptions panel.
- Add simulator-to-prediction links.
- Add tests for World Cup 2026 format.

## 11. Tournament Phase Transitions

### User Goal

Understand what changes as the tournament moves from group stage to knockouts.

### Entry Points

- Dashboard during transition.
- Match list.
- Simulator.
- Team pages.

### Step-by-Step Flow

1. Group-stage matches finish.
2. App shows pending qualification if not finalized.
3. Round of 32 bracket appears when teams are known.
4. Prediction flow updates to knockout matches.
5. Leaderboards explain current scoring context.
6. Simulator updates assumptions and bracket state.
7. Team pages show qualification or elimination status.

### Primary UI Screens/Components

- Dashboard phase banner.
- Match list.
- Knockout prediction entry.
- Leaderboard context label.
- Simulator bracket/state view.
- Team status badge.

### Empty States

- Waiting for bracket confirmation.
- No matches between phases.
- Team eliminated.

### Error States

- Provider bracket delayed.
- Conflicting qualification data.
- Simulation outdated after bracket update.

### Success States

- Bracket confirmed.
- New predictions available.
- Simulator refreshed.
- Team pages updated.

### Required Data or Backend Support

- Tournament phase status.
- Qualification and bracket data.
- Match generation or ingestion.
- Simulator invalidation.
- Team status updates.

### Acceptance Criteria

- Users understand when no predictions are currently available.
- Knockout predictions use 90-minute plus stoppage-time scoring.
- Simulator uses extra time and penalties for advancement.
- Team pages clearly show active or eliminated status.

### Suggested Implementation Tasks for Codex

- Add phase status model.
- Add dashboard phase banner.
- Add knockout match grouping.
- Add simulator invalidation on bracket updates.
- Add phase-transition empty states.

## 12. Profile, Consent, and Privacy Journey

### User Goal

Manage identity, preferences, privacy, consent, notifications, and account lifecycle.

### Entry Points

- Profile nav.
- Onboarding.
- Global leaderboard opt-in.
- Consent prompt.

### Step-by-Step Flow

1. User sets or edits display name.
2. User manages favorite teams, language, and locale.
3. User controls global leaderboard visibility.
4. User manages consent choices for ads and analytics.
5. User manages notification preferences if MVP includes reminders.
6. User requests account deletion.
7. User requests data export if applicable.

### Primary UI Screens/Components

- Profile page.
- Display name form.
- Preferences form.
- Global leaderboard privacy controls.
- Consent controls.
- Notification preferences.
- Account deletion flow.

### Empty States

- No notification preferences configured.
- No global leaderboard participation.
- No teams followed.

### Error States

- Profile save failure.
- Consent update failure.
- Account deletion blocked by active operation.
- Export unavailable.

### Success States

- Profile saved.
- Preferences updated.
- Global leaderboard visibility changed.
- Consent saved.
- Account deletion requested or completed.

### Required Data or Backend Support

- Profile table.
- Preference table.
- Consent records.
- Global leaderboard opt-in flag.
- Notification preference fields.
- Account deletion process.
- Data export process if required.

### Acceptance Criteria

- User can change display name.
- User can edit preferences after onboarding.
- User can opt out of global leaderboard.
- Consent choices are stored and respected.
- Account deletion behavior is documented before implementation.

### Suggested Implementation Tasks for Codex

- Build profile route.
- Add profile update endpoint.
- Add consent storage.
- Add global visibility controls.
- Add account deletion request flow.
- Add tests for privacy-sensitive settings.
