# Context Snapshot (Pause/Resume)

Last updated: 2026-03-17 (Codex context handoff skill added for future pause/resume updates; product work still resumes from the 2026-03-08 deployment/debug plan below)

## Session Handoff Workflow
- A reusable Codex skill now exists at `/Users/anthonyaguilar/.codex/skills/context-handoff/`.
- In future sessions, invoke `Use $context-handoff` before stepping away or shutting down to refresh this file with work completed, current state, blockers, and next steps.
- Keep the durable project background in this file, but rewrite stale next steps instead of appending noisy diary notes forever.

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

### Desktop results page section order (current implementation)
1. Top bar
2. Verdict hero
3. Warning/fallback banner (when relevant)
4. Top conversion blockers
5. Rewrite Pack / Copy Lab
6. Appendix
7. Footer / Disclaimer

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

### Latest shipped UI pass (2026-03-15)
The frontend was upgraded from a report-like prototype into a more guided product experience.

Home/Input updates:
- Hero simplified around one promise: paste the page and get the sharpest fix first
- Reduced visual clutter by replacing the old stat/chip pile with a tighter proof row and output preview
- Mode/style controls kept, but framed as lighter guidance instead of the main event
- Added helper copy to explain that roast style changes flavor, not recommendations

Results updates:
- Old summary card replaced with a verdict hero (`verdict-hero`) that leads with score, diagnosis, and best next move
- Top issues promoted into tighter spotlight cards with clearer “why it matters / what to change / rewrite” framing
- Rewrite section reworked into a more tool-like “Copy Lab” with a recommended bundle rail
- Long-form details moved into an appendix instead of competing with the primary narrative
- Sidebar now emphasizes “Ship this first” rather than duplicating score-only content

Mobile polish:
- Reduced topbar clutter on narrow screens
- Added a sticky mobile action bar for fast access to Copy Lab / top fix
- Tightened spacing and results hierarchy so the verdict and primary action sit higher in the flow

Supporting assets:
- Added `favicon.svg`
- Bumped static asset cache-busting query params in `index.html`

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
- Top bar with brand, URL pill, tone badge, source/fallback badge, action button
- Verdict hero (score, diagnosis, verdict chip, strongest next move)
- Top conversion blocker spotlight cards
- Rewrite pack / Copy Lab with compare cards and recommended bundle
- Appendix with quick wins, scores, mobile roast, positives, and full finding breakdown
- Footer disclaimer + rerun button
- Sticky right rail focused on the strongest recommended fix
- Copy-to-clipboard actions + toast feedback

Implemented app-shell behavior:
- State-driven screen rendering (`home`, `analyzing`, `results`)
- Fake analysis orchestration with timed step/progress updates
- Fixture loading from `./fixtures/pass2-ui.sample.json`
- Basic URL normalization (`https://` auto-prefix when missing)
- Rerun/cancel/reset flow back to home

### Validation / sanity checks already run
- `node --check app.js` passed
- `node --check server.js` passed
- `node --check scripts/dev.js` passed
- `node --check scripts/smoke-ui.js` passed
- `npm run validate:pass2-fixtures` passed
- `npm run test:smoke` passed

### UI smoke coverage now in repo
`scripts/smoke-ui.js` now provides a lightweight Playwright-based smoke suite that starts the UI server and verifies:
- Happy path: home -> sample results -> mobile action bar
- Fallback path: API requests aborted in-browser -> fixture fallback warning + results render
- Error path: blocked scenario -> blocked error screen + recovery action

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

## Resume Update (2026-02-28, later): Real page fetch/extraction started in backend

### What changed
- `server.js` no longer relies only on `buildMockAnalysis()` for normal URLs.
- For non-test URLs, `POST /analyze` now:
  - fetches the submitted page HTML
  - extracts headline, support copy, headings, paragraphs, CTA candidates, and proof/objection language signals
  - builds heuristic category scores from extracted page content
  - generates ranked pass1 issues, quick wins, positives, and a basic rewrite pack from that extraction
- `POST /compose` now maps the pass1 analysis into a dynamic pass2 UI payload instead of always returning the same static sample values.

