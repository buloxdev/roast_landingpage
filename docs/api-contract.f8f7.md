# API Contract (v1 Draft)

## Status

Draft contract for backend implementation planning. This document is the source of truth for the v1 API surface unless superseded by a later revision.

Notes:
- UI work currently runs from static fixtures.
- `schemas/pass2-ui-contract.json` is frozen for v1 UI integration and should be treated as authoritative for `compose_response.ui` and `GET /roast/:id` payloads.
- `schemas/pass1-analysis-contract.json` is intentionally loose for now.

## Goals

- Support a two-pass pipeline:
  - Pass 1: page analysis (`POST /analyze`)
  - Pass 2: UI composition (`POST /compose`)
- Support shareable roast retrieval (`GET /roast/:id`)
- Keep request/response shapes stable enough for frontend integration while backend internals evolve

## Conventions

### Base URL

Environment-specific (examples):
- Local: `http://localhost:3000`
- Production: `https://api.example.com`

### Content Type

All request/response bodies are JSON unless noted otherwise.

- Request header: `Content-Type: application/json`
- Response header: `Content-Type: application/json`

### IDs

String IDs. UUIDv4 recommended for v1.

Examples:
- `analysis_id`: `0d9d0f67-1c0f-42f5-9f0f-1f26b7f21d2b`
- `compose_id`: `8fd9a6cc-4f06-4e5d-bf68-2c1f0bb93f4e`
- `roast_id`: `r_7f3f3c0f7a2c`

### Timestamps

ISO 8601 UTC strings.

Example: `2026-02-25T19:34:12.123Z`

### Error Envelope (All Endpoints)

Non-2xx responses should use this shape:

```json
{
  "error": {
    "code": "INVALID_URL",
    "message": "Provided URL is not a valid public http(s) URL.",
    "retryable": false,
    "details": {
      "field": "url"
    }
  },
  "request_id": "req_01HXYZ..."
}
```

Fields:
- `error.code`: stable machine-readable code
- `error.message`: user-safe message
- `error.retryable`: whether retrying the same request may succeed
- `error.details`: optional structured metadata
- `request_id`: optional but recommended for tracing

### Common Error Codes

- `INVALID_JSON`
- `INVALID_URL`
- `UNSUPPORTED_URL`
- `FETCH_TIMEOUT`
- `PAGE_BLOCKED`
- `PAGE_TOO_LARGE`
- `EXTRACTION_FAILED`
- `ANALYSIS_FAILED`
- `COMPOSITION_FAILED`
- `VALIDATION_FAILED`
- `NOT_FOUND`
- `RATE_LIMITED`
- `INTERNAL_ERROR`

## Endpoint 1: `POST /analyze`

Runs pass 1 analysis on a landing page URL and returns analysis JSON (not UI copy).

### Request

```json
{
  "url": "https://example.com",
  "mode": "brutal",
  "viewport": {
    "desktop": { "width": 1440, "height": 900 },
    "mobile": { "width": 390, "height": 844 }
  },
  "options": {
    "include_screenshot_refs": false,
    "max_wait_ms": 20000
  }
}
```

### Request Fields

- `url` (required, string): target page URL (`http`/`https`)
- `mode` (optional, string): roast tone preset used in prompts. Suggested values for v1: `brutal`, `balanced`, `gentle`
- `viewport` (optional, object): explicit desktop/mobile capture sizes used for observations
- `options` (optional, object): backend execution controls

### Success Response (`200 OK`)

```json
{
  "analysis_id": "0d9d0f67-1c0f-42f5-9f0f-1f26b7f21d2b",
  "created_at": "2026-02-25T19:34:12.123Z",
  "input": {
    "url": "https://example.com",
    "normalized_url": "https://example.com/",
    "mode": "brutal"
  },
  "status": "ok",
  "warnings": [],
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
  }
}
```

Notes:
- `analysis` should conform to the current placeholder shape in `schemas/pass1-analysis-contract.json`.
- v1 backend may add additional keys inside `analysis` while pass1 schema remains intentionally loose.
- `warnings` may include partial extraction or weak evidence signals without failing the request.

### Partial/Degraded Success (`200 OK` with warnings)

Use `status: "partial"` when analysis completes but with known limitations.

