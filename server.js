const http = require("http");
const { URL } = require("url");
const crypto = require("crypto");
const fs = require("fs");
const path = require("path");

const PORT = Number(process.env.PORT || 8787);

const PASS2_SAMPLE_PATH = path.join(__dirname, "fixtures", "pass2-ui.sample.json");
const PASS1_SCHEMA_PATH = path.join(__dirname, "schemas", "pass1-analysis-contract.json");

const pass2Sample = JSON.parse(fs.readFileSync(PASS2_SAMPLE_PATH, "utf8"));
const pass1Schema = JSON.parse(fs.readFileSync(PASS1_SCHEMA_PATH, "utf8"));
const pass1RequiredKeys = Array.isArray(pass1Schema.required) ? pass1Schema.required : [];

const roastStore = new Map();

function nowIso() {
  return new Date().toISOString();
}

function makeId(prefix) {
  const token = crypto.randomBytes(8).toString("hex");
  return `${prefix}_${token}`;
}

function makeRequestId() {
  return makeId("req");
}

function clone(value) {
  return JSON.parse(JSON.stringify(value));
}

function sendJson(res, statusCode, body) {
  const payload = JSON.stringify(body);
  res.writeHead(statusCode, {
    "Content-Type": "application/json; charset=utf-8",
    "Content-Length": Buffer.byteLength(payload),
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Headers": "Content-Type",
    "Access-Control-Allow-Methods": "GET,POST,OPTIONS",
  });
  res.end(payload);
}

function sendError(res, statusCode, requestId, code, message, options = {}) {
  const body = {
    error: {
      code,
      message,
      ...(options.details ? { details: options.details } : {}),
      retryable: Boolean(options.retryable),
    },
    request_id: requestId,
    timestamp: nowIso(),
  };
  sendJson(res, statusCode, body);
}

function readJsonBody(req) {
  return new Promise((resolve, reject) => {
    let raw = "";

    req.on("data", (chunk) => {
      raw += chunk;
      if (raw.length > 1024 * 1024) {
        reject(new Error("Body too large"));
        req.destroy();
      }
    });

    req.on("end", () => {
      if (!raw) {
        resolve({});
        return;
      }

      try {
        resolve(JSON.parse(raw));
      } catch (error) {
        reject(error);
      }
    });

    req.on("error", reject);
  });
}

function isValidHttpUrl(value) {
  if (typeof value !== "string" || value.length === 0 || value.length > 2048) {
    return false;
  }

  try {
    const parsed = new URL(value);
    return parsed.protocol === "http:" || parsed.protocol === "https:";
  } catch {
    return false;
  }
}

function hasPass1Shape(analysis) {
  if (!analysis || typeof analysis !== "object" || Array.isArray(analysis)) {
    return false;
  }
  return pass1RequiredKeys.every((key) => Object.prototype.hasOwnProperty.call(analysis, key));
}

function getScenarioFromUrl(urlValue) {
  const value = String(urlValue || "").toLowerCase();
  if (value.includes("blocked") || value.includes("login") || value.includes("private")) return "blocked";
  if (value.includes("timeout")) return "timeout";
  if (value.includes("dashboard") || value.includes("/app")) return "redirected";
  if (value.includes("analysis-fail")) return "analysis-fail";
  if (value.includes("compose-fail")) return "compose-fail";
  if (value.includes("rate-limit")) return "rate-limit";
  return "normal";
}

function shouldForceComposeFailFromAnalysis(analysis) {
  if (!analysis || typeof analysis !== "object") return false;
  const share = analysis.share;
  if (!share || typeof share !== "object") return false;
  const title = String(share.suggested_title || "").toLowerCase();
  return title.includes("compose-fail");
}

function buildMockAnalysis({ url, mode }) {
  return {
    meta: {
      version: "v1",
      evidence_status: "partial",
      warnings: [
        {
          code: "PARTIAL_EVIDENCE",
          message: "Some sections could not be extracted; analysis used visible content only.",
        },
      ],
    },
    summary: {
      score_overall: 56,
      score_band: "Major clarity/messaging gaps",
      one_liner: "Credible design, but the offer is unclear in the hero.",
    },
    issues: [
      {
        rank: 1,
        category: "Clarity of offer",
        title: "Hero headline is vague",
        impact: "High",
        confidence: "High",
        problem: "The hero does not clearly state what the product is.",
        why_it_hurts: "Visitors cannot self-qualify quickly.",
        evidence: [{ type: "quote", value: "Turn feedback into momentum" }],
        fix: "Name the product category, audience, and outcome in the hero.",
      },
    ],
    category_scores: [],
    quick_wins: [
      "Make the hero headline specific to audience + outcome.",
      "Use a CTA that signals the next step.",
      "Add one differentiator near the hero.",
    ],
    rewrite_pack: {
      note: "Stub output only",
    },
    mobile_roast: {
      note: "Stub output only",
    },
    positives: [
      "Visual polish creates initial credibility.",
      "Page structure appears scannable on desktop.",
    ],
    share: {
      suggested_title: `Roast for ${url}`,
      mode_used: mode,
    },
  };
}

