# Roast My Landing Page - Backend API Contract (v1)

Status: Final v1 API contract (sync-first). No schema/UI changes implied.

## Purpose

This document defines the v1 backend API contract for:

- `POST /analyze`
- `POST /compose`
- `GET /roast/:id`

It is aligned to:

- `docs/v1-decisions.md`
- `schemas/pass2-ui-contract.json`
- `context.md`

Constraints honored:

- No UI file changes
- No schema changes
- No backend implementation changes

## Design Notes (v1)

- v1 is sync-first: clients can call `POST /analyze` then `POST /compose` and render results immediately.
- `GET /roast/:id` supports shareable permalinks/persistence when available.
- Two-pass pipeline is preserved:
  - Pass 1 = analysis facts/scores/findings
  - Pass 2 = UI composition copy only (must not mutate analysis meaning)
- `schemas/pass2-ui-contract.json` is the source of truth for the pass-2 UI payload shape.

## Conventions

- Base URL: implementation-defined (examples omit host)
- Content type: `application/json`
- IDs: opaque strings (UUID/ULID/etc. allowed)
- Timestamps: ISO 8601 UTC strings
- URL inputs must be `http://` or `https://` in v1

## Error Response Shape (All Endpoints)

All non-2xx responses should use this shape.

```json
{
  "error": {
    "code": "INVALID_REQUEST",
    "message": "Request body failed validation.",
    "details": [
      {
        "field": "url",
        "reason": "Must be a valid http(s) URL"
      }
    ],
    "retryable": false
  },
  "request_id": "req_01HZX...",
  "timestamp": "2026-02-25T19:04:12Z"
}
```

### Error fields

- `error.code`: stable machine-readable code
- `error.message`: human-readable summary
- `error.details`: optional field-level diagnostics
- `error.retryable`: whether retrying later may succeed
- `request_id`: server-generated trace ID
- `timestamp`: response timestamp

### Recommended error codes

- `INVALID_REQUEST`
- `UNSUPPORTED_URL`
- `FETCH_FAILED`
- `PAGE_BLOCKED`
- `ANALYSIS_FAILED`
- `COMPOSE_FAILED`
- `NOT_FOUND`
- `RATE_LIMITED`
- `INTERNAL_ERROR`

## Partial-Evidence Behavior (v1)

v1 should return the best useful roast when full evidence is unavailable, as long as enough content can be analyzed.

### Behavior rules

- If some content is unavailable (blocked sections, render issues, timeouts, truncated extraction), `POST /analyze` may still return `200` with `meta.evidence_status = "partial"` and warnings.
- `POST /compose` should accept partial pass-1 analysis by default and still return valid pass-2 UI JSON.
- If evidence is too limited to produce a credible roast, return `422` (`PAGE_BLOCKED` or `ANALYSIS_FAILED`) instead of low-quality output.
- `GET /roast/:id` should preserve partial-evidence metadata so the UI can disclose limitations.

### Evidence status values (recommended)

- `complete`
- `partial`
- `insufficient`

## Endpoint: `POST /analyze`

Runs pass-1 analysis on a landing page URL and returns analysis JSON (facts/scores/findings).

### Request Body

```json
{
  "url": "https://example-saas.com",
  "mode": "brutal",
  "persist": true,
  "request_idempotency_key": "analyze_7b6d2f"
}
```

### Request fields

- `url` (required, string): landing page URL (`http/https`)
- `mode` (optional, string): roast mode from UI (`balanced`, `brutal`, `fix-first`)
- `persist` (optional, boolean, default `false`): whether to create/update a roast record for permalink retrieval
- `request_idempotency_key` (optional, string): client-provided dedupe key

### Success Response `200 OK`

`analysis` is pass-1 data and should satisfy the current placeholder contract in `schemas/pass1-analysis-contract.json` (required top-level keys), while remaining flexible internally in v1.

```json
{
  "roast_id": "roast_01JV8M3N8X2Q7B4R0YF8K2A1J9",
  "status": "analyzed",
  "input": {
    "url": "https://example-saas.com",
    "mode": "brutal"
  },
  "analysis": {
    "meta": {
      "version": "v1",
      "evidence_status": "partial",
      "warnings": [
        {
          "code": "PARTIAL_EVIDENCE",
          "message": "Some sections could not be extracted; analysis used visible content only."
        }
      ]
    },
    "summary": {
      "score_overall": 56,
      "score_band": "Major clarity/messaging gaps",
      "one_liner": "Credible design, but the offer is unclear in the hero."
    },
    "issues": [
      {
        "rank": 1,
        "category": "Clarity of offer",
        "title": "Hero headline is vague",
        "impact": "High",
        "confidence": "High",
        "problem": "The hero does not clearly state what the product is.",
        "why_it_hurts": "Visitors cannot self-qualify quickly.",
        "evidence": [
          { "type": "quote", "value": "Turn feedback into momentum" }
        ],
        "fix": "Name the product category, audience, and outcome in the hero."
      }
    ],
    "category_scores": [],
    "quick_wins": [],
    "rewrite_pack": {},
    "mobile_roast": {},
    "positives": [],
    "share": {}
  },
  "request_id": "req_01HZX...",
  "timestamp": "2026-02-25T19:04:12Z"
}
```

