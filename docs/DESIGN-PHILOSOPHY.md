# Design Philosophy

## Core Statement

Apple-like clarity meets World Cup energy.

MatchPulse should feel like an Apple-like premium World Cup companion: clean, calm, spacious, emotionally warm, mobile-first, highly readable, premium but not corporate, and playful only through subtle World Cup accents.

The product must not look like a betting app, casino product, generic fantasy sports dashboard, or cluttered analytics tool.

All UI should feel like a premium iPhone app first. Desktop layouts are responsive extensions of the mobile app experience, not the primary design target.

## Product Feel

MatchPulse should feel:

- Clean.
- Calm.
- Spacious.
- Emotionally warm.
- Mobile-first.
- Premium iPhone-app-like.
- Highly readable.
- Premium but not corporate.
- Playful only through subtle World Cup accents.
- Focused on prediction confidence, completion, and return visits.

The app should help users feel oriented and informed. It should never pressure users with noisy urgency, odds-like presentation, or overloaded dashboards.

## Visual Principles

- White and off-white are the dominant canvas.
- Use translucent card surfaces sparingly for depth and focus.
- Use soft shadows, not heavy elevation.
- Use large rounded corners for a friendly, premium feel.
- Maintain a strong typography hierarchy.
- Use restrained motion.
- Present one primary action per screen or state.
- Avoid overloaded dashboards.
- Show data as calm, digestible cards.
- Make AI insights feel trustworthy and explainable.
- Make simulator probabilities visually clear, not intimidating.
- Use subtle World Cup accents without relying on official FIFA marks, team crests, or copyrighted assets.

## Final Design-System Decisions

These decisions are locked for MVP UI implementation.

### Font Family

- Use Inter as the default product UI font.
- Use tabular numbers for scores, rankings, countdowns, and probabilities.
- Fraunces or Newsreader may be used only for editorial marketing hero moments.
- Do not use decorative sports fonts.

### Icon Style

- Use `lucide-react` as the preferred icon library for future implementation.
- Use outline icons only.
- Use `1.75px` or `2px` stroke.
- Icons must support labels, not replace labels.
- Avoid filled icons, football clipart, and emoji-style graphics.

### Corner Radius

Use this radius scale:

| Token | Value | Usage |
|---|---:|---|
| `xs` | `8px` | Small chips, compact status elements |
| `sm` | `12px` | Small controls |
| `md` | `16px` | Inputs, medium controls |
| `lg` | `24px` | Default product cards |
| `xl` | `32px` | Hero cards and modal surfaces |
| `full` | `999px` | Pills, avatars, segmented controls |

Rules:

- Default product card radius is `24px`.
- Small controls use `12px` to `16px`.
- Hero cards and modal surfaces use `32px`.

### Shadows

- Use subtle borders and soft shadows.
- Avoid heavy elevation.
- Most product cards should use a soft border plus minimal shadow.
- Strong shadows are reserved for modals or floating overlays only.

### Translucent Cards

- Default surfaces are solid white.
- Translucent or glass cards are allowed only for:
  - landing hero
  - dashboard summary cards
  - match insight cards
  - simulator probability cards
  - modal overlays
- Do not use glass effects for dense lists, long forms, or leaderboard rows.

### Illustration and Photography

- Use abstract, rights-safe editorial visuals.
- Prefer subtle geometric tournament patterns, soft blurred color fields, abstract pitch lines, and stadium-inspired shapes.
- Do not use official FIFA assets, team crests, player photos, or copyrighted match photography unless licensing is confirmed.
- Avoid cartoon football characters.

### Country Accent Themes

- Country accent themes are allowed only as subtle secondary decoration.
- Allowed uses:
  - small team chips
  - subtle card borders
  - tiny status bars
  - decorative gradients on team pages
  - team comparison accents
- Not allowed:
  - full-screen country-color themes
  - primary button color changes
  - navigation color changes
  - accessibility-critical text color changes
- The global MatchPulse brand remains dominant.

### Motion

- Use fast, restrained, Apple-like motion.
- Respect reduced motion preferences.
- Avoid playful bouncing football animations.

Durations:

| Motion type | Duration |
|---|---:|
| Micro interactions | `120ms` |
| Standard UI transitions | `180ms` |
| Card/page entrance | `240ms` |
| Modal/sheet | `280ms` |

Rules:

