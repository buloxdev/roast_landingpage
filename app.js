(function () {
  const FALLBACK_DATA = JSON.parse(`{
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
  "issue_cards": [
    {
      "rank": 1,
      "category": "Clarity of offer",
      "title": "Your hero headline hides the product",
      "impact_badge": "High",
      "confidence_badge": "High",
      "problem": "The hero headline does not clearly say what the product is or who it is for.",
      "why_it_hurts": "Visitors cannot quickly self-qualify, which increases bounce risk before they reach your stronger sections.",
      "evidence_label": "Evidence",
      "evidence": [{ "type": "quote", "value": "Turn feedback into momentum" }],
      "fix_label": "Fix",
      "fix": "State the product category, audience, and primary outcome directly in the hero headline.",
      "rewrite_label": "Example Rewrite",
      "example_rewrite": "Collect and analyze customer feedback automatically so product teams can ship better features faster."
    },
    {
      "rank": 2,
      "category": "CTA quality",
      "title": "CTA says nothing about the next step",
      "impact_badge": "High",
      "confidence_badge": "High",
      "problem": "The primary CTA is generic and does not communicate what happens next.",
      "why_it_hurts": "Generic CTAs create friction because users must guess the commitment level and outcome.",
      "evidence_label": "Evidence",
      "evidence": [{ "type": "quote", "value": "Get Started" }],
      "fix_label": "Fix",
      "fix": "Replace the CTA with a specific action that matches buyer intent and reduces ambiguity.",
      "rewrite_label": "Example Rewrite",
      "example_rewrite": "Start Free Feedback Audit"
    },
    {
      "rank": 3,
      "category": "Messaging / differentiation",
      "title": "Benefits are broad, not differentiated",
      "impact_badge": "High",
      "confidence_badge": "Medium",
      "problem": "The page leans on broad feature claims but does not explain why this is better than alternatives.",
      "why_it_hurts": "Without clear differentiation, visitors compare you on price or leave to keep researching.",
      "evidence_label": "Evidence",
      "evidence": [
        { "type": "quote", "value": "AI-powered insights for modern teams" },
        { "type": "quote", "value": "Built for speed and scale" }
      ],
      "fix_label": "Fix",
      "fix": "Add a clear 'why us' statement with a concrete differentiator (speed, setup time, data sources, accuracy, or workflow fit).",
      "rewrite_label": "Example Rewrite",
      "example_rewrite": "Connect Slack, Intercom, and email in 10 minutes, then get deduplicated feedback themes your PMs can act on the same day."
    },
    {
      "rank": 4,
      "category": "Objection handling",
      "title": "You leave buying questions unanswered",
      "impact_badge": "Medium",
      "confidence_badge": "Medium",
      "problem": "Common buyer objections (setup effort, integrations, pricing fit, data quality) are not handled early.",
      "why_it_hurts": "Visitors with interest still hesitate because they cannot answer basic purchase-risk questions from the page.",
      "evidence_label": "Evidence",
      "evidence": [{ "type": "ui_observation", "value": "No visible FAQ or risk-reversal near pricing/CTA sections" }],
      "fix_label": "Fix",
      "fix": "Add a short objection-handling block near the CTA covering setup time, integrations, and trial expectations.",
      "rewrite_label": "Example Rewrite",
      "example_rewrite": ""
    },
    {
      "rank": 5,
      "category": "Mobile experience",
      "title": "Mobile hero is doing too much before the CTA",
      "impact_badge": "Medium",
      "confidence_badge": "High",
      "problem": "On mobile, the hero text wraps into a dense block and the primary CTA appears low in the viewport.",
      "why_it_hurts": "Mobile users get less immediate clarity and may not see the action quickly enough to convert.",
      "evidence_label": "Evidence",
      "evidence": [{ "type": "ui_observation", "value": "Primary CTA not fully visible on initial mobile viewport without scrolling" }],
      "fix_label": "Fix",
      "fix": "Reduce hero copy length, tighten spacing, and move the CTA higher (or add a sticky mobile CTA).",
      "rewrite_label": "Example Rewrite",
      "example_rewrite": ""
    }
  ],
  "score_section": {
    "title": "Category Scores",
    "items": [
      { "category": "Clarity of offer", "score": 6, "weight": 20, "display_score": "6/10 (weight 20)", "note": "The page hints at the value but does not clearly define the product in the hero." },
      { "category": "Target audience clarity", "score": 6, "weight": 10, "display_score": "6/10 (weight 10)", "note": "It appears aimed at product teams, but the hero does not name them directly." },
      { "category": "Headline strength", "score": 5, "weight": 10, "display_score": "5/10 (weight 10)", "note": "Short and punchy, but too abstract to carry first-impression clarity." },
      { "category": "CTA quality", "score": 5, "weight": 15, "display_score": "5/10 (weight 15)", "note": "Visible CTA exists, but wording is generic and low-specificity." },
      { "category": "Messaging / differentiation", "score": 5, "weight": 15, "display_score": "5/10 (weight 15)", "note": "Benefits are implied, but clear differentiation is not stated early." },
      { "category": "Trust / proof", "score": 6, "weight": 10, "display_score": "6/10 (weight 10)", "note": "Some logos/testimonials are present, but impact would improve with quantified outcomes." },
      { "category": "Structure / hierarchy", "score": 7, "weight": 10, "display_score": "7/10 (weight 10)", "note": "The page flows logically and is mostly scannable on desktop." },
      { "category": "Objection handling", "score": 4, "weight": 5, "display_score": "4/10 (weight 5)", "note": "Too little risk-reduction messaging near conversion points." },
      { "category": "Mobile experience", "score": 5, "weight": 5, "display_score": "5/10 (weight 5)", "note": "Usable, but hero density and CTA placement weaken first-screen performance." }
    ]
  },
  "quick_wins_section": {
    "title": "Quick Wins",
    "subtitle": "30 minutes or less",
    "items": [
      "Rewrite the hero headline to name the product and target user explicitly.",
      "Change the primary CTA from 'Get Started' to a specific action with clear next step.",
      "Add a one-line differentiator under the hero subheadline.",
      "Add a compact FAQ/risk-reversal block near the main CTA."
    ]
  },
  "rewrite_pack_section": {
    "title": "Rewrite Pack",
    "headline_options_label": "Headline options",
    "headlines": [
      "Customer Feedback Analysis for Product Teams, Automated",
      "Turn Customer Feedback Into Prioritized Product Decisions",
      "Automatically Collect and Analyze Feedback Across Your Support Channels"
    ],
    "subheadline_options_label": "Subheadline options",
    "subheadlines": [
      "Connect your feedback sources, surface recurring themes, and give your team a clear view of what to build next.",
      "Built for product teams that need faster insight, less manual tagging, and clearer prioritization."
    ],
    "cta_options_label": "CTA options",
    "ctas": [
      "Start Free Feedback Audit",
      "Analyze My Feedback Pipeline",
      "See a Live Demo",
      "Start Free Trial",
      "Connect My Feedback Sources"
    ]
  },
  "mobile_section": {
    "title": "Mobile Roast",
    "score_label": "Mobile score",
    "score": 5,
    "findings": [
      "Primary CTA not fully visible on initial mobile viewport without scrolling",
      "Hero copy wraps into a dense paragraph, reducing scan speed",
      "Consider a sticky mobile CTA after the hero to keep action visible"
    ]
  },
  "positives_section": {
    "title": "What's Working",
    "items": [
      "Visual design and spacing create a credible first impression on desktop.",
      "Section flow is logical, with a clear progression from problem to features to proof.",
      "The page avoids excessive clutter and is reasonably scannable."
    ]
  },
  "share_card_copy": {
    "title": "Roast My Landing Page",
    "quote": "Looks legit. Still too vague. Your hero makes visitors guess what you actually do.",
    "score_text": "Roast Score: 56/100",
    "top_issues": [
      "Vague hero headline",
      "Generic CTA",
      "Weak differentiation"
    ],
    "footer_cta": "Paste your URL. Get roasted."
  },
  "footer": {
    "disclaimer": "AI roast based on page content and viewport observations. Review recommendations before shipping changes.",
    "rerun_cta": "Roast another page"
  }
}`);

  const SAMPLE_FIXTURE_URL = "./fixtures/pass2-ui.sample.json";
  const FIXTURE_PATHS = {
    sample: "./fixtures/pass2-ui.sample.json",
    partial: "./fixtures/pass2-ui.partial-evidence.json",
    blocked: "./fixtures/pass2-ui.blocked-page.json",
    strong: "./fixtures/pass2-ui.strong-page.json",
    mobile: "./fixtures/pass2-ui.mobile-issues.json",
  };
  function resolveApiBaseUrl() {
    if (window.ROAST_API_BASE_URL) {
      return String(window.ROAST_API_BASE_URL).replace(/\/+$/, "");
    }
    return "/api";
  }

  const API_BASE_URL = resolveApiBaseUrl();
  const ERROR_COPY = {
    emptyUrl: "Paste a landing page URL to start the roast.",
    invalidUrl:
      "That URL does not look valid. Paste a full page URL (for example, https://example.com).",
    unsupportedProtocol: "Use an http:// or https:// URL.",
    blocked: {
      kind: "blocked",
      title: "We could not access that page",
      message:
        "The page appears to be behind login, bot protection, or a permission gate, so we could not see the landing page content.",
      primaryLabel: "Try another URL",
      secondaryLabel: "Use sample URL",
      helper: "If this is a preview link, make sure it loads publicly without login.",
    },
    timeout: {
      kind: "timeout",
      title: "The page took too long to load",
      message:
        "We could not finish reading the page before the timeout. Heavy scripts, redirects, or third-party widgets may be blocking analysis.",
      primaryLabel: "Retry roast",
      secondaryLabel: "Try another URL",
    },
    redirected: {
      kind: "redirected",
      title: "That URL did not open a landing page",
      message:
        "We were redirected to an app or dashboard page instead of a marketing page.",
      primaryLabel: "Try another URL",
      secondaryLabel: "Use sample URL",
      helper: "Use the public marketing URL (homepage, pricing, product, or campaign page).",
    },
    analysisFailed: {
      kind: "analysis",
      title: "Analysis failed",
      message: "We loaded the page, but the roast analysis did not complete.",
      primaryLabel: "Retry roast",
      secondaryLabel: "Back to home",
    },
    composeFailed: {
      kind: "compose",
      title: "We scored the page, but could not format the results",
      message:
        "The analysis completed, but the UI composition step failed. Retry to regenerate the results screen.",
      primaryLabel: "Retry formatting",
      secondaryLabel: "Run roast again",
      secondaryAction: "retry-analysis",
    },
    fixtureTimeout: {
      kind: "timeout",
      title: "Could not build the roast report",
      message:
        "The frontend shell could not load the fixture report for this run. Retry the roast or go back and try again.",
      primaryLabel: "Retry roast",
      secondaryLabel: "Back to home",
    },
    composeInvalid: {
      kind: "compose",
      title: "Results format error",
      message:
        "We received a roast result in an unexpected format and could not render it safely.",
      primaryLabel: "Retry roast",
      secondaryLabel: "Use sample URL",
    },
    rateLimited: {
      kind: "rate-limit",
      title: "Too many requests right now",
      message: "We hit a temporary rate limit while generating your roast. Please retry in a moment.",
      primaryLabel: "Retry roast",
      secondaryLabel: "Try another URL",
    },
    partialEvidence: {
      title: "Roast generated with limited evidence",
      message:
        "We found enough page content to produce a roast, but some sections were hidden, blocked, or not fully visible. Confidence is lower on a few findings.",
      helper:
        "Interactive content (tabs, carousels, modals) can reduce evidence quality.",
    },
  };
  const ANALYSIS_STEPS = [
    {
      title: "Loading page",
      detail: "We are loading the page and capturing the initial view.",
    },
    {
      title: "Reading copy and CTA flow",
      detail: "We are extracting visible copy and identifying the primary CTA path.",
    },
    {
      title: "Scoring clarity, messaging, and trust",
      detail: "We are scoring the page against the v1 conversion rubric.",
    },
    {
      title: "Composing results for the UI",
      detail: "We are building the result payload for the desktop report layout.",
    },
  ];
  const MODE_OPTIONS = [
    {
      value: "balanced",
      label: "Balanced",
      hint: "Sharp but constructive",
    },
    {
      value: "brutal",
      label: "Brutal",
      hint: "Highest signal, least sugar",
    },
    {
      value: "fix-first",
      label: "Fix-First",
      hint: "Action-oriented roast",
    },
  ];
  const STYLE_OPTIONS = [
    {
      value: "observational",
      label: "Observational",
      hint: "Pattern-spotting, playful, and clean",
    },
    {
      value: "deadpan",
      label: "Deadpan",
      hint: "Dry, restrained, and quietly sharp",
    },
    {
      value: "bold",
      label: "Bold",
      hint: "Confident, punchy, and harder-hitting",
    },
  ];

  function getAppRoot() {
    return document.getElementById("app");
  }

  function renderFatalBootstrapError(error) {
    const root = getAppRoot();
    const target = root || document.body;
    const message =
      error && typeof error.message === "string" && error.message
        ? error.message
        : "Unknown frontend bootstrap error";

    target.innerHTML = `
      <div class="shell">
        <section class="error-shell">
          <div class="error-card">
            <div class="eyebrow">Frontend Error</div>
            <h1>App failed to render</h1>
            <p class="error-copy">The UI hit a runtime error before it could paint the normal screen.</p>
            <div class="fixture-note">
              <strong>Error:</strong> ${escapeHtml(message)}
            </div>
            <div class="error-actions">
              <button class="primary-btn" type="button" onclick="window.location.reload()">Reload page</button>
            </div>
          </div>
        </section>
      </div>
    `;
  }

  const state = {
    screen: "home",
    form: {
      url: "https://example.com/sample",
      mode: "brutal",
      style: "observational",
    },
    formError: "",
    errorState: null,
    resultMeta: {
      partialEvidence: false,
      scenario: "sample",
      source: "fixture",
      apiFallback: false,
      fallbackReason: "",
      roastId: "",
      provider: "",
      providerModel: "",
    },
    progress: 0,
    completedSteps: 0,
    resultData: null,
    roastHistory: [],
    runId: 0,
    analyzing: false,
  };

  const fixtureCache = Object.create(null);
  const fixturePromises = Object.create(null);
  const HISTORY_STORAGE_KEY = "roast-history-v1";

  function escapeHtml(value) {
    return String(value)
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/\"/g, "&quot;")
      .replace(/'/g, "&#39;");
  }

  function chipClass(level) {
    const key = (level || "").toLowerCase();
    if (key === "high") return "high";
    if (key === "medium") return "medium";
    if (key === "low") return "low";
    return "";
  }

  function sleep(ms) {
    return new Promise((resolve) => window.setTimeout(resolve, ms));
  }

  function loadRoastHistory() {
    try {
      const raw = window.localStorage.getItem(HISTORY_STORAGE_KEY);
      if (!raw) return [];
      const parsed = JSON.parse(raw);
      if (!Array.isArray(parsed)) return [];
      return parsed.filter((entry) => entry && typeof entry === "object").slice(0, 3);
    } catch (_error) {
      return [];
    }
  }

  function saveRoastHistory(items) {
    try {
      window.localStorage.setItem(HISTORY_STORAGE_KEY, JSON.stringify(items.slice(0, 3)));
    } catch (_error) {
      return;
    }
  }

  function formatHistoryTime(iso) {
    if (!iso) return "Recent";
    try {
      const date = new Date(iso);
      return date.toLocaleDateString(undefined, { month: "short", day: "numeric" });
    } catch (_error) {
      return "Recent";
    }
  }

  function buildHistoryEntry() {
    const data = state.resultData;
    if (!data || !data.header) return null;
    return {
      url: state.form.url,
      title: data.header.title || "Untitled roast",
      score: Number(data.header.score_value) || 0,
      verdict: data.header.verdict_chip || "",
      mode: state.form.mode,
      style: state.form.style,
      savedAt: new Date().toISOString(),
      resultData: data,
      resultMeta: {
        partialEvidence: state.resultMeta.partialEvidence,
        scenario: state.resultMeta.scenario,
        source: state.resultMeta.source,
        apiFallback: state.resultMeta.apiFallback,
        fallbackReason: state.resultMeta.fallbackReason,
        roastId: state.resultMeta.roastId,
        provider: state.resultMeta.provider,
        providerModel: state.resultMeta.providerModel,
      },
    };
  }

  function persistCurrentRoastToHistory() {
    const entry = buildHistoryEntry();
    if (!entry) return;
    const deduped = state.roastHistory.filter((item) => !(item && item.url === entry.url));
    const nextHistory = [entry].concat(deduped).slice(0, 3);
    state.roastHistory = nextHistory;
    saveRoastHistory(nextHistory);
  }

  function getModeMeta(modeValue) {
    return MODE_OPTIONS.find((option) => option.value === modeValue) || MODE_OPTIONS[0];
  }

  function getStyleMeta(styleValue) {
    return STYLE_OPTIONS.find((option) => option.value === styleValue) || STYLE_OPTIONS[0];
  }

  function normalizeUrlInput(raw) {
    const value = (raw || "").trim();
    if (!value) return "";
    if (/^https?:\/\//i.test(value)) return value;
    return `https://${value}`;
  }

  function validateLandingPageUrl(raw) {
    const value = (raw || "").trim();
    if (!value) {
      return { ok: false, error: ERROR_COPY.emptyUrl };
    }

    if (/^[a-z]+:\/\//i.test(value) && !/^https?:\/\//i.test(value)) {
      return { ok: false, error: ERROR_COPY.unsupportedProtocol };
    }

    const normalized = normalizeUrlInput(value);
    let parsed;
    try {
      parsed = new URL(normalized);
    } catch (_error) {
      return { ok: false, error: ERROR_COPY.invalidUrl };
    }

    if (!/^https?:$/.test(parsed.protocol)) {
      return { ok: false, error: ERROR_COPY.unsupportedProtocol };
    }

    if (!parsed.hostname || !parsed.hostname.includes(".")) {
      return { ok: false, error: ERROR_COPY.invalidUrl };
    }

    return { ok: true, url: parsed.toString() };
  }

  function getScenarioFromUrl(urlString) {
    const value = String(urlString || "").toLowerCase();
    if (value.includes("timeout")) return "timeout";
    if (value.includes("blocked") || value.includes("login") || value.includes("private")) return "blocked";
    if (value.includes("dashboard") || value.includes("/app")) return "redirected";
    if (value.includes("analysis-fail") || value.includes("compose-fail")) return "analysis-fail";
    if (value.includes("partial")) return "partial";
    if (value.includes("strong")) return "strong";
    if (value.includes("mobile")) return "mobile";
    return "sample";
  }

  async function withTimeout(promise, ms, message) {
    let timerId;
    try {
      return await Promise.race([
        promise,
        new Promise((_, reject) => {
          timerId = window.setTimeout(() => reject(new Error(message)), ms);
        }),
      ]);
    } finally {
      clearTimeout(timerId);
    }
  }

  function getApiUrl(path) {
    return `${API_BASE_URL}${path}`;
  }

  function isObject(value) {
    return Boolean(value) && typeof value === "object" && !Array.isArray(value);
  }

  function validatePass2PayloadSafe(payload) {
    if (
      window.Pass2Validation &&
      typeof window.Pass2Validation.validatePass2Payload === "function"
    ) {
      return window.Pass2Validation.validatePass2Payload(payload);
    }
    return { ok: true, errors: [] };
  }

  async function readJsonResponse(response) {
    const text = await response.text();
    if (!text) return null;
    try {
      return JSON.parse(text);
    } catch (_error) {
      return { __parse_error: true, raw: text };
    }
  }

  function buildApiErrorFromResponse(response, payload, phase) {
    const apiError = isObject(payload) && isObject(payload.error) ? payload.error : null;
    return {
      kind: "api",
      phase,
      status: response.status,
      code: apiError && apiError.code ? apiError.code : "API_ERROR",
      message:
        (apiError && apiError.message) ||
        `HTTP ${response.status} while calling ${phase === "compose" ? "/compose" : "/analyze"}`,
      retryable: Boolean(apiError && apiError.retryable),
      details: Array.isArray(apiError && apiError.details) ? apiError.details : [],
      payload,
      unavailable: false,
    };
  }

  async function postJson(path, body, phase) {
    let response;
    try {
      response = await withTimeout(
        fetch(getApiUrl(path), {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(body),
        }),
        7000,
        `${phase} request timed out`
      );
    } catch (error) {
      throw {
        kind: "api",
        phase,
        code: "API_UNAVAILABLE",
        message: error && error.message ? error.message : "API request failed",
        retryable: true,
        unavailable: true,
        cause: error,
      };
    }

    const payload = await readJsonResponse(response);
    if (!response.ok) {
      throw buildApiErrorFromResponse(response, payload, phase);
    }
    return payload;
  }

  function getApiErrorDetailReason(error, fieldName) {
    if (!error || !Array.isArray(error.details)) return "";
    const entry = error.details.find(
      (detail) => detail && typeof detail === "object" && detail.field === fieldName
    );
    return entry && typeof entry.reason === "string" ? entry.reason : "";
  }

  function apiErrorContains(error, terms) {
    if (!error || !Array.isArray(terms) || terms.length === 0) return false;
    const textParts = [];
    if (typeof error.message === "string") textParts.push(error.message);
    if (Array.isArray(error.details)) {
      for (let i = 0; i < error.details.length; i += 1) {
        const detail = error.details[i];
        if (detail && typeof detail.reason === "string") textParts.push(detail.reason);
      }
    }
    const haystack = textParts.join(" ").toLowerCase();
    return terms.some((term) => haystack.includes(String(term).toLowerCase()));
  }

  function shouldShowDevFallbackUi() {
    if (window.ROAST_DEBUG_BANNERS === true) return true;
    const hostname = window.location && window.location.hostname ? window.location.hostname : "";
    return (
      hostname === "localhost" ||
      hostname === "127.0.0.1" ||
      hostname === ""
    );
  }

  function getRunSourceBadge() {
    if (state.screen === "home") return null;
    if (state.screen === "analyzing") {
      return {
        label: "API",
        title: `Using API at ${API_BASE_URL}`,
      };
    }
    if (shouldShowDevFallbackUi() && state.resultMeta && state.resultMeta.apiFallback) {
      return {
        label: "Fixture fallback",
        title:
          state.resultMeta.fallbackReason ||
          `Using local fixture because ${API_BASE_URL} is unavailable`,
      };
    }
    if (
      shouldShowDevFallbackUi() &&
      state.resultMeta &&
      state.resultMeta.provider &&
      state.resultMeta.providerModel
    ) {
      return {
        label: `AI: ${state.resultMeta.providerModel}`,
        title: `Results composed from ${state.resultMeta.provider} using ${state.resultMeta.providerModel}`,
      };
    }
    return {
      label: "API",
      title: `Results loaded from ${API_BASE_URL}`,
    };
  }

  function mapApiErrorToErrorState(error) {
    const code = String((error && error.code) || "").toUpperCase();

    if (code === "PAGE_BLOCKED") return getErrorStateFromTemplate(ERROR_COPY.blocked);
    if (
      code === "FETCH_FAILED" &&
      apiErrorContains(error, ["redirect", "dashboard", "/app", "marketing page"])
    ) {
      return getErrorStateFromTemplate(ERROR_COPY.redirected);
    }
    if (code === "FETCH_FAILED") {
      return getErrorStateFromTemplate(ERROR_COPY.timeout);
    }
    if (code === "RATE_LIMITED") return getErrorStateFromTemplate(ERROR_COPY.rateLimited);
    if (code === "ANALYSIS_FAILED") return getErrorStateFromTemplate(ERROR_COPY.analysisFailed);
    if (code === "COMPOSE_FAILED") return getErrorStateFromTemplate(ERROR_COPY.composeFailed);
    if (code === "INVALID_PASS2_PAYLOAD") return getErrorStateFromTemplate(ERROR_COPY.composeInvalid);
    if (code === "INTERNAL_ERROR" || code === "API_ERROR") {
      return {
        kind: "analysis",
        title: "The roast engine is unavailable",
        message: "The AI backend did not complete the roast. Try again in a moment.",
        helper: "",
        primaryLabel: "Retry roast",
        secondaryLabel: "Try another URL",
        primaryAction: "",
        secondaryAction: "",
      };
    }
    if (code === "INVALID_REQUEST") {
      const urlReason = getApiErrorDetailReason(error, "url");
      if (/valid http/i.test(urlReason)) return getErrorStateFromTemplate(ERROR_COPY.analysisFailed);
    }
    return null;
  }

  async function runApiRoast(url, mode, style) {
    const analyze = await postJson("/analyze", { url, mode, style, persist: true }, "analyze");
    if (!isObject(analyze) || !isObject(analyze.analysis)) {
      throw {
        kind: "api",
        phase: "analyze",
        code: "ANALYSIS_FAILED",
        message: "Analyze response missing analysis payload.",
        unavailable: false,
      };
    }

    let compose = analyze.ui;
    if (!isObject(compose)) {
      compose = await postJson(
        "/compose",
        {
          roast_id: analyze.roast_id,
          analysis: analyze.analysis,
          mode,
          style,
        },
        "compose"
      );
    }

    const pass2Validation = validatePass2PayloadSafe(compose);
    if (!pass2Validation.ok) {
      throw {
        kind: "api",
        phase: "compose",
        code: "INVALID_PASS2_PAYLOAD",
        message: "Compose response did not match the pass2 UI contract.",
        unavailable: false,
        validation: pass2Validation,
      };
    }

    return {
      ui: compose,
      partialEvidence:
        Boolean(
          analyze &&
            analyze.analysis &&
            analyze.analysis.meta &&
            analyze.analysis.meta.evidence_status === "partial"
        ),
      roastId: analyze.roast_id || "",
      analysisMeta: {
        ...((analyze.analysis_meta || (analyze.analysis && analyze.analysis.meta) || null) || {}),
        ...(analyze.compose_meta && analyze.compose_meta.provider
          ? {
              provider: analyze.compose_meta.provider,
              provider_model: analyze.compose_meta.provider_model || "",
            }
          : {}),
      },
    };
  }

  async function runFixtureFallbackForScenario(scenario) {
    if (scenario === "blocked") return { errorState: getErrorStateFromTemplate(ERROR_COPY.blocked) };
    if (scenario === "redirected") return { errorState: getErrorStateFromTemplate(ERROR_COPY.redirected) };
    if (scenario === "analysis-fail") return { errorState: getErrorStateFromTemplate(ERROR_COPY.analysisFailed) };
    if (scenario === "timeout") return { errorState: getErrorStateFromTemplate(ERROR_COPY.timeout) };

    const fixtureKind =
      scenario === "partial"
        ? "partial"
        : scenario === "strong"
        ? "strong"
        : scenario === "mobile"
        ? "mobile"
        : "sample";
    const ui = await loadPass2Fixture(fixtureKind);
    const pass2Validation = validatePass2PayloadSafe(ui);
    if (!pass2Validation.ok) {
      throw new Error("Fixture payload failed pass2 validation");
    }
    return { ui, partialEvidence: scenario === "partial", scenario: fixtureKind };
  }

  async function loadPass2Fixture(kind) {
    const fixtureKind = kind || "sample";
    if (fixtureCache[fixtureKind]) return fixtureCache[fixtureKind];
    if (!fixturePromises[fixtureKind]) {
      fixturePromises[fixtureKind] = (async function () {
        const fixtureUrl = FIXTURE_PATHS[fixtureKind] || FIXTURE_PATHS.sample;
        try {
          const response = await fetch(fixtureUrl, { cache: "no-store" });
          if (!response.ok) throw new Error(`fixture status ${response.status}`);
          const json = await response.json();
          fixtureCache[fixtureKind] = json;
          return json;
        } catch (_error) {
          fixtureCache[fixtureKind] = fixtureKind === "sample" ? FALLBACK_DATA : FALLBACK_DATA;
          return FALLBACK_DATA;
        }
      })();
    }
    return fixturePromises[fixtureKind];
  }

  function getErrorStateFromTemplate(template) {
    return {
      kind: template.kind,
      title: template.title,
      message: template.message,
      helper: template.helper || "",
      primaryLabel: template.primaryLabel,
      secondaryLabel: template.secondaryLabel,
      primaryAction: template.primaryAction || "",
      secondaryAction: template.secondaryAction || "",
    };
  }

  function getResultsWarnings(data) {
    const warnings = [];
    if (state.resultMeta && state.resultMeta.partialEvidence) {
      warnings.push({
        kind: "partial",
        title: ERROR_COPY.partialEvidence.title,
        message: ERROR_COPY.partialEvidence.message,
        helper: ERROR_COPY.partialEvidence.helper,
      });
    }

    if (
      data === FALLBACK_DATA &&
      state.resultMeta &&
      state.resultMeta.scenario !== "sample"
    ) {
      warnings.push({
        kind: "fallback",
        title: "Could not load sample roast fixture",
        message: "Falling back to the built-in sample result for local preview.",
        helper: "",
      });
    }

    if (shouldShowDevFallbackUi() && state.resultMeta && state.resultMeta.apiFallback) {
      warnings.push({
        kind: "fallback",
        title: "API unavailable - showing local fixture",
        message:
          state.resultMeta.fallbackReason ||
          "Could not reach the API, so the UI loaded a local fixture result instead.",
        helper: `Expected API base: ${API_BASE_URL}`,
      });
    }

    return warnings;
  }

  function renderIssueCard(issue) {
    const evidenceItems = (issue.evidence || [])
      .map((entry) => {
        const isQuote = entry.type === "quote";
        return `<li>${
          isQuote
            ? `<span class="quote">${escapeHtml(entry.value)}</span>`
            : escapeHtml(entry.value)
        }</li>`;
      })
      .join("");

    const rewriteClass = issue.example_rewrite ? "" : "empty";

    return `
      <article class="issue-card" id="issue-${issue.rank}">
        <div class="issue-top">
          <div class="rank">${issue.rank}</div>
          <div class="issue-title-wrap">
            <h3>${escapeHtml(issue.title)}</h3>
            <div class="issue-category">${escapeHtml(issue.category)}</div>
          </div>
          <div class="chips">
            <span class="chip ${chipClass(issue.impact_badge)}">${escapeHtml(
      issue.impact_badge
    )} Impact</span>
            <span class="chip">${escapeHtml(issue.confidence_badge)} Confidence</span>
          </div>
        </div>
        <div class="issue-grid">
          <div class="kv">
            <label>Problem</label>
            <p>${escapeHtml(issue.problem)}</p>
          </div>
          <div class="kv">
            <label>Why it hurts</label>
            <p>${escapeHtml(issue.why_it_hurts)}</p>
          </div>
          <div class="kv">
            <label>${escapeHtml(issue.evidence_label || "Evidence")}</label>
            <ul class="evidence-list">${evidenceItems}</ul>
          </div>
          <div class="kv">
            <label>${escapeHtml(issue.fix_label || "Fix")}</label>
            <p>${escapeHtml(issue.fix)}</p>
          </div>
          <div class="rewrite-box ${rewriteClass}">
            <div class="kv">
              <label>${escapeHtml(issue.rewrite_label || "Example Rewrite")}</label>
              <p>${escapeHtml(issue.example_rewrite || "")}</p>
            </div>
            <button class="copy-btn" data-copy="${escapeHtml(
              issue.example_rewrite || ""
            )}">Copy</button>
          </div>
        </div>
      </article>
    `;
  }

  function renderScoreRows(items) {
    return items
      .map((row) => {
        const pct = Math.max(0, Math.min(100, (Number(row.score) || 0) * 10));
        return `
          <div class="score-row">
            <div>
              <strong>${escapeHtml(row.category)}</strong>
              <div class="score-note">${escapeHtml(row.note)}</div>
            </div>
            <div class="score-value-inline">${escapeHtml(row.display_score)}</div>
            <div class="score-bar" aria-hidden="true"><span style="width:${pct}%"></span></div>
          </div>
        `;
      })
      .join("");
  }

  function renderCopyList(items) {
    return items
      .map(
        (text) => `
        <div class="option-item">
          <p>${escapeHtml(text)}</p>
          <button class="copy-btn" data-copy="${escapeHtml(text)}">Copy</button>
        </div>
      `
      )
      .join("");
  }

  function renderProblemHeadlineList(items) {
    return (items || [])
      .slice(0, 3)
      .map(
        (item, index) => `
          <li>
            <span>${index + 1}</span>
            <p>${escapeHtml(item)}</p>
          </li>
        `
      )
      .join("");
  }

  function renderRewriteCompareCard(label, beforeText, afterText) {
    if (!afterText) return "";
    const beforeValue = beforeText || "Needs work";
    return `
      <article class="rewrite-compare-card">
        <div class="rewrite-compare-head">
          <div class="rewrite-compare-kicker">Rewrite preview</div>
          <button class="copy-btn copy-btn-quiet" data-copy="${escapeHtml(afterText)}">Copy upgrade</button>
        </div>
        <h3>${escapeHtml(label)}</h3>
        <div class="rewrite-compare-grid">
          <div class="rewrite-side rewrite-side-before">
            <span class="rewrite-side-label">Current</span>
            <p>${escapeHtml(beforeValue)}</p>
          </div>
          <div class="rewrite-side rewrite-side-after">
            <span class="rewrite-side-label">Rewrite</span>
            <p>${escapeHtml(afterText)}</p>
          </div>
        </div>
      </article>
    `;
  }

  function renderTopbar(meta) {
    const mode = getModeMeta(state.form.mode);
    const style = getStyleMeta(state.form.style);
    const sourceBadge = getRunSourceBadge();
    const right = meta && meta.rightHtml ? meta.rightHtml : "";
    const showUrl = !(meta && meta.hideUrl) && state.form.url;

    return `
      <header class="topbar">
        <div class="brand">
          <div class="brand-mark">RM</div>
          <div>Roast My Landing Page</div>
        </div>
        <div class="topbar-right">
          ${showUrl ? `<div class="url-pill">${escapeHtml(state.form.url)}</div>` : ""}
          <div class="mode-pill">${escapeHtml(mode.label)}</div>
          <div class="mode-pill mode-pill-soft">${escapeHtml(style.label)}</div>
          ${
            sourceBadge
              ? `<div class="mode-pill mode-pill-soft" title="${escapeHtml(sourceBadge.title)}">${escapeHtml(
                  sourceBadge.label
                )}</div>`
              : ""
          }
          ${right}
        </div>
      </header>
    `;
  }

  function renderHome() {
    const mode = getModeMeta(state.form.mode);
    const style = getStyleMeta(state.form.style);
    const hasUrlError = Boolean(state.formError);
    const historyMarkup = state.roastHistory.length
      ? `
        <section class="history-card">
          <div class="history-head">
            <div>
              <div class="eyebrow">Recent roasts</div>
              <h3>Pick up where you left off</h3>
            </div>
          </div>
          <div class="history-list">
            ${state.roastHistory
              .map(
                (entry, index) => `
                  <button type="button" class="history-item" data-history-index="${index}">
                    <div class="history-item-top">
                      <strong>${escapeHtml(entry.title || "Recent roast")}</strong>
                      <span>${escapeHtml(formatHistoryTime(entry.savedAt))}</span>
                    </div>
                    <div class="history-item-url">${escapeHtml(entry.url || "")}</div>
                    <div class="history-item-meta">
                      <span>${escapeHtml(`Score ${entry.score || 0}`)}</span>
                      <span>${escapeHtml(entry.verdict || "Saved result")}</span>
                    </div>
                  </button>
                `
              )
              .join("")}
          </div>
        </section>
      `
      : "";
    return `
      <div class="shell">
        ${renderTopbar({
          hideUrl: true,
          rightHtml: `<button class="ghost-btn" type="button" data-action="use-example">Use sample URL</button>`,
        })}

        <div class="home-grid">
          <section class="home-hero-card">
            <div class="eyebrow">For designers, founders, and homepage obsessives</div>
            <h1 class="home-title">Paste the page. Watch it cook.</h1>
            <p class="home-lede">
              A playful roast with real signal behind it. We pull apart the headline, next step, message, and trust story fast enough to use mid-iteration.
            </p>

            <div class="hero-stat-grid">
              <div class="hero-stat">
                <div class="hero-stat-label">It finds</div>
                <div class="hero-stat-value">The vague promise, weak next step, and muddy messaging first</div>
              </div>
              <div class="hero-stat">
                <div class="hero-stat-label">It gives</div>
                <div class="hero-stat-value">Rewrites, quick wins, and a ranked list of what to fix next</div>
              </div>
              <div class="hero-stat">
                <div class="hero-stat-label">Good for</div>
                <div class="hero-stat-value">Launch pages, portfolio sites, SaaS homepages, and redesigns</div>
              </div>
              <div class="hero-stat">
                <div class="hero-stat-label">The vibe</div>
                <div class="hero-stat-value">More design crit than corporate audit, with a little heat</div>
              </div>
            </div>

            <div class="home-preview-strip">
              <div class="preview-chip">Headline clarity</div>
              <div class="preview-chip">Next-step strength</div>
              <div class="preview-chip">Messaging gaps</div>
              <div class="preview-chip">Rewrite ideas</div>
              <div class="preview-chip">Mobile friction</div>
              <div class="preview-chip">What is already working</div>
            </div>
          </section>

          <section class="input-card">
            <div class="input-card-head">
              <div>
                <div class="eyebrow">Start here</div>
                <h2>Drop in the URL</h2>
                <p>Pick the tone. Pick the style. Get the teardown.</p>
              </div>
              <div class="input-card-badges">
                <div class="mode-pill mode-pill-soft">${escapeHtml(mode.hint)}</div>
                <div class="mode-pill mode-pill-soft">${escapeHtml(style.hint)}</div>
              </div>
            </div>

            <form data-form="roast" class="input-form" novalidate>
              <label class="field-label" for="landing-url">Landing page URL</label>
              <input
                id="landing-url"
                class="url-input-field${hasUrlError ? " has-error" : ""}"
                type="url"
                name="url"
                placeholder="https://your-site.com"
                value="${escapeHtml(state.form.url)}"
                autocomplete="url"
                inputmode="url"
                aria-invalid="${hasUrlError ? "true" : "false"}"
                aria-describedby="${hasUrlError ? "landing-url-error" : ""}"
                required
              />
              ${
                hasUrlError
                  ? `<p id="landing-url-error" class="field-error">${escapeHtml(state.formError)}</p>`
                  : ""
              }

              <div class="field-label">Roast mode</div>
              <div class="mode-selector" role="tablist" aria-label="Roast mode">
                ${MODE_OPTIONS.map((option) => {
                  const active = option.value === state.form.mode;
                  return `
                    <button
                      type="button"
                      class="mode-option${active ? " is-active" : ""}"
                      role="tab"
                      aria-selected="${active ? "true" : "false"}"
                      data-mode-value="${escapeHtml(option.value)}"
                    >
                      <span>${escapeHtml(option.label)}</span>
                      <small>${escapeHtml(option.hint)}</small>
                    </button>
                  `;
                }).join("")}
              </div>

              <div class="field-label">Roast style</div>
              <div class="mode-selector" role="tablist" aria-label="Roast style">
                ${STYLE_OPTIONS.map((option) => {
                  const active = option.value === state.form.style;
                  return `
                    <button
                      type="button"
                      class="mode-option${active ? " is-active" : ""}"
                      role="tab"
                      aria-selected="${active ? "true" : "false"}"
                      data-style-value="${escapeHtml(option.value)}"
                    >
                      <span>${escapeHtml(option.label)}</span>
                      <small>${escapeHtml(option.hint)}</small>
                    </button>
                  `;
                }).join("")}
              </div>

              <button class="primary-btn primary-btn-lg" type="submit">Roast My Landing Page</button>
            </form>

            <div class="fixture-note">
              <strong>Just exploring?</strong> Load the sample and see the full roast format before running your own page.
            </div>
            <div class="sample-results-actions">
              <button class="sample-result-btn" type="button" data-action="view-example-results" data-example-scenario="sample">View sample results</button>
              <button class="sample-result-btn" type="button" data-action="view-example-results" data-example-scenario="strong">View strong-page results</button>
              <button class="sample-result-btn" type="button" data-action="view-example-results" data-example-scenario="mobile">View mobile-issues results</button>
              <button class="sample-result-btn" type="button" data-action="view-example-results" data-example-scenario="partial">View partial-evidence results</button>
            </div>

            ${historyMarkup}
          </section>
        </div>
      </div>
      <div id="toast" class="toast" role="status" aria-live="polite"></div>
    `;
  }

  function renderAnalyzing() {
    const activeStepIndex = Math.min(state.completedSteps, ANALYSIS_STEPS.length - 1);
    const detail =
      state.progress >= 100
        ? "Opening the desktop roast report..."
        : ANALYSIS_STEPS[activeStepIndex].detail;

    return `
      <div class="shell">
        ${renderTopbar({
          rightHtml: `<button class="ghost-btn" type="button" data-action="back-home">Cancel</button>`,
        })}

        <section class="analyzing-shell">
          <div class="analyzing-main">
            <div class="eyebrow">Analyzing</div>
            <h1 class="analyzing-title">Roasting your page...</h1>
            <p class="analyzing-copy">
              We are checking the page, extracting copy, and building your roast.
            </p>
            <p class="analyzing-copy analyzing-copy-detail">${escapeHtml(detail)}</p>

            <div class="progress-header">
              <span>Report generation progress</span>
              <strong>${Math.round(state.progress)}%</strong>
            </div>
            <div
              class="progress-track"
              role="progressbar"
              aria-valuemin="0"
              aria-valuemax="100"
              aria-valuenow="${Math.round(state.progress)}"
              aria-label="Roast report progress"
            >
              <div class="progress-fill" style="width: ${Math.round(state.progress)}%"></div>
            </div>

            <ol class="analysis-steps">
              ${ANALYSIS_STEPS.map((step, index) => {
                const isDone = index < state.completedSteps;
                const isActive = !isDone && index === state.completedSteps && state.progress < 100;
                const rowClass = isDone ? "is-done" : isActive ? "is-active" : "is-pending";
                const statusText = isDone ? "Done" : isActive ? "In progress" : "Waiting";
                return `
                  <li class="analysis-step ${rowClass}">
                    <div class="analysis-step-dot" aria-hidden="true">${isDone ? "OK" : index + 1}</div>
                    <div class="analysis-step-body">
                      <div class="analysis-step-title-row">
                        <strong>${escapeHtml(step.title)}</strong>
                        <span>${statusText}</span>
                      </div>
                      <p>${escapeHtml(step.detail)}</p>
                    </div>
                  </li>
                `;
              }).join("")}
            </ol>
          </div>

          <aside class="analysis-side">
            <section class="rail-card score-card-big">
              <div class="score-big-label">Run mode</div>
              <div class="analysis-side-value">${escapeHtml(getModeMeta(state.form.mode).label)}</div>
              <div class="score-band">${escapeHtml(getModeMeta(state.form.mode).hint)}</div>
              <div class="score-band" style="margin-top:6px;">${escapeHtml(getStyleMeta(state.form.style).label)}: ${escapeHtml(
      getStyleMeta(state.form.style).hint
    )}</div>
            </section>
          </aside>
        </section>
      </div>
      <div id="toast" class="toast" role="status" aria-live="polite"></div>
    `;
  }

  function renderError() {
    const error = state.errorState || {
      title: "Analysis failed",
      message: "Something went wrong while generating the report.",
      kind: "unknown",
    };

    const kindLabel =
      error.kind === "timeout"
        ? "Timeout"
        : error.kind === "blocked"
        ? "Page access blocked"
        : error.kind === "redirected"
        ? "Wrong page type"
        : error.kind === "compose"
        ? "Results format error"
        : error.kind === "rate-limit"
        ? "Rate limited"
        : "Analysis error";
    const primaryAction =
      error.primaryAction || (error.primaryLabel && /retry/i.test(error.primaryLabel) ? "retry-analysis" : "back-home");
    const secondaryAction =
      error.secondaryAction ||
      (error.secondaryLabel && /sample/i.test(error.secondaryLabel) ? "use-example" : "back-home");

    return `
      <div class="shell">
        ${renderTopbar({
          rightHtml: `<button class="ghost-btn" type="button" data-action="back-home">Back</button>`,
        })}

        <section class="error-shell">
          <div class="error-card">
            <div class="eyebrow">Run Error</div>
            <h1>${escapeHtml(error.title)}</h1>
            <p class="error-copy">${escapeHtml(error.message)}</p>

            <div class="error-meta-row">
              <span class="error-chip">${escapeHtml(kindLabel)}</span>
              <span class="error-meta-url">${escapeHtml(state.form.url || "")}</span>
            </div>
            ${error.helper ? `<p class="error-helper">${escapeHtml(error.helper)}</p>` : ""}

            <div class="error-actions">
              <button class="primary-btn" type="button" data-action="${escapeHtml(primaryAction)}">${escapeHtml(
      error.primaryLabel || "Retry roast"
    )}</button>
              <button class="ghost-btn" type="button" data-action="${escapeHtml(secondaryAction)}">${escapeHtml(
      error.secondaryLabel || "Back to home"
    )}</button>
            </div>

            <div class="fixture-note">
              <strong>v1 note:</strong> this is a frontend-only shell, but the error state is wired now so the future API path has a place to fail gracefully.
            </div>
          </div>
        </section>
      </div>
      <div id="toast" class="toast" role="status" aria-live="polite"></div>
    `;
  }

  function renderResults(data) {
    const sections = {
      topProblems: "top-problems",
      scores: "scores",
      quickWins: "quick-wins",
      rewrites: "rewrites",
      mobile: "mobile",
      positives: "positives",
    };
    const permalinkUrl =
      state.resultMeta && state.resultMeta.roastId
        ? `${API_BASE_URL}/roast/${encodeURIComponent(state.resultMeta.roastId)}`
        : "https://roast.example/r/demo-123";

    const resultWarnings = getResultsWarnings(data);
    return `
      <div class="shell">
        ${renderTopbar({
          rightHtml: `<button class="primary-btn" data-action="rerun">Roast another page</button>`,
        })}

        <section class="summary-card">
          <div class="eyebrow">${escapeHtml(data.header.eyebrow)}</div>
          <div class="summary-header">
            <div>
              <h1>${escapeHtml(data.header.title)}</h1>
              <p>${escapeHtml(data.header.subtitle)}</p>
            </div>
            <div class="score-badge">
              <div class="score-label">${escapeHtml(data.header.score_label)}</div>
              <div class="score-value">${escapeHtml(String(data.header.score_value))}</div>
              <div class="score-band">${escapeHtml(data.header.score_band)}</div>
            </div>
          </div>
          <div class="summary-meta">
            <div>
              <p>${escapeHtml(data.summary_panel.one_liner)}</p>
            </div>
            <div class="verdict-chip">${escapeHtml(data.header.verdict_chip)}</div>
          </div>
        </section>

        ${
          resultWarnings.length
            ? `
          <section class="results-banner-stack">
            ${resultWarnings
              .map(
                (warning) => `
              <div class="results-banner ${warning.kind === "partial" ? "is-warning" : ""}">
                <div>
                  <strong>${escapeHtml(warning.title)}</strong>
                  <p>${escapeHtml(warning.message)}</p>
                  ${warning.helper ? `<small>${escapeHtml(warning.helper)}</small>` : ""}
                </div>
                <div class="results-banner-actions">
                  <button class="ghost-btn" data-action="retry-analysis">Retry roast</button>
                </div>
              </div>
            `
              )
              .join("")}
          </section>
        `
            : ""
        }

        <div class="layout">
          <main class="stack">
            <section class="section section-priority" id="${sections.topProblems}">
              <h2>${escapeHtml(data.summary_panel.top_problems_title)}</h2>
              <p class="section-subtitle">${escapeHtml(data.summary_panel.cta_hint)}</p>
              <ol class="problem-headline-list">
                ${renderProblemHeadlineList(data.summary_panel.top_3_problems)}
              </ol>
              <div class="issue-list">
                ${data.issue_cards.slice(0, 3).map(renderIssueCard).join("")}
              </div>
              ${
                data.issue_cards.length > 3
                  ? `
                <details class="detail-panel issue-overflow-panel">
                  <summary>Additional findings (${data.issue_cards.length - 3})</summary>
                  <div class="detail-panel-body">
                    <div class="issue-list">
                      ${data.issue_cards.slice(3).map(renderIssueCard).join("")}
                    </div>
                  </div>
                </details>
              `
                  : ""
              }
            </section>

            <section class="section section-priority" id="${sections.rewrites}">
              <h2>${escapeHtml(data.rewrite_pack_section.title)}</h2>
              <div class="rewrite-compare-stack">
                ${renderRewriteCompareCard(
                  "Headline",
                  data.issue_cards[0] && data.issue_cards[0].evidence && data.issue_cards[0].evidence[0]
                    ? data.issue_cards[0].evidence[0].value
                    : "",
                  data.rewrite_pack_section.headlines[0]
                )}
                ${renderRewriteCompareCard(
                  "Support line",
                  data.header.subtitle || data.summary_panel.one_liner || "",
                  data.rewrite_pack_section.subheadlines[0]
                )}
                ${renderRewriteCompareCard(
                  "Next step",
                  data.summary_panel.cta_hint || "",
                  data.rewrite_pack_section.ctas[0]
                )}
              </div>
              <div class="rewrite-grid">
                <div class="rewrite-group">
                  <h3>${escapeHtml(data.rewrite_pack_section.headline_options_label)}</h3>
                  <div class="option-list">${renderCopyList(data.rewrite_pack_section.headlines)}</div>
                </div>
                <div class="rewrite-group">
                  <h3>${escapeHtml(data.rewrite_pack_section.subheadline_options_label)}</h3>
                  <div class="option-list">${renderCopyList(data.rewrite_pack_section.subheadlines)}</div>
                </div>
                <div class="rewrite-group">
                  <h3>${escapeHtml(data.rewrite_pack_section.cta_options_label)}</h3>
                  <div class="option-list">${renderCopyList(data.rewrite_pack_section.ctas)}</div>
                </div>
              </div>
            </section>

            <section class="section section-collapsible">
              <h2 class="section-compact-title">More detail</h2>
              <details class="detail-panel" id="${sections.quickWins}" open>
                <summary>${escapeHtml(data.quick_wins_section.title)} (${escapeHtml(
                  data.quick_wins_section.subtitle
                )})</summary>
                <div class="detail-panel-body">
                  <ol class="simple-list">
                    ${data.quick_wins_section.items
                      .map((item) => `<li>${escapeHtml(item)}</li>`)
                      .join("")}
                  </ol>
                </div>
              </details>

              <details class="detail-panel" id="${sections.scores}">
                <summary>${escapeHtml(data.score_section.title)}</summary>
                <div class="detail-panel-body">
                  <div class="score-table">
                    ${renderScoreRows(data.score_section.items)}
                  </div>
                </div>
              </details>

              <details class="detail-panel" id="${sections.mobile}">
                <summary>${escapeHtml(data.mobile_section.title)}</summary>
                <div class="detail-panel-body">
                  <p class="section-subtitle">${escapeHtml(
                    data.mobile_section.score_label
                  )}: ${escapeHtml(String(data.mobile_section.score))}/10</p>
                  <ul class="simple-list">
                    ${data.mobile_section.findings
                      .map((finding) => `<li>${escapeHtml(finding)}</li>`)
                      .join("")}
                  </ul>
                </div>
              </details>

              <details class="detail-panel" id="${sections.positives}">
                <summary>${escapeHtml(data.positives_section.title)}</summary>
                <div class="detail-panel-body">
                  <ul class="simple-list">
                    ${data.positives_section.items
                      .map((item) => `<li>${escapeHtml(item)}</li>`)
                      .join("")}
                  </ul>
                </div>
              </details>
            </section>

            <section class="section">
              <div class="split-row">
                <p class="footer-note">${escapeHtml(data.footer.disclaimer)}</p>
                <button class="ghost-btn" data-action="rerun">${escapeHtml(
                  data.footer.rerun_cta
                )}</button>
              </div>
            </section>
          </main>

          <aside class="rail" aria-label="Summary sidebar">
            <section class="rail-card score-card-big">
              <div class="score-big-label">${escapeHtml(data.header.score_label)}</div>
              <div class="score-big-value">${escapeHtml(String(data.header.score_value))}</div>
              <div class="score-band">${escapeHtml(data.header.score_band)}</div>
            </section>

            <section class="rail-card">
              <h3>Share & Actions</h3>
              <div class="action-list">
                <button class="action-btn" data-copy="${escapeHtml(permalinkUrl)}">Copy roast link</button>
                <button class="action-btn" data-copy="${escapeHtml(
                  buildShareSummary(data, permalinkUrl)
                )}">Copy summary</button>
                <a class="action-btn action-btn-link" href="${escapeHtml(
                  buildMailtoLink(data, permalinkUrl)
                )}">Email draft</a>
                <button class="action-btn" data-action="rerun">Roast another page</button>
              </div>
            </section>
          </aside>
        </div>
      </div>
      <div id="toast" class="toast" role="status" aria-live="polite"></div>
    `;
  }

  function render() {
    const app = getAppRoot();
    if (!app) {
      throw new Error('Missing #app mount node in index.html');
    }

    if (state.screen === "home") {
      app.innerHTML = renderHome();
      return;
    }

    if (state.screen === "analyzing") {
      app.innerHTML = renderAnalyzing();
      return;
    }

    if (state.screen === "error") {
      app.innerHTML = renderError();
      return;
    }

    app.innerHTML = renderResults(state.resultData || FALLBACK_DATA);
  }

  function showToast(message) {
    const toast = document.getElementById("toast");
    if (!toast) return;
    toast.textContent = message;
    toast.classList.add("show");
    clearTimeout(showToast.timer);
    showToast.timer = setTimeout(() => {
      toast.classList.remove("show");
    }, 1400);
  }

  async function copyText(text) {
    if (!text) return;
    try {
      if (navigator.clipboard && window.isSecureContext) {
        await navigator.clipboard.writeText(text);
      } else {
        const input = document.createElement("textarea");
        input.value = text;
        input.setAttribute("readonly", "");
        input.style.position = "absolute";
        input.style.left = "-9999px";
        document.body.appendChild(input);
        input.select();
        document.execCommand("copy");
        document.body.removeChild(input);
      }
      showToast("Copied");
    } catch (_err) {
      showToast("Copy failed");
    }
  }

  function buildShareSummary(data, permalinkUrl) {
    const title = data && data.header ? data.header.title : "Roast summary";
    const scoreText =
      data && data.share_card_copy && data.share_card_copy.score_text
        ? data.share_card_copy.score_text
        : "";
    const quote =
      data && data.share_card_copy && data.share_card_copy.quote
        ? data.share_card_copy.quote
        : "";
    return [title, scoreText, quote, permalinkUrl].filter(Boolean).join("\n");
  }

  function buildMailtoLink(data, permalinkUrl) {
    const subject = encodeURIComponent("Take a look at this landing page roast");
    const body = encodeURIComponent(buildShareSummary(data, permalinkUrl));
    return `mailto:?subject=${subject}&body=${body}`;
  }

  function getExampleUrlForScenario(scenario) {
    const key = String(scenario || "sample").toLowerCase();
    if (key === "strong") return "https://example.com/strong";
    if (key === "mobile") return "https://example.com/mobile";
    if (key === "partial") return "https://example.com/partial";
    return "https://example.com/sample";
  }

  function getExampleScenarioFromQuery() {
    try {
      const params = new URLSearchParams(window.location.search || "");
      const value = String(params.get("example") || "").toLowerCase();
      if (!value) return "";
      if (value === "sample" || value === "strong" || value === "mobile" || value === "partial") {
        return value;
      }
      return "";
    } catch (_error) {
      return "";
    }
  }

  async function loadExampleResults(scenario) {
    const selectedScenario = String(scenario || "sample").toLowerCase();
    state.runId += 1;
    const currentRunId = state.runId;
    state.formError = "";
    state.errorState = null;
    state.analyzing = false;
    state.form.url = getExampleUrlForScenario(selectedScenario);

    const fallback = await runFixtureFallbackForScenario(selectedScenario);
    if (state.runId !== currentRunId) return;

    if (fallback.errorState) {
      state.screen = "error";
      state.errorState = fallback.errorState;
      render();
      return;
    }

    state.resultData = (fallback && fallback.ui) || FALLBACK_DATA;
    state.resultMeta = {
      partialEvidence: Boolean(fallback && fallback.partialEvidence),
      scenario: (fallback && fallback.scenario) || selectedScenario,
      source: "fixture",
      apiFallback: true,
      fallbackReason: `Loaded local ${selectedScenario} example.`,
      roastId: "",
    };
    state.screen = "results";
    persistCurrentRoastToHistory();
    render();
  }

  function resetToHome() {
    state.runId += 1;
    state.screen = "home";
    state.analyzing = false;
    state.formError = "";
    state.errorState = null;
    state.resultMeta = {
      partialEvidence: false,
      scenario: "sample",
      source: "fixture",
      apiFallback: false,
      fallbackReason: "",
      roastId: "",
      provider: "",
      providerModel: "",
    };
    state.progress = 0;
    state.completedSteps = 0;
    render();
  }

  async function startAnalysisFlow() {
    const validation = validateLandingPageUrl(state.form.url);
    if (!validation.ok) {
      state.formError = validation.error || "Enter a valid URL.";
      if (state.screen !== "home") state.screen = "home";
      render();
      return;
    }

    state.form.url = validation.url;
    const scenario = getScenarioFromUrl(validation.url);
    state.formError = "";
    state.errorState = null;
    state.resultMeta = {
      partialEvidence: false,
      scenario: scenario === "analysis-fail" ? "sample" : scenario,
      source: "api",
      apiFallback: false,
      fallbackReason: "",
      roastId: "",
      provider: "",
      providerModel: "",
    };
    state.runId += 1;
    const currentRunId = state.runId;
    state.screen = "analyzing";
    state.analyzing = true;
    state.progress = 4;
    state.completedSteps = 0;
    render();
    const roastPromise = (async function () {
      try {
        const apiRun = await runApiRoast(validation.url, state.form.mode, state.form.style);
        return {
          ui: apiRun.ui,
          partialEvidence: Boolean(apiRun.partialEvidence),
          source: "api",
          apiFallback: false,
          scenario: state.resultMeta.scenario,
          roastId: apiRun.roastId || "",
          provider:
            apiRun.analysisMeta && typeof apiRun.analysisMeta.provider === "string"
              ? apiRun.analysisMeta.provider
              : "",
          providerModel:
            apiRun.analysisMeta && typeof apiRun.analysisMeta.provider_model === "string"
              ? apiRun.analysisMeta.provider_model
              : "",
        };
      } catch (error) {
        const mappedError = mapApiErrorToErrorState(error);
        if (mappedError && !error.unavailable) {
          throw { type: "ui-error", errorState: mappedError };
        }

        if (!error || !error.unavailable) {
          throw {
            type: "ui-error",
            errorState: mappedError || getErrorStateFromTemplate(ERROR_COPY.analysisFailed),
          };
        }

        const fallback = await runFixtureFallbackForScenario(scenario);
        if (fallback.errorState) {
          throw { type: "ui-error", errorState: fallback.errorState };
        }

        return {
          ui: fallback.ui,
          partialEvidence: Boolean(fallback.partialEvidence),
          source: "fixture",
          apiFallback: true,
          scenario: fallback.scenario || state.resultMeta.scenario,
          roastId: "",
          provider: "",
          providerModel: "",
          fallbackReason:
            error.code === "API_UNAVAILABLE"
              ? `Could not reach ${API_BASE_URL} (${error.message}).`
              : `Stub API returned ${error.status || "an error"} during ${error.phase || "analysis"}.`,
        };
      }
    })();
    const progressTargets = [16, 34, 57, 78, 94];
    const progressPauses = [420, 520, 640, 580, 520];
    const startedAt = Date.now();

    for (let index = 0; index < ANALYSIS_STEPS.length; index += 1) {
      const microSteps = 4;
      const from = state.progress;
      const to = progressTargets[index];
      for (let part = 1; part <= microSteps; part += 1) {
        await sleep(Math.max(60, Math.floor(progressPauses[index] / microSteps)));
        if (state.runId !== currentRunId) return;
        const pct = part / microSteps;
        state.progress = Math.round(from + (to - from) * pct);
        state.completedSteps = part === microSteps ? index + 1 : index;
        render();
      }
    }

    const minRuntimeMs = 2600;
    const remaining = Math.max(0, minRuntimeMs - (Date.now() - startedAt));
    let runOutput;
    try {
      [runOutput] = await Promise.all([
        roastPromise,
        sleep(remaining),
      ]);
    } catch (error) {
      if (state.runId !== currentRunId) return;
      state.analyzing = false;
      state.screen = "error";
      state.errorState =
        error && error.type === "ui-error" && error.errorState
          ? error.errorState
          : getErrorStateFromTemplate(ERROR_COPY.fixtureTimeout);
      render();
      return;
    }
    if (state.runId !== currentRunId) return;

    state.progress = 100;
    state.completedSteps = ANALYSIS_STEPS.length;
    render();
    await sleep(220);
    if (state.runId !== currentRunId) return;

    state.resultData = (runOutput && runOutput.ui) || FALLBACK_DATA;
    state.resultMeta.partialEvidence = Boolean(runOutput && runOutput.partialEvidence);
    state.resultMeta.scenario =
      (runOutput && runOutput.scenario) || state.resultMeta.scenario || "sample";
    state.resultMeta.source = (runOutput && runOutput.source) || "fixture";
    state.resultMeta.apiFallback = Boolean(runOutput && runOutput.apiFallback);
    state.resultMeta.fallbackReason = (runOutput && runOutput.fallbackReason) || "";
    state.resultMeta.roastId = (runOutput && runOutput.roastId) || "";
    state.resultMeta.provider = (runOutput && runOutput.provider) || "";
    state.resultMeta.providerModel = (runOutput && runOutput.providerModel) || "";
    state.screen = "results";
    state.analyzing = false;
    persistCurrentRoastToHistory();
    render();
  }

  function bindEvents() {
    document.addEventListener("click", (event) => {
      const copyTarget = event.target.closest("[data-copy]");
      if (copyTarget) {
        copyText(copyTarget.getAttribute("data-copy"));
        return;
      }

      const modeTarget = event.target.closest("[data-mode-value]");
      if (modeTarget) {
        state.form.mode = modeTarget.getAttribute("data-mode-value") || state.form.mode;
        if (state.screen === "home") render();
        return;
      }

      const styleTarget = event.target.closest("[data-style-value]");
      if (styleTarget) {
        state.form.style = styleTarget.getAttribute("data-style-value") || state.form.style;
        if (state.screen === "home") render();
        return;
      }

      const actionTarget = event.target.closest("[data-action]");
      const historyTarget = event.target.closest("[data-history-index]");
      if (historyTarget) {
        const index = Number(historyTarget.getAttribute("data-history-index"));
        const entry = state.roastHistory[index];
        if (!entry || !entry.resultData) return;
        state.form.url = entry.url || state.form.url;
        state.form.mode = entry.mode || state.form.mode;
        state.form.style = entry.style || state.form.style;
        state.resultData = entry.resultData;
        state.resultMeta = entry.resultMeta || state.resultMeta;
        state.errorState = null;
        state.formError = "";
        state.analyzing = false;
        state.screen = "results";
        render();
        return;
      }

      if (!actionTarget) return;
      const action = actionTarget.getAttribute("data-action");

      if (action === "rerun" || action === "back-home") {
        resetToHome();
        return;
      }

      if (action === "retry-analysis") {
        startAnalysisFlow();
        return;
      }

      if (action === "use-example") {
        state.form.url = getExampleUrlForScenario("sample");
        state.formError = "";
        if (state.screen === "home") render();
        return;
      }

      if (action === "view-example-results") {
        const scenario = actionTarget.getAttribute("data-example-scenario") || "sample";
        loadExampleResults(scenario);
      }
    });

    document.addEventListener("input", (event) => {
      const target = event.target;
      if (!(target instanceof HTMLInputElement)) return;
      if (target.name === "url") {
        state.form.url = target.value;
        if (state.formError) {
          state.formError = "";
          if (state.screen === "home") render();
        }
      }
    });

    document.addEventListener("submit", (event) => {
      const form = event.target;
      if (!(form instanceof HTMLFormElement)) return;
      if (form.matches('[data-form="roast"]')) {
        event.preventDefault();
        if (state.analyzing) return;
        startAnalysisFlow();
      }
    });
  }

  function bootstrap() {
    state.roastHistory = loadRoastHistory();
    render();
    bindEvents();
    const exampleScenario = getExampleScenarioFromQuery();
    if (exampleScenario) {
      loadExampleResults(exampleScenario);
    }
  }

  window.addEventListener("error", function (event) {
    const error = event && event.error ? event.error : new Error(event && event.message ? event.message : "Window error");
    renderFatalBootstrapError(error);
  });

  window.addEventListener("unhandledrejection", function (event) {
    const reason = event ? event.reason : null;
    const error = reason instanceof Error ? reason : new Error(String(reason || "Unhandled promise rejection"));
    renderFatalBootstrapError(error);
  });

  try {
    bootstrap();
  } catch (error) {
    renderFatalBootstrapError(error);
    throw error;
  }
})();