### Status Codes

- `200 OK`: analysis completed (including partial evidence)
- `400 Bad Request`: malformed JSON or missing required fields
- `422 Unprocessable Entity`: valid request, but page cannot be analyzed credibly (blocked/insufficient)
- `429 Too Many Requests`: rate limited
- `500 Internal Server Error`: unexpected failure
- `503 Service Unavailable`: dependency timeout/outage (retryable)

## Endpoint: `POST /compose`

Runs pass-2 composition and returns UI presentation JSON for the results screen.

### Request Body (preferred: server-produced pass1)

```json
{
  "roast_id": "roast_01JV8M3N8X2Q7B4R0YF8K2A1J9",
  "analysis": {
    "meta": {
      "evidence_status": "partial",
      "warnings": [
        {
          "code": "PARTIAL_EVIDENCE",
          "message": "Some sections could not be extracted; analysis used visible content only."
        }
      ]
    },
    "summary": {},
    "issues": [],
    "category_scores": [],
    "quick_wins": [],
    "rewrite_pack": {},
    "mobile_roast": {},
    "positives": [],
    "share": {}
  },
  "mode": "brutal"
}
```

### Compose input rules

- At least one of `roast_id` or `analysis` must be provided.
- `analysis` must be pass-1 output (or equivalent) and preserve factual meaning.
- If both `roast_id` and `analysis` are provided, treat `analysis` as the compose source of truth and `roast_id` as the persistence target/context.
- `mode` may tune tone/style, but not alter rankings/scores/evidence facts.
- If `analysis.meta.evidence_status = "partial"`, compose still returns a best-effort pass-2 payload unless analysis is marked `insufficient`.

### Success Response `200 OK`

Response body must match `schemas/pass2-ui-contract.json` exactly (same top-level shape, no wrapper).

Example snippet (illustrative only; use `fixtures/pass2-ui.sample.json` as a full valid example):

```jsonc
{
  "header": {
    "eyebrow": "Roast Report",
    "title": "Polished design, fuzzy pitch",
    "subtitle": "Your page looks credible, but the hero copy makes people work too hard to understand the offer.",
    "score_label": "Roast Score",
    "score_value": 56,
    "score_band": "Major clarity/messaging gaps",
    "verdict_chip": "Fix the hero first"
  },
  "summary_panel": {
    "one_liner": "The page looks credible, but the hero copy is too vague to explain what the product actually does in 5 seconds.",
    "top_problems_title": "Top conversion blockers",
    "top_3_problems": [
      "Hero headline is vague and outcome-light",
      "Primary CTA is generic and weakly matched to intent",
      "Differentiation is buried under feature language"
    ],
    "cta_hint": "Start with the hero headline + CTA. That is your fastest conversion lift."
  },
  "tabs": [
    { "id": "top-problems", "label": "Top Problems" },
    { "id": "scores", "label": "Scores" },
    { "id": "quick-wins", "label": "Quick Wins" },
    { "id": "rewrites", "label": "Rewrites" },
    { "id": "mobile", "label": "Mobile" }
  ],
  "...": "remaining required pass2-ui fields omitted here for brevity"
}
```

### Status Codes

- `200 OK`: composition completed (including from partial evidence)
- `400 Bad Request`: malformed JSON or missing required body
- `422 Unprocessable Entity`: pass-1 analysis is missing critical required fields or marked insufficient
- `429 Too Many Requests`: rate limited
- `500 Internal Server Error`: unexpected failure
- `503 Service Unavailable`: dependency timeout/outage (retryable)

## Endpoint: `GET /roast/:id`

Returns a stored roast resource for shareable/permalink pages.

### Path Params

- `id` (required): roast resource ID (opaque)

### Success Response `200 OK`

Example snippet (illustrative; `ui` must be full schema-compliant pass-2 JSON):