### What did not change
- Deterministic QA scenario URLs still work:
  - blocked
  - timeout
  - redirected/dashboard
  - analysis-fail
  - rate-limit
  - compose-fail
- The pass1/pass2 contracts were kept intact.

### Current caveat
- This is still heuristic analysis, not full browser rendering or LLM-backed interpretation.
- Extraction is based on fetched HTML/text, so JavaScript-heavy pages may still come back as partial evidence.

### Next step after this code lands
1. Validate local and hosted `/analyze` output against a few real landing pages
2. Check whether the live Vercel + Render app now produces meaningfully different roasts for different URLs
3. Tighten the UI copy and visual design after the backend behavior feels credible enough

## Resume Update (2026-02-28, later): Optional OpenAI-backed pass1/pass2 added

### What changed
- `server.js` now supports a real OpenAI-backed pipeline when `OPENAI_API_KEY` is present.
- The backend reads:
  - `OPENAI_API_KEY`
  - `OPENAI_PASS1_MODEL` (default `gpt-4o-mini`)
  - `OPENAI_PASS2_MODEL` (default `gpt-4o-mini`)
- Existing prompt files are now wired into the backend:
  - `prompts/pass1-system.txt`
  - `prompts/pass1-analysis-template.txt`
  - `prompts/pass2-system.txt`
  - `prompts/pass2-compose-template.txt`

### Runtime behavior
- If `OPENAI_API_KEY` is configured:
  - `/analyze` uses the extracted page evidence plus OpenAI for pass1 JSON
  - `/compose` uses OpenAI to generate pass2 UI JSON against the frozen pass2 schema
- If `OPENAI_API_KEY` is not configured:
  - the backend falls back to the current heuristic analysis/composition path
- If OpenAI fails at runtime:
  - the backend currently falls back to the heuristic path rather than hard-failing the request

### Supporting files added/updated
- `.env.example`
- `.gitignore`
- `README.md`

### Operational next step
1. Set `OPENAI_API_KEY` on the Render backend service
2. Redeploy/restart Render
3. Verify `/health` returns `openai_configured: true`
4. Re-test several real landing pages and compare output quality against the heuristic path

## Resume Update (2026-02-28, later): Full API mode required for normal roasts

### Decision
- Normal roasts should use the real OpenAI pipeline every time.
- Silent fallback to heuristic analysis/composition was removed for normal URLs.

### Runtime behavior now
- If `OPENAI_API_KEY` is missing:
  - `/analyze` and `/compose` fail with an AI-backend-not-configured error path
- If OpenAI fails during pass1:
  - `/analyze` fails instead of returning heuristic output
- If OpenAI fails during pass2:
  - `/compose` fails instead of returning heuristic output

### What still remains deterministic
- The hardcoded QA scenario URLs still exist for testing blocked/timeout/rate-limit/compose-fail states.

### Immediate operational requirement
1. Set `OPENAI_API_KEY` on Render
2. Redeploy Render
3. Confirm `/health` shows `openai_configured: true`
4. Re-test live roasts on real URLs

## Resume Update (2026-02-28 23:13 CST): Live app status, local-dev stabilization, and next focus

### Current live architecture
- Frontend is live on Vercel:
  - `https://roastlandingpage.vercel.app`
- Backend is live on Render:
  - `https://roast-landingpage-api.onrender.com`
- Vercel rewrites `/api/*` to the Render backend.
- Render `/health` confirms `openai_configured: true`, which means the environment variable is present.

### Important backend diagnosis
- The current OpenAI failure is **not** a bad server deploy.
- It is **not** a bad proxy path.
- It is **not** a missing env var.
- Render logs now show the real upstream problem:
  - OpenAI returns `429`
  - `openai.code = insufficient_quota`
- Meaning:
  - the key is being read
  - the API account/org behind the key does not currently have usable API quota/billing
- Required fix outside the codebase:
  1. update API billing/quota in the OpenAI Platform account
  2. re-test a roast after quota is restored

### Current OpenAI model configuration guidance
- Cheapest safe default for now:
  - `OPENAI_PASS1_MODEL=gpt-4o-mini`
  - `OPENAI_PASS2_MODEL=gpt-4o-mini`
