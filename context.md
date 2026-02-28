# Context Snapshot (Pause/Resume)

Last updated: 2026-02-26 (UI shell + non-UI deliverables integrated, stub API scaffold + pass2 validation helpers added, frontend wired to stub API in progress)

## What This Project Is
`Roast My Landing Page` is a tool where users paste a landing page URL and an AI agent gives a brutal-but-useful conversion roast.

Core concept:
- Analyze copy, CTA, structure, messaging, trust/proof, objections
- Rank issues by conversion impact
- Provide concrete fixes + rewrites
- Make results shareable (viral loop via public roast pages/share cards)

## Key Product Decisions (and Why)

### 1) Desktop-first v1 (not mobile-first)
Decision:
- Build the primary experience for desktop/laptop first
- Keep mobile supported, but not the optimization priority

Why:
- Most users (founders/marketers) will review/edit landing pages on a laptop
- Roast output is dense (scores, ranked issues, rewrites), which is easier to consume on desktop
- Faster v1 delivery without over-optimizing mobile interactions too early

Implication:
- We still include a `Mobile Roast` section because mobile conversion issues matter

### 2) Two-pass AI pipeline
Decision:
- Pass 1: analysis JSON (scores + findings)
- Pass 2: UI composition JSON (presentation copy only)

Why:
- Separates accuracy from style
- Prevents “pretty wording” from mutating analysis facts
- Easier to validate, test, and debug

### 3) Frozen pass2 UI contract for v1 UI work
Decision:
- `schemas/pass2-ui-contract.json` is treated as stable for frontend build work

Why:
- UI can be built against a fixed shape without churn
- Supports parallel agents (UI, fixtures, validation, prompts) with low merge conflict

### 4) Keep pass1 schema looser for now
Decision:
- `schemas/pass1-analysis-contract.json` is a lightweight placeholder, not strict yet

Why:
- Real landing-page extraction/LLM outputs will reveal edge cases
- Premature strictness would likely cause rework during backend integration

## What Has Been Designed / Locked (Conceptually)

### V1 Rubric (100 points, weighted)
- Clarity of offer (20)
- Target audience clarity (10)
- Headline strength (10)
- CTA quality (15)
- Messaging / differentiation (15)
- Trust / proof (10)
- Structure / hierarchy (10)
- Objection handling (5)
- Mobile experience (5)

### Score bands
- 90-100: Strong page, mostly optimization
- 70-89: Good but leaving conversions on the table
- 50-69: Major clarity/messaging gaps
- 0-49: Confusing page, weak conversion foundation

### Output/issue principles
- Rank by impact first
- Every criticism includes a fix
- Quote exact copy when critiquing messaging
- Roast the page, not the founder
- Separate desktop vs mobile observations

### Desktop results page section order (locked for v1)
1. Top bar
2. Header summary card
3. Top 5 Problems
4. Category Scores
5. Quick Wins
6. Rewrite Pack
7. Mobile Roast
8. What’s Working
9. Footer / Disclaimer

## What Exists in the Repo Right Now

### Files currently present
- `README.md`
- `index.html`
- `styles.css`
- `app.js`
- `server.js`
- `package.json`
- `context.md`
- `docs/v1-decisions.md`
- `docs/api-contract.md`
- `docs/error-copy.md`
- `docs/validation-rules.md`
- `schemas/pass1-analysis-contract.json`
- `schemas/pass2-ui-contract.json`
- `fixtures/pass2-ui.sample.json`
- `fixtures/pass2-ui.partial-evidence.json`
- `fixtures/pass2-ui.blocked-page.json`
- `fixtures/pass2-ui.strong-page.json`
- `fixtures/pass2-ui.mobile-issues.json`
- `prompts/pass1-system.txt`
- `prompts/pass1-analysis-template.txt`
- `prompts/pass2-system.txt`
- `prompts/pass2-compose-template.txt`
- `prompts/README.md`
- `scripts/validate-pass2-fixtures.js`
- `utils/pass2-validation.js`
- `utils/pass2-boundary.js`

### Implemented prototype (static frontend app shell + desktop-first results)
There is now a static frontend v1 shell in `app.js` with screen state and a working flow:

- `Home/Input` -> `Analyzing` -> `Results`

The results screen preserves the locked desktop-first layout and renders from the pass2 sample fixture (`fixtures/pass2-ui.sample.json`) with a fallback to embedded fixture data when `fetch()` fails (e.g. `file://` preview).

### Agent A (UI shell flow) status: merged/confirmed
Confirmed in workspace (`app.js`, `styles.css`):
- Home/Input screen
  - URL input field
  - Roast mode selector
  - Submit CTA
  - “Use sample URL” helper