```jsonc
{
  "id": "roast_01JV8M3N8X2Q7B4R0YF8K2A1J9",
  "status": "ready",
  "created_at": "2026-02-25T19:04:12Z",
  "updated_at": "2026-02-25T19:04:20Z",
  "input": {
    "url": "https://example-saas.com",
    "mode": "brutal"
  },
  "analysis_meta": {
    "evidence_status": "partial",
    "warnings": [
      {
        "code": "PARTIAL_EVIDENCE",
        "message": "Some sections could not be extracted; analysis used visible content only."
      }
    ]
  },
  "analysis": {
    "meta": {},
    "summary": {},
    "issues": [],
    "category_scores": [],
    "quick_wins": [],
    "rewrite_pack": {},
    "mobile_roast": {},
    "positives": [],
    "share": {}
  },
  "ui": {
    "header": {
      "eyebrow": "Roast Report",
      "title": "Polished design, fuzzy pitch",
      "subtitle": "Your page looks credible, but the hero copy makes people work too hard to understand the offer.",
      "score_label": "Roast Score",
      "score_value": 56,
      "score_band": "Major clarity/messaging gaps",
      "verdict_chip": "Fix the hero first"
    },
    "...": "remaining required pass2-ui fields omitted here for brevity"
  }
}
```

Notes:

- `ui` is the public/share rendering payload and must remain fully compliant with `schemas/pass2-ui-contract.json`.
- `analysis` may be omitted from public responses in privacy- or payload-constrained deployments, but `analysis_meta` (including partial-evidence warnings) should still be preserved.

### Status Codes

- `200 OK`: roast found
- `404 Not Found`: unknown roast ID
- `410 Gone`: roast existed but was deleted/expired (optional v1 behavior)
- `500 Internal Server Error`: unexpected failure

## Sync vs Async Notes (v1 + forward compatibility)

### v1 (recommended now): sync-first

- `POST /analyze`: synchronous analysis response (`200`)
- `POST /compose`: synchronous composition response (`200`)
- Client flow:
  1. `POST /analyze`
  2. `POST /compose`
  3. Optional `GET /roast/:id` for share view

### Forward-compatible async option (not required for v1)

If processing time grows, the same endpoints may later support:

- `202 Accepted` with a job/roast ID
- polling via `GET /roast/:id` until `status = ready | failed`

Suggested transitional response for async mode:

```json
{
  "roast_id": "roast_01JV8M3N8X2Q7B4R0YF8K2A1J9",
  "status": "processing",
  "stage": "analyzing",
  "poll_after_ms": 1500
}
```

v1 clients should assume sync success, but tolerate `202` for future compatibility if feasible.

## Contract Alignment Notes / Mismatches

No blocking contract mismatches found in the current repo artifacts.

Notes:

- `POST /compose` is specified to return the raw pass-2 UI JSON body (no wrapper) to align directly with `schemas/pass2-ui-contract.json` and existing frontend fixture usage.
- `summary_panel.top_3_problems` (pass-2 schema) complements, not conflicts with, the locked “Top 5 Problems” results section (`issue_cards`, up to 5).

## Validation Requirements (v1)

### `POST /analyze`

- Reject non-HTTP(S) URLs.
- Enforce a reasonable URL length limit (recommended: `2048` chars).
- Return explicit blocked/fetch failure errors where possible (`PAGE_BLOCKED`, `FETCH_FAILED`).
- If analysis succeeds with degraded evidence, return `200` and set `analysis.meta.evidence_status = "partial"` instead of failing.

### `POST /compose`

- Require at least one compose input source (`roast_id` or `analysis`).
- Validate pass-1 presence/shape at least to the placeholder `schemas/pass1-analysis-contract.json` top-level keys.
- Validate the returned body against `schemas/pass2-ui-contract.json` before returning `200`.
- On pass-2 schema validation failure, return `422` and include field/path diagnostics in `error.details`.

### `GET /roast/:id`

- Only return persisted records whose `ui` payload is valid against `schemas/pass2-ui-contract.json`.
- If older persisted payloads exist, migrate on read/write or fail safely (`500`) and log for migration follow-up.
- Preserve partial-evidence metadata when present so the UI can disclose analysis limitations.

## Example `422` (Pass2 Schema Validation Failure)

```json
{
  "error": {
    "code": "COMPOSE_FAILED",
    "message": "Composed UI payload failed pass2 schema validation.",
    "details": [
      {
        "field": "issue_cards",
        "reason": "must contain at most 5 items"
      }
    ],
    "retryable": false
  },
  "request_id": "req_01HZX...",
  "timestamp": "2026-02-25T19:04:12Z"
}
```

## Non-Goals (v1)

- Authentication/authorization spec
- Billing/usage metering spec
- Streaming responses
- Webhook callbacks
- Batch multi-URL analysis