- Lower-cost experiment to try later:
  - `OPENAI_PASS1_MODEL=gpt-4.1-nano`
  - `OPENAI_PASS2_MODEL=gpt-4o-mini`
- Reason:
  - pass2 is user-facing and schema-constrained, so quality matters more there

### Local dev stability changes completed
- Repeated local breakage was caused by:
  - stale browser cache
  - port collision with another local project
  - frontend pointing to outdated localhost API ports
  - local backend/OpenAI assumptions leaking into normal UI testing
- Current local workflow is intentionally simpler:
  - `npm run dev`
  - open `http://127.0.0.1:8091`
- Current expected behavior:
  - local UI serves from repo-owned dev server
  - browser calls `/api`
  - dev server proxies `/api/*` to the live Render backend by default
- Explicit local backend mode now exists separately:
  - `npm run dev:local-api`
  - only use this when intentionally testing backend code locally

### Frontend/API bug fixed today
- `app.js` previously treated backend `503` responses as if the API were unreachable.
- That incorrectly triggered fixture fallback and showed misleading “Stub API unavailable” copy.
- Fixed behavior:
  - true network/proxy failures can still fall back if needed
  - backend `503` responses now surface as real error states instead of fake fixture fallback
- Also removed outdated `stub API` wording from the UI where it was misleading.

### UI work completed today
- Home screen language was moved away from internal/prototype phrasing.
- The home screen URL pill was removed.
- A more vibrant visual direction was started in `styles.css`.
- Roast style selector was added to the home screen:
  - `Sharp`
  - `Deadpan`
  - `Unhinged`
- Roast style only affects pass2 phrasing, not factual analysis.

### Prompt/style work completed today
- `prompts/pass2-system.txt` and `prompts/pass2-compose-template.txt` were strengthened so the roast voice can be more vivid where it matters:
  - headline
  - one-liner
  - issue titles
  - share quote
- `server.js` style guidance for pass2 was tightened.
- Pass2 temperature was raised from `0.5` to `0.8` to allow more tonal variation.
- These changes require Render to be healthy against OpenAI quota before they can be properly evaluated.

### Current known product state
- The app architecture is real and working:
  - public frontend
  - public backend
  - real page fetch/extraction path
  - Render/Vercel wiring
- The immediate blocker to “real AI every roast” is OpenAI API quota.
- Until quota is fixed, any normal roast that depends on OpenAI will fail upstream.

### Recommended next steps for tomorrow
1. Fix OpenAI API billing/quota in the platform account and confirm real roasts succeed again
2. Re-test roast styles (`Sharp`, `Deadpan`, `Unhinged`) on the same page and evaluate tone differences
3. Continue UI cleanup:
   - make the visual system sleeker and more vibrant
   - tighten wording further so it feels playful but not sloppy
   - remove any remaining internal/prototype-sounding language
4. Create promotional visuals:
   - polished app screenshots
   - shareable mockups for Instagram/social posts
   - likely a few curated “before/after roast” examples
5. Discuss monetization options:
   - free roasts with limits
   - paid credits / usage packs
   - subscription tiers
   - agency/team plans
   - paid share pages or downloadable teardown reports

### Practical resume point
- If resuming locally tomorrow:
  1. run `npm run dev`
  2. open `http://127.0.0.1:8091`
  3. confirm the app is talking to `/api`
  4. only debug OpenAI-backed roast quality after API quota is restored

## Resume Update (2026-03-01 21:05 CST): UI direction tightened, rewrite compare added, and production fallback UX cleaned up

### What was completed today

#### 1. Home screen tone moved toward the intended product personality
- The hero language was pushed away from generic SaaS/corporate copy and toward a more playful, design-crit tone.
- Current home hero headline:
  - `Paste the page. Watch it cook.`
- Current supporting direction:
  - playful but still useful
  - meant to feel like a smart critique tool, not a dashboard for growth teams

#### 2. Home screen wording cleanup
- User-facing `CTA` jargon was partially removed from the visible home screen copy.
- On the home screen, `CTA` was replaced with clearer language like:
  - `next step`
  - `Next-step strength`
