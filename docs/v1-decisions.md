# Roast My Landing Page - V1 Locked Decisions

## Product Scope (Frozen for V1)
- Primary UX: desktop-first
- Secondary UX: mobile-supported (functional, not optimized first)
- Output: two-pass AI pipeline
  - Pass 1: analysis JSON (scored roast)
  - Pass 2: UI composition JSON (presentation copy only)
- No live tone switching in the UI for v1
- No advanced mobile interaction polish in v1

## Results Page Section Order (Desktop)
1. Top bar
2. Header summary card
3. Top 5 Problems
4. Category Scores
5. Quick Wins
6. Rewrite Pack
7. Mobile Roast
8. What's Working
9. Footer / Disclaimer

## Layout (Desktop First)
- 12-column grid
- Main content: 8 columns
- Sticky right rail: 4 columns
- Max content width: 1280px (target range 1200-1360px)

## V1 Build Sequence
1. Home/Input page
2. Results page shell (desktop-first layout)
3. Render from fixture JSON (pass-2 sample)
4. Copy/share actions
5. Loading + error states
6. Real API wiring (pass-1 + pass-2)

## Guardrails
- Preserve analysis fidelity between pass-1 and pass-2
- Roast the page, not the founder
- Every criticism must include a fix
- Rank issues by impact, not style nitpicks