function buildRoastResource(record) {
  return {
    id: record.id,
    status: record.status,
    created_at: record.created_at,
    updated_at: record.updated_at,
    input: clone(record.input),
    analysis_meta: clone(record.analysis?.meta || {}),
    analysis: clone(record.analysis),
    ui: record.ui ? clone(record.ui) : null,
  };
}

async function handleAnalyze(req, res, requestId) {
  let body;
  try {
    body = await readJsonBody(req);
  } catch (error) {
    return sendError(res, 400, requestId, "INVALID_REQUEST", "Request body failed validation.", {
      details: [{ field: "body", reason: error.message.includes("JSON") ? "Malformed JSON" : error.message }],
      retryable: false,
    });
  }

  if (!isValidHttpUrl(body.url)) {
    return sendError(res, 422, requestId, "INVALID_REQUEST", "Request body failed validation.", {
      details: [{ field: "url", reason: "Must be a valid http(s) URL (max 2048 chars)" }],
      retryable: false,
    });
  }

  const scenario = getScenarioFromUrl(body.url);
  if (scenario === "blocked") {
    return sendError(res, 422, requestId, "PAGE_BLOCKED", "The page could not be accessed.", {
      details: [{ field: "url", reason: "Page appears behind login, bot protection, or permission gate" }],
      retryable: false,
    });
  }
  if (scenario === "timeout") {
    return sendError(res, 503, requestId, "FETCH_FAILED", "The page took too long to load.", {
      details: [{ field: "url", reason: "Page fetch/capture timed out" }],
      retryable: true,
    });
  }
  if (scenario === "redirected") {
    return sendError(res, 422, requestId, "FETCH_FAILED", "URL redirected away from a landing page.", {
      details: [{ field: "url", reason: "Redirected to app/dashboard page instead of marketing page" }],
      retryable: false,
    });
  }
  if (scenario === "analysis-fail") {
    return sendError(res, 422, requestId, "ANALYSIS_FAILED", "The page loaded but analysis did not complete.", {
      details: [{ field: "analysis", reason: "Pass-1 model/output generation failed" }],
      retryable: true,
    });
  }
  if (scenario === "rate-limit") {
    return sendError(res, 429, requestId, "RATE_LIMITED", "Too many requests. Please retry later.", {
      details: [{ field: "request", reason: "Rate limit exceeded for this client" }],
      retryable: true,
    });
  }

  const mode = typeof body.mode === "string" && body.mode.trim() ? body.mode.trim() : "balanced";
  const roastId = makeId("roast");
  const analysis = buildMockAnalysis({ url: body.url, mode });
  const timestamp = nowIso();
  const record = {
    id: roastId,
    status: "analyzed",
    created_at: timestamp,
    updated_at: timestamp,
    input: { url: body.url, mode },
    analysis,
    ui: null,
  };

  if (body.persist === true) {
    roastStore.set(roastId, record);
  }

  return sendJson(res, 200, {
    roast_id: roastId,
    status: "analyzed",
    input: record.input,
    analysis: clone(analysis),
    request_id: requestId,
    timestamp,
  });
}