- Internal/backend/schema names were intentionally left alone to avoid unnecessary churn.

#### 3. Visual system was pushed further
- `styles.css` was updated to make the app feel:
  - sharper
  - hotter
  - more design-forward
  - less polite / less corporate
- Changes included:
  - stronger hero gradients
  - richer orange/teal accents
  - more editorial hero scale
  - upgraded input card styling
  - stronger mode/style selection states

#### 4. Production trust fix: fallback banner hidden from real users
- The `API unavailable - showing local fixture` warning/banner was identified as a trust killer.
- `app.js` was updated so debug fallback UI is now shown only in local/dev contexts:
  - `localhost`
  - `127.0.0.1`
  - file-preview / empty hostname
- In production, fallback/debug wording is hidden.
- This was deployed to Vercel.

#### 5. Rewrite Pack got a more product-like compare view
- A visual `Current / Rewrite` compare stack was added above the Rewrite Pack.
- It currently shows compare cards for:
  - Headline
  - Support line
  - Next step
- Each compare card includes:
  - current text on the left
  - rewritten version on the right
  - `Copy upgrade` button
- The styling was tightened after first implementation to feel more intentional and less like generic dashboard cards.

### Important clarification from today
- The new rewrite compare UI did **not** break analysis.
- The apparent “Analysis failed” regression was caused by the existing OpenAI upstream quota issue being surfaced honestly instead of being silently masked by fallback behavior.
- In other words:
  - the backend was already failing on quota
  - the frontend is just less misleading now

### Current known blocker
- OpenAI normal-roast path is still blocked by:
  - `429`
  - `insufficient_quota`
- This is confirmed by Render logs.
- Until API quota/billing is restored, real AI-backed normal roasts will continue to fail upstream.

### Product/UX decision clarified today
- The app currently sits between two modes:
  1. strict real-AI mode
     - backend failures surface as errors
     - honest, but brittle while quota is unresolved
  2. seamless fallback mode
     - backend failures degrade to heuristic/sample output without telling production users
     - better UX during billing/setup issues
- This decision is still open for tomorrow.
- Pragmatic recommendation if quota is not fixed immediately:
  - restore graceful fallback for quota/API failures
  - keep fallback/debug language hidden in production
  - keep strict/debug visibility locally only

### Current status of the rewrite compare feature
- UI/layout direction is good.
- Data feeding it is still approximate in some places.
- Current limitation:
  - `Current` values do not always reflect exact original page copy
  - some “before” values are still derived from existing summary/evidence fields rather than a dedicated extracted original field
- Recommended next improvement:
  - capture true original:
    - headline
    - support line
    - primary action text
  - feed those exact values into the compare cards

### Updated next-step priority order
1. Decide whether to restore seamless fallback while OpenAI quota is unresolved
2. Fix OpenAI API billing/quota in the platform account
3. Improve rewrite compare data quality (true original copy on the left)
4. Add local roast history (last 3 roasts, no login)
5. Add share flow:
   - `Copy link`
   - `Email draft`
   - possibly a better-labeled team-share action
6. Continue polishing the UI
7. Create promo screenshots / social assets
8. Talk through monetization

### Practical resume point for tomorrow
- Start in local dev:
  1. `npm run dev`
  2. open `http://127.0.0.1:8091`
- Then decide first:
  - fix quota/billing now, or
  - temporarily re-enable graceful fallback for production UX

## Resume Update (2026-03-03 20:24 CST): Graceful fallback restored, roast history added, share flow improved

### What was completed today

#### 1. Graceful fallback was restored
- Decision made:
  - while OpenAI quota is unresolved, the product should stay usable instead of hard-failing normal roasts
- `server.js` was updated so:
  - pass1 tries OpenAI first
  - if pass1 fails, it falls back to heuristic analysis
  - pass2 tries OpenAI first
  - if pass2 fails, it falls back to the local pass2 composition path
- This means:
  - the app should remain usable even when OpenAI returns quota/billing errors
  - once quota is restored, the same code automatically prefers the configured OpenAI models again

