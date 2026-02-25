# Error / Loading Copy (v1)

Purpose: pass1/pass2 loading, retry, and failure copy for the static UI flow and future API wiring.

## Tone Rules
- Direct and calm
- Specific about what failed (URL, page access, analysis, compose)
- No blame language
- Give one primary next action
- Avoid pretending a roast exists when evidence is blocked

## Loading States

### Analyzing Screen (default)
- Title: `Roasting your page...`
- Subtitle: `We are checking the page, extracting copy, and building your roast.`

### Step Labels (progress list)
1. `Loading page`
2. `Reading copy and CTA flow`
3. `Scoring clarity, messaging, and trust`
4. `Composing results for the UI`

### Slow Page / Slow Analysis Hint (optional after delay)
- `This is taking longer than usual. Large pages, scripts, or bot checks can slow analysis.`

## Input Validation Errors

### Empty URL
- Message: `Paste a landing page URL to start the roast.`
- CTA: `Try sample URL`

### Invalid URL Format
- Message: `That URL does not look valid. Paste a full page URL (for example, https://example.com).`
- CTA: `Fix URL`

### Unsupported Protocol
- Message: `Use an http:// or https:// URL.`
- CTA: `Fix URL`

## Page Access Errors (Fetch / Capture)

### Blocked Page (login / bot protection / permission)
- Title: `We could not access that page`
- Message: `The page appears to be behind login, bot protection, or a permission gate, so we could not see the landing page content.`
- Primary CTA: `Try another URL`
- Secondary CTA: `Use sample URL`
- Helper: `If this is a preview link, make sure it loads publicly without login.`

### Timeout / Page Never Stabilized
- Title: `The page took too long to load`
- Message: `We could not finish reading the page before the timeout. Heavy scripts, redirects, or third-party widgets may be blocking analysis.`
- Primary CTA: `Retry roast`
- Secondary CTA: `Try another URL`

### Redirected to App / Dashboard
- Title: `That URL did not open a landing page`
- Message: `We were redirected to an app or dashboard page instead of a marketing page.`
- Primary CTA: `Try another URL`
- Helper: `Use the public marketing URL (homepage, pricing, product, or campaign page).`

## Pass 1 / Analysis Errors

### Analysis Failed (generic)
- Title: `Analysis failed`
- Message: `We loaded the page, but the roast analysis did not complete.`
- Primary CTA: `Retry roast`
- Secondary CTA: `Back to home`

### Partial Evidence / Low Confidence
- Title: `Roast generated with limited evidence`
- Message: `We found enough page content to produce a roast, but some sections were hidden, blocked, or not fully visible. Confidence is lower on a few findings.`
- Primary CTA: `View roast`
- Secondary CTA: `Retry roast`
- Helper: `Interactive content (tabs, carousels, modals) can reduce evidence quality.`

## Pass 2 / UI Composition Errors

### Compose Failed (analysis exists)
- Title: `We scored the page, but could not format the results`
- Message: `The analysis completed, but the UI composition step failed. Retry to regenerate the results screen.`
- Primary CTA: `Retry formatting`
- Secondary CTA: `Run roast again`

### Invalid Pass2 Contract Response
- Title: `Results format error`
- Message: `We received a roast result in an unexpected format and could not render it safely.`
- Primary CTA: `Retry roast`
- Secondary CTA: `Use sample URL`

## Retry / Recovery Copy

### Retry In Progress
- Message: `Retrying roast...`

### Retry Succeeded Toast
- Message: `Roast ready.`

### Copy Action Failure (optional)
- Message: `Could not copy to clipboard. Select and copy manually.`

## Empty / Missing Fixture Fallback (local dev)
- Title: `Could not load sample roast fixture`
- Message: `Falling back to the built-in sample result for local preview.`
- CTA: `Continue`

## Notes for Implementation
- Blocked-page scenarios should prefer the `pass2-ui.blocked-page.json` fixture pattern rather than inventing normal findings.
- Partial-evidence scenarios should preserve the normal pass2 shape and communicate uncertainty in copy/disclaimer, not by changing schema.
- Keep button labels short to avoid wrapping in the top bar and dialogs.