- Analyzing screen
  - Fake progress bar
  - Multi-step status list
  - Mode summary/status card
- Results screen
  - Existing desktop-first results layout preserved and reused
- Static flow wiring
  - Home -> Analyzing -> Results
  - Loads `fixtures/pass2-ui.sample.json` (with fallback fixture data)

Implementation notes (Agent A decisions):
- Kept `app.js` in one file to move quickly
- Did not modify `schemas/pass2-ui-contract.json`
- Preserved locked v1 results section order

Implemented results UI sections:
- Top bar with brand, URL pill, tone badge, action button
- Header summary card (title, subtitle, score, score band, verdict chip)
- Top 5 problem cards
- Category scores table
- Quick wins
- Rewrite pack (headline/subheadline/CTA lists) with copy buttons
- Mobile roast section
- What’s Working section
- Footer disclaimer + rerun button
- Sticky right rail (score, top problems, quick actions, section anchors)
- Copy-to-clipboard actions + toast feedback

Implemented app-shell behavior:
- State-driven screen rendering (`home`, `analyzing`, `results`)
- Fake analysis orchestration with timed step/progress updates
- Fixture loading from `./fixtures/pass2-ui.sample.json`
- Basic URL normalization (`https://` auto-prefix when missing)
- Rerun/cancel/reset flow back to home

### Validation / sanity checks already run
- `node --check app.js` passed
- Fixture JSON parse check passed (`fixtures/pass2-ui.sample.json`)
- `pass2-ui` schema JSON parse check passed
- Basic fixture sanity checks (array sizes, quote length, score sections) passed
- Agent A shell-flow presence verified in workspace (`renderHome`, `renderAnalyzing`, `renderResults`, fixture fetch path)

Note:
- Local static server preview could not be verified in this environment because the sandbox blocked binding a port.

## Git / Source Control Status

### GitHub remote (configured)
- `origin`: `https://github.com/buloxdev/roast_landingpage.git`

### Main branch status at pause time
- `main` is pushed to GitHub (`origin/main`)
- Repo is intended to use GitHub as the primary reference/backup point moving forward
- Current local working state may include in-progress changes while wiring frontend -> stub API (`app.js`, `context.md`) before the next commit

### Notable commits already on `main`
- `Add v1 API contract`
- `Add v1 prompt pack`
- `Add edge-case fixtures and error copy`
- `Add v1 validation rules spec`
- `Update project context after agent integrations`
- `Add project README and update context snapshot`
- `Add UI error states and stub API scaffold`
- `Load pass2 validation helpers in static app`

## Contract Status

### `pass2-ui` schema status: tightened and ready for UI work
`schemas/pass2-ui-contract.json` now enforces:
- strict top-level shape (`additionalProperties: false`)
- required nested keys
- enums:
  - `impact_badge`: `High | Medium | Low`
  - `confidence_badge`: `High | Medium | Low`
  - evidence `type`: `quote | ui_observation`
- numeric ranges:
  - `header.score_value` = `0..100`
  - category/mobile scores = `0..10`
- fixed array counts:
  - `top_3_problems` = 3
  - `score_section.items` = 9
  - `rewrite_pack_section.headlines` = 3
  - `rewrite_pack_section.subheadlines` = 2
  - `rewrite_pack_section.ctas` = 5
  - `share_card_copy.top_issues` = 3
- bounded array counts:
  - `quick_wins_section.items` = 3..5
  - `positives_section.items` = 2..4
- `share_card_copy.quote` max length = 140

### `pass1-analysis` schema status: intentionally loose (for now)
`schemas/pass1-analysis-contract.json` is currently a placeholder shape only.

Reason:
- Backend + real-world extraction/LLM edge cases likely require iteration before hardening

## Integrated Non-UI Deliverables (Now In Repo)

The following planning outputs are now implemented and committed on `main`.

### Prompt pack (integrated)
- `prompts/pass1-system.txt`
- `prompts/pass1-analysis-template.txt`
- `prompts/pass2-system.txt`
- `prompts/pass2-compose-template.txt`
- `prompts/README.md`

Status:
- Added to `main`
- Intended for direct use in pass1/pass2 model calls

### API contract (integrated)
- `docs/api-contract.md`

Endpoints defined:
- `POST /analyze`
- `POST /compose`
- `GET /roast/:id`

Status:
- Added to `main`
- Draft merged from recovered agent work (sync-first v1, partial-evidence handling documented)