async function handleCompose(req, res, requestId) {
  let body;
  try {
    body = await readJsonBody(req);
  } catch (error) {
    return sendError(res, 400, requestId, "INVALID_REQUEST", "Request body failed validation.", {
      details: [{ field: "body", reason: error.message.includes("JSON") ? "Malformed JSON" : error.message }],
      retryable: false,
    });
  }

  if (!body || (body.roast_id == null && body.analysis == null)) {
    return sendError(res, 422, requestId, "INVALID_REQUEST", "Request body failed validation.", {
      details: [{ field: "body", reason: "At least one of roast_id or analysis is required" }],
      retryable: false,
    });
  }

  let sourceAnalysis = body.analysis;
  let targetRecord = null;

  if (body.roast_id != null) {
    targetRecord = roastStore.get(String(body.roast_id)) || null;
    if (!sourceAnalysis && targetRecord) {
      sourceAnalysis = targetRecord.analysis;
    }
  }

  if (!sourceAnalysis) {
    return sendError(res, 422, requestId, "COMPOSE_FAILED", "Pass-1 analysis is required to compose UI.", {
      details: [{ field: "analysis", reason: "Provide analysis or a known roast_id with stored analysis" }],
      retryable: false,
    });
  }

  if (!hasPass1Shape(sourceAnalysis)) {
    return sendError(res, 422, requestId, "COMPOSE_FAILED", "Pass-1 analysis is missing required fields.", {
      details: pass1RequiredKeys
        .filter((key) => !Object.prototype.hasOwnProperty.call(sourceAnalysis, key))
        .map((key) => ({ field: `analysis.${key}`, reason: "Missing required field" })),
      retryable: false,
    });
  }

  if (sourceAnalysis.meta && sourceAnalysis.meta.evidence_status === "insufficient") {
    return sendError(res, 422, requestId, "COMPOSE_FAILED", "Pass-1 analysis is marked insufficient.", {
      details: [{ field: "analysis.meta.evidence_status", reason: "Cannot compose from insufficient evidence" }],
      retryable: false,
    });
  }

  const composeFailFromRecord =
    Boolean(targetRecord && targetRecord.input && getScenarioFromUrl(targetRecord.input.url) === "compose-fail");
  const composeFailFromAnalysis = shouldForceComposeFailFromAnalysis(sourceAnalysis);
  if (composeFailFromRecord || composeFailFromAnalysis) {
    return sendError(res, 422, requestId, "COMPOSE_FAILED", "The analysis completed, but composition failed.", {
      details: [{ field: "compose", reason: "Forced compose failure scenario for integration testing" }],
      retryable: true,
    });
  }

  const ui = clone(pass2Sample);

  if (body.mode === "fix-first") {
    ui.header.verdict_chip = "Fix the hero first";
  } else if (body.mode === "balanced") {
    ui.header.verdict_chip = "Start with clarity";
  }

  if (targetRecord) {
    targetRecord.ui = clone(ui);
    targetRecord.status = "ready";
    targetRecord.updated_at = nowIso();
    if (!targetRecord.analysis) {
      targetRecord.analysis = clone(sourceAnalysis);
    }
    roastStore.set(targetRecord.id, targetRecord);
  } else if (typeof body.roast_id === "string" && body.roast_id) {
    const timestamp = nowIso();
    roastStore.set(body.roast_id, {
      id: body.roast_id,
      status: "ready",
      created_at: timestamp,
      updated_at: timestamp,
      input: {
        url: "https://example-saas.com",
        mode: typeof body.mode === "string" ? body.mode : "balanced",
      },
      analysis: clone(sourceAnalysis),
      ui: clone(ui),
    });
  }

  return sendJson(res, 200, ui);
}

function handleGetRoast(req, res, requestId, roastId) {
  const record = roastStore.get(roastId);

  if (!record) {
    return sendError(res, 404, requestId, "NOT_FOUND", "Roast not found.", { retryable: false });
  }

  if (!record.ui) {
    return sendJson(res, 200, {
      ...buildRoastResource(record),
      status: "analyzed",
      ui: null,
    });
  }

  return sendJson(res, 200, buildRoastResource(record));
}

function parseRoute(reqUrl) {
  const parsed = new URL(reqUrl, "http://localhost");
  return { pathname: parsed.pathname };
}

const server = http.createServer(async (req, res) => {
  const requestId = makeRequestId();

  if (req.method === "OPTIONS") {
    res.writeHead(204, {
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Headers": "Content-Type",
      "Access-Control-Allow-Methods": "GET,POST,OPTIONS",
    });
    res.end();
    return;
  }

  try {
    const { pathname } = parseRoute(req.url || "/");

    if (req.method === "POST" && pathname === "/analyze") {
      await handleAnalyze(req, res, requestId);
      return;
    }

    if (req.method === "POST" && pathname === "/compose") {
      await handleCompose(req, res, requestId);
      return;
    }

    if (req.method === "GET" && pathname.startsWith("/roast/")) {
      const roastId = decodeURIComponent(pathname.slice("/roast/".length));
      if (!roastId) {
        sendError(res, 404, requestId, "NOT_FOUND", "Roast not found.", { retryable: false });
        return;
      }
      handleGetRoast(req, res, requestId, roastId);
      return;
    }

    sendError(res, 404, requestId, "NOT_FOUND", "Route not found.", { retryable: false });
  } catch (error) {
    sendError(res, 500, requestId, "INTERNAL_ERROR", "Unexpected server error.", {
      details: [{ field: "server", reason: error.message }],
      retryable: false,
    });
  }
});

if (require.main === module) {
  server.listen(PORT, () => {
    console.log(`Stub API listening on http://localhost:${PORT}`);
  });
}

module.exports = {
  server,
  roastStore,
};
