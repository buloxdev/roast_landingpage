const http = require("http");
const { URL } = require("url");
const crypto = require("crypto");
const fs = require("fs");
const path = require("path");
const dns = require("dns").promises;
const net = require("net");

function loadEnvFile(filePath) {
  if (!fs.existsSync(filePath)) return;
  const lines = fs.readFileSync(filePath, "utf8").split(/\r?\n/);
  for (const line of lines) {
    if (!line || /^\s*#/.test(line)) continue;
    const match = line.match(/^\s*([A-Za-z_][A-Za-z0-9_]*)\s*=\s*(.*)\s*$/);
    if (!match) continue;
    const key = match[1];
    if (process.env[key] != null && process.env[key] !== "") continue;
    let value = match[2] || "";
    if (
      (value.startsWith('"') && value.endsWith('"')) ||
      (value.startsWith("'") && value.endsWith("'"))
    ) {
      value = value.slice(1, -1);
    }
    process.env[key] = value;
  }
}

loadEnvFile(path.join(__dirname, ".env"));
loadEnvFile(path.join(__dirname, ".env.local"));

const PORT = Number(process.env.PORT || 8787);
const OPENAI_API_KEY = process.env.OPENAI_API_KEY || "";
const OPENAI_BASE_URL = String(process.env.OPENAI_BASE_URL || "https://api.openai.com/v1").replace(/\/+$/, "");
const OPENAI_PASS1_MODEL = process.env.OPENAI_PASS1_MODEL || "gpt-4o-mini";
const OPENAI_PASS2_MODEL = process.env.OPENAI_PASS2_MODEL || "gpt-4o-mini";
const ENABLE_OPENAI_PASS2 =
  String(process.env.ENABLE_OPENAI_PASS2 || "").trim().toLowerCase() === "true";
const OPENAI_TIMEOUT_MS = Math.max(
  5000,
  parsePositiveInteger(process.env.OPENAI_TIMEOUT_MS, 25000)
);
const API_ACCESS_TOKEN = process.env.API_ACCESS_TOKEN || "";
const CORS_ALLOWED_ORIGINS = String(process.env.CORS_ALLOWED_ORIGINS || "*")
  .split(",")
  .map((value) => value.trim())
  .filter(Boolean);
const RATE_LIMIT_WINDOW_MS = Math.max(
  1000,
  parsePositiveInteger(process.env.RATE_LIMIT_WINDOW_MS, 60000)
);
const RATE_LIMIT_MAX_ANALYZE = parsePositiveInteger(process.env.RATE_LIMIT_MAX_ANALYZE, 30);
const RATE_LIMIT_MAX_COMPOSE = parsePositiveInteger(process.env.RATE_LIMIT_MAX_COMPOSE, 60);
const SERVER_VERSION = "compose-inline-20260307c";
let sharedBrowserPromise = null;
const requestRateMap = new Map();

const PASS2_SAMPLE_PATH = path.join(__dirname, "fixtures", "pass2-ui.sample.json");
const PASS1_SCHEMA_PATH = path.join(__dirname, "schemas", "pass1-analysis-contract.json");
const PASS2_SCHEMA_PATH = path.join(__dirname, "schemas", "pass2-ui-contract.json");
const PASS1_SYSTEM_PROMPT_PATH = path.join(__dirname, "prompts", "pass1-system.txt");
const PASS1_TEMPLATE_PATH = path.join(__dirname, "prompts", "pass1-analysis-template.txt");
const PASS2_SYSTEM_PROMPT_PATH = path.join(__dirname, "prompts", "pass2-system.txt");
const PASS2_TEMPLATE_PATH = path.join(__dirname, "prompts", "pass2-compose-template.txt");

const pass2Sample = JSON.parse(fs.readFileSync(PASS2_SAMPLE_PATH, "utf8"));
const pass1Schema = JSON.parse(fs.readFileSync(PASS1_SCHEMA_PATH, "utf8"));
const pass2Schema = JSON.parse(fs.readFileSync(PASS2_SCHEMA_PATH, "utf8"));
const pass1SystemPrompt = fs.readFileSync(PASS1_SYSTEM_PROMPT_PATH, "utf8");
const pass1Template = fs.readFileSync(PASS1_TEMPLATE_PATH, "utf8");
const pass2SystemPrompt = fs.readFileSync(PASS2_SYSTEM_PROMPT_PATH, "utf8");
const pass2Template = fs.readFileSync(PASS2_TEMPLATE_PATH, "utf8");
const pass1RequiredKeys = Array.isArray(pass1Schema.required) ? pass1Schema.required : [];
const pass2ValidationApi = require("./utils/pass2-validation.js");
const CATEGORY_WEIGHTS = [
  ["Clarity of offer", 20],
  ["Target audience clarity", 10],
  ["Headline strength", 10],
  ["CTA quality", 15],
  ["Messaging / differentiation", 15],
  ["Trust / proof", 10],
  ["Structure / hierarchy", 10],
  ["Objection handling", 5],
  ["Mobile experience", 5],
];
const GENERIC_CTA_RE = /^(get started|learn more|submit|book now|click here|sign up|try now|start now)$/i;
const PRODUCT_TERMS = [
  "platform",
  "software",
  "tool",
  "app",
  "service",
  "crm",
  "dashboard",
  "analytics",
  "automation",
  "assistant",
  "api",
  "marketplace",
  "checkout",
  "payments",
  "scheduling",
  "feedback",
  "email",
  "sales",
];
const TRUST_TERMS = [
  "trusted by",
  "customers",
  "teams",
  "reviews",
  "testimonial",
  "case study",
  "g2",
  "capterra",
  "soc 2",
  "security",
  "compliance",
  "logos",
  "used by",
];
const DIFFERENTIATION_TERMS = [
  "faster",
  "minutes",
  "hours",
  "days",
  "without",
  "instead of",
  "unlike",
  "only",
  "first",
  "automatically",
  "one click",
  "in real time",
  "same day",
];
const OBJECTION_TERMS = [
  "faq",
  "pricing",
  "security",
  "guarantee",
  "trial",
  "cancel",
  "setup",
  "integrations",
  "compliance",
  "demo",
];
const CTA_ACTION_TERMS = [
  "start",
  "book",
  "schedule",
  "demo",
  "try",
  "join",
  "get",
  "see",
  "watch",
  "talk",
  "contact",
];

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

function parsePositiveInteger(input, fallback) {
  const parsed = Number(input);
  return Number.isInteger(parsed) && parsed > 0 ? parsed : fallback;
}

function getClientIp(req) {
  const forwarded = req.headers && req.headers["x-forwarded-for"];
  if (typeof forwarded === "string" && forwarded.trim()) {
    return forwarded.split(",")[0].trim();
  }

  const remoteAddress = req.socket && req.socket.remoteAddress ? req.socket.remoteAddress : "127.0.0.1";
  if (remoteAddress.startsWith("::ffff:")) {
    return remoteAddress.slice(7);
  }
  return remoteAddress;
}

function buildCorsOrigin(origin) {
  if (!origin) return CORS_ALLOWED_ORIGINS.includes("*") ? "*" : "";
  if (CORS_ALLOWED_ORIGINS.includes("*")) return "*";
  return CORS_ALLOWED_ORIGINS.includes(origin) ? origin : "";
}

function buildCorsHeaders(req) {
  const allowedOrigin = buildCorsOrigin(req && req.headers ? req.headers.origin : null);
  if (!allowedOrigin) {
    return {};
  }
  return {
    "Access-Control-Allow-Origin": allowedOrigin,
    "Access-Control-Allow-Headers": "Content-Type, Authorization",
    "Access-Control-Allow-Methods": "GET,POST,OPTIONS",
    Vary: "Origin",
    ...(allowedOrigin === "*" ? {} : { "Access-Control-Allow-Credentials": "true" }),
  };
}

function applyCorsHeaders(res, req) {
  const corsHeaders = buildCorsHeaders(req);
  for (const [key, value] of Object.entries(corsHeaders)) {
    res.setHeader(key, value);
  }
}

function rateLimitAllowed(req, action, maxRequests) {
  const ip = getClientIp(req);
  const key = `${action}:${ip}`;
  const now = Date.now();

  if (requestRateMap.size > 1000) {
    for (const [mapKey, bucket] of requestRateMap) {
      if (now - bucket.windowStart > RATE_LIMIT_WINDOW_MS * 2) {
        requestRateMap.delete(mapKey);
      }
    }
  }

  const bucket = requestRateMap.get(key) || { count: 0, windowStart: now };
  if (now - bucket.windowStart > RATE_LIMIT_WINDOW_MS) {
    bucket.count = 0;
    bucket.windowStart = now;
  }
  bucket.count += 1;
  requestRateMap.set(key, bucket);

  const retryAfterSeconds = Math.max(
    1,
    Math.ceil((bucket.windowStart + RATE_LIMIT_WINDOW_MS - now) / 1000)
  );
  return {
    allowed: bucket.count <= maxRequests,
    remaining: Math.max(0, maxRequests - bucket.count),
    retryAfter: retryAfterSeconds,
  };
}

function isRequestAuthorized(req) {
  if (!API_ACCESS_TOKEN) return true;

  const header = req.headers.authorization;
  const match = typeof header === "string" ? header.match(/^Bearer\s+(.+)$/i) : null;
  const token = match && match[1] ? match[1].trim() : req.headers["x-api-token"];
  if (!token) return false;

  const expected = Buffer.from(String(API_ACCESS_TOKEN), "utf8");
  const actual = Buffer.from(String(token), "utf8");
  if (expected.length !== actual.length) return false;

  return crypto.timingSafeEqual(expected, actual);
}

function hasDisallowedHostname(hostname) {
  const normalized = hostname.toLowerCase();
  return (
    normalized === "localhost" ||
    normalized === "::1" ||
    normalized.endsWith(".local") ||
    normalized.endsWith(".localhost") ||
    normalized.endsWith(".internal") ||
    normalized.endsWith(".test") ||
    normalized.endsWith(".invalid") ||
    normalized.endsWith(".example") ||
    normalized.endsWith(".example.com")
  );
}

function hasDisallowedIp(address) {
  const version = net.isIP(address);
  if (!version) return true;

  if (version === 4) {
    const octets = address.split(".").map(Number);
    if (!octets.every((part) => Number.isFinite(part))) return true;
    const [a, b] = octets;
    if (a === 0) return true;
    if (a === 10) return true;
    if (a === 127) return true;
    if (a === 172 && b >= 16 && b <= 31) return true;
    if (a === 192 && b === 168) return true;
    if (a === 169 && b === 254) return true;
    if (a === 100 && b >= 64 && b <= 127) return true;
    if (a >= 224) return true;
    return false;
  }

  const normalized = address.toLowerCase();
  if (normalized === "::" || normalized === "::0" || normalized === "::1") return true;
  if (normalized.startsWith("fc") || normalized.startsWith("fd")) return true;
  if (normalized.startsWith("fe80")) return true;
  if (normalized.startsWith("ff")) return true;
  if (normalized.includes(".") || normalized.includes("/")) return true;
  return false;
}

async function validatePublicHttpUrl(rawUrl) {
  if (!isValidHttpUrl(rawUrl)) {
    return { ok: false, reason: "Must be a valid http(s) URL." };
  }

  const parsed = new URL(rawUrl);
  if (parsed.username || parsed.password) {
    return { ok: false, reason: "URL credentials are not allowed." };
  }

  if (hasDisallowedHostname(parsed.hostname)) {
    return { ok: false, reason: "URL hostname is not allowed." };
  }

  const ipFromHostname = net.isIP(parsed.hostname);
  if (ipFromHostname) {
    return hasDisallowedIp(parsed.hostname)
      ? { ok: false, reason: "URL resolves to a restricted IP." }
      : { ok: true, normalizedHost: parsed.hostname };
  }

  try {
    const resolved = await dns.lookup(parsed.hostname, { all: true });
    if (!resolved.length) {
      return { ok: false, reason: "URL hostname could not be resolved." };
    }

    for (const result of resolved) {
      if (hasDisallowedIp(result.address)) {
        return {
          ok: false,
          reason: `URL resolves to restricted destination ${result.address}`,
        };
      }
    }

    return { ok: true };
  } catch (error) {
    return {
      ok: false,
      reason: error && error.code ? `DNS lookup failed: ${error.code}` : "DNS lookup failed.",
    };
  }
}

function isPlainObject(value) {
  return Boolean(value) && typeof value === "object" && !Array.isArray(value);
}

function mergeJsonLike(baseValue, overlayValue) {
  if (overlayValue == null) return clone(baseValue);
  if (Array.isArray(overlayValue)) return clone(overlayValue);
  if (!isPlainObject(baseValue) || !isPlainObject(overlayValue)) return clone(overlayValue);

  const merged = clone(baseValue);
  for (const [key, value] of Object.entries(overlayValue)) {
    if (!Object.prototype.hasOwnProperty.call(baseValue, key)) {
      merged[key] = clone(value);
      continue;
    }
    merged[key] = mergeJsonLike(baseValue[key], value);
  }
  return merged;
}

function clamp(value, min, max) {
  return Math.max(min, Math.min(max, value));
}

function cleanText(value) {
  return String(value || "")
    .replace(/&nbsp;/gi, " ")
    .replace(/&amp;/gi, "&")
    .replace(/&quot;/gi, '"')
    .replace(/&#39;/gi, "'")
    .replace(/&#x27;/gi, "'")
    .replace(/&lt;/gi, "<")
    .replace(/&gt;/gi, ">")
    .replace(/\s+/g, " ")
    .trim();
}

function truncate(value, maxLength) {
  const text = cleanText(value);
  if (text.length <= maxLength) return text;
  return `${text.slice(0, Math.max(0, maxLength - 1)).trim()}…`;
}

function uniqueNonEmpty(values, limit) {
  const seen = new Set();
  const results = [];

  for (const value of values || []) {
    const normalized = cleanText(value);
    if (!normalized) continue;
    const key = normalized.toLowerCase();
    if (seen.has(key)) continue;
    seen.add(key);
    results.push(normalized);
    if (typeof limit === "number" && results.length >= limit) break;
  }

  return results;
}

function stripHtml(source) {
  return String(source || "")
    .replace(/<script[\s\S]*?<\/script>/gi, " ")
    .replace(/<style[\s\S]*?<\/style>/gi, " ")
    .replace(/<noscript[\s\S]*?<\/noscript>/gi, " ")
    .replace(/<svg[\s\S]*?<\/svg>/gi, " ")
    .replace(/<[^>]+>/g, " ");
}

function extractTagTexts(html, tagName, limit = 20) {
  const regex = new RegExp(`<${tagName}\\b[^>]*>([\\s\\S]*?)<\\/${tagName}>`, "gi");
  const matches = [];
  let match;
  while ((match = regex.exec(html)) && matches.length < limit) {
    matches.push(cleanText(stripHtml(match[1])));
  }
  return uniqueNonEmpty(matches, limit);
}

function extractMetaContents(html) {
  const meta = {};
  const regex = /<meta\b[^>]*(?:name|property)=["']([^"']+)["'][^>]*content=["']([^"']*)["'][^>]*>/gi;
  let match;
  while ((match = regex.exec(html))) {
    meta[String(match[1]).toLowerCase()] = cleanText(match[2]);
  }
  return meta;
}

function extractCtas(html) {
  const buttonTexts = extractTagTexts(html, "button", 10);
  const anchorRegex = /<a\b[^>]*>([\s\S]*?)<\/a>/gi;
  const anchorTexts = [];
  let match;
  while ((match = anchorRegex.exec(html)) && anchorTexts.length < 25) {
    anchorTexts.push(cleanText(stripHtml(match[1])));
  }

  return uniqueNonEmpty(
    buttonTexts
      .concat(anchorTexts)
      .filter((text) => text && text.length <= 60),
    12
  );
}

function countMatches(text, terms) {
  const haystack = String(text || "").toLowerCase();
  return terms.reduce((count, term) => (haystack.includes(String(term).toLowerCase()) ? count + 1 : count), 0);
}

function inferAudience(heroText) {
  const text = cleanText(heroText);
  const forMatch = text.match(/\bfor\s+([A-Z][A-Za-z0-9/& -]{2,40}|[a-z][a-z0-9/& -]{2,40})/i);
  if (forMatch) return truncate(forMatch[1], 32);

  if (/founders/i.test(text)) return "founders";
  if (/marketers/i.test(text)) return "marketers";
  if (/sales/i.test(text)) return "sales teams";
  if (/product/i.test(text)) return "product teams";
  if (/developer/i.test(text)) return "developers";
  if (/recruit/i.test(text)) return "recruiting teams";
  return "the right buyer";
}

function inferProductType(heroText) {
  const text = cleanText(heroText);
  const lowered = text.toLowerCase();
  for (const term of PRODUCT_TERMS) {
    if (lowered.includes(term)) return term;
  }
  return "offer";
}

function inferOutcome(heroText, description) {
  const combined = cleanText(`${heroText} ${description}`);
  if (/increase|grow|boost/i.test(combined)) return "grow faster";
  if (/save|reduce|cut/i.test(combined)) return "save time";
  if (/automate/i.test(combined)) return "automate manual work";
  if (/book|schedule/i.test(combined)) return "book more meetings";
  if (/analy/i.test(combined)) return "get clearer insights";
  if (/collect/i.test(combined)) return "capture more demand";
  return "get a clearer result";
}

function hasOpenAiConfigured() {
  return Boolean(OPENAI_API_KEY);
}

function requireOpenAiConfigured() {
  if (!hasOpenAiConfigured()) {
    const error = new Error("OPENAI_API_KEY is not configured.");
    error.code = "OPENAI_NOT_CONFIGURED";
    throw error;
  }
}

function asJsonString(value) {
  return JSON.stringify(value, null, 2);
}

function renderTemplate(template, replacements) {
  return String(template).replace(/\{\{(\w+)\}\}/g, function replaceToken(_match, key) {
    return Object.prototype.hasOwnProperty.call(replacements, key) ? String(replacements[key]) : "";
  });
}

function getDurationMs(startedAt) {
  return Math.max(0, Date.now() - startedAt);
}

function getPlaywrightChromium() {
  try {
    return require("playwright").chromium;
  } catch {
    return null;
  }
}

async function getSharedBrowser() {
  const chromium = getPlaywrightChromium();
  if (!chromium) return null;
  if (!sharedBrowserPromise) {
    sharedBrowserPromise = chromium
      .launch({
        headless: true,
        args: [
          "--no-sandbox",
          "--disable-setuid-sandbox",
          "--disable-dev-shm-usage",
        ],
      })
      .catch((error) => {
        sharedBrowserPromise = null;
        throw error;
      });
  }
  return sharedBrowserPromise;
}

function extractMessageContent(message) {
  if (!message) return "";
  if (typeof message.content === "string") return message.content;
  if (Array.isArray(message.content)) {
    return message.content
      .map((part) => {
        if (!part) return "";
        if (typeof part === "string") return part;
        if (typeof part.text === "string") return part.text;
        return "";
      })
      .join("");
  }
  return "";
}

async function callOpenAiJson({ model, systemPrompt, userPrompt, responseFormat, temperature = 0.3 }) {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), OPENAI_TIMEOUT_MS);
  let response;
  try {
    response = await fetch(`${OPENAI_BASE_URL}/chat/completions`, {
      method: "POST",
      signal: controller.signal,
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${OPENAI_API_KEY}`,
      },
      body: JSON.stringify({
        model,
        temperature,
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: userPrompt },
        ],
        response_format: responseFormat,
      }),
    });
  } catch (error) {
    if (error && error.name === "AbortError") {
      const timeoutError = new Error(`OpenAI request timed out after ${OPENAI_TIMEOUT_MS}ms`);
      timeoutError.code = "OPENAI_TIMEOUT";
      throw timeoutError;
    }
    throw error;
  } finally {
    clearTimeout(timeoutId);
  }

  const payload = await response.json().catch(() => ({}));
  if (!response.ok) {
    const message =
      (payload && payload.error && payload.error.message) ||
      `OpenAI request failed with status ${response.status}`;
    const error = new Error(message);
    error.status = response.status;
    error.payload = payload;
    throw error;
  }

  const rawContent =
    payload &&
    Array.isArray(payload.choices) &&
    payload.choices[0] &&
    payload.choices[0].message
      ? extractMessageContent(payload.choices[0].message)
      : "";

  if (!rawContent) {
    throw new Error("OpenAI response did not include JSON content.");
  }

  return JSON.parse(rawContent);
}

function canWriteResponse(res) {
  return res && !res.writableEnded && !res.writableFinished;
}

function sendJson(res, statusCode, body, req = null) {
  if (!canWriteResponse(res) || res.__roastResponseSent) {
    return;
  }

  const payload = JSON.stringify(body);
  res.__roastResponseSent = true;

  if (!res.headersSent) {
    const headers = {
      "Content-Type": "application/json; charset=utf-8",
      "Content-Length": Buffer.byteLength(payload),
      ...buildCorsHeaders(req),
    };
    res.writeHead(statusCode, {
      ...headers,
    });
  } else {
    applyCorsHeaders(res, req);
  }
  try {
    res.end(payload);
  } catch {
    // Ignore late writes if headers/body were already sent by another branch.
  }
}

function sendError(res, statusCode, requestId, code, message, options = {}, req = null) {
  if (!canWriteResponse(res)) {
    return;
  }

  if (options.retryAfterSeconds != null) {
    res.setHeader("Retry-After", String(options.retryAfterSeconds));
  }

  if (options.authFailed) {
    res.setHeader("WWW-Authenticate", 'Bearer realm="API"');
  }

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
  sendJson(res, statusCode, body, req);
}

function logServerError(scope, requestId, error, extra = {}) {
  const details = {
    requestId,
    scope,
    message: error && error.message ? error.message : "Unknown error",
    code: error && error.code ? error.code : "",
    status: error && error.status ? error.status : "",
    ...(extra || {}),
  };

  if (error && error.payload && error.payload.error) {
    details.openai = {
      type: error.payload.error.type || "",
      code: error.payload.error.code || "",
      message: error.payload.error.message || "",
    };
  }

  console.error(`[${scope}]`, JSON.stringify(details));
}

function logServerInfo(scope, requestId, details = {}) {
  console.log(`[${scope}]`, JSON.stringify({ requestId, ...details }));
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
  if (value.includes("example-saas.com")) return "sample";
  if (value.includes("/sample")) return "sample";
  if (value.includes("/strong")) return "strong";
  if (value.includes("/mobile")) return "mobile";
  if (value.includes("/partial")) return "partial";
  if (value.includes("blocked") || value.includes("login") || value.includes("private")) return "blocked";
  if (value.includes("timeout")) return "timeout";
  if (value.includes("dashboard") || value.includes("/app")) return "redirected";
  if (value.includes("analysis-fail")) return "analysis-fail";
  if (value.includes("compose-fail")) return "compose-fail";
  if (value.includes("rate-limit")) return "rate-limit";
  return "normal";
}

function getDemoPageSnapshot(pageUrl, scenario) {
  const htmlByScenario = {
    sample: `
      <html><head><title>Example SaaS</title><meta name="description" content="Turn customer feedback into product momentum."></head>
      <body>
        <h1>Turn feedback into momentum</h1>
        <h2>Collect requests, spot patterns, and decide what to build next.</h2>
        <p>Use one workspace for customer calls, support tickets, and product notes so your team can stop guessing.</p>
        <p>Trusted by product teams at fast-moving SaaS companies.</p>
        <a href="/demo">Get started</a>
        <a href="/learn">Learn more</a>
      </body></html>
    `,
    strong: `
      <html><head><title>Strong Example SaaS</title><meta name="description" content="Customer intelligence for product teams."></head>
      <body>
        <h1>Customer intelligence for product teams</h1>
        <h2>Connect feedback channels, uncover recurring themes, and ship with confidence.</h2>
        <p>See what customers are asking for, what revenue is at risk, and which improvements will move adoption.</p>
        <p>Trusted by Notion, Framer, and modern product orgs.</p>
        <a href="/trial">Start free trial</a>
      </body></html>
    `,
    mobile: `
      <html><head><title>Mobile Example SaaS</title><meta name="description" content="A deliberately crowded hero for mobile testing."></head>
      <body>
        <h1>The all-in-one feedback operating system for high-growth teams that need more context before they can prioritize anything</h1>
        <h2>Collect requests, connect calls, sync CRM notes, tag churn risk, and align support and product in one place.</h2>
        <p>This hero is intentionally long so the mobile roast has something obvious to flag.</p>
        <a href="/demo">Book a demo</a>
      </body></html>
    `,
    partial: `
      <html><head><title>Partial Example</title></head>
      <body>
        <h1>Feedback, organized.</h1>
        <p>Simple workspace for collecting what customers ask for.</p>
      </body></html>
    `,
  };

  const html = htmlByScenario[scenario];
  if (!html) return null;
  return {
    ok: true,
    html,
    finalUrl: pageUrl,
  };
}

function shouldForceComposeFailFromAnalysis(analysis) {
  if (!analysis || typeof analysis !== "object") return false;
  const share = analysis.share;
  if (!share || typeof share !== "object") return false;
  const title = String(share.suggested_title || "").toLowerCase();
  return title.includes("compose-fail");
}

async function fetchPageSnapshotViaHttp(pageUrl) {
  const scenario = getScenarioFromUrl(pageUrl);
  if (scenario === "sample" || scenario === "strong" || scenario === "mobile" || scenario === "partial") {
    return getDemoPageSnapshot(pageUrl, scenario);
  }

  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), 12000);

  try {
    const response = await fetch(pageUrl, {
      redirect: "follow",
      signal: controller.signal,
      headers: {
        "User-Agent":
          "Mozilla/5.0 (compatible; RoastLandingPageBot/1.0; +https://roastlandingpage.vercel.app)",
        Accept: "text/html,application/xhtml+xml",
      },
    });

    if (response.status === 401 || response.status === 403) {
      return { ok: false, status: response.status, code: "PAGE_BLOCKED", reason: "Page appears behind login or bot protection" };
    }

    if (!response.ok) {
      return { ok: false, status: response.status, code: "FETCH_FAILED", reason: `Page request returned ${response.status}` };
    }

    const contentType = String(response.headers.get("content-type") || "").toLowerCase();
    if (!contentType.includes("text/html")) {
      return { ok: false, status: 422, code: "FETCH_FAILED", reason: "URL did not return an HTML page" };
    }

    const finalUrl = response.url || pageUrl;
    if (!isValidHttpUrl(finalUrl)) {
      return { ok: false, status: 403, code: "SSRF_BLOCKED", reason: "Final URL is invalid." };
    }
    const finalValidation = await validatePublicHttpUrl(finalUrl);
    if (!finalValidation.ok) {
      return {
        ok: false,
        status: 403,
        code: "SSRF_BLOCKED",
        reason: `Final URL blocked: ${finalValidation.reason}`,
      };
    }
    if (getScenarioFromUrl(finalUrl) === "redirected") {
      return { ok: false, status: 422, code: "FETCH_FAILED", reason: "Redirected to app/dashboard page instead of marketing page" };
    }

    const html = await response.text();
    return { ok: true, html, finalUrl };
  } catch (error) {
    if (error && error.name === "AbortError") {
      return { ok: false, status: 503, code: "FETCH_FAILED", reason: "Page fetch/capture timed out", retryable: true };
    }
    return { ok: false, status: 503, code: "FETCH_FAILED", reason: error && error.message ? error.message : "Page fetch failed", retryable: true };
  } finally {
    clearTimeout(timeoutId);
  }
}

async function fetchPageSnapshotViaBrowser(pageUrl) {
  const browser = await getSharedBrowser();
  if (!browser) {
    const error = new Error("Playwright browser runtime is unavailable.");
    error.code = "BROWSER_UNAVAILABLE";
    throw error;
  }

  const context = await browser.newContext({
    userAgent:
      "Mozilla/5.0 (compatible; RoastLandingPageBot/1.0; +https://roastlandingpage.vercel.app)",
    viewport: { width: 1440, height: 960 },
  });
  const page = await context.newPage();
  page.setDefaultNavigationTimeout(18000);
  page.setDefaultTimeout(8000);

  try {
    const response = await page.goto(pageUrl, {
      waitUntil: "domcontentloaded",
      timeout: 18000,
    });

    if (response) {
      const status = response.status();
      if (status === 401 || status === 403) {
        return {
          ok: false,
          status,
          code: "PAGE_BLOCKED",
          reason: "Page appears behind login or bot protection",
        };
      }
      if (!response.ok()) {
        return {
          ok: false,
          status,
          code: "FETCH_FAILED",
          reason: `Page request returned ${status}`,
        };
      }
      const contentType = String(response.headers()["content-type"] || "").toLowerCase();
      if (contentType && !contentType.includes("text/html")) {
        return {
          ok: false,
          status: 422,
          code: "FETCH_FAILED",
          reason: "URL did not return an HTML page",
        };
      }
    }

    try {
      await page.waitForLoadState("networkidle", { timeout: 4000 });
    } catch {
      // A quieter page is ideal, but many marketing sites keep connections open.
    }

    const finalUrl = page.url() || pageUrl;
    if (!isValidHttpUrl(finalUrl)) {
      return { ok: false, status: 403, code: "SSRF_BLOCKED", reason: "Final URL is invalid." };
    }
    const finalValidation = await validatePublicHttpUrl(finalUrl);
    if (!finalValidation.ok) {
      return {
        ok: false,
        status: 403,
        code: "SSRF_BLOCKED",
        reason: `Final URL blocked: ${finalValidation.reason}`,
      };
    }
    if (getScenarioFromUrl(finalUrl) === "redirected") {
      return {
        ok: false,
        status: 422,
        code: "FETCH_FAILED",
        reason: "Redirected to app/dashboard page instead of marketing page",
      };
    }

    const html = await page.content();
    return { ok: true, html, finalUrl, rendered: true };
  } catch (error) {
    if (error && /timeout|timed out|Timeout/i.test(String(error.message || ""))) {
      return {
        ok: false,
        status: 503,
        code: "FETCH_FAILED",
        reason: "Page browser render timed out",
        retryable: true,
      };
    }
    throw error;
  } finally {
    await context.close().catch(() => {});
  }
}

async function fetchPageSnapshot(pageUrl, requestId) {
  const scenario = getScenarioFromUrl(pageUrl);
  if (scenario === "sample" || scenario === "strong" || scenario === "mobile" || scenario === "partial") {
    return getDemoPageSnapshot(pageUrl, scenario);
  }

  try {
    const renderedSnapshot = await fetchPageSnapshotViaBrowser(pageUrl);
    if (renderedSnapshot && renderedSnapshot.ok) {
      if (requestId) {
        logServerInfo("page_snapshot", requestId, {
          source: "browser",
          url: pageUrl,
          final_url: renderedSnapshot.finalUrl || pageUrl,
        });
      }
      return renderedSnapshot;
    }
    if (renderedSnapshot && !renderedSnapshot.ok) {
      return renderedSnapshot;
    }
  } catch (error) {
    if (requestId) {
      logServerError("page_snapshot_browser", requestId, error, { url: pageUrl });
    }
  }

  const httpSnapshot = await fetchPageSnapshotViaHttp(pageUrl);
  if (requestId) {
    logServerInfo("page_snapshot", requestId, {
      source: "http",
      url: pageUrl,
      final_url: httpSnapshot && httpSnapshot.finalUrl ? httpSnapshot.finalUrl : pageUrl,
    });
  }
  return httpSnapshot;
}

function buildExtraction(html, finalUrl) {
  const title = uniqueNonEmpty(extractTagTexts(html, "title", 1), 1)[0] || "";
  const meta = extractMetaContents(html);
  const h1s = extractTagTexts(html, "h1", 6);
  const h2s = extractTagTexts(html, "h2", 10);
  const paragraphs = extractTagTexts(html, "p", 20).filter((text) => text.length >= 35);
  const ctas = extractCtas(html);
  const visibleText = cleanText(stripHtml(html));
  const description = meta.description || meta["og:description"] || paragraphs[0] || "";
  const heroHeadline = h1s[0] || meta["og:title"] || title || "";
  const heroSupport = h2s[0] || description || paragraphs[0] || "";
  const trustMentions = countMatches(visibleText, TRUST_TERMS);
  const objectionMentions = countMatches(visibleText, OBJECTION_TERMS);

  return {
    finalUrl,
    rendered: false,
    title,
    description,
    heroHeadline,
    heroSupport,
    h1s,
    h2s,
    paragraphs,
    ctas,
    visibleText,
    trustMentions,
    objectionMentions,
  };
}

function buildPromptEvidence(extraction, requestedUrl, mode) {
  const quotedSnippets = uniqueNonEmpty(
    [extraction.heroHeadline, extraction.heroSupport].concat(extraction.ctas.slice(0, 3)).concat(extraction.paragraphs.slice(0, 4)),
    8
  );

  return {
    requested_url: requestedUrl,
    normalized_url: extraction.finalUrl,
    roast_mode: mode,
    fetch_status: "success",
    extraction_status: "parsed_html",
    evidence_completeness_summary:
      extraction.heroHeadline && extraction.ctas.length
        ? "Core landing-page evidence available (headline, support copy, CTA, and body text)."
        : "Partial landing-page evidence available; some key signals may be missing.",
    page_meta_json: asJsonString({
      title: extraction.title,
      description: extraction.description,
      final_url: extraction.finalUrl,
    }),
    extracted_copy_json: asJsonString({
      hero_headline: extraction.heroHeadline,
      hero_support: extraction.heroSupport,
      paragraph_samples: extraction.paragraphs.slice(0, 6),
    }),
    cta_elements_json: asJsonString({
      detected_ctas: extraction.ctas.slice(0, 8),
    }),
    structure_json: asJsonString({
      h1s: extraction.h1s,
      h2s: extraction.h2s,
      paragraph_count: extraction.paragraphs.length,
    }),
    trust_elements_json: asJsonString({
      trust_signal_matches: extraction.trustMentions,
      objection_signal_matches: extraction.objectionMentions,
    }),
    desktop_observations_json: asJsonString([
      extraction.heroHeadline ? "Hero headline detected." : "No clear hero headline detected.",
      extraction.ctas[0] ? `Primary CTA candidate detected: "${truncate(extraction.ctas[0], 48)}".` : "No obvious primary CTA detected.",
      extraction.h2s.length ? `Detected ${extraction.h2s.length} secondary headings, suggesting page structure exists.` : "Very few section headings were detected.",
    ]),
    mobile_observations_json: asJsonString([
      "Mobile findings are inferred from text density and CTA placement clues, not real browser rendering.",
      extraction.heroHeadline && extraction.heroHeadline.split(/\s+/).length > 14
        ? "Hero headline appears long enough to risk heavy wrapping on small screens."
        : "Hero headline length looks manageable for mobile.",
    ]),
    quoted_snippets_json: asJsonString(quotedSnippets),
    errors_json: asJsonString([]),
  };
}

function getRoastStyleInstruction(style) {
  if (style === "observational") {
    return "Use a clean observational roast style. Notice the odd patterns, vague habits, and quiet contradictions in the page, then point them out in a playful, useful way. Keep it crisp, clever, and free of vulgar language.";
  }
  if (style === "deadpan") {
    return "Use a dry, understated deadpan tone. Be concise, quietly cutting, and slightly amused. Favor lines that sound effortless rather than loud. Keep the language clean and never use vulgar phrasing.";
  }
  if (style === "bold") {
    return "Use a bold, high-contrast roast style. Make the strongest problems feel unmistakable, use punchier framing, and land harder without becoming sloppy or cruel. Keep the language clean and never use vulgar phrasing.";
  }
  return "Use a clean observational roast style. Notice the odd patterns, vague habits, and quiet contradictions in the page, then point them out in a playful, useful way. Keep it crisp, clever, and free of vulgar language.";
}

function getRoastStyleFewShot(style) {
  if (style === "deadpan") {
    return [
      "Header title example: \"A real product. A still-blurry pitch.\"",
      "One-liner example: \"The page is presentable. The message is still late.\"",
      "Issue title example 1: \"Technically a headline. Not yet a reason to care.\"",
      "Issue title example 2: \"It is a button. It is not yet a next step.\"",
      "Share quote example: \"Clean design. Delayed meaning.\"",
    ].join("\\n");
  }
  if (style === "bold") {
    return [
      "Header title example: \"Strong surface. Soft pitch.\"",
      "One-liner example: \"The page looks ready for traffic. The message still folds under pressure.\"",
      "Issue title example 1: \"The headline walks on stage without a point.\"",
      "Issue title example 2: \"The next step shows up with no conviction.\"",
      "Share quote example: \"Polished page. Underpowered message.\"",
    ].join("\\n");
  }
  return [
    "Header title example: \"This page keeps acting like we already know what it does.\"",
    "One-liner example: \"The design is doing its job. The message keeps taking the scenic route.\"",
    "Issue title example 1: \"The headline keeps hinting instead of saying.\"",
    "Issue title example 2: \"The next step sounds like it was named at the last minute.\"",
    "Share quote example: \"Nice page. Strange habit of avoiding the point.\"",
  ].join("\\n");
}

function scoreBandFromOverall(score) {
  if (score >= 90) return "Strong page, mostly optimization";
  if (score >= 70) return "Good page, still leaving conversions on the table";
  if (score >= 50) return "Major clarity/messaging gaps";
  return "Confusing page, weak conversion foundation";
}

function scoreExtraction(extraction) {
  const hero = cleanText(extraction.heroHeadline);
  const support = cleanText(extraction.heroSupport);
  const combinedHero = cleanText(`${hero} ${support}`);
  const cta = extraction.ctas[0] || "";
  const bodyText = extraction.visibleText;
  const heroWordCount = hero ? hero.split(/\s+/).length : 0;
  const heroHasAudience = /\bfor\b/i.test(combinedHero) || /teams|founders|marketers|developers|sales|product/i.test(combinedHero);
  const heroHasProduct = countMatches(combinedHero, PRODUCT_TERMS) > 0;
  const heroHasSpecificity = /\d|%|minutes|hours|days|faster|without|automatically/i.test(combinedHero);
  const differentiationCount = countMatches(bodyText, DIFFERENTIATION_TERMS);
  const trustCount = extraction.trustMentions;
  const objectionCount = extraction.objectionMentions;
  const structureSignals = extraction.h2s.length + extraction.paragraphs.length;
  const ctaSpecific = cta && !GENERIC_CTA_RE.test(cta) && /\b(start|book|schedule|demo|trial|audit|see|talk|watch|contact)\b/i.test(cta);

  const scores = {
    "Clarity of offer": clamp(2 + (hero ? 2 : 0) + (heroHasProduct ? 3 : 0) + (heroHasSpecificity ? 2 : 0), 2, 9),
    "Target audience clarity": clamp(2 + (heroHasAudience ? 4 : 0) + (/for /i.test(support) ? 1 : 0), 2, 9),
    "Headline strength": clamp(2 + (hero ? 2 : 0) + (heroWordCount >= 4 && heroWordCount <= 12 ? 2 : 0) + (heroHasSpecificity ? 2 : 0), 2, 9),
    "CTA quality": clamp(2 + (cta ? 2 : 0) + (ctaSpecific ? 3 : 0) + (!cta || GENERIC_CTA_RE.test(cta) ? 0 : 1), 2, 9),
    "Messaging / differentiation": clamp(2 + Math.min(4, differentiationCount) + (heroHasSpecificity ? 1 : 0), 2, 9),
    "Trust / proof": clamp(2 + Math.min(5, trustCount), 2, 9),
    "Structure / hierarchy": clamp(3 + Math.min(4, extraction.h2s.length) + (structureSignals >= 8 ? 1 : 0), 2, 9),
    "Objection handling": clamp(2 + Math.min(4, objectionCount), 2, 9),
    "Mobile experience": clamp(6 - (heroWordCount > 14 ? 2 : 0) - (cta ? 0 : 1), 3, 8),
  };

  return scores;
}

function buildCategoryScoreItems(scores, extraction) {
  const notes = {
    "Clarity of offer": extraction.heroHeadline
      ? "Hero exists, but clarity depends on how explicitly it states the offer."
      : "No clear hero headline was detected early on the page.",
    "Target audience clarity": /\bfor\b/i.test(`${extraction.heroHeadline} ${extraction.heroSupport}`)
      ? "The page hints at who this is for, but could be more explicit."
      : "The page does not clearly name the audience in the hero.",
    "Headline strength": extraction.heroHeadline
      ? "Headline was scored on specificity, length, and usefulness."
      : "Without a clear headline, the first impression is weak.",
    "CTA quality": extraction.ctas[0]
      ? `Primary CTA detected: "${truncate(extraction.ctas[0], 48)}".`
      : "No obvious primary CTA was detected in the extracted content.",
    "Messaging / differentiation":
      "Differentiation was scored on whether the page explains why this is better or different.",
    "Trust / proof": extraction.trustMentions
      ? "Trust language or proof signals were detected on the page."
      : "Very little trust or proof language was detected.",
    "Structure / hierarchy":
      "Structure score reflects heading depth, scanability clues, and content organization.",
    "Objection handling": extraction.objectionMentions
      ? "The page addresses some buyer concerns, but there is room to tighten this."
      : "Common buying objections were not clearly addressed in the extracted content.",
    "Mobile experience":
      "Mobile score is heuristic for now and is based on hero density and CTA visibility clues.",
  };

  return CATEGORY_WEIGHTS.map(([category, weight]) => ({
    category,
    score: scores[category],
    weight,
    display_score: `${scores[category]}/10 (weight ${weight})`,
    note: notes[category],
  }));
}

function buildIssues(scores, extraction) {
  const cta = extraction.ctas[0] || "No clear CTA detected";
  const hero = extraction.heroHeadline || extraction.title || "No clear hero headline detected";
  const templates = {
    "Clarity of offer": {
      title: "Your hero headline hides the offer",
      problem: "The hero does not clearly explain what the product is and why someone should care.",
      why: "Visitors should not have to infer the category or outcome from vague copy.",
      fix: "Name the product category, audience, and outcome directly in the hero headline.",
      rewrite: `${inferProductType(hero)} for ${inferAudience(hero)} that helps them ${inferOutcome(hero, extraction.description)}.`,
      evidence: [{ type: "quote", value: truncate(hero, 90) }],
    },
    "Target audience clarity": {
      title: "The page does not clearly say who it is for",
      problem: "The page leaves the intended buyer too implicit in the hero.",
      why: "When people cannot quickly self-identify, bounce risk goes up.",
      fix: "Call out the audience explicitly near the top of the page.",
      rewrite: `Built for ${inferAudience(`${hero} ${extraction.heroSupport}`)} who need to ${inferOutcome(hero, extraction.description)}.`,
      evidence: [{ type: "quote", value: truncate(hero || extraction.description, 90) }],
    },
    "Headline strength": {
      title: "The headline is not doing enough conversion work",
      problem: "The headline is either too abstract, too broad, or not specific enough to carry the first impression.",
      why: "The hero headline should quickly set context before visitors start scrolling.",
      fix: "Use stronger language that says what the product does and the result it creates.",
      rewrite: `${inferOutcome(hero, extraction.description)} with a ${inferProductType(hero)} built for ${inferAudience(hero)}.`,
      evidence: [{ type: "quote", value: truncate(hero, 90) }],
    },
    "CTA quality": {
      title: "The primary CTA is too weak or generic",
      problem: "The main CTA does not clearly signal the next step or expected value.",
      why: "Generic CTA copy creates hesitation because the user has to guess the commitment.",
      fix: "Make the CTA specific to the action and the payoff.",
      rewrite: `See how ${inferAudience(hero)} can ${inferOutcome(hero, extraction.description)}`,
      evidence: [{ type: "quote", value: truncate(cta, 90) }],
    },
    "Messaging / differentiation": {
      title: "Differentiation is not obvious enough",
      problem: "The page does not clearly explain why this is better, faster, or more valuable than alternatives.",
      why: "Without a sharp 'why us', buyers keep comparing and delay action.",
      fix: "Add one concrete differentiator near the hero using speed, setup time, workflow fit, or a unique capability.",
      rewrite: "",
      evidence: [{ type: "ui_observation", value: "Differentiation language was limited or generic in the extracted copy" }],
    },
    "Trust / proof": {
      title: "The page needs stronger proof",
      problem: "Proof points are weak, missing, or not visible enough in the extracted content.",
      why: "Visitors need reassurance that other teams trust the product and get real outcomes from it.",
      fix: "Add quantified testimonials, customer logos, or clear credibility markers near the CTA.",
      rewrite: "",
      evidence: [{ type: "ui_observation", value: "Only limited trust or proof signals were detected" }],
    },
    "Structure / hierarchy": {
      title: "The page structure is not pulling enough weight",
      problem: "The hierarchy is not doing enough to guide the visitor from problem to proof to action.",
      why: "A page can look polished and still lose conversions if the section sequence does not build conviction.",
      fix: "Tighten the section order and make sure the page quickly moves from promise to proof to CTA.",
      rewrite: "",
      evidence: [{ type: "ui_observation", value: "Heading and paragraph structure suggests room for stronger scanability" }],
    },
    "Objection handling": {
      title: "Important buying questions are still unanswered",
      problem: "The page does not do enough to reduce buyer hesitation around setup, pricing, security, or fit.",
      why: "Interested buyers still stall when common objections are not handled near conversion points.",
      fix: "Add a compact objection-handling block near the CTA or pricing section.",
      rewrite: "",
      evidence: [{ type: "ui_observation", value: "Little objection-handling language was detected in the extracted page copy" }],
    },
    "Mobile experience": {
      title: "The hero may be too dense on smaller screens",
      problem: "Long hero copy or a delayed CTA can weaken first-screen performance on mobile.",
      why: "Mobile users need clarity and a visible action quickly.",
      fix: "Shorten the hero copy and keep the CTA higher in the first mobile viewport.",
      rewrite: "",
      evidence: [{ type: "ui_observation", value: "Mobile score is heuristic and is currently inferred from hero density and CTA visibility clues" }],
    },
  };

  const sorted = Object.entries(scores)
    .map(([category, score]) => {
      const weight = CATEGORY_WEIGHTS.find((item) => item[0] === category)[1];
      return { category, score, weight, severity: (10 - score) * weight };
    })
    .sort((a, b) => b.severity - a.severity)
    .slice(0, 5);

  return sorted.map((item, index) => {
    const template = templates[item.category];
    return {
      rank: index + 1,
      category: item.category,
      title: template.title,
      impact: item.score <= 4 ? "High" : item.score <= 6 ? "Medium" : "Low",
      confidence: item.category === "Mobile experience" ? "Medium" : "High",
      problem: template.problem,
      why_it_hurts: template.why,
      evidence: template.evidence,
      fix: template.fix,
      example_rewrite: template.rewrite,
    };
  });
}

function buildQuickWins(issues) {
  return uniqueNonEmpty(
    issues.map((issue) => issue.fix),
    4
  );
}

function buildPositives(scores, extraction) {
  const positives = [];
  if (scores["Structure / hierarchy"] >= 7) {
    positives.push("The page has enough heading structure to feel scannable on first pass.");
  }
  if (scores["Trust / proof"] >= 7) {
    positives.push("Trust and credibility signals are visible enough to support the conversion story.");
  }
  if (scores["CTA quality"] >= 7) {
    positives.push("The primary CTA is specific enough to communicate the next step.");
  }
  if (extraction.heroHeadline) {
    positives.push("A clear hero headline is present and gives the page an immediate focal point.");
  }
  positives.push("The page provides enough visible content to generate concrete feedback rather than a generic roast.");
  return uniqueNonEmpty(positives, 3);
}

function buildRewritePack(extraction) {
  const audience = inferAudience(`${extraction.heroHeadline} ${extraction.heroSupport}`);
  const product = inferProductType(`${extraction.heroHeadline} ${extraction.description}`);
  const outcome = inferOutcome(extraction.heroHeadline, extraction.description);
  return {
    headlines: [
      `${capitalize(product)} for ${audience}`,
      `${capitalize(outcome)} for ${audience}`,
      `${capitalize(product)} that helps ${audience} ${outcome}`,
    ],
    subheadlines: [
      `Explain what the ${product} does, who it is for, and why it helps ${audience} ${outcome}.`,
      `Make the promise concrete by showing how quickly buyers can ${outcome} without extra complexity.`,
    ],
    ctas: [
      `See the ${product} in action`,
      `Start your ${product} review`,
      `Book a demo`,
      `Try it free`,
      `See pricing`,
    ],
  };
}

function capitalize(value) {
  const text = cleanText(value);
  if (!text) return "";
  return text.charAt(0).toUpperCase() + text.slice(1);
}

function buildRealAnalysis({ url, mode, extraction }) {
  const scores = scoreExtraction(extraction);
  const categoryScores = buildCategoryScoreItems(scores, extraction);
  const issues = buildIssues(scores, extraction);
  const quickWins = buildQuickWins(issues);
  const positives = buildPositives(scores, extraction);
  const rewritePack = buildRewritePack(extraction);
  const weightedTotal = categoryScores.reduce((sum, item) => sum + item.score * item.weight, 0);
  const overall = Math.round(weightedTotal / 10);
  const warnings = [];
  const evidenceStatus =
    extraction.heroHeadline && extraction.ctas.length ? "complete" : "partial";

  if (evidenceStatus === "partial") {
    warnings.push({
      code: "PARTIAL_EVIDENCE",
      message: "Some key page elements were missing or hard to extract; findings are still based on visible copy.",
    });
  }

  return {
    meta: {
      version: "v1",
      source_url: url,
      final_url: extraction.finalUrl,
      mode_used: mode,
      evidence_status: evidenceStatus,
      warnings,
      extraction: {
        mode: extraction.rendered ? "browser" : "http",
        title: extraction.title,
        hero_headline: extraction.heroHeadline,
        hero_support: extraction.heroSupport,
        primary_cta: extraction.ctas[0] || "",
      },
    },
    summary: {
      score_overall: overall,
      score_band: scoreBandFromOverall(overall),
      one_liner:
        issues[0] && issues[0].problem
          ? truncate(issues[0].problem, 160)
          : "The page has a credible base, but key conversion messaging still needs tightening.",
    },
    issues,
    category_scores: categoryScores,
    quick_wins: quickWins,
    rewrite_pack: rewritePack,
    mobile_roast: {
      score: scores["Mobile experience"],
      findings: [
        "Mobile findings are currently heuristic and based on the extracted hero/CTA structure.",
        extraction.ctas[0]
          ? `Primary CTA detected: "${truncate(extraction.ctas[0], 48)}".`
          : "No obvious primary CTA was detected from the extracted content.",
        extraction.heroHeadline && extraction.heroHeadline.split(/\s+/).length > 14
          ? "Hero headline is long enough that it may wrap heavily on mobile."
          : "Hero headline length looks reasonable for a first mobile viewport.",
      ],
    },
    positives,
    share: {
      suggested_title: `Roast for ${new URL(url).hostname}`,
      mode_used: mode,
      quote: truncate(
        issues[0]
          ? `${issues[0].title}. ${issues[0].fix}`
          : "Clearer messaging will make the page easier to trust and act on.",
        140
      ),
    },
  };
}

function mergePass1Analysis(base, candidate, metaOverrides) {
  const merged = clone(base);
  const next = candidate && typeof candidate === "object" ? candidate : {};
  const summary = next.summary && typeof next.summary === "object" ? next.summary : {};
  const candidateScores = Array.isArray(next.category_scores) ? next.category_scores : [];
  const scoreMap = new Map();

  for (const item of candidateScores) {
    if (!item || typeof item !== "object") continue;
    const category = cleanText(item.category);
    if (!category) continue;
    scoreMap.set(category, item);
  }

  merged.meta = {
    ...merged.meta,
    ...(next.meta && typeof next.meta === "object" ? next.meta : {}),
    ...metaOverrides,
  };

  merged.summary = {
    ...merged.summary,
    ...(summary && typeof summary === "object" ? summary : {}),
  };

  if (summary.overall_score != null && merged.summary.score_overall == null) {
    merged.summary.score_overall = Number(summary.overall_score) || merged.summary.score_overall;
  }

  merged.summary.score_overall = clamp(Number(merged.summary.score_overall) || 0, 0, 100);
  merged.summary.score_band = cleanText(merged.summary.score_band || scoreBandFromOverall(merged.summary.score_overall));
  merged.summary.one_liner = truncate(merged.summary.one_liner || base.summary.one_liner, 180);

  if (Array.isArray(next.issues) && next.issues.length) {
    merged.issues = next.issues.slice(0, 5).map((issue, index) => ({
      rank: index + 1,
      category: cleanText(issue.category || base.issues[index] && base.issues[index].category || "Clarity of offer"),
      title: cleanText(issue.title || base.issues[index] && base.issues[index].title || "Landing-page issue"),
      impact: /low/i.test(issue.impact) ? "Low" : /medium/i.test(issue.impact) ? "Medium" : "High",
      confidence: /low/i.test(issue.confidence) ? "Low" : /medium/i.test(issue.confidence) ? "Medium" : "High",
      problem: cleanText(issue.problem || base.issues[index] && base.issues[index].problem),
      why_it_hurts: cleanText(issue.why_it_hurts || base.issues[index] && base.issues[index].why_it_hurts),
      evidence: Array.isArray(issue.evidence) && issue.evidence.length
        ? issue.evidence.map((entry) => ({
            type: entry && entry.type === "ui_observation" ? "ui_observation" : "quote",
            value: cleanText(entry && entry.value),
          }))
        : clone(base.issues[index] && base.issues[index].evidence || [{ type: "ui_observation", value: "Limited supporting evidence available." }]),
      fix: cleanText(issue.fix || base.issues[index] && base.issues[index].fix),
      example_rewrite: cleanText(issue.example_rewrite || base.issues[index] && base.issues[index].example_rewrite || ""),
    }));
  }

  merged.category_scores = CATEGORY_WEIGHTS.map(([category, weight], index) => {
    const source = scoreMap.get(category) || {};
    const score = source.score_0_to_10 != null ? source.score_0_to_10 : source.score;
    return {
      category,
      score: clamp(Number(score) || base.category_scores[index].score, 0, 10),
      weight,
      display_score: `${clamp(Number(score) || base.category_scores[index].score, 0, 10)}/10 (weight ${weight})`,
      note: cleanText(source.note || base.category_scores[index].note),
    };
  });

  if (Array.isArray(next.quick_wins) && next.quick_wins.length) {
    merged.quick_wins = fillToLength(next.quick_wins, base.quick_wins, 4);
  }

  if (next.rewrite_pack && typeof next.rewrite_pack === "object") {
    merged.rewrite_pack = {
      headlines: fillToLength(next.rewrite_pack.headlines, base.rewrite_pack.headlines, 3),
      subheadlines: fillToLength(next.rewrite_pack.subheadlines, base.rewrite_pack.subheadlines, 2),
      ctas: fillToLength(next.rewrite_pack.ctas, base.rewrite_pack.ctas, 5),
    };
  }

  if (next.mobile_roast && typeof next.mobile_roast === "object") {
    const mobileScore = next.mobile_roast.score_0_to_10 != null ? next.mobile_roast.score_0_to_10 : next.mobile_roast.score;
    merged.mobile_roast = {
      score: clamp(Number(mobileScore) || base.mobile_roast.score, 0, 10),
      findings: fillToLength(next.mobile_roast.findings, base.mobile_roast.findings, 3),
    };
  }

  if (Array.isArray(next.positives) && next.positives.length) {
    merged.positives = fillToLength(next.positives, base.positives, 3);
  }

  if (next.share && typeof next.share === "object") {
    merged.share = {
      ...base.share,
      ...next.share,
      quote: truncate(next.share.quote || base.share.quote || base.summary.one_liner, 140),
      top_issues: fillToLength(next.share.top_issues, base.issues.map((issue) => issue.title), 3),
      score_text: next.share.score_text || `Roast Score: ${merged.summary.score_overall}/100`,
    };
  }

  return merged;
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

function fillToLength(values, fallbackValues, expectedLength) {
  const merged = uniqueNonEmpty([].concat(values || [], fallbackValues || []));
  return merged.slice(0, expectedLength);
}

function buildStyledHeaderTitle(style, score) {
  if (style === "deadpan") {
    if (score >= 70) return "A real offer. Still not a clean pitch.";
    if (score >= 50) return "Presentable page. Delayed meaning.";
    return "The page exists. The pitch is still unclear.";
  }
  if (style === "bold") {
    if (score >= 70) return "Strong surface. Soft pitch.";
    if (score >= 50) return "Polished page. Underpowered message.";
    return "The page looks ready. The pitch is not.";
  }
  if (score >= 70) return "This page is close, but it still dodges the point.";
  if (score >= 50) return "The design is carrying more than the message.";
  return "This page keeps asking the design to explain the offer.";
}

function buildStyledOneLiner(style, analysis, fallbackText) {
  const firstIssue = Array.isArray(analysis.issues) && analysis.issues[0] ? analysis.issues[0] : null;
  const category = firstIssue && firstIssue.category ? String(firstIssue.category) : "";

  if (/CTA quality/i.test(category)) {
    if (style === "deadpan") return "The page has a button. The next step is still oddly vague.";
    if (style === "bold") return "The page reaches for action, then blinks at the last second.";
    return "The page gets to the next step and suddenly starts speaking in placeholders.";
  }
  if (/Messaging \/ differentiation/i.test(category)) {
    if (style === "deadpan") return "The message is competent. It is not distinctive.";
    if (style === "bold") return "The page looks market-ready. The differentiation does not.";
    return "The page says plenty of familiar things and somehow avoids saying the memorable one.";
  }
  if (style === "deadpan") return "The page is credible. The message is still late.";
  if (style === "bold") return "The page looks polished. The pitch still folds under pressure.";
  return "The page looks sharp, then takes the scenic route to the actual point.";
}

function buildStyledIssueTitle(style, issue, fallbackTitle) {
  const category = issue && issue.category ? String(issue.category) : "";
  if (/Clarity of offer|Headline strength/i.test(category)) {
    if (style === "deadpan") return "Technically a headline. Not yet a clear offer.";
    if (style === "bold") return "The headline shows up with no real point.";
    return "The headline keeps hinting instead of saying.";
  }
  if (/CTA quality/i.test(category)) {
    if (style === "deadpan") return "It is a button. It is not yet a next step.";
    if (style === "bold") return "The next step shows up with no conviction.";
    return "The next step sounds like it was named at the last minute.";
  }
  if (/Messaging \/ differentiation/i.test(category)) {
    if (style === "deadpan") return "The message is present. The distinction is not.";
    if (style === "bold") return "The pitch blends in where it should separate.";
    return "The page says the normal things, which is the problem.";
  }
  if (/Trust \/ proof/i.test(category)) {
    if (style === "deadpan") return "Credibility is implied. Proof is still thin.";
    if (style === "bold") return "The page asks for trust before it earns it.";
    return "The page wants trust to arrive on vibes alone.";
  }
  if (/Objection handling/i.test(category)) {
    if (style === "deadpan") return "The buyer questions remain politely unanswered.";
    if (style === "bold") return "The page leaves the hard questions hanging.";
    return "The page keeps hoping nobody asks the obvious buying questions.";
  }
  if (/Mobile experience/i.test(category)) {
    if (style === "deadpan") return "On mobile, this gets crowded quickly.";
    if (style === "bold") return "Mobile is doing too much before the point lands.";
    return "On mobile, the page starts multitasking before it explains itself.";
  }
  return fallbackTitle;
}

function buildStyledShareQuote(style, analysis) {
  const firstIssue = Array.isArray(analysis.issues) && analysis.issues[0] ? analysis.issues[0] : null;
  const category = firstIssue && firstIssue.category ? String(firstIssue.category) : "";

  if (/CTA quality/i.test(category)) {
    if (style === "deadpan") return "The button is there. The reason to click is not.";
    if (style === "bold") return "Visible CTA. Missing conviction.";
    return "The next step sounds like it got named on the way to launch.";
  }
  if (/Messaging \/ differentiation/i.test(category)) {
    if (style === "deadpan") return "Competent message. Weak distinction.";
    if (style === "bold") return "Clean page. Blended-in pitch.";
    return "The page says plenty. Very little of it sticks.";
  }
  if (style === "deadpan") return "Clean design. Delayed meaning.";
  if (style === "bold") return "Polished page. Underpowered message.";
  return "Nice page. Strange habit of avoiding the point.";
}

function applyStyleOverlay(ui, analysis, style) {
  const next = clone(ui);
  const score = clamp(Number(next.header && next.header.score_value) || 0, 0, 100);
  next.header.title = buildStyledHeaderTitle(style, score);
  next.header.subtitle = truncate(buildStyledOneLiner(style, analysis, next.header.subtitle), 180);
  next.summary_panel.one_liner = truncate(buildStyledOneLiner(style, analysis, next.summary_panel.one_liner), 180);
  next.share_card_copy.quote = truncate(buildStyledShareQuote(style, analysis), 140);

  if (Array.isArray(next.issue_cards)) {
    next.issue_cards = next.issue_cards.map((card, index) => ({
      ...card,
      title: index < 3 ? buildStyledIssueTitle(style, card, card.title) : card.title,
    }));
  }

  next.summary_panel.top_3_problems = fillToLength(
    (next.issue_cards || []).slice(0, 3).map((issue) => issue.title),
    next.summary_panel.top_3_problems,
    3
  );

  return next;
}

function buildPass2Ui(analysis, mode) {
  const ui = clone(pass2Sample);
  const issues = Array.isArray(analysis.issues) ? analysis.issues.slice(0, 5) : [];
  const categoryScores = Array.isArray(analysis.category_scores) ? analysis.category_scores : [];
  const rewritePack = analysis.rewrite_pack || {};
  const mobileRoast = analysis.mobile_roast || {};

  ui.header.title =
    analysis.summary && analysis.summary.score_overall >= 70
      ? "Strong base, but still leaving conversions on the table"
      : analysis.summary && analysis.summary.score_overall >= 50
      ? "Credible page, but the message still slips"
      : "The page needs a much clearer pitch";
  ui.header.subtitle = truncate(
    (analysis.summary && analysis.summary.one_liner) ||
      "The page has enough visible content to score, but the message still needs work.",
    180
  );
  ui.header.score_value = clamp(Number(analysis.summary && analysis.summary.score_overall) || 0, 0, 100);
  ui.header.score_band = cleanText((analysis.summary && analysis.summary.score_band) || ui.header.score_band);
  ui.header.verdict_chip =
    mode === "fix-first"
      ? "Fix the highest-impact issue first"
      : mode === "balanced"
      ? "Start with clarity and CTA"
      : "Brutal honesty, ranked by impact";

  ui.summary_panel.one_liner = truncate(ui.header.subtitle, 180);
  ui.summary_panel.top_3_problems = fillToLength(
    issues.map((issue) => issue.title),
    ui.summary_panel.top_3_problems,
    3
  );
  ui.summary_panel.cta_hint = truncate(
    (Array.isArray(analysis.quick_wins) && analysis.quick_wins[0]) ||
      "Start with the hero headline and primary CTA. That is the fastest lift.",
    140
  );

  if (issues.length) {
    ui.issue_cards = issues.map((issue, index) => ({
      rank: index + 1,
      category: cleanText(issue.category),
      title: cleanText(issue.title),
      impact_badge: issue.impact || "Medium",
      confidence_badge: issue.confidence || "High",
      problem: cleanText(issue.problem),
      why_it_hurts: cleanText(issue.why_it_hurts),
      evidence_label: "Evidence",
      evidence: (issue.evidence || []).map((entry) => ({
        type: entry.type === "ui_observation" ? "ui_observation" : "quote",
        value: cleanText(entry.value),
      })),
      fix_label: "Fix",
      fix: cleanText(issue.fix),
      rewrite_label: "Example Rewrite",
      example_rewrite: cleanText(issue.example_rewrite || ""),
    }));
  }

  if (categoryScores.length === 9) {
    ui.score_section.items = categoryScores.map((item) => ({
      category: item.category,
      score: clamp(Number(item.score) || 0, 0, 10),
      weight: item.weight,
      display_score: cleanText(item.display_score),
      note: cleanText(item.note),
    }));
  }

  ui.quick_wins_section.items = fillToLength(
    analysis.quick_wins,
    ui.quick_wins_section.items,
    4
  );

  ui.rewrite_pack_section.headlines = fillToLength(rewritePack.headlines, ui.rewrite_pack_section.headlines, 3);
  ui.rewrite_pack_section.subheadlines = fillToLength(
    rewritePack.subheadlines,
    ui.rewrite_pack_section.subheadlines,
    2
  );
  ui.rewrite_pack_section.ctas = fillToLength(rewritePack.ctas, ui.rewrite_pack_section.ctas, 5);

  ui.mobile_section.score = clamp(Number(mobileRoast.score) || ui.mobile_section.score, 0, 10);
  ui.mobile_section.findings = fillToLength(mobileRoast.findings, ui.mobile_section.findings, 3);

  ui.positives_section.items = fillToLength(analysis.positives, ui.positives_section.items, 3);

  ui.share_card_copy.quote = truncate(
    (analysis.share && analysis.share.quote) || ui.header.subtitle,
    140
  );
  ui.share_card_copy.score_text = `Roast Score: ${ui.header.score_value}/100`;
  ui.share_card_copy.top_issues = fillToLength(
    issues.map((issue) => issue.title),
    ui.share_card_copy.top_issues,
    3
  );

  return ui;
}

async function buildAiPass1Analysis({ requestedUrl, mode, extraction, fallbackAnalysis, requestId }) {
  const prompt = renderTemplate(pass1Template, buildPromptEvidence(extraction, requestedUrl, mode));
  if (requestId) {
    logServerInfo("pass1_begin", requestId, {
      model: OPENAI_PASS1_MODEL,
      prompt_chars: prompt.length,
      visible_text_chars: extraction && extraction.visibleText ? extraction.visibleText.length : 0,
      paragraph_count: extraction && Array.isArray(extraction.paragraphs) ? extraction.paragraphs.length : 0,
      cta_count: extraction && Array.isArray(extraction.ctas) ? extraction.ctas.length : 0,
    });
  }
  const raw = await callOpenAiJson({
    model: OPENAI_PASS1_MODEL,
    systemPrompt: pass1SystemPrompt,
    userPrompt: prompt,
    responseFormat: { type: "json_object" },
    temperature: 0.4,
  });

  return mergePass1Analysis(fallbackAnalysis, raw, {
    provider: "openai",
    provider_model: OPENAI_PASS1_MODEL,
    evidence_status:
      raw && raw.meta && typeof raw.meta.evidence_status === "string"
        ? raw.meta.evidence_status
        : fallbackAnalysis.meta.evidence_status,
  });
}

async function buildAiPass2Ui({ requestedUrl, mode, style, analysis, fallbackUi, requestId }) {
  const roastModeLabel =
    mode === "fix-first" ? "Fix-First" : mode === "balanced" ? "Balanced" : "Brutal";
  const prompt = renderTemplate(pass2Template, {
    requested_url: requestedUrl,
    roast_mode_label: roastModeLabel,
    roast_style_instruction: getRoastStyleInstruction(style),
    roast_style_examples: getRoastStyleFewShot(style),
    pass1_analysis_json: asJsonString(analysis),
  });
  if (requestId) {
    logServerInfo("pass2_begin", requestId, {
      model: OPENAI_PASS2_MODEL,
      style,
      prompt_chars: prompt.length,
      analysis_chars: asJsonString(analysis).length,
      issue_count: analysis && Array.isArray(analysis.issues) ? analysis.issues.length : 0,
    });
  }

  const raw = await callOpenAiJson({
    model: OPENAI_PASS2_MODEL,
    systemPrompt: pass2SystemPrompt,
    userPrompt: prompt,
    responseFormat: {
      type: "json_schema",
      json_schema: {
        name: "pass2_ui_contract",
        strict: true,
        schema: pass2Schema,
      },
    },
    temperature: 1.0,
  });

  const mergedUi = applyStyleOverlay(mergeJsonLike(fallbackUi, raw), analysis, style);
  const validation = pass2ValidationApi.validatePass2Payload(mergedUi);
  if (!validation.ok) {
    const error = new Error("OpenAI Pass 2 output failed pass2 validation.");
    error.validation = validation;
    throw error;
  }

  return mergedUi;
}

async function composeUiWithFallback({
  requestId,
  roastId,
  requestedUrl,
  mode,
  style,
  analysis,
}) {
  logServerInfo("compose_begin", requestId, {
    roast_id: roastId || "",
    pass: "pass2",
    mode,
    style,
  });

  let fallbackUi;
  try {
    fallbackUi = buildPass2Ui(analysis, mode);
  } catch (error) {
    logServerError("compose_base", requestId, error, {
      roast_id: roastId || "",
      pass: "pass2",
      mode,
      style,
    });
    fallbackUi = clone(pass2Sample);
  }

  const composeStartedAt = Date.now();
  if (!ENABLE_OPENAI_PASS2) {
    logServerInfo("compose_local", requestId, {
      roast_id: roastId || "",
      pass: "pass2",
      duration_ms: getDurationMs(composeStartedAt),
    });
    return {
      ui: applyStyleOverlay(fallbackUi, analysis, style),
      composeMeta: {
        provider: "local",
        provider_model: "",
        fallback: false,
      },
    };
  }

  try {
    requireOpenAiConfigured();
    const ui = await buildAiPass2Ui({
      requestedUrl,
      mode,
      style,
      analysis,
      fallbackUi,
      requestId,
    });
    const composeMeta = {
      provider: "openai",
      provider_model: OPENAI_PASS2_MODEL,
      fallback: false,
    };
    logServerInfo("compose_success", requestId, {
      roast_id: roastId || "",
      pass: "pass2",
      model: OPENAI_PASS2_MODEL,
      duration_ms: getDurationMs(composeStartedAt),
    });
    return { ui, composeMeta };
  } catch (error) {
    logServerError("compose", requestId, error, {
      roast_id: roastId || "",
      pass: "pass2",
      model: OPENAI_PASS2_MODEL,
      duration_ms: typeof composeStartedAt === "number" ? getDurationMs(composeStartedAt) : 0,
    });
    logServerInfo("compose_fallback", requestId, {
      roast_id: roastId || "",
      pass: "pass2",
      model: OPENAI_PASS2_MODEL,
    });
    return {
      ui: applyStyleOverlay(fallbackUi, analysis, style),
      composeMeta: {
        provider: "fallback",
        provider_model: "",
        fallback: true,
      },
    };
  }
}

async function handleAnalyze(req, res, requestId) {
  if (!isRequestAuthorized(req)) {
    return sendError(
      res,
      401,
      requestId,
      "UNAUTHORIZED",
      "Missing or invalid API token.",
      { authFailed: true, retryable: false },
      req
    );
  }

  const rateLimit = rateLimitAllowed(req, "analyze", RATE_LIMIT_MAX_ANALYZE);
  if (!rateLimit.allowed) {
    return sendError(
      res,
      429,
      requestId,
      "RATE_LIMITED",
      "Too many requests. Please retry later.",
      { details: [{ field: "request", reason: "Rate limit exceeded for this client" }], retryAfterSeconds: rateLimit.retryAfter, retryable: false },
      req
    );
  }

  let body;
  try {
    body = await readJsonBody(req);
  } catch (error) {
    return sendError(
      res,
      400,
      requestId,
      "INVALID_REQUEST",
      "Request body failed validation.",
      { details: [{ field: "body", reason: error.message.includes("JSON") ? "Malformed JSON" : error.message }], retryable: false },
      req
    );
  }

  if (!isValidHttpUrl(body.url)) {
    return sendError(
      res,
      422,
      requestId,
      "INVALID_REQUEST",
      "Request body failed validation.",
      { details: [{ field: "url", reason: "Must be a valid http(s) URL (max 2048 chars)" }], retryable: false },
      req
    );
  }

  const scenario = getScenarioFromUrl(body.url);
  if (scenario !== "sample" && scenario !== "strong" && scenario !== "mobile" && scenario !== "partial") {
    const targetValidation = await validatePublicHttpUrl(body.url);
    if (!targetValidation.ok) {
      return sendError(
        res,
        422,
        requestId,
        "SSRF_BLOCKED",
        "Request body failed validation.",
        { details: [{ field: "url", reason: targetValidation.reason }], retryable: false },
        req
      );
    }
  }

  if (scenario === "blocked") {
    return sendError(
      res,
      422,
      requestId,
      "PAGE_BLOCKED",
      "The page could not be accessed.",
      { details: [{ field: "url", reason: "Page appears behind login, bot protection, or permission gate" }], retryable: false },
      req
    );
  }
  if (scenario === "timeout") {
    return sendError(
      res,
      503,
      requestId,
      "FETCH_FAILED",
      "The page took too long to load.",
      { details: [{ field: "url", reason: "Page fetch/capture timed out" }], retryable: true },
      req
    );
  }
  if (scenario === "redirected") {
    return sendError(
      res,
      422,
      requestId,
      "FETCH_FAILED",
      "URL redirected away from a landing page.",
      { details: [{ field: "url", reason: "Redirected to app/dashboard page instead of marketing page" }], retryable: false },
      req
    );
  }
  if (scenario === "analysis-fail") {
    return sendError(
      res,
      422,
      requestId,
      "ANALYSIS_FAILED",
      "The page loaded but analysis did not complete.",
      { details: [{ field: "analysis", reason: "Pass-1 model/output generation failed" }], retryable: true },
      req
    );
  }
  if (scenario === "rate-limit") {
    return sendError(
      res,
      429,
      requestId,
      "RATE_LIMITED",
      "Too many requests. Please retry later.",
      { details: [{ field: "request", reason: "Rate limit exceeded for this client" }], retryable: true },
      req
    );
  }

  const mode = typeof body.mode === "string" && body.mode.trim() ? body.mode.trim() : "balanced";
  const style = typeof body.style === "string" && body.style.trim() ? body.style.trim() : "sharp";
  const roastId = makeId("roast");
  const analyzeStartedAt = Date.now();
  const snapshotStartedAt = Date.now();
  const snapshot = await fetchPageSnapshot(body.url, requestId);
  if (!snapshot.ok) {
    return sendError(
      res,
      snapshot.status || 503,
      requestId,
      snapshot.code || "FETCH_FAILED",
      snapshot.code === "PAGE_BLOCKED" ? "The page could not be accessed." : "The page could not be analyzed.",
      { details: [{ field: "url", reason: snapshot.reason || "Page fetch failed" }], retryable: Boolean(snapshot.retryable) },
      req
    );
  }
  logServerInfo("analyze_fetch_complete", requestId, {
    url: body.url,
    final_url: snapshot.finalUrl || body.url,
    rendered: Boolean(snapshot.rendered),
    duration_ms: getDurationMs(snapshotStartedAt),
  });

  let analysis;
  const extraction = buildExtraction(snapshot.html, snapshot.finalUrl);
  extraction.rendered = Boolean(snapshot.rendered);
  const fallbackAnalysis = buildRealAnalysis({ url: body.url, mode, extraction });
  const pass1StartedAt = Date.now();
  try {
    requireOpenAiConfigured();
    analysis = await buildAiPass1Analysis({
      requestedUrl: body.url,
      mode,
      extraction,
      fallbackAnalysis,
      requestId,
    });
    logServerInfo("analyze_success", requestId, {
      url: body.url,
      mode,
      style,
      pass: "pass1",
      model: OPENAI_PASS1_MODEL,
      provider:
        analysis && analysis.meta && analysis.meta.provider ? analysis.meta.provider : "",
      provider_model:
        analysis && analysis.meta && analysis.meta.provider_model
          ? analysis.meta.provider_model
          : "",
      duration_ms: getDurationMs(pass1StartedAt),
    });
  } catch (error) {
    logServerError("analyze", requestId, error, {
      url: body.url,
      mode,
      style,
      pass: "pass1",
      model: OPENAI_PASS1_MODEL,
      duration_ms: getDurationMs(pass1StartedAt),
    });
    analysis = fallbackAnalysis;
  }

  const timestamp = nowIso();
  const requestedUrl =
    analysis && analysis.meta && analysis.meta.source_url ? analysis.meta.source_url : body.url;
  const composeResult = await composeUiWithFallback({
    requestId,
    roastId,
    requestedUrl,
    mode,
    style,
    analysis,
  });
  const record = {
    id: roastId,
    status: "ready",
    created_at: timestamp,
    updated_at: timestamp,
    input: { url: body.url, mode, style },
    analysis,
    ui: clone(composeResult.ui),
  };

  if (body.persist === true) {
    roastStore.set(roastId, record);
  }

  logServerInfo("analyze_complete", requestId, {
    url: body.url,
    roast_id: roastId,
    duration_ms: getDurationMs(analyzeStartedAt),
    provider:
      analysis && analysis.meta && analysis.meta.provider ? analysis.meta.provider : "fallback",
    provider_model:
      analysis && analysis.meta && analysis.meta.provider_model ? analysis.meta.provider_model : "",
    compose_provider:
      composeResult && composeResult.composeMeta && composeResult.composeMeta.provider
        ? composeResult.composeMeta.provider
        : "fallback",
  });

  return sendJson(res, 200, {
    roast_id: roastId,
    status: "analyzed",
    input: record.input,
    analysis: clone(analysis),
    analysis_meta: analysis && analysis.meta ? clone(analysis.meta) : null,
    ui: clone(composeResult.ui),
    compose_meta: clone(composeResult.composeMeta),
    request_id: requestId,
    timestamp,
  }, req);
}

async function handleCompose(req, res, requestId) {
  if (!isRequestAuthorized(req)) {
    return sendError(
      res,
      401,
      requestId,
      "UNAUTHORIZED",
      "Missing or invalid API token.",
      { authFailed: true, retryable: false },
      req
    );
  }

  const rateLimit = rateLimitAllowed(req, "compose", RATE_LIMIT_MAX_COMPOSE);
  if (!rateLimit.allowed) {
    return sendError(
      res,
      429,
      requestId,
      "RATE_LIMITED",
      "Too many requests. Please retry later.",
      { details: [{ field: "request", reason: "Rate limit exceeded for this client" }], retryAfterSeconds: rateLimit.retryAfter, retryable: false },
      req
    );
  }

  let body;
  try {
    body = await readJsonBody(req);
  } catch (error) {
    return sendError(
      res,
      400,
      requestId,
      "INVALID_REQUEST",
      "Request body failed validation.",
      { details: [{ field: "body", reason: error.message.includes("JSON") ? "Malformed JSON" : error.message }], retryable: false },
      req
    );
  }

  if (!body || (body.roast_id == null && body.analysis == null)) {
    return sendError(
      res,
      422,
      requestId,
      "INVALID_REQUEST",
      "Request body failed validation.",
      { details: [{ field: "body", reason: "At least one of roast_id or analysis is required" }], retryable: false },
      req
    );
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
    return sendError(
      res,
      422,
      requestId,
      "COMPOSE_FAILED",
      "Pass-1 analysis is required to compose UI.",
      { details: [{ field: "analysis", reason: "Provide analysis or a known roast_id with stored analysis" }], retryable: false },
      req
    );
  }

  if (!hasPass1Shape(sourceAnalysis)) {
    return sendError(
      res,
      422,
      requestId,
      "COMPOSE_FAILED",
      "Pass-1 analysis is missing required fields.",
      {
        details: pass1RequiredKeys
          .filter((key) => !Object.prototype.hasOwnProperty.call(sourceAnalysis, key))
          .map((key) => ({ field: `analysis.${key}`, reason: "Missing required field" })),
        retryable: false,
      },
      req
    );
  }

  if (sourceAnalysis.meta && sourceAnalysis.meta.evidence_status === "insufficient") {
    return sendError(
      res,
      422,
      requestId,
      "COMPOSE_FAILED",
      "Pass-1 analysis is marked insufficient.",
      { details: [{ field: "analysis.meta.evidence_status", reason: "Cannot compose from insufficient evidence" }], retryable: false },
      req
    );
  }

  const composeFailFromRecord =
    Boolean(targetRecord && targetRecord.input && getScenarioFromUrl(targetRecord.input.url) === "compose-fail");
  const composeFailFromAnalysis = shouldForceComposeFailFromAnalysis(sourceAnalysis);
  if (composeFailFromRecord || composeFailFromAnalysis) {
    return sendError(
      res,
      422,
      requestId,
      "COMPOSE_FAILED",
      "The analysis completed, but composition failed.",
      { details: [{ field: "compose", reason: "Forced compose failure scenario for integration testing" }], retryable: true },
      req
    );
  }

  const composeResult = await composeUiWithFallback({
    requestId,
    roastId: typeof body.roast_id === "string" ? body.roast_id : "",
    requestedUrl:
      targetRecord && targetRecord.input && targetRecord.input.url
        ? targetRecord.input.url
        : sourceAnalysis && sourceAnalysis.meta && sourceAnalysis.meta.source_url
        ? sourceAnalysis.meta.source_url
        : "https://example.com",
    mode: typeof body.mode === "string" ? body.mode : "balanced",
    style:
      typeof body.style === "string" && body.style
        ? body.style
        : targetRecord && targetRecord.input && targetRecord.input.style
        ? targetRecord.input.style
        : "sharp",
    analysis: sourceAnalysis,
  });
  const ui = composeResult.ui;

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
        style: typeof body.style === "string" ? body.style : "sharp",
      },
      analysis: clone(sourceAnalysis),
      ui: clone(ui),
    });
  }

  return sendJson(res, 200, ui, req);
}

function handleGetRoast(req, res, requestId, roastId) {
  const record = roastStore.get(roastId);

  if (!record) {
    return sendError(res, 404, requestId, "NOT_FOUND", "Roast not found.", { retryable: false }, req);
  }

  if (!record.ui) {
    return sendJson(res, 200, {
      ...buildRoastResource(record),
      status: "analyzed",
      ui: null,
    }, req);
  }

  return sendJson(res, 200, buildRoastResource(record), req);
}

function parseRoute(reqUrl) {
  const parsed = new URL(reqUrl, "http://localhost");
  return { pathname: parsed.pathname };
}

const server = http.createServer(async (req, res) => {
  const requestId = makeRequestId();

  if (req.method === "OPTIONS") {
    const allowedOrigin = buildCorsOrigin(req.headers && req.headers.origin);
    if (!allowedOrigin && req.headers && req.headers.origin) {
      sendError(res, 403, requestId, "FORBIDDEN", "Origin not allowed.", { retryable: false }, req);
      return;
    }

    const requestedHeaders = req.headers["access-control-request-headers"];
    const preflightHeaders = {
      "Access-Control-Allow-Origin": allowedOrigin || "*",
      "Access-Control-Allow-Headers": requestedHeaders || "Content-Type, Authorization",
      "Access-Control-Allow-Methods": "GET,POST,OPTIONS",
      "Access-Control-Max-Age": "600",
      Vary: "Origin",
    };
    if (allowedOrigin && allowedOrigin !== "*") {
      preflightHeaders["Access-Control-Allow-Credentials"] = "true";
    }
    res.writeHead(204, preflightHeaders);
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

    if (req.method === "GET" && pathname === "/health") {
      sendJson(res, 200, {
        ok: true,
        service: "roast-landingpage-api",
        version: SERVER_VERSION,
        openai_configured: hasOpenAiConfigured(),
        timestamp: nowIso(),
      }, req);
      return;
    }

    if (req.method === "GET" && pathname.startsWith("/roast/")) {
      const roastId = decodeURIComponent(pathname.slice("/roast/".length));
      if (!roastId) {
        sendError(res, 404, requestId, "NOT_FOUND", "Roast not found.", { retryable: false }, req);
        return;
      }
      handleGetRoast(req, res, requestId, roastId);
      return;
    }

    sendError(res, 404, requestId, "NOT_FOUND", "Route not found.", { retryable: false }, req);
  } catch (error) {
    sendError(
      res,
      500,
      requestId,
      "INTERNAL_ERROR",
      "Unexpected server error.",
      { details: [{ field: "server", reason: error.message }], retryable: false },
      req
    );
  }
});

if (require.main === module) {
  server.listen(PORT, () => {
    console.log(`Stub API listening on 0.0.0.0:${PORT} (${SERVER_VERSION})`);
  });
}

module.exports = {
  server,
  roastStore,
};