### Edge-case fixtures + error copy (integrated)
Fixtures:
- `fixtures/pass2-ui.partial-evidence.json`
- `fixtures/pass2-ui.blocked-page.json`
- `fixtures/pass2-ui.strong-page.json`
- `fixtures/pass2-ui.mobile-issues.json`

Copy spec:
- `docs/error-copy.md`

Status:
- Added to `main`
- Fixtures were sanity-checked by the agent for pass2 contract expectations

### Validation/QA doc (integrated)
- `docs/validation-rules.md`
- Optional `scripts/` sanity checker

Status:
- `docs/validation-rules.md` added to `main`
- Optional helper script was intentionally skipped to keep scope tight

## Parallel Agent Workflow (Recommended)

This project is intentionally split for parallel work with low merge risk.

### Shared source-of-truth files (do not change casually)
- `docs/v1-decisions.md`
- `schemas/pass2-ui-contract.json`

### Agent assignments

#### Agent A: UI shell flow
Owns:
- `index.html`, `styles.css`, `app.js` (or new UI files if split)

Status:
- Implemented and confirmed in workspace

Delivered:
- `Home/Input` screen
- `Analyzing` screen (fake progress)
- Static flow: `Home -> Analyzing -> Results`
- Results render from `fixtures/pass2-ui.sample.json` with fallback

#### Agent B: Prompt pack
Owns:
- new `prompts/` folder only

Status:
- Implemented and integrated into `main`

Delivered:
- `prompts/pass1-system.txt`
- `prompts/pass1-analysis-template.txt`
- `prompts/pass2-system.txt`
- `prompts/pass2-compose-template.txt`
- `prompts/README.md`

#### Agent C: API contract doc
Owns:
- `docs/api-contract.md`

Status:
- Implemented and integrated into `main`

Delivered:
- `docs/api-contract.md`
- Merged from two rescued drafts recovered from temporary Codex worktrees

#### Agent D: Edge-case fixtures + error copy
Owns:
- new `fixtures/*.json`
- `docs/error-copy.md`

Status:
- Implemented and integrated into `main`

Delivered:
- `fixtures/pass2-ui.partial-evidence.json`
- `fixtures/pass2-ui.blocked-page.json`
- `fixtures/pass2-ui.strong-page.json`
- `fixtures/pass2-ui.mobile-issues.json`
- `docs/error-copy.md`

#### Agent E: Validation rules / QA spec
Owns:
- `docs/validation-rules.md`
- optional `scripts/` helper

Status:
- Implemented and integrated into `main`

Delivered:
- `docs/validation-rules.md`
- Optional helper script intentionally not added

### Merge/integration strategy
1. Merge prompts/docs/fixtures/validation work first (low risk)
2. Merge UI shell flow changes second
3. Run JSON/JS sanity checks
4. Fix only integration issues
5. Proceed to backend work after UI static flow is stable

### Workflow decision update (important)
The parallel worktree approach worked technically but was confusing operationally during recovery.

Decision for next phase:
- Use a simpler workflow in the main repo (single thread / single workspace)
- Commit small changes frequently
- Push to GitHub frequently
- Use `context.md` as the running source-of-truth checkpoint

Worktrees can be revisited later if needed, but they are not the default for the immediate next phase.

## Next Steps (Recommended Order)

### Immediate next step
Begin backend/UI integration work against the now-merged contracts/prompts/fixtures:
- Keep the current UI shell flow and replace fake analysis with real API calls behind the same screens
- Use edge-case fixtures + error copy to implement explicit error/partial-evidence states
- Stay in the main repo (no worktrees for now)

### Next implementation tasks (recommended)
1. Add URL validation + explicit UI error states using `docs/error-copy.md`
2. Wire `POST /analyze` and `POST /compose` behind the existing analyzing screen
3. Keep fixture fallback path for offline/frontend-only testing
4. Add pass2 response validation at the boundary before rendering
5. Implement persistence/permalink flow (`GET /roast/:id`)

### After initial API wiring lands
1. Harden `pass1-analysis` schema using observed real outputs
2. Add server-side validation/fidelity checks (pass1 -> pass2 invariants)
3. Add share page rendering for `GET /roast/:id`
4. Consider modularizing `app.js` after behavior is stable

## Known Constraints / Caveats
- Sandbox blocked local HTTP server port binding during validation, so UI was not visually verified in-browser from this environment
- `pass1-analysis` schema is intentionally under-specified for now
- `app.js` still contains embedded fallback fixture data (in addition to loading `fixtures/pass2-ui.sample.json`)

## Resume Checklist (for future thread)
- Confirm `main` is up to date with `origin/main`
- Check for any uncommitted local changes (`git status`) before starting new work
- Confirm `main` contains:
  - UI shell flow
  - prompt pack
  - API contract
  - edge-case fixtures + error copy
  - validation rules
  - stub API scaffold (`server.js`, `package.json`)
  - pass2 validation helpers (`utils/`, `scripts/`)