- Avoid anything above `400ms`.
- Standard easing: `ease-out`.
- Entrance easing: `cubic-bezier(0.16, 1, 0.3, 1)`.
- Exit easing: `ease-in`.

## Color Direction

| Token | Hex | Purpose |
|---|---:|---|
| Base White | `#FAFAF7` | Main app canvas |
| Card White | `#FFFFFF` | Cards, sheets, panels |
| Soft Border | `#E8E8E3` | Dividers, card borders, quiet outlines |
| Primary Text | `#111111` | Main text |
| Secondary Text | `#6B6B6B` | Supporting text, metadata |
| World Cup Blue | `#1B4DFF` | Primary actions and active states |
| Mexico Green | `#00A86B` | Positive outcomes and upward movement |
| Canada Red | `#E63946` | Locks, warnings, missed predictions, urgent deadlines |
| Warm Gold | `#F2B84B` | Premium, winners, champions, trophies, special highlights |
| Soft Sky | `#EAF1FF` | Quiet blue backgrounds |
| Soft Green | `#EAF8F1` | Quiet positive backgrounds |
| Soft Red | `#FDECEC` | Quiet warning backgrounds |

## Color Usage Rules

- Blue is used for primary actions and active states.
- Green is used for positive outcomes, qualification, correct predictions, and upward movement.
- Red is used for locks, warnings, missed predictions, and urgent deadlines.
- Gold is used for premium, winners, champions, trophies, and special highlights.
- Accent colors should never dominate the screen.
- The app should remain mostly white, calm, and premium.
- Avoid large blocks of saturated red, green, blue, or gold.
- Avoid gradients as the main visual identity.
- Use soft tint backgrounds for status cards instead of loud fills.

## Screen Guidance

### Landing Page

The landing page should feel editorial and premium.

Guidance:

- Lead with the World Cup prediction value proposition.
- Use generous spacing and high-quality typography.
- Show the product as a companion, not a betting or fantasy platform.
- Make sign-up, create group, and join group paths obvious.
- Use subtle tournament energy through color accents, match context, and motion.

### Dashboard

The dashboard should feel like an iOS command center.

Guidance:

- Prioritize next locks and unfinished predictions.
- Keep one clear primary next action.
- Use calm cards for private group standings, global rank, personalized news, insights, and simulator.
- Avoid dense tables and competing widgets.
- Show only the most useful information, with deeper pages for detail.

### Prediction Cards

Prediction cards should be fast, thumb-friendly, and minimal.

Guidance:

- Make score entry large enough for mobile.
- Show lock status clearly.
- Keep match context concise.
- Save state must be visible and reassuring.
- Completion state should feel rewarding without noise.

### Leaderboards

Leaderboards should feel celebratory but not noisy.

Guidance:

- Emphasize rank, movement, points, and top performers.
- Use gold sparingly for first place, trophies, and champion moments.
- Avoid casino-like shine, flashing effects, or excessive confetti.
- Keep tie-breaker and scoring explanations easy to find.

### AI Insight Cards

AI insight cards should look like trustworthy analysis, not chatbot output.

Guidance:

- Use structured evidence bullets.
- Show confidence and freshness clearly.
- Avoid conversational chatbot framing.
- Avoid unsupported certainty.
- Place insight cards near prediction decisions, not as a separate content feed.

### Simulator

The simulator should use simple probability cards and paths, not complex charts first.

Guidance:

- Start with stage probability cards.
- Make team paths easy to scan.
- Explain assumptions in plain language.
- Offer deeper model detail only after the simple view.
- Do not present probabilities like betting odds.

### Team Pages

Team pages should feel like elegant team profiles.

Guidance:

- Lead with team identity, group, next match, and tournament status.
- Show schedule, form, ranking, news, insights, and simulator probability as calm sections.
- Keep advanced data optional and digestible.
- Avoid unlicensed crests or official tournament marks.

## Spacing

- Prefer generous vertical spacing.
- Use consistent section rhythm.
- Avoid cramming unrelated modules into one viewport.
- Cards should breathe with clear internal padding.
- Mobile spacing should support thumb interaction and reduce accidental taps.
- Dense information should be grouped into progressive sections rather than compressed tables.

## Typography

