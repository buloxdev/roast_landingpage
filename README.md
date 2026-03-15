# Roast My Landing Page

AI-powered landing page roast tool (desktop-first v1) for founders and marketers.

Users paste a URL, the system analyzes copy/CTA/structure/messaging, and returns a ranked roast with fixes and rewrites.

## Current Status

This repo currently contains a **working frontend v1 shell**, a **stub backend API**, and the core planning/contract assets needed for real backend integration.

Implemented in `main`:
- Desktop-first UI flow: `Home/Input -> Analyzing -> Results`
- Results page renders from pass2 fixture JSON
- Stub backend API for `POST /analyze`, `POST /compose`, `GET /roast/:id`
- Live frontend deploy on Vercel
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

- `index.html` / `app.js`
  - Frontend app shell and screen rendering
- `tailwind.src.css` / `tailwind.generated.css` / `tailwind.config.js`
  - Tailwind source, compiled utilities, and theme config
- `styles.css`
  - Shared semantic CSS kept alongside Tailwind utilities
- `server.js`
  - Stub backend API service
- `render.yaml`
  - Render web-service blueprint for backend deploy
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
  - `deployment.md`
  - `error-copy.md`
  - `validation-rules.md`
- `context.md`
  - Current orchestration snapshot / pause-resume state

## Run Locally

Recommended local dev:

```bash
cd roast_landingpage
npm run dev
```

Then open:
- [http://127.0.0.1:8091](http://127.0.0.1:8091)

This starts:
- UI server on `127.0.0.1:8091`
- Tailwind CSS watcher that rebuilds `tailwind.generated.css`
- API requests proxied automatically to the live Render backend

Behavior:
- `npm run dev` always proxies `/api/*` to the live Render backend
- this avoids the recurring local `503` / fallback issue caused by missing or stale local backend config
- use local backend mode only when you explicitly want to debug backend code

Optional UI-only mode:

```bash
cd roast_landingpage
npm run ui:dev
```

One-off CSS build:

```bash
cd roast_landingpage
npm run build:css
```

Optional local-backend mode:

```bash
cd roast_landingpage
npm run dev:local-api
```

Notes:
- `dev:local-api` starts the local API on `127.0.0.1:8788`
- it requires a valid local `OPENAI_API_KEY`
- if the key is missing, the dev server will fall back to proxying the live Render backend

Legacy manual flow:

Terminal 1:

```bash
cd roast_landingpage
python3 -m http.server 8090
```

Terminal 2:

```bash
cd roast_landingpage
npm run api:stub
```

Optional: enable OpenAI-backed local backend

```bash
cd roast_landingpage
cp .env.example .env
```

Then set:
- `OPENAI_API_KEY`
- optional model overrides:
  - `OPENAI_PASS1_MODEL`
  - `OPENAI_PASS2_MODEL`

Notes:
- OpenAI is now required for normal roasts
- if `OPENAI_API_KEY` is missing, the backend will return an AI-backend-not-configured error
- if the OpenAI call fails, the request fails instead of falling back to heuristics

## Deploy To GitHub Pages

This repo can now deploy its static frontend to GitHub Pages from `main`.

What to do:

1. Push the repo to GitHub.
2. In GitHub, open `Settings -> Pages`.
3. Under `Build and deployment`, set `Source` to `GitHub Actions`.
4. Push to `main` or run the `Deploy GitHub Pages` workflow manually from the Actions tab.
5. Open the published URL once the workflow finishes.

Important:
- GitHub Pages only hosts the static frontend, not the Node backend in `server.js`
- this repo includes a Pages-specific client config in `site-config.js` that points the frontend at `https://roast-landingpage-api.onrender.com`
- if your backend URL changes, update `site-config.js`
- custom domains still work, but `site-config.js` currently auto-switches only for `*.github.io`; for a custom domain, set `window.ROAST_API_BASE_URL` there too

## What Is Finished vs Not Finished

Finished:
- UI shell flow and desktop-first results layout
- Stub backend API + deterministic error scenarios
- Prompt pack (v1)
- API contract (v1)
- Edge-case fixtures
- Error/loading copy spec
- Validation/QA rules spec
- Vercel frontend deploy

Not finished:
- Durable persistence and production hardening for the fully model-backed backend
- Real scraping/extraction pipeline
- Pass1 strict schema hardening (deferred until real outputs)
- Hosted backend wiring from Vercel -> Render
- Share page/permalink persistence beyond in-memory stub

## Recommended Next Steps

1. Set `OPENAI_API_KEY` in the backend environment
2. Verify OpenAI-backed pass1/pass2 output quality on several real pages
3. Improve extraction quality for JS-heavy sites
4. Tighten UI tone and visual design
5. Implement durable persistence for `GET /roast/:id` share flow

## Source of Truth Files

For ongoing work, treat these as the primary references:
- `context.md`
- `docs/v1-decisions.md`
- `schemas/pass2-ui-contract.json`

## Notes

- The local sandbox used during development blocked binding a local port in one environment, so some preview checks were done via file-level validation instead of browser rendering.
- Agent work was orchestrated via git worktrees and merged into `main`.