- Preserve `schemas/pass2-ui-contract.json` shape during integration
- Run sanity checks:
  - JSON parse on all `fixtures/*.json`
  - JSON parse on `schemas/*.json`
  - `node --check` on UI scripts
- Proceed with backend/UI integration (replace fake analysis flow with real API path)
- Start with UI URL validation + explicit error states using `docs/error-copy.md`

## Pause Update (2026-02-26): Frontend wired to stub API

### What was completed today
- `app.js` was updated to use the real two-pass stub API flow while preserving the existing UI shell/screens:
  - `POST /analyze`
  - `POST /compose`
- The existing UX flow is unchanged:
  - `Home/Input` -> `Analyzing` -> `Results`
  - Existing error screens still used
  - Existing fake progress/analyzing animation still used
- Fixture fallback behavior was preserved (dev-friendly):
  - If the stub API is unavailable / times out / returns 5xx, frontend falls back to local pass2 fixtures
  - A results warning banner now indicates when fixture fallback was used because the API was unavailable
- Pass2 response boundary validation is now applied before rendering using the existing `utils/pass2-validation.js`
- Error mapping was improved to route backend errors into current UI error states (including compose failure copy from `docs/error-copy.md`)
- `node --check app.js` passed after changes

### Files changed in this work
- `app.js` (only)

### Current behavior after wiring
- Default API base in frontend: `http://localhost:8787`
- When stub API is running:
  - frontend submits real requests to `/analyze` then `/compose`
  - renders pass2 JSON from `/compose` (after lightweight validation)
- When stub API is not running:
  - frontend still works using fixture fallback
  - results screen shows warning banner indicating fallback mode

### Stub/backend limitations noticed (important for next phase)
- Stub `POST /analyze` currently always returns `meta.evidence_status = "partial"`, so API-backed runs always show the partial-evidence warning
- Stub API mostly returns generic validation/internal errors and does not exercise all recommended contract error codes (`PAGE_BLOCKED`, `FETCH_FAILED`, `ANALYSIS_FAILED`, etc.)
- Stub `POST /compose` returns a mostly static sample UI payload (minimal mode-based variation), so results are not yet meaningfully driven by pass1 content

## Next Steps (Updated Recommended Order)

### Immediate next step
Run a quick end-to-end manual verification with both processes locally:
- `npm run api:stub` (stub API)
- local static server for UI (e.g. `python3 -m http.server 8090`)
- confirm:
  - API-backed run works
  - fallback banner appears when API is off
  - compose/invalid/error states map cleanly

### Next implementation tasks (recommended)
1. Add a small dev toggle / debug indicator for API mode vs fixture-fallback mode (optional, low risk)
2. Improve stub server scenarios so frontend error mappings can be exercised (`PAGE_BLOCKED`, `FETCH_FAILED`, `ANALYSIS_FAILED`, `COMPOSE_FAILED`)
3. Wire `GET /roast/:id` into frontend permalink/share behavior (currently still placeholder copy action)
4. Tighten pass2 boundary handling/logging for malformed compose responses (optional telemetry/debug console output)
5. Start real backend implementation behind the stub contract without changing frontend flow

### After backend moves beyond stub behavior
1. Harden `pass1-analysis` schema using observed real outputs
2. Add server-side validation/fidelity checks (pass1 -> pass2 invariants)
3. Implement share page rendering for `GET /roast/:id`
4. Consider modularizing `app.js` after behavior is stable

## Resume Update (2026-02-26, later): Stub QA scenarios + permalink wiring completed

### Additional work completed
- `server.js` now supports deterministic URL-triggered scenarios for frontend mapping tests:
  - `https://blocked.example.com` -> `422 PAGE_BLOCKED`
  - `https://timeout.example.com` -> `503 FETCH_FAILED` (retryable)
  - `https://example.com/dashboard` (or `/app`) -> `422 FETCH_FAILED` (redirected/dashboard)
  - `https://analysis-fail.example.com` -> `422 ANALYSIS_FAILED`
  - `https://rate-limit.example.com` -> `429 RATE_LIMITED`
  - `https://compose-fail.example.com` + subsequent `POST /compose` -> `422 COMPOSE_FAILED`
- `app.js` permalink action now uses real roast IDs from API-backed runs:
  - "Copy permalink" now copies `http://localhost:8787/roast/<roast_id>` when available
  - fixture mode still uses fallback demo permalink

