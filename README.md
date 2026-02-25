# Roast My Landing Page

AI-powered landing page roast tool (desktop-first v1) for founders and marketers.

Users paste a URL, the system analyzes copy/CTA/structure/messaging, and returns a ranked roast with fixes and rewrites.

## Current Status

This repo currently contains a **static frontend v1 shell** plus the core planning/contract assets needed for backend integration.

Implemented in `main`:
- Desktop-first UI flow: `Home/Input -> Analyzing -> Results`
- Results page renders from pass2 fixture JSON
- Prompt pack for pass1/pass2 model calls
- API contract (`POST /analyze`, `POST /compose`, `GET /roast/:id`)
- Edge-case fixtures + error/loading copy
- Validation rules spec

## Product Direction (v1)

- Desktop-first UX (mobile supported, not optimized first)
- Two-pass AI pipeline:
  - Pass 1: analysis JSON (facts/scores/findings)
  - Pass 2: UI composition JSON (presentation copy only)
- Preserve analysis fidelity between pass1 and pass2

## Repo Structure

- `index.html` / `styles.css` / `app.js`
  - Static frontend prototype (desktop-first results experience + shell flow)
- `fixtures/`
  - Pass2 UI fixtures for sample + edge cases
- `schemas/`
  - `pass2-ui-contract.json` (tightened/frozen for UI work)
  - `pass1-analysis-contract.json` (intentionally loose placeholder for now)
- `prompts/`
  - Pass1/pass2 prompt templates and usage notes
- `docs/`
  - `v1-decisions.md`
  - `api-contract.md`
  - `error-copy.md`
  - `validation-rules.md`
- `context.md`
  - Current orchestration snapshot / pause-resume state

## Run the Static Prototype

You can open `index.html` directly, but fixture fetch may fail on `file://`. The app includes a fallback embedded fixture so the results screen still renders.

Recommended (serve locally):

```bash
cd /Users/anthonyaguilar/Documents/agent_eval/roast_landingpage
python3 -m http.server 8090
```

Then open:
- [http://localhost:8090](http://localhost:8090)

## What Is Finished vs Not Finished

Finished:
- UI shell flow and desktop-first results layout
- Prompt pack (v1)
- API contract (v1)
- Edge-case fixtures
- Error/loading copy spec
- Validation/QA rules spec

Not finished:
- Real backend implementation for `/analyze`, `/compose`, `/roast/:id`
- Real scraping/extraction pipeline
- Pass1 strict schema hardening (deferred until real outputs)
- Share page/permalink backend wiring

## Recommended Next Steps

1. Add UI URL validation + explicit error states using `docs/error-copy.md`
2. Replace fake analysis flow with real `POST /analyze` + `POST /compose` calls
3. Keep fixture fallback path for offline/frontend testing
4. Add response validation (pass2 schema) before rendering
5. Implement persistence + `GET /roast/:id` share flow

## Source of Truth Files

For ongoing work, treat these as the primary references:
- `context.md`
- `docs/v1-decisions.md`
- `schemas/pass2-ui-contract.json`

## Notes

- The local sandbox used during development blocked binding a local port in one environment, so some preview checks were done via file-level validation instead of browser rendering.
- Agent work was orchestrated via git worktrees and merged into `main`.