#### 2. Model usage is now easy to verify in code
- Current model defaults in `server.js`:
  - `OPENAI_PASS1_MODEL = gpt-4o-mini`
  - `OPENAI_PASS2_MODEL = gpt-4o-mini`
- The exact OpenAI call sites remain:
  - pass1 call uses `OPENAI_PASS1_MODEL`
  - pass2 call uses `OPENAI_PASS2_MODEL`
- This was explicitly checked so there is a clear audit trail for what model will be used when quota is available.

#### 3. Personal local filesystem paths were removed from README
- `README.md` previously had absolute local commands containing `/Users/anthonyaguilar/...`
- Those paths were replaced with generic repo-root commands before pushing
- Repo content was re-checked to confirm no remaining instances of:
  - `/Users/anthonyaguilar`
  - `anthonyaguilar`

#### 4. Local roast history was added
- `app.js` and `styles.css` were updated so the app now stores the last 3 successful roasts in browser localStorage
- History appears on the home screen under the input card
- Each saved roast includes:
  - title
  - URL
  - score
  - verdict
  - saved date
- Clicking a history item reopens the saved result
- No backend/auth work required

#### 5. Results sidebar actions were upgraded
- The old sidebar action block was weak and overly mechanical:
  - `Copy share quote`
  - `Copy score text`
  - `Copy permalink`
- It was replaced with a more productized share/action set:
  - `Copy roast link`
  - `Copy summary`
  - `Email draft`
  - `Roast another page`
- `Copy summary` now bundles:
  - roast title
  - score text
  - quote
  - permalink
- `Email draft` uses a `mailto:` flow rather than requiring a new backend email system

### Current product state after today
- The app is in a better UX position:
  - production users do not see debug fallback banners
  - the app should degrade more gracefully while OpenAI quota is unresolved
  - roast history and sharing are both more usable
- The product is still limited by OpenAI API quota for “true AI every roast,” but is no longer forced into a brittle all-or-nothing experience.

### New design concern raised today
- Once the user reaches the roast/results page, there is likely too much going on.
- Open question for the next UI pass:
  - can the results page be simplified and made more impactful?
- This is likely the right next UX problem to solve after the recent feature additions.

### Likely simplification directions to explore next
1. reduce visible density above the fold
2. collapse or deprioritize lower-value sections
3. make the top 1-3 problems feel dominant and immediate
4. make the rewrite section more central and clearly actionable
5. reduce “dashboard chrome” and make the page feel more like a focused critique document

### Updated next-step priority order
1. Verify the restored graceful fallback works after Render redeploy
2. Fix OpenAI API billing/quota in the platform account
3. Simplify the results/roast page so it feels more impactful and less busy
4. Improve rewrite compare data quality (true original page copy on the left)
5. Continue polish for screenshot/social-worthiness
6. Create promo screenshots / social assets
7. Talk through monetization

### Practical resume point for tomorrow
1. run `npm run dev`
2. open `http://127.0.0.1:8091`
3. confirm fallback behavior is usable again
4. review the results page specifically with the question:
   - what can be removed, collapsed, or visually subordinated to make the roast feel sharper?

## Resume Update (2026-03-05 20:40 CST): Example-result routing fixed + Figma capture workflow prepared

### What was completed today

#### 1. Figma capture workflow was initialized and validated
- Used the Figma MCP flow and created/updated file:
  - `https://www.figma.com/design/i2akHZBAHbKNl9sMANavMW`
- Captured app/home visuals into Figma and verified node structure via MCP metadata/screenshot.
- Added local capture support in `index.html` by injecting:
  - `<script src="https://mcp.figma.com/mcp/html-to-design/capture.js" async></script>`

#### 2. Marketing board source page was created
- Added local marketing composition files for social/app-store boards:
  - `social-kit.html`
  - `social-kit.css`
- Boards implemented:
  - Instagram portrait (1080x1350)
  - X/Twitter landscape (1600x900)
  - App Store portrait (1290x2796)
- The board frame capture was pushed into the same Figma file (node root around `4:2`).

#### 3. Important capture limitation discovered
- HTML-to-design capture produced blank blocks where iframe app previews were expected.
- Current Figma marketing board structure is in place, but screenshot surfaces inside those cards are placeholders from capture.
- To finalize market-ready assets, we need static image screenshots (PNG) inserted instead of iframe content before capture.