```json
{
  "analysis_id": "...",
  "created_at": "2026-02-25T19:34:12.123Z",
  "input": { "url": "https://example.com", "normalized_url": "https://example.com/", "mode": "brutal" },
  "status": "partial",
  "warnings": [
    {
      "code": "PARTIAL_EVIDENCE",
      "message": "Some sections could not be extracted; analysis is based on visible hero and above-the-fold content."
    }
  ],
  "analysis": { "meta": {}, "summary": {}, "issues": [], "category_scores": [], "quick_wins": [], "rewrite_pack": {}, "mobile_roast": {}, "positives": [], "share": {} }
}
```

### Failure Status Codes (Recommended)

- `400 Bad Request`: invalid JSON / invalid URL / unsupported input
- `408 Request Timeout`: fetch/render timeout (or `504` if behind proxy/gateway)
- `422 Unprocessable Entity`: extraction succeeded but analysis failed validation
- `429 Too Many Requests`: rate limits
- `500 Internal Server Error`: unexpected backend failure
- `502/503`: upstream browser/LLM provider failures (optional distinction)

## Endpoint 2: `POST /compose`

Runs pass 2 UI composition from pass 1 analysis and returns the pass2 UI payload used by the frontend.

### Request (Option A: by `analysis_id`) [Recommended]

```json
{
  "analysis_id": "0d9d0f67-1c0f-42f5-9f0f-1f26b7f21d2b",
  "mode": "brutal"
}
```

### Request (Option B: inline analysis)

```json
{
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
  "mode": "brutal"
}
```

Notes:
- Supporting both modes makes backend integration and local testing easier.
- If both `analysis_id` and `analysis` are provided, backend should either reject (`400`) or define precedence explicitly. Recommended: reject as ambiguous.

### Success Response (`200 OK`)

```json
{
  "compose_id": "8fd9a6cc-4f06-4e5d-bf68-2c1f0bb93f4e",
  "analysis_id": "0d9d0f67-1c0f-42f5-9f0f-1f26b7f21d2b",
  "created_at": "2026-02-25T19:34:14.880Z",
  "status": "ok",
  "warnings": [],
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
    "issue_cards": [],
    "score_section": { "title": "Category Scores", "items": [] },
    "quick_wins_section": { "title": "Quick Wins", "subtitle": "30 minutes or less", "items": [] },
    "rewrite_pack_section": {
      "title": "Rewrite Pack",
      "headline_options_label": "Headline options",
      "headlines": [],
      "subheadline_options_label": "Subheadline options",
      "subheadlines": [],
      "cta_options_label": "CTA options",
      "ctas": []
    },
    "mobile_section": { "title": "Mobile Roast", "score_label": "Mobile score", "score": 5, "findings": [] },
    "positives_section": { "title": "What's Working", "items": [] },
    "share_card_copy": {
      "title": "Roast My Landing Page",
      "quote": "Looks legit. Still too vague. Your hero makes visitors guess what you actually do.",
      "score_text": "Roast Score: 56/100",
      "top_issues": ["Vague hero headline", "Generic CTA", "Weak differentiation"],
      "footer_cta": "Paste your URL. Get roasted."
    },
    "footer": {
      "disclaimer": "AI roast based on page content and viewport observations. Review recommendations before shipping changes.",
      "rerun_cta": "Roast another page"
    }
  }
}
```

Important:
- `ui` must validate against `schemas/pass2-ui-contract.json`.
- The example above truncates some arrays for readability and is illustrative only; real responses must satisfy exact array counts required by the schema.

### Failure Status Codes (Recommended)

- `400 Bad Request`: missing/ambiguous input (`analysis_id` vs `analysis`)
- `404 Not Found`: `analysis_id` not found
- `422 Unprocessable Entity`: analysis payload invalid or composition output fails pass2 schema validation
- `429 Too Many Requests`
- `500 Internal Server Error`

## Endpoint 3: `GET /roast/:id`

Returns a saved/shareable roast suitable for public page rendering.

### Path Params

- `id` (required): roast identifier (`roast_id`)

### Success Response (`200 OK`)

