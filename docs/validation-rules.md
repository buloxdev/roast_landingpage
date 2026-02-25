# V1 Validation + QA Rules (Pass2 UI Contract)

## Scope
- Defines validation and QA expectations for pass2 UI composition output in v1.
- Implementation-agnostic: no UI/schema changes implied.
- Source of truth:
  - `context.md`
  - `docs/v1-decisions.md`
  - `schemas/pass2-ui-contract.json`

## Validation Layers (v1)
1. Schema validation (JSON contract shape)
2. Semantic consistency checks (scores/ranks/cross-field alignment)
3. Pass1 -> Pass2 fidelity checks (presentation must not mutate analysis facts)
4. UI rendering QA (graceful behavior for long/empty/missing content)

## Pass2 Contract Validation Expectations

### Top-level contract
- Pass2 payload must validate against `schemas/pass2-ui-contract.json`.
- Top-level object is strict (`additionalProperties: false`). No extra keys.
- All required sections must exist:
  - `header`, `summary_panel`, `tabs`, `issue_cards`, `score_section`, `quick_wins_section`, `rewrite_pack_section`, `mobile_section`, `positives_section`, `share_card_copy`, `footer`

### Enums (must match exactly)
- `issue_cards[].impact_badge`: `High | Medium | Low`
- `issue_cards[].confidence_badge`: `High | Medium | Low`
- `issue_cards[].evidence[].type`: `quote | ui_observation`
- `score_section.items[].category`: one of the 9 locked rubric categories
- `score_section.items[].weight`: one of `20 | 15 | 10 | 5`

### Numeric ranges
- `header.score_value`: integer `0..100`
- `score_section.items[].score`: integer `0..10`
- `mobile_section.score`: integer `0..10`
- `issue_cards[].rank`: integer `1..5`

### Fixed counts
- `summary_panel.top_3_problems`: exactly `3`
- `score_section.items`: exactly `9`
- `rewrite_pack_section.headlines`: exactly `3`
- `rewrite_pack_section.subheadlines`: exactly `2`
- `rewrite_pack_section.ctas`: exactly `5`
- `share_card_copy.top_issues`: exactly `3`

### Bounded counts
- `issue_cards`: `1..5`
- `quick_wins_section.items`: `3..5`
- `positives_section.items`: `2..4`
- `mobile_section.findings`: `>= 1`
- `tabs`: `>= 5`
- `issue_cards[].evidence`: `>= 1`

### String rules
- All required strings are non-empty unless schema explicitly allows empty string.
- `share_card_copy.quote` must be `<= 140` chars.
- `issue_cards[].example_rewrite` may be empty string (`""`) and must not fail validation.

## Pass2 Fidelity Checks (Pass1 -> Pass2)
Pass2 is presentation copy only. It may rephrase wording, but must not change analysis facts from pass1.

### Must not change
- Overall score value (if pass1 provides a final score)
- Category scores and weights
- Issue ranking/order (impact-ranked, not style-ranked)
- Issue count selected for UI (top N) once chosen for pass2 generation
- Issue category assignment
- Evidence meaning (especially quoted copy)
- Mobile score/findings substance vs pass1 mobile analysis
- Positives/strengths substance (no invented strengths that contradict pass1)

### Allowed transformations
- Shortening for UI fit
- Headings/labels/copy polish
- Reformatting into sections/cards/tabs
- Rewrite suggestions phrased differently, as long as they address the same underlying issue/fix intent

### Fidelity failures (examples)
- Score changed to sound harsher/friendlier
- Rank order shuffled without pass1 change
- Quote evidence altered materially
- New issue added that was not in pass1 (or omitted top-ranked issue without explicit rule)
- Fix/rewrite no longer addresses the stated problem

## Score/Rank Consistency Rules