#### 4. "Examples of results" issue was fixed in product UI
- User feedback: example results were not opening reliably.
- Added direct one-click home actions in `app.js`:
  - `View sample results`
  - `View strong-page results`
  - `View mobile-issues results`
  - `View partial-evidence results`
- Added supporting styles in `styles.css` (`.sample-results-actions`, `.sample-result-btn`).
- Added URL query bootstrapping for deterministic example loading:
  - `?example=sample`
  - `?example=strong`
  - `?example=mobile`
  - `?example=partial`
- Implemented with:
  - `getExampleScenarioFromQuery()`
  - `loadExampleResults(scenario)`

#### 5. Runtime verification completed
- Confirmed syntax:
  - `node --check app.js` passed
- Confirmed live server was serving updated JS/CSS via `curl` checks on `127.0.0.1:8091`.

### Files changed today
- `app.js`
- `styles.css`
- `index.html`
- `social-kit.html` (new)
- `social-kit.css` (new)
- `context.md`

### Working links (local examples)
- `http://127.0.0.1:8091/?example=sample`
- `http://127.0.0.1:8091/?example=strong`
- `http://127.0.0.1:8091/?example=mobile`
- `http://127.0.0.1:8091/?example=partial`

### Next steps for tomorrow (recommended order)
1. Generate true PNG screenshots for each example result state (sample/strong/mobile/partial) at target dimensions.
2. Replace iframe-based preview surfaces in `social-kit.html` with static image tags using those PNGs.
3. Re-run Figma MCP capture into `i2akHZBAHbKNl9sMANavMW` so IG/X/App Store boards include real app visuals.
4. Export/share final marketing assets from Figma.
5. Optional cleanup: remove capture script from `index.html` after capture session if no longer needed.

## Resume Update (2026-03-05 18:21 CST): OpenAI billing restored, pass1 confirmed live, pass2 confirmation still pending

### What was confirmed today
- OpenAI API billing was funded/restored by the user.
- Render logs now confirm that at least pass1 is using OpenAI successfully.
- Confirmed log example:
  - `[analyze_success]`
  - provider = `openai`
  - provider_model = `gpt-4o-mini`
- This means:
  - the API key is valid
  - billing/quota is no longer the original blocker
  - the hosted app is hitting the real AI path at least for analysis/pass1

### What is still unresolved
- Hosted roast output still feels bland/generic.
- That means the current problem has shifted from infrastructure/billing to quality:
  - prompt quality
  - extraction quality
  - or pass2 falling back quietly
- We did **not** yet confirm pass2 success from the deployed Render service.

### Code changes made today

#### 1. Dev-only source visibility was added
- `server.js` now returns `analysis_meta` from `/analyze`
- `app.js` stores that in `resultMeta`
- In local/dev only, the UI can now show:
  - `AI: gpt-4o-mini`
  - or `Fixture fallback`
- This is intentionally hidden in production

#### 2. Explicit success logging was added in backend code
- `server.js` now logs:
  - `[analyze_success]`
  - `[compose_success]`
- Goal:
  - stop guessing whether OpenAI was actually used
  - distinguish successful AI usage from graceful fallback

### Important deployment/debugging state
- Local repo contains the success-log code.
- Latest local commit checked:
  - `93adc0e Add AI success logging and local source indicator`
- User reported confusion because terminal showed:
  - `nothing to commit, working tree clean`
- That was expected because the commit already existed locally.
- Unclear at pause time whether Render had actually picked up the newest commit containing `compose_success` logging.

### What we learned from logs
- `analyze_success` was seen in Render logs.
- `compose_success` was **not** observed yet.
- That does **not** prove compose/pass2 failed.
- It likely means one of:
  1. Render had not yet deployed the latest success-log commit
  2. compose/pass2 still fell back or failed silently before the new logging was live

### Current likely diagnosis
- Pass1 is definitely using OpenAI.
- Pass2 remains unconfirmed from production logs.
- If the hosted result is still bland, the most likely possibilities are:
  1. pass2 is still falling back to local composition
  2. pass2 is using OpenAI, but prompts/output are still too generic