- Use Inter as the default product UI font.
- Use strong hierarchy: page title, section title, card title, body, metadata.
- Prioritize readability over decorative type.
- Use large, clear numbers for scores, ranks, locks, and probabilities.
- Use tabular numbers for scores, rankings, countdowns, and probabilities.
- Keep metadata quiet with secondary text.
- Avoid all-caps labels except short status tags when necessary.
- Avoid tiny text in dense tables.
- Fraunces or Newsreader may be used only for editorial marketing hero moments.
- Do not use decorative sports fonts.

## Cards

- Cards are the main unit for digestible data.
- Use Card White on Base White with Soft Border and soft shadows.
- Use `24px` as the default product card radius.
- Use `32px` for hero cards and modal surfaces.
- Default surfaces are solid white.
- Use translucent surfaces only for approved hero, dashboard summary, insight, simulator, and modal contexts.
- Do not nest cards inside cards unless the inner element is a small status chip or input group.
- Each card should have a clear purpose and primary action.

## Buttons

- One primary action per screen or major state.
- Primary buttons use World Cup Blue.
- Secondary actions should be visually quieter.
- Destructive or urgent actions should use red only when necessary.
- Buttons must be thumb-friendly on mobile.
- Small controls use `12px` to `16px` radius.
- Avoid multiple equal-weight CTAs in the same view.

## Forms

- Forms should feel calm and guided.
- Break longer setup flows into clear steps.
- Use concise labels and helpful validation.
- Preserve user input after errors.
- Prediction inputs should be optimized for speed.
- Profile and preference forms should make privacy consequences clear.

## Empty States

- Empty states should still feel useful.
- Always explain what is missing and what to do next.
- Offer actions tied to prediction completion, team following, group creation, insights, or simulator use.
- Avoid generic placeholder illustrations.
- Empty states should maintain the premium calm tone.

## Loading States

- Use skeletons or quiet loading cards.
- Avoid spinners as the main loading experience when content structure is known.
- Keep loading states stable to avoid layout jumps.
- For scoring, simulations, and insights, explain when generation may take time.

## Motion

- Motion should be fast, restrained, and purposeful.
- Use subtle transitions for card entrance, save confirmation, rank movement, and completion states.
- Use `120ms` for micro interactions, `180ms` for standard UI transitions, `240ms` for card/page entrance, and `280ms` for modals/sheets.
- Avoid motion above `400ms`.
- Use `ease-out` for standard transitions, `cubic-bezier(0.16, 1, 0.3, 1)` for entrance, and `ease-in` for exit.
- Avoid bouncing, flashing, casino-like effects, and playful football animations.
- Respect reduced-motion preferences.
- Motion should help users understand state changes, not decorate the interface.

## Accessibility

- Maintain strong contrast for text and controls.
- Do not rely on color alone for status.
- Pair red/green status with labels, icons, or text.
- Ensure touch targets are large enough on mobile.
- Keep focus states visible.
- Support keyboard navigation for forms, menus, and prediction inputs.
- Use plain language for scoring, AI confidence, and simulator assumptions.

## Mobile-First Behavior

- Design mobile screens first.
- Treat iPhone-sized layouts as the primary design target.
- Desktop should adapt the mobile app experience without becoming a desktop-first website.
- The MVP is PWA-first; future App Store / Google Play distribution should preserve the same premium mobile web design through a Capacitor wrapper.
- Keep the next action visible near the top.
- Place prediction completion above news, simulator, and secondary content.
- Use thumb-friendly cards and controls.
- Avoid horizontal tables on mobile.
- Use progressive disclosure for details.
- Keep dashboards short enough to scan, with deeper pages for full detail.

## What to Avoid

- Dark betting app aesthetic.
- Casino colors.
- Dense tables as the first presentation.
- Excessive gradients.
- Generic SaaS dashboard look.
- Cartoonish football graphics.
- Unlicensed FIFA logos or team crests.
- Overuse of red, green, blue, or gold.
- Decorative sports fonts.
- Filled icons.
- Football clipart.
- Emoji-style graphics.
- Full-screen country-color themes.
- Glass effects for dense lists, long forms, or leaderboard rows.
- Heavy elevation.
- Odds-led layouts.
- Flashy rank animations.
- Cluttered fantasy sports widgets.
- Chatbot-looking AI cards.
- Complex charts before simple probability explanations.
- Multiple competing primary actions.

## Open Design Decisions

- Final marketing hero type choice if an editorial font is used.
- Final abstract visual asset style.
- Exact shadow token values.
- Exact card translucency opacity and blur values for approved glass contexts.
- Team accent mapping rules for teams with similar or conflicting national colors.