### Scores
- `score_section.items` must contain the 9 locked rubric categories (exactly once each).
- `mobile_section.score` must equal the `score_section.items` score for `Mobile experience`.
- `header.score_band` must match `header.score_value` using v1 bands:
  - `90-100`: Strong page, mostly optimization
  - `70-89`: Good but leaving conversions on the table
  - `50-69`: Major clarity/messaging gaps
  - `0-49`: Confusing page, weak conversion foundation
- `header.score_value` should be consistent with weighted category scores.
  - Recommended QA formula: `round(sum(score * weight) / 10)` where category scores are `0..10` and weights sum to `100`.
  - If implementation uses a different documented rounding rule, allow only the documented behavior (otherwise treat mismatch as defect).

### Ranks / top issues
- `issue_cards[].rank` values must be unique and sorted ascending from `1` with no gaps.
- `summary_panel.top_3_problems` should map to the first 3 ranked issues (same issue substance; wording may be shortened).
- `share_card_copy.top_issues` should reflect the same top 3 issue set as the ranked list/summary.
- Share/top-issue ordering should preserve pass1/pass2 rank order unless explicitly documented otherwise.

## Empty `example_rewrite` Handling
- Empty string is valid and expected in some cases.
- UI must not crash or render broken affordances when `example_rewrite === ""`.
- Do not show an empty copy target.
- Acceptable rendering behavior (implementation choice):
  - hide the rewrite body for that issue, or
  - show a neutral fallback label/text (e.g., rewrite unavailable)
- Validation should distinguish:
  - `""` (valid intentional empty)
  - missing field / wrong type (invalid)

## UI Rendering Edge Cases (QA Expectations)

### Long strings / overflow
- No unusable horizontal page overflow on desktop/tablet/mobile.
- Long content wraps or truncates safely in:
  - header title/subtitle
  - issue titles/problem/fix text
  - evidence quotes/observations
  - rewrite options (headlines/subheadlines/CTAs)
  - share quote / share issue bullets
  - tabs / anchor labels
- Copy buttons remain clickable and visually aligned when adjacent text wraps.

### Missing/invalid content handling
- Schema-invalid payloads should fail validation and route to error handling (not partially broken render).
- Required-field omissions should not produce silent incorrect UI.
- Valid-but-empty `example_rewrite` should render gracefully (see rule above).
- If optional UI conveniences depend on missing derived data, degrade safely (no JS errors, no stuck loading state).

### Section/order integrity
- Desktop results section order must remain the locked v1 order from `docs/v1-decisions.md`.
- Anchor/tab navigation must target existing sections only.

## Manual QA Checklist (v1)

### Data/contract checks
- Validate sample and edge fixtures against `pass2-ui-contract.json`.
- Verify `share_card_copy.quote` length (`<= 140`).
- Verify score/rank consistency rules above.
- Verify `Mobile experience` category score matches `mobile_section.score`.

### Desktop (primary UX)
- Results page is usable at common laptop/desktop widths.
- Locked section order is preserved.
- Sticky right rail (if present) does not overlap content or hide actions.
- Long strings do not break layout or action buttons.

### Tablet
- Content remains readable and navigable.
- Anchor nav/tabs still work and scroll to correct sections.
- No clipped cards/tables/rewrite options.

### Mobile (supported, not optimization-first)
- Page is usable end-to-end (read, scroll, copy, rerun).
- No horizontal overflow from long strings.
- Copy buttons remain tappable.
- Anchor nav/tabs (if shown) remain functional or degrade cleanly.

### Interaction checks
- Copy buttons copy the intended text (rewrite options, share copy, etc.).
- Copy success feedback appears and does not block further interaction.
- Anchor nav moves to correct section and does not land under sticky UI.
- Rerun/reset actions remain available after copy/share interactions.

## Defect Severity Guidance (optional triage)
- P0/P1: schema-invalid payload renders as broken UI; rank/score inconsistencies; crashes
- P2: wrong anchor targets, broken copy buttons, severe overflow on common widths
- P3: minor truncation/wrapping polish issues with content still usable