### Current best next step
1. Confirm Render is actually running commit `93adc0e`
2. Run one hosted roast again
3. Check Render logs specifically for:
   - `analyze_success`
   - `compose_success`
4. If both appear:
   - move directly into prompt/output quality improvement
5. If only `analyze_success` appears:
   - debug why pass2 is not succeeding or not logging

### Updated next-step priority order
1. Confirm Render deploy includes `compose_success` logging
2. Verify whether pass2 is using OpenAI or falling back
3. If both AI passes are confirmed, improve prompt/output quality
4. Continue simplifying the roast/results page
5. Keep the approved Figma frame as the visual reference baseline

### Practical resume point
1. Open Render logs
2. Run one roast from the hosted app
3. Look for:
   - `[analyze_success]`
   - `[compose_success]`
4. Use that result to decide:
   - pass2 debugging
   - or prompt-quality tuning

## Resume Update (2026-03-08 CST): pass2 confirmed, frontend sample fallback bug found, browser-render ingestion added

### What was confirmed today
- Render logs now confirm the full AI pipeline is running:
  - `[analyze_success]`
  - `[compose_begin]`
  - `[compose_success]`
- This means:
  - pass1 is using OpenAI
  - pass2 is also using OpenAI
  - the earlier compose ambiguity is resolved

### What was actually causing the repeated bland/sample result
- The repeated `Polished design, fuzzy pitch` result was **not** a real AI roast.
- It matched the hardcoded frontend sample payload in `app.js` (`FALLBACK_DATA`).
- Root cause on the frontend:
  1. `postJson()` was timing out too quickly for hosted runs
     - `analyze` timeout had been only `7000ms`
  2. `getScenarioFromUrl()` treated normal URLs as `"sample"`
  3. when the client-side request timed out, the UI silently rendered the sample roast
- Fix applied in `app.js`:
  - analyze timeout increased to `70000ms`
  - compose timeout increased to `30000ms`
  - normal URLs now map to `"normal"`, not `"sample"`
  - real URLs no longer silently render the canned sample roast

### What was fixed in the analyzing screen
- The analyzing screen previously looked frozen because it marked all steps as `Done` while the backend was still working.
- Fix applied in `app.js`:
  - keep the final step visibly `In progress` while waiting on the backend
  - show a slow-run message after `12s`:
    - "This run is taking longer than usual. The hosted backend may be waking up, or the page may be script-heavy."

### What was changed in pass2 behavior
- Pass2 style tuning alone was not enough to create visible differences.
- A deterministic style overlay was added in `server.js` so visible copy differs by style even when model output collapses toward the same tone.
- Fields now explicitly restyled by backend overlay:
  - `header.title`
  - `header.subtitle`
  - `summary_panel.one_liner`
  - first 3 issue titles
  - `share_card_copy.quote`

### Browser-rendered ingestion work added
- The backend previously only fetched raw HTML via `fetch(...)`.
- That is insufficient for many modern JS-heavy landing pages.
- A browser-first snapshot path was added in `server.js`:
  - try Playwright Chromium first
  - if browser rendering works:
    - use the rendered DOM HTML
    - log `page_snapshot` with `source: "browser"`
  - if browser rendering is unavailable/fails:
    - fall back to raw HTTP fetch
    - log `page_snapshot` with `source: "http"`
- Analysis metadata now records extraction mode:
  - `analysis.meta.extraction.mode = "browser"` or `"http"`

### Current deployment blocker for rendered-browser ingestion
- Render logs showed:
  - `page_snapshot_browser`
  - missing Chromium executable
  - then `page_snapshot` with `source: "http"`
- This means:
  - Playwright package is installed
  - Chromium binary is **not** installed in the Render build image
  - browser-rendered ingestion is currently not active in production yet

### Fix already prepared for Render
- `render.yaml` was updated so the backend build installs Chromium:
  - `buildCommand: npm install && npx playwright install chromium`
- This change was prepared locally and should be pushed/deployed next to activate browser-rendered ingestion on Render.