```json
{
  "roast_id": "r_7f3f3c0f7a2c",
  "created_at": "2026-02-25T19:34:15.201Z",
  "input": {
    "url": "https://example.com",
    "normalized_url": "https://example.com/",
    "mode": "brutal"
  },
  "analysis_id": "0d9d0f67-1c0f-42f5-9f0f-1f26b7f21d2b",
  "compose_id": "8fd9a6cc-4f06-4e5d-bf68-2c1f0bb93f4e",
  "status": "ok",
  "warnings": [],
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
    "issue_cards": [],
    "score_section": { "title": "Category Scores", "items": [] },
    "quick_wins_section": { "title": "Quick Wins", "subtitle": "30 minutes or less", "items": [] },
    "rewrite_pack_section": {
      "title": "Rewrite Pack",
      "headline_options_label": "Headline options",
      "headlines": [],
      "subheadline_options_label": "Subheadline options",
      "subheadlines": [],
      "cta_options_label": "CTA options",
      "ctas": []
    },
    "mobile_section": { "title": "Mobile Roast", "score_label": "Mobile score", "score": 5, "findings": [] },
    "positives_section": { "title": "What's Working", "items": [] },
    "share_card_copy": {
      "title": "Roast My Landing Page",
      "quote": "Looks legit. Still too vague. Your hero makes visitors guess what you actually do.",
      "score_text": "Roast Score: 56/100",
      "top_issues": ["Vague hero headline", "Generic CTA", "Weak differentiation"],
      "footer_cta": "Paste your URL. Get roasted."
    },
    "footer": {
      "disclaimer": "AI roast based on page content and viewport observations. Review recommendations before shipping changes.",
      "rerun_cta": "Roast another page"
    }
  }
}
```

Notes:
- `ui` is the primary rendering payload for public/share pages and should match `schemas/pass2-ui-contract.json` exactly.
- `analysis` is intentionally omitted from public response by default to avoid bloating payloads and exposing internal evidence details. If needed later, add `include=analysis` query support.

### Failure Status Codes (Recommended)

- `404 Not Found`: unknown roast ID
- `410 Gone`: roast deleted/expired (optional for future retention policies)
- `500 Internal Server Error`

## Suggested End-to-End Flow (v1)

1. Client calls `POST /analyze` with target URL.
2. Client calls `POST /compose` using returned `analysis_id`.
3. Backend optionally persists composed roast and returns/creates `roast_id`.
4. Public/shared pages render via `GET /roast/:id`.

Alternative v1 implementation:
- UI may call a single backend orchestrator internally, but public contract should still preserve the two-pass endpoints for debuggability and parallel development.

## Validation Requirements

### `POST /analyze`

- Reject non-HTTP(S) URLs
- Normalize URL (e.g., add trailing slash if standard normalizer does so)
- Enforce max URL length (recommended: 2048 chars)
- Return explicit blocked/timeout errors where possible

### `POST /compose`

- Validate pass1 presence/shape at least to placeholder contract (`schemas/pass1-analysis-contract.json`)
- Validate pass2 output against `schemas/pass2-ui-contract.json` before returning `200`
- On schema failure, return `422 VALIDATION_FAILED` with failed path(s) if available

### `GET /roast/:id`

- Only return persisted, validated pass2 UI payloads
- If persistence stores an older payload shape, either migrate on read or fail with `500` and log for migration work

## Example `422 VALIDATION_FAILED` (Pass2)

```json
{
  "error": {
    "code": "VALIDATION_FAILED",
    "message": "Composed UI payload failed pass2 schema validation.",
    "retryable": false,
    "details": {
      "schema": "schemas/pass2-ui-contract.json",
      "issues": [
        {
          "path": "issue_cards",
          "message": "must contain at most 5 items"
        }
      ]
    }
  },
  "request_id": "req_01HXYZ..."
}
```

## Open Questions (Track Before Backend Implementation)

- Should `POST /compose` persist and return `roast_id` immediately, or should persistence be a separate internal step?
- Do we support asynchronous processing (job IDs + polling) in v1, or keep both endpoints synchronous first?
- Should `mode` be a free string or restricted enum in the API contract now?
- What retention policy applies to saved roasts (`GET /roast/:id`)?
- Should public `GET /roast/:id` redact or omit source URL for privacy in some cases?

## Non-Goals (v1)

- Authentication/authorization spec
- Billing/usage metering spec
- Streaming responses
- Webhook callbacks
- Batch multi-URL analysis