### Files changed in this additional work
- `server.js`
- `app.js`
- `context.md`

### Validation completed
- `node --check app.js` passed
- `node --check server.js` passed
- Escalated local HTTP checks verified expected endpoint status/code matrix above

### Practical QA trigger URLs (for manual browser runs)
- Normal API run: `https://example-saas.com`
- Blocked: `https://blocked.example.com`
- Timeout: `https://timeout.example.com`
- Redirected/dashboard: `https://example.com/dashboard`
- Analysis fail: `https://analysis-fail.example.com`
- Rate limit: `https://rate-limit.example.com`
- Compose fail seed: `https://compose-fail.example.com`

## Resume Update (2026-02-28): Blank page fixed, local UI/API flow verified

### Root cause of the blank page
- The white/beige blank page was a frontend runtime error, not a server/CSS issue.
- A raw backtick-formatted string inside the `renderHome()` template in `app.js` caused Safari to evaluate `analyze` as a JavaScript variable.
- The on-page error surfaced as:
  - `Error: Can't find variable: analyze`

### Fixes applied
- `app.js`
  - removed the problematic inline backtick formatting in the home-screen copy
  - added guarded bootstrap/error rendering so startup failures show a visible error card instead of a blank page
- `index.html`
  - removed eager loading of `utils/pass2-validation.js` and `utils/pass2-boundary.js` from the page bootstrap path
  - now loads only the main app bundle
  - keeps a versioned `app.js` script URL to avoid stale Safari cache issues after local changes

### Current index bootstrap state
- `index.html` now loads only:
  - `./app.js?v=20260228c`
- `app.js` safely degrades if `window.Pass2Validation` is absent, so startup no longer depends on the `utils/` scripts.
- The temporary HTML watchdog fallback used during debugging was removed after the runtime issue was isolated.

### Validation completed today
- `node --check app.js` passed after the fix
- Local browser run confirmed the normal app now renders
- Safari cache behavior was confirmed: removing the asset version query caused stale JS to be reused; restoring the versioned script URL fixed it
- Stub API run confirmed the happy path works:
  - `https://example-saas.com` produced a full score/results flow

### Manual scenario matrix verified in browser
- `https://blocked.example.com`
  - `Run error` / `We could not access that page`
- `https://timeout.example.com`
  - `Run error` / `The page took too long to load`
- `https://compose-fail.example.com`
  - `We scored the page, but could not format the results`
- `https://analysis-fail.example.com`
  - analysis-failure state rendered correctly
- `https://rate-limit.example.com`
  - rate-limit state rendered correctly
- `https://example.com/dashboard`
  - `That URL did not open a landing page`

### What this confirms
- UI startup is working locally
- Safari is serving the current JS bundle correctly with the versioned script URL in place
- `POST /analyze` and `POST /compose` are working against the stub API
- Results rendering works
- Error-state mapping works across the main deterministic stub scenarios

### Next step
- Commit the final runtime/bootstrap fixes (`app.js`, `index.html`, `context.md`)
- Then choose between:
  1. deploy the current prototype
  2. improve the stub/backend realism
  3. replace more of the stub with real backend implementation

## Resume Update (2026-02-28, later): Frontend deployed, backend deploy prep added

### Deployment status
- Frontend is live on Vercel:
  - `https://roastlandingpage.vercel.app`
- Current live frontend is still effectively frontend-only because the hosted backend has not been deployed yet.
- The deployed site remains usable because the app still has fixture fallback when the API is unavailable.

### Deployment architecture chosen
- Frontend: Vercel
- Backend API: Render web service
- Frontend API path strategy:
  - local browser on `localhost` / `127.0.0.1` -> `http://localhost:8787`
  - deployed browser -> `/api`
  - optional override remains available through `window.ROAST_API_BASE_URL`

### Code/config added for backend hosting
- `server.js`
  - added `GET /health`
  - startup log now reflects hosted binding (`0.0.0.0:${PORT}`)
- `app.js`
  - API base resolution now supports local-vs-hosted behavior cleanly
- `render.yaml`
  - added for Render backend deployment
- `docs/deployment.md`
  - added exact backend deploy and Vercel rewrite steps

### Important deployment note
- A placeholder `vercel.json` rewrite file was intentionally **not** kept in the repo.
- Reason: committing a fake backend destination would break the next Vercel deploy.
- The real `vercel.json` should only be added after the actual Render backend URL is known.

### Next concrete step
1. Deploy the current backend stub to Render using `render.yaml`
2. Get the real Render service URL
3. Add `vercel.json` with the real `/api/*` rewrite destination
4. Redeploy Vercel
5. Verify the live site works against the hosted backend