### Files changed during this phase
- `app.js`
- `server.js`
- `render.yaml`
- `package.json`
- `prompts/pass2-system.txt`
- `prompts/pass2-compose-template.txt`
- `index.html`
- `context.md`

### Most important next step for tomorrow
1. Push/deploy the Render Chromium install change from `render.yaml`
2. Manual deploy latest commit in Render
3. Run one roast
4. Check Render logs for:
   - no `page_snapshot_browser` missing executable error
   - `page_snapshot` with `source: "browser"`

### After that
1. Re-test roast quality on a modern JS-heavy landing page
2. If quality is still weak, improve extraction/analysis rather than continuing blind prompt tweaks
3. Then return to UI simplification and screenshot/promo work

### Practical resume point
1. Confirm `render.yaml` change is pushed:
   - `buildCommand: npm install && npx playwright install chromium`
2. Manual deploy latest commit in Render
3. Run one hosted roast
4. Inspect logs for:
   - `page_snapshot_browser` errors
   - `page_snapshot source:"browser"` vs `source:"http"`
5. Use that result to decide whether ingestion is finally fixed

## Resume Update (2026-03-24 19:51 CDT): pass2 routing fix + FETCH_FAILED fallback fix

### What was diagnosed today
- The roast-style prompt tightening was not showing up reliably in production because the backend still had two flattening issues:
  1. `ENABLE_OPENAI_PASS2` defaulted to off unless explicitly set to `true`
  2. request handling still used stale style fallbacks like `sharp`
- Result: `Observational` and `Bold` could collapse into the same visible roast even after prompt changes.

### Backend fix prepared locally
- `server.js` was updated so:
  - pass2 defaults to enabled when an `OPENAI_API_KEY` exists
  - style values are normalized consistently to:
    - `observational`
    - `deadpan`
    - `bold`
  - old `sharp` fallback is mapped to `observational`
- Prompt files were tightened using the subagent debate output:
  - `prompts/pass2-system.txt`
  - `prompts/pass2-compose-template.txt`
- The new prompt rules emphasize:
  - evidence from the actual page
  - one sharp line of personality per issue
  - plain-language fixes
  - personality concentrated in headline / one-liner / top issue titles / share quote

### FETCH_FAILED debugging result
- Another backend issue was found in `fetchPageSnapshot(...)`:
  - if the browser-render path returned `FETCH_FAILED`, the server immediately gave up
  - it did **not** try the simpler raw HTTP snapshot path afterward
- That caused avoidable failures for real sites.

### Backend fix prepared locally for FETCH_FAILED
- `server.js` now includes a fallback policy:
  - if browser capture fails with a hard block (`PAGE_BLOCKED`, `SSRF_BLOCKED`, 401, 403), return the failure
  - otherwise, log `page_snapshot_browser_fallback` and continue to the HTTP snapshot path
- This should reduce false `FETCH_FAILED` dead-ends for normal public pages.

### Frontend note
- `app.js` was also improved locally so generic `FETCH_FAILED` no longer always maps to the timeout message.
- However, `app.js` currently has many unrelated local UI edits mixed in.
- Safer deployment order:
  1. ship backend-only fixes first (`server.js` + prompt files)
  2. separately decide whether to ship the frontend error-copy change

### Recommended next deploy order
1. Commit and push:
   - `server.js`
   - `prompts/pass2-system.txt`
   - `prompts/pass2-compose-template.txt`
2. Manual deploy latest commit in Render
3. Test one real hosted roast
4. Compare styles again:
   - `Observational`
   - `Deadpan`
   - `Bold`
5. Check Render logs for:
   - `compose_success`
   - `page_snapshot_browser_fallback`
   - `page_snapshot source:"browser"` or `source:"http"`

### What to expect after the backend deploy
- pass2 prompt changes should finally have a real chance to show up
- style routing should no longer silently collapse back to old defaults
- normal sites that fail browser capture may still succeed via HTTP fallback instead of hard failing immediately

### If styles still look too similar after this
- The next bottleneck is likely not style routing anymore.
- The next likely bottleneck would be:
  - extraction quality feeding pass2
  - or the visible UI/fallback composition structure flattening differences
