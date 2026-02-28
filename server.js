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

async function fetchPageSnapshot(pageUrl) {
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
  const snapshot = await fetchPageSnapshot(body.url);
  if (!snapshot.ok) {
    return sendError(
      res,
      snapshot.status || 503,
      requestId,
      snapshot.code || "FETCH_FAILED",
      snapshot.code === "PAGE_BLOCKED" ? "The page could not be accessed." : "The page could not be analyzed.",
      {
        details: [{ field: "url", reason: snapshot.reason || "Page fetch failed" }],
        retryable: Boolean(snapshot.retryable),
      }
    );
  }

  const extraction = buildExtraction(snapshot.html, snapshot.finalUrl);
  const analysis = buildRealAnalysis({ url: body.url, mode, extraction });
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

  const ui = buildPass2Ui(sourceAnalysis, body.mode);

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

    if (req.method === "GET" && pathname === "/health") {
      sendJson(res, 200, {
        ok: true,
        service: "roast-landingpage-api",
        timestamp: nowIso(),
      });
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
    console.log(`Stub API listening on 0.0.0.0:${PORT}`);
  });
}

module.exports = {
  server,
  roastStore,
};
