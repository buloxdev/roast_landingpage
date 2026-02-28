# Deployment Notes

## Current architecture

- Frontend: Vercel static deploy
- Backend API: Render web service

This split is intentional:
- Vercel already hosts the static frontend successfully
- Render is a good fit for the Node API service

Relevant platform behavior:
- Render web services should bind to `0.0.0.0` and the `PORT` environment variable
- Vercel can proxy `/api/*` requests to an external backend using rewrites

## Backend deploy on Render

This repo now includes `render.yaml` for the API service:

```yaml
services:
  - type: web
    name: roast-landingpage-api
    runtime: node
    plan: free
    buildCommand: npm install
    startCommand: node server.js
    healthCheckPath: /health
```

Backend requirements now in code:
- `server.js` reads `process.env.PORT`
- health endpoint exists at `GET /health`

## Frontend API behavior

`app.js` now chooses the API base like this:
- local browser on `localhost` / `127.0.0.1` -> `http://localhost:8787`
- deployed browser anywhere else -> `/api`
- explicit override still works with `window.ROAST_API_BASE_URL`

This means the deployed frontend expects Vercel to proxy `/api/*` to the hosted backend.

## After Render gives you the backend URL

Create `vercel.json` in the repo root with the real Render backend URL:

```json
{
  "$schema": "https://openapi.vercel.sh/vercel.json",
  "rewrites": [
    {
      "source": "/api/:path*",
      "destination": "https://YOUR-RENDER-SERVICE.onrender.com/:path*"
    }
  ]
}
```

Then redeploy Vercel.

## Verification checklist

1. Open the Render backend health endpoint:
   - `https://YOUR-RENDER-SERVICE.onrender.com/health`
2. Confirm it returns JSON with `"ok": true`
3. Add the Vercel rewrite above
4. Redeploy Vercel
5. Test the live frontend using:
   - `https://example-saas.com`
   - `https://blocked.example.com`
   - `https://timeout.example.com`
   - `https://example.com/dashboard`
   - `https://analysis-fail.example.com`
   - `https://rate-limit.example.com`
   - `https://compose-fail.example.com`
