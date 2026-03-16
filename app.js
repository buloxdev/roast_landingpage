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
    backupRoast: {
      title: "Backup roast shown",
      message:
        "The live roast engine did not finish this run, so we loaded a backup roast shell instead of dropping you into an error screen.",
      helper:
        "Retry once the backend settles if you want a fresh page-specific result.",
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
    analyzingSlow: false,
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
    if (state.resultMeta && state.resultMeta.apiFallback) return null;
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
    if (value.includes("/sample") || value.includes("example-saas.com")) return "sample";
    return "normal";
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
      const timeoutMs = phase === "analyze" ? 70000 : 30000;
      response = await withTimeout(
        fetch(getApiUrl(path), {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(body),
        }),
        timeoutMs,
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
    if (scenario === "normal") {
      const ui = await loadPass2Fixture("sample");
      const pass2Validation = validatePass2PayloadSafe(ui);
      if (!pass2Validation.ok) {
        throw new Error("Fixture payload failed pass2 validation");
      }
      return { ui, partialEvidence: false, scenario: "sample" };
    }

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

  function shouldDegradeToFixture(error) {
    if (!error || typeof error !== "object") return false;
    if (error.unavailable || error.retryable) return true;

    const code = String(error.code || "").toUpperCase();
    return (
      code === "ANALYSIS_FAILED" ||
      code === "COMPOSE_FAILED" ||
      code === "RATE_LIMITED" ||
      code === "INTERNAL_ERROR" ||
      code === "API_ERROR"
    );
  }

  function getFallbackReasonForError(error) {
    if (!error || typeof error !== "object") {
      return "The roast engine did not complete this run, so a backup roast was loaded.";
    }

    if (error.code === "API_UNAVAILABLE") {
      return `Could not reach ${API_BASE_URL} (${error.message}). Loaded a backup roast instead.`;
    }

    if (error.code) {
      return `The backend returned ${error.code} during ${error.phase || "analysis"}. Loaded a backup roast instead.`;
    }

    return `The roast engine failed during ${error.phase || "analysis"}. Loaded a backup roast instead.`;
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

    if (state.resultMeta && state.resultMeta.apiFallback) {
      warnings.push({
        kind: "fallback",
        title: ERROR_COPY.backupRoast.title,
        message:
          state.resultMeta.fallbackReason ||
          ERROR_COPY.backupRoast.message,
        helper: shouldShowDevFallbackUi()
          ? `Expected API base: ${API_BASE_URL}`
          : ERROR_COPY.backupRoast.helper,
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

  function renderIssueSpotlightCard(issue) {
    const leadEvidence =
      issue && issue.evidence && issue.evidence[0] ? issue.evidence[0].value : "";
    return `
      <article class="rounded-[20px] border border-[#d9b8a1] bg-[radial-gradient(circle_at_top_right,rgba(255,90,54,0.12),transparent_34%),radial-gradient(circle_at_bottom_left,rgba(15,157,122,0.07),transparent_26%),linear-gradient(180deg,#fffdf9,#f8ece1)] p-4 shadow-[0_18px_30px_rgba(25,22,20,0.06)]" id="issue-spotlight-${issue.rank}">
        <div class="grid items-start gap-2.5 sm:grid-cols-[auto_1fr] lg:grid-cols-[auto_1fr_auto]">
          <div class="rank">${issue.rank}</div>
          <div>
            <h3 class="m-0 text-[20px] leading-[1.06] tracking-[-0.025em]">${escapeHtml(issue.title)}</h3>
            <div class="issue-category">${escapeHtml(issue.category)}</div>
          </div>
          <span class="chip ${chipClass(issue.impact_badge)} justify-self-start lg:justify-self-end">${escapeHtml(
      issue.impact_badge
    )} Impact</span>
        </div>
        <p class="mt-3 text-[18px] leading-[1.45]">${escapeHtml(issue.problem)}</p>
        <div class="mt-3 grid gap-2.5 sm:grid-cols-2">
          <div class="rounded-[14px] border border-[#dec2af] bg-[#fffaf4] p-3">
            <label class="mb-1.5 block text-[11px] font-bold uppercase tracking-[0.08em] text-[#6d5448]">Why it matters</label>
            <p class="m-0 leading-[1.48]">${escapeHtml(issue.why_it_hurts)}</p>
          </div>
          <div class="rounded-[14px] border border-[#dec2af] bg-[#fffaf4] p-3">
            <label class="mb-1.5 block text-[11px] font-bold uppercase tracking-[0.08em] text-[#6d5448]">What to change</label>
            <p class="m-0 leading-[1.48]">${escapeHtml(issue.fix)}</p>
          </div>
        </div>
        ${
          leadEvidence
            ? `
          <div class="mt-3 border-t border-dashed border-[#dfc0a8] pt-3">
            <span class="mb-1.5 block text-[11px] font-bold uppercase tracking-[0.08em] text-[#6d5448]">Seen on page</span>
            <p class="m-0 leading-[1.48]">${escapeHtml(leadEvidence)}</p>
          </div>
        `
            : ""
        }
        ${
          issue.example_rewrite
            ? `
          <div class="mt-3 flex flex-col gap-3 rounded-[14px] border border-dashed border-[#e3ac81] bg-[#fff0dd] p-3 sm:flex-row sm:items-start sm:justify-between">
            <div>
              <label class="mb-1.5 block text-[11px] font-bold uppercase tracking-[0.08em] text-[#6d5448]">${escapeHtml(
                issue.rewrite_label || "Example Rewrite"
              )}</label>
              <p class="m-0 leading-[1.48]">${escapeHtml(issue.example_rewrite)}</p>
            </div>
            <button class="copy-btn" data-copy="${escapeHtml(issue.example_rewrite)}">Copy</button>
          </div>
        `
            : ""
        }
      </article>
    `;
  }

  function renderScoreRows(items) {
    return items
      .map((row) => {
        const pct = Math.max(0, Math.min(100, (Number(row.score) || 0) * 10));
        return `
          <div class="grid items-center gap-2.5 rounded-xl border border-[#dcbba6] bg-[#fffdf9] p-2.5 lg:grid-cols-[minmax(180px,1.2fr)_120px_1fr]">
            <div>
              <strong class="mb-0.5 block">${escapeHtml(row.category)}</strong>
              <div class="text-[13px] text-[#6d5448]">${escapeHtml(row.note)}</div>
            </div>
            <div class="font-bold">${escapeHtml(row.display_score)}</div>
            <div class="h-2 overflow-hidden rounded-full bg-[#ead8c8]" aria-hidden="true"><span class="block h-full bg-[linear-gradient(90deg,#ff5a36,#ff9a4d)]" style="width:${pct}%"></span></div>
          </div>
        `;
      })
      .join("");
  }

  function renderCopyList(items) {
    return items
      .map(
        (text) => `
        <div class="flex flex-col items-start justify-between gap-2.5 rounded-[10px] border border-[#dec4b2] bg-[#fffdf9] p-2.5 sm:flex-row">
          <p class="m-0 leading-[1.4]">${escapeHtml(text)}</p>
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
      <article class="rounded-[18px] border border-[#d9b8a1] bg-[radial-gradient(circle_at_top_right,rgba(255,90,54,0.14),transparent_36%),linear-gradient(180deg,#fffdf8,#f8ede2)] p-4 shadow-[0_16px_28px_rgba(24,17,25,0.06)]">
        <div class="mb-1.5 flex items-center justify-between gap-2.5">
          <div class="text-[11px] uppercase tracking-[0.1em] text-[#6d5448]">Rewrite preview</div>
          <button class="copy-btn copy-btn-quiet" data-copy="${escapeHtml(afterText)}">Copy upgrade</button>
        </div>
        <h3 class="mb-3 text-[18px] tracking-[-0.02em]">${escapeHtml(label)}</h3>
        <div class="grid gap-2.5 sm:grid-cols-2">
          <div class="rounded-2xl border border-[#ebc6b5] bg-[#fff1e8] p-[14px]">
            <span class="mb-2.5 inline-block text-[10px] font-bold uppercase tracking-[0.11em] text-[#9b5b47]">Current</span>
            <p class="m-0 text-[15px] leading-[1.5] text-[#8d5c4d] [text-decoration-color:rgba(141,92,77,0.45)] [text-decoration-thickness:1.5px] line-through">${escapeHtml(
              beforeValue
            )}</p>
          </div>
          <div class="rounded-2xl border border-[#b9ddcf] bg-[#effcf5] p-[14px]">
            <span class="mb-2.5 inline-block text-[10px] font-bold uppercase tracking-[0.11em] text-[#0f9d7a]">Rewrite</span>
            <p class="m-0 text-[15px] font-semibold leading-[1.5] text-[#171119]">${escapeHtml(afterText)}</p>
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
          ${showUrl ? `<div class="url-pill topbar-url">${escapeHtml(state.form.url)}</div>` : ""}
          <div class="mode-pill topbar-meta-pill">${escapeHtml(mode.label)}</div>
          <div class="mode-pill mode-pill-soft topbar-meta-pill">${escapeHtml(style.label)}</div>
          ${
            sourceBadge
              ? `<div class="mode-pill mode-pill-soft topbar-source-pill" title="${escapeHtml(sourceBadge.title)}">${escapeHtml(
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

        <div class="grid gap-5 xl:grid-cols-[minmax(0,1.1fr)_minmax(360px,0.9fr)] xl:items-start">
          <section class="relative overflow-hidden rounded-[28px] border border-[rgba(255,241,232,0.12)] bg-[linear-gradient(135deg,#17111f_0%,#241521_44%,#4f1d17_100%)] px-5 py-6 text-[#fff4ec] shadow-[0_32px_90px_rgba(0,0,0,0.34),inset_0_1px_0_rgba(255,255,255,0.05)] sm:px-8 sm:py-9">
            <div class="pointer-events-none absolute -right-[10%] -bottom-[22%] h-[340px] w-[340px] rounded-full bg-[radial-gradient(circle,rgba(15,157,122,0.28),transparent_72%)]"></div>
            <div class="pointer-events-none absolute right-[18px] top-[18px] h-28 w-28 rotate-12 rounded-[28px] border border-white/10 bg-[linear-gradient(135deg,rgba(255,248,240,0.16),rgba(255,248,240,0.04))]"></div>
            <div class="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_14%_18%,rgba(255,196,107,0.28),transparent_24%),radial-gradient(circle_at_88%_14%,rgba(255,90,54,0.44),transparent_28%),radial-gradient(circle_at_76%_86%,rgba(15,157,122,0.3),transparent_30%)]"></div>
            <div class="relative">
            <div class="mb-2 text-[11px] font-semibold uppercase tracking-[0.18em] text-white/70 sm:text-xs">For designers, founders, and homepage obsessives</div>
            <h1 class="max-w-[7.5ch] font-display text-[clamp(2.125rem,8vw,4.75rem)] font-black leading-[0.92] tracking-[-0.055em] text-white">Paste the link. Watch it cook.</h1>
            <p class="mt-3 max-w-[44ch] text-[17px] leading-8 text-white/80 sm:text-[19px]">
              A conversion critique that gets to the point fast: what is muddy, what is costing clarity, and what to rewrite next.
            </p>

            <div class="mt-5 flex flex-wrap gap-2">
              <div class="rounded-full border border-white/15 bg-white/10 px-3 py-2 text-xs tracking-[0.03em] text-white/90">Fast verdict</div>
              <div class="rounded-full border border-white/15 bg-white/10 px-3 py-2 text-xs tracking-[0.03em] text-white/90">Prioritized fixes</div>
              <div class="rounded-full border border-white/15 bg-white/10 px-3 py-2 text-xs tracking-[0.03em] text-white/90">Ready-to-use rewrites</div>
            </div>

            <div class="mt-5 grid gap-3">
              <div class="rounded-[20px] border border-white/10 bg-white/10 p-4 backdrop-blur-xl">
                <div class="mb-1 text-[11px] uppercase tracking-[0.08em] text-white/70">Calls out</div>
                <div class="text-lg font-bold leading-[1.28] text-white">Vague headlines, weak CTAs, thin proof, and muddy differentiation</div>
              </div>
              <div class="rounded-[20px] border border-white/10 bg-white/10 p-4 backdrop-blur-xl">
                <div class="mb-1 text-[11px] uppercase tracking-[0.08em] text-white/70">Hands back</div>
                <div class="text-lg font-bold leading-[1.28] text-white">A ranked plan, better copy, and the strongest next move to ship first</div>
              </div>
              <div class="rounded-[20px] border border-white/10 bg-white/10 p-4 backdrop-blur-xl">
                <div class="mb-1 text-[11px] uppercase tracking-[0.08em] text-white/70">Best on</div>
                <div class="text-lg font-bold leading-[1.28] text-white">Launch pages, SaaS homepages, redesigns, and "why is this not converting?" moments</div>
              </div>
            </div>

            <div class="mt-5 rounded-[24px] border border-white/10 bg-white/10 p-4 backdrop-blur-xl">
              <div class="flex items-center justify-between gap-3">
                <div>
                  <div class="mb-1 text-[11px] uppercase tracking-[0.09em] text-white/70">Example output</div>
                  <strong class="block text-[22px] leading-[1.02] tracking-[-0.03em] text-white">Fix the hero first</strong>
                </div>
                <div class="grid h-[68px] w-[68px] place-items-center rounded-[20px] border border-white/15 bg-white/10 text-[28px] font-extrabold text-white">56</div>
              </div>
              <div class="mt-4 grid gap-3 sm:grid-cols-2">
                <div class="rounded-[18px] border border-white/10 bg-white/10 p-3">
                  <span class="mb-1 block text-[11px] uppercase tracking-[0.08em] text-white/70">Diagnosis</span>
                  <p class="m-0 leading-6 text-white/95">The page looks polished, but the value prop is still making visitors guess.</p>
                </div>
                <div class="rounded-[18px] border border-white/10 bg-white/10 p-3">
                  <span class="mb-1 block text-[11px] uppercase tracking-[0.08em] text-white/70">Rewrite direction</span>
                  <p class="m-0 leading-6 text-white/95">Name the product, the audience, and the outcome in one breath.</p>
                </div>
              </div>
            </div>
            </div>
          </section>

          <section class="rounded-[28px] border border-[#dfbca2] bg-[radial-gradient(circle_at_top_right,rgba(255,90,54,0.12),transparent_32%),linear-gradient(180deg,rgba(255,250,245,0.98),rgba(248,236,224,0.97))] p-5 shadow-[0_28px_76px_rgba(14,8,10,0.2),inset_0_1px_0_rgba(255,255,255,0.4)] sm:p-6">
            <div class="mb-4 flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
              <div>
                <div class="mb-1 text-[11px] font-semibold uppercase tracking-[0.18em] text-[#a53d21] sm:text-xs">Run a roast</div>
                <h2 class="m-0 text-[clamp(1.75rem,2.6vw,2.375rem)] font-black leading-[0.98] tracking-[-0.04em] text-[#171119]">Drop in the URL</h2>
                <p class="mt-2 max-w-[34ch] text-[15px] leading-7 text-[#6d5448]">Choose the tone, run the scan, then jump straight to the fix with the biggest conversion upside.</p>
              </div>
              <div class="grid gap-2 sm:justify-items-end">
                <div class="mode-pill mode-pill-soft">${escapeHtml(mode.hint)}</div>
                <div class="mode-pill mode-pill-soft">${escapeHtml(style.hint)}</div>
              </div>
            </div>

            <form data-form="roast" class="grid gap-3" novalidate>
              <label class="text-[13px] font-semibold text-[#171119]" for="landing-url">Landing page URL</label>
              <input
                id="landing-url"
                class="w-full rounded-[18px] border border-[#dcb9a0] bg-[#fffdfa] px-[18px] py-4 text-[#171119] shadow-[inset_0_1px_0_rgba(255,255,255,0.76),0_1px_0_rgba(255,255,255,0.28)] focus:border-[rgba(255,90,54,0.52)] focus:outline-none focus:ring-4 focus:ring-[rgba(255,90,54,0.14)]${hasUrlError ? " border-[rgba(199,63,42,0.55)] bg-[#fff8f7]" : ""}"
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
                  ? `<p id="landing-url-error" class="m-0 text-xs leading-[1.35] text-[#d63b21]">${escapeHtml(state.formError)}</p>`
                  : ""
              }

              <div class="flex flex-col items-start gap-1 sm:flex-row sm:items-baseline sm:justify-between sm:gap-3">
                <div class="text-[13px] font-semibold text-[#171119]">Roast mode</div>
                <div class="text-xs leading-[1.35] text-[#6d5448]">Default is tuned to give the clearest, sharpest signal.</div>
              </div>
              <div class="grid gap-2 lg:grid-cols-3" role="tablist" aria-label="Roast mode">
                ${MODE_OPTIONS.map((option) => {
                  const active = option.value === state.form.mode;
                  return `
                    <button
                      type="button"
                      class="rounded-2xl border px-[13px] py-3 text-left transition duration-150 ${active ? "border-[rgba(255,90,54,0.5)] bg-[radial-gradient(circle_at_top_right,rgba(255,90,54,0.14),transparent_45%),linear-gradient(180deg,#fff8f0,#ffebdd)] shadow-[inset_0_0_0_1px_rgba(255,255,255,0.35),0_14px_24px_rgba(255,90,54,0.14)]" : "border-[#dcb9a0] bg-[linear-gradient(180deg,#fffdf9,#f7ece2)] hover:-translate-y-px hover:border-[rgba(255,90,54,0.36)] hover:shadow-[0_12px_22px_rgba(28,17,22,0.08)]"}"
                      role="tab"
                      aria-selected="${active ? "true" : "false"}"
                      data-mode-value="${escapeHtml(option.value)}"
                    >
                      <span class="block font-bold ${active ? "text-[#8e2d14]" : "text-[#171119]"}">${escapeHtml(option.label)}</span>
                      <small class="mt-1 block text-[11px] leading-[1.35] text-[#6d5448]">${escapeHtml(option.hint)}</small>
                    </button>
                  `;
                }).join("")}
              </div>

              <div class="flex flex-col items-start gap-1 sm:flex-row sm:items-baseline sm:justify-between sm:gap-3">
                <div class="text-[13px] font-semibold text-[#171119]">Roast style</div>
                <div class="text-xs leading-[1.35] text-[#6d5448]">Flavor only. The recommendations stay the same.</div>
              </div>
              <div class="grid gap-2 lg:grid-cols-3" role="tablist" aria-label="Roast style">
                ${STYLE_OPTIONS.map((option) => {
                  const active = option.value === state.form.style;
                  return `
                    <button
                      type="button"
                      class="rounded-2xl border px-[13px] py-3 text-left transition duration-150 ${active ? "border-[rgba(255,90,54,0.5)] bg-[radial-gradient(circle_at_top_right,rgba(255,90,54,0.14),transparent_45%),linear-gradient(180deg,#fff8f0,#ffebdd)] shadow-[inset_0_0_0_1px_rgba(255,255,255,0.35),0_14px_24px_rgba(255,90,54,0.14)]" : "border-[#dcb9a0] bg-[linear-gradient(180deg,#fffdf9,#f7ece2)] hover:-translate-y-px hover:border-[rgba(255,90,54,0.36)] hover:shadow-[0_12px_22px_rgba(28,17,22,0.08)]"}"
                      role="tab"
                      aria-selected="${active ? "true" : "false"}"
                      data-style-value="${escapeHtml(option.value)}"
                    >
                      <span class="block font-bold ${active ? "text-[#8e2d14]" : "text-[#171119]"}">${escapeHtml(option.label)}</span>
                      <small class="mt-1 block text-[11px] leading-[1.35] text-[#6d5448]">${escapeHtml(option.hint)}</small>
                    </button>
                  `;
                }).join("")}
              </div>

              <button class="primary-btn primary-btn-lg mt-1" type="submit">Roast My Landing Page</button>
            </form>

            <div class="mt-[18px] rounded-2xl border border-[#dbb79d] bg-[linear-gradient(180deg,#fff7ef,#f8e9db)] px-4 py-[14px] text-[13px] leading-[1.4] text-[#6b5347]">
              <strong>Just exploring?</strong> Open a sample report and see the full output before you run your own page.
            </div>
            <div class="mt-3 grid gap-2">
              <button class="rounded-xl border border-[#dbb79d] bg-[#fffdf9] px-3 py-[11px] text-left font-semibold text-[#2f2320] transition duration-150 hover:-translate-y-px hover:border-[rgba(255,90,54,0.34)] hover:shadow-[0_10px_16px_rgba(24,17,25,0.08)]" type="button" data-action="view-example-results" data-example-scenario="sample">View sample results</button>
              <button class="rounded-xl border border-[#dbb79d] bg-[#fffdf9] px-3 py-[11px] text-left font-semibold text-[#2f2320] transition duration-150 hover:-translate-y-px hover:border-[rgba(255,90,54,0.34)] hover:shadow-[0_10px_16px_rgba(24,17,25,0.08)]" type="button" data-action="view-example-results" data-example-scenario="strong">View strong-page results</button>
              <button class="rounded-xl border border-[#dbb79d] bg-[#fffdf9] px-3 py-[11px] text-left font-semibold text-[#2f2320] transition duration-150 hover:-translate-y-px hover:border-[rgba(255,90,54,0.34)] hover:shadow-[0_10px_16px_rgba(24,17,25,0.08)]" type="button" data-action="view-example-results" data-example-scenario="mobile">View mobile-issues results</button>
              <button class="rounded-xl border border-[#dbb79d] bg-[#fffdf9] px-3 py-[11px] text-left font-semibold text-[#2f2320] transition duration-150 hover:-translate-y-px hover:border-[rgba(255,90,54,0.34)] hover:shadow-[0_10px_16px_rgba(24,17,25,0.08)]" type="button" data-action="view-example-results" data-example-scenario="partial">View partial-evidence results</button>
            </div>

            ${historyMarkup}
          </section>
        </div>
      </div>
      <div id="toast" class="toast" role="status" aria-live="polite"></div>
    `;
  }

  function renderAnalyzing() {
    const waitingOnBackend =
      state.progress < 100 && state.completedSteps >= ANALYSIS_STEPS.length;
    const visibleCompletedSteps = waitingOnBackend
      ? ANALYSIS_STEPS.length - 1
      : state.completedSteps;
    const activeStepIndex = Math.min(visibleCompletedSteps, ANALYSIS_STEPS.length - 1);
    const detail = state.progress >= 100
      ? "Opening the desktop roast report..."
      : state.analyzingSlow
      ? "This run is taking longer than usual. The hosted backend may be waking up, or the page may be script-heavy."
      : ANALYSIS_STEPS[activeStepIndex].detail;

    return `
      <div class="shell">
        ${renderTopbar({
          rightHtml: `<button class="ghost-btn" type="button" data-action="back-home">Cancel</button>`,
        })}

        <section class="grid items-start gap-5 lg:grid-cols-[minmax(0,2fr)_minmax(280px,1fr)]">
          <div class="rounded-[20px] border border-[#d9b8a1] bg-[radial-gradient(circle_at_top_right,rgba(255,90,54,0.08),transparent_30%),linear-gradient(180deg,rgba(255,252,248,0.98),rgba(248,236,224,0.96))] p-4 shadow-shell sm:p-[22px]">
            <div class="eyebrow">Analyzing</div>
            <h1 class="m-0 text-[clamp(1.625rem,2.6vw,2.375rem)] leading-[1.05] tracking-[-0.02em]">Roasting your page...</h1>
            <p class="mt-2 text-[#6d5448] leading-[1.45]">
              We are checking the page, extracting copy, and building your roast.
            </p>
            <p class="mt-1 text-[14px] leading-[1.45] text-[#6d5448]">${escapeHtml(detail)}</p>

            <div class="mb-2 mt-4 flex items-center justify-between gap-3 text-[13px] text-[#6d5448]">
              <span>Report generation progress</span>
              <strong class="text-[14px] text-[#171119]">${Math.round(state.progress)}%</strong>
            </div>
            <div
              class="h-[10px] overflow-hidden rounded-full border border-[#dcc4b1] bg-[#eadacd]"
              role="progressbar"
              aria-valuemin="0"
              aria-valuemax="100"
              aria-valuenow="${Math.round(state.progress)}"
              aria-label="Roast report progress"
            >
              <div class="h-full bg-[linear-gradient(90deg,#ff5a36,#ff9a4d)] transition-[width] duration-200" style="width: ${Math.round(
                state.progress
              )}%"></div>
            </div>

            <ol class="mt-4 grid list-none gap-2.5 p-0">
              ${ANALYSIS_STEPS.map((step, index) => {
                const isDone = index < visibleCompletedSteps;
                const isActive = !isDone && index === visibleCompletedSteps && state.progress < 100;
                const statusText = isDone ? "Done" : isActive ? "In progress" : "Waiting";
                const rowClasses = isDone
                  ? "border-[#bed9cd] bg-[linear-gradient(180deg,#f3fbf6,#fff)]"
                  : isActive
                  ? "border-[#dfb39a] bg-[linear-gradient(180deg,#fff5ec,#fff)]"
                  : "border-[#d9b8a1] bg-[rgba(255,253,249,0.82)]";
                const dotClasses = isDone
                  ? "border-[#b7d7ca] bg-[#e6f4ed] text-[#0f9d7a]"
                  : isActive
                  ? "border-[#ebb294] bg-[#ffe8db] text-[#8a2f18]"
                  : "border-[#dcc2af] bg-[#f7eee4] text-[#171119]";
                return `
                  <li class="grid gap-2.5 rounded-[14px] border p-2.5 ${rowClasses}">
                    <div class="grid gap-2.5 sm:grid-cols-[auto_1fr]">
                      <div class="grid h-7 w-7 shrink-0 place-items-center rounded-[10px] border font-bold ${dotClasses}" aria-hidden="true">${
                        isDone ? "OK" : index + 1
                      }</div>
                      <div class="min-w-0">
                        <div class="flex flex-col items-start gap-0.5 sm:flex-row sm:items-baseline sm:justify-between sm:gap-2.5">
                          <strong class="text-[14px]">${escapeHtml(step.title)}</strong>
                          <span class="whitespace-nowrap text-[12px] text-[#6d5448]">${statusText}</span>
                        </div>
                        <p class="mt-1 text-[13px] leading-[1.4] text-[#6d5448]">${escapeHtml(step.detail)}</p>
                      </div>
                    </div>
                  </li>
                `;
              }).join("")}
            </ol>
          </div>

          <aside class="grid gap-3 lg:sticky lg:top-4">
            <section class="rounded-[18px] border border-[#d9b8a1] bg-[linear-gradient(180deg,#fffdf9,#f8ede2)] p-[14px]">
              <div class="text-[12px] text-[#6d5448]">Run mode</div>
              <div class="my-1 text-[28px] font-extrabold leading-[1.1]">${escapeHtml(getModeMeta(state.form.mode).label)}</div>
              <div class="text-[12px] text-[#6d5448]">${escapeHtml(getModeMeta(state.form.mode).hint)}</div>
              <div class="mt-1.5 text-[12px] text-[#6d5448]">${escapeHtml(getStyleMeta(state.form.style).label)}: ${escapeHtml(
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

        <section class="grid min-h-[min(68vh,720px)] place-items-center">
          <div class="w-full max-w-[760px] rounded-[20px] border border-[#d9b8a1] bg-[radial-gradient(circle_at_top_right,rgba(255,90,54,0.08),transparent_30%),linear-gradient(180deg,rgba(255,252,248,0.98),rgba(248,236,224,0.98))] p-4 shadow-shell sm:p-[22px]">
            <div class="eyebrow">Run Error</div>
            <h1 class="m-0 text-[clamp(1.625rem,3vw,2.25rem)] leading-[1.05] tracking-[-0.02em]">${escapeHtml(error.title)}</h1>
            <p class="mt-2 max-w-[60ch] leading-[1.45] text-[#6d5448]">${escapeHtml(error.message)}</p>

            <div class="mt-[14px] flex flex-wrap items-center gap-2.5">
              <span class="error-chip">${escapeHtml(kindLabel)}</span>
              <span class="error-meta-url">${escapeHtml(state.form.url || "")}</span>
            </div>
            ${error.helper ? `<p class="mt-3 text-[13px] leading-[1.4] text-[#6f5849]">${escapeHtml(error.helper)}</p>` : ""}

            <div class="mt-4 flex flex-wrap gap-2.5">
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
    const primaryHeadline = data.rewrite_pack_section.headlines[0] || "";
    const primarySubheadline = data.rewrite_pack_section.subheadlines[0] || "";
    const primaryCta = data.rewrite_pack_section.ctas[0] || "";
    const topIssues = data.issue_cards.slice(0, 3);
    const overflowIssues = data.issue_cards.slice(3);

    const resultWarnings = getResultsWarnings(data);
    return `
      <div class="shell">
        ${renderTopbar({
          rightHtml: `<button class="primary-btn" data-action="rerun">Roast another page</button>`,
        })}

        <section class="summary-card bg-[radial-gradient(circle_at_top_right,rgba(255,90,54,0.16),transparent_28%),radial-gradient(circle_at_bottom_left,rgba(15,157,122,0.12),transparent_24%),linear-gradient(180deg,rgba(255,252,248,0.98),rgba(248,236,224,0.98))] p-[18px] sm:p-7">
          <div class="eyebrow">Roast verdict</div>
          <div class="grid items-start gap-5 lg:grid-cols-[minmax(0,1.55fr)_minmax(280px,0.85fr)]">
            <div>
              <div class="verdict-chip">${escapeHtml(data.header.verdict_chip)}</div>
              <h1 class="mt-[14px] max-w-[12ch] text-[clamp(1.875rem,7vw,3.375rem)] font-black leading-[0.96] tracking-[-0.045em] sm:max-w-[12ch]">${escapeHtml(
                data.header.title
              )}</h1>
              <p class="m-0 max-w-[60ch] leading-6 text-[#6d5448]">${escapeHtml(data.header.subtitle)}</p>
              <p class="mt-[14px] max-w-[48ch] text-[16px] leading-[1.45] text-[#171119] sm:text-[18px]">${escapeHtml(
                data.summary_panel.one_liner
              )}</p>
              <div class="mt-[18px] grid gap-2.5 lg:grid-cols-3">
                ${data.summary_panel.top_3_problems
                  .slice(0, 3)
                  .map(
                    (item, index) => `
                      <div class="min-h-full rounded-2xl border border-[#dcc0aa] bg-[#fffbf7] p-[14px]">
                        <span class="mb-2.5 grid h-7 w-7 place-items-center rounded-[10px] border border-[#ebb899] bg-[#ffe7d6] font-bold text-[#9f3e20]">${
                          index + 1
                        }</span>
                        <p class="m-0 font-bold leading-[1.38]">${escapeHtml(item)}</p>
                      </div>
                    `
                  )
                  .join("")}
              </div>
            </div>
            <div class="grid gap-3">
              <div class="score-badge rounded-[18px] p-4 shadow-[0_18px_34px_rgba(19,12,18,0.08)]">
                <div class="score-label">${escapeHtml(data.header.score_label)}</div>
                <div class="score-value text-[52px]">${escapeHtml(String(data.header.score_value))}</div>
                <div class="score-band">${escapeHtml(data.header.score_band)}</div>
              </div>
              <div class="rounded-[18px] border border-[rgba(255,237,225,0.14)] bg-[linear-gradient(180deg,rgba(29,19,27,0.98),rgba(19,14,24,0.96))] p-4 text-[#fff4ec] shadow-[0_16px_30px_rgba(11,8,14,0.22)]">
                <div class="mb-2 text-[11px] uppercase tracking-[0.18em] text-white/70">Best next move</div>
                <p class="m-0 leading-6">${escapeHtml(data.summary_panel.cta_hint)}</p>
                <div class="mt-[14px] grid gap-2.5">
                  <a class="primary-btn text-btn" href="#${sections.rewrites}">Open Copy Lab</a>
                  ${
                    primaryHeadline
                      ? `<button class="ghost-btn ghost-btn-dark" data-copy="${escapeHtml(primaryHeadline)}">Copy best headline</button>`
                      : ""
                  }
                </div>
              </div>
            </div>
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
              <div class="mb-[14px] flex flex-col items-start gap-1.5 sm:flex-row sm:items-start sm:justify-between sm:gap-4">
                <div>
                  <h2>${escapeHtml(data.summary_panel.top_problems_title)}</h2>
                  <p class="section-subtitle">${escapeHtml(data.summary_panel.cta_hint)}</p>
                </div>
                <div class="max-w-[250px] text-[13px] leading-[1.45] text-[#6d5448]">Start with these before touching the lower-value polish work.</div>
              </div>
              <div class="grid gap-[14px]">
                ${topIssues.map(renderIssueSpotlightCard).join("")}
              </div>
            </section>

            <section class="section bg-[radial-gradient(circle_at_top_right,rgba(255,90,54,0.12),transparent_36%),radial-gradient(circle_at_bottom_left,rgba(15,157,122,0.06),transparent_24%),rgba(255,253,249,0.88)]" id="${sections.rewrites}">
              <h2>${escapeHtml(data.rewrite_pack_section.title)}</h2>
              <p class="section-subtitle">Recommended rewrites first, alternate options second.</p>
              <div class="grid items-start gap-4 lg:grid-cols-[minmax(0,1.5fr)_minmax(240px,0.8fr)]">
                <div class="grid gap-[14px]">
                  ${renderRewriteCompareCard(
                    "Headline",
                    data.issue_cards[0] && data.issue_cards[0].evidence && data.issue_cards[0].evidence[0]
                      ? data.issue_cards[0].evidence[0].value
                      : "",
                    primaryHeadline
                  )}
                  ${renderRewriteCompareCard(
                    "Support line",
                    data.header.subtitle || data.summary_panel.one_liner || "",
                    primarySubheadline
                  )}
                  ${renderRewriteCompareCard(
                    "Next step",
                    data.summary_panel.cta_hint || "",
                    primaryCta
                  )}
                </div>
                <aside class="lg:sticky lg:top-4">
                  <div class="rounded-[18px] border border-[#dcbda8] bg-[linear-gradient(180deg,#fffdf9,#f8ede2)] p-4 shadow-[0_16px_30px_rgba(22,18,20,0.06)]">
                    <div class="eyebrow">Recommended bundle</div>
                    <h3 class="mb-3 text-[22px] leading-[1.02] tracking-[-0.03em]">Ship this version first</h3>
                    <div class="grid gap-2.5">
                      ${
                        primaryHeadline
                          ? `<button class="w-full rounded-[14px] border border-[#dbbaa4] bg-[linear-gradient(180deg,#fffdf9,#f7ece1)] p-3 text-left transition duration-150 hover:-translate-y-px hover:border-[rgba(255,90,54,0.3)] hover:shadow-[0_12px_20px_rgba(20,14,18,0.08)]" data-copy="${escapeHtml(
                              primaryHeadline
                            )}"><span class="mb-1.5 block text-[11px] font-bold uppercase tracking-[0.08em] text-[#6d5448]">Headline</span><strong class="block leading-[1.4]">${escapeHtml(
                              primaryHeadline
                            )}</strong></button>`
                          : ""
                      }
                      ${
                        primarySubheadline
                          ? `<button class="w-full rounded-[14px] border border-[#dbbaa4] bg-[linear-gradient(180deg,#fffdf9,#f7ece1)] p-3 text-left transition duration-150 hover:-translate-y-px hover:border-[rgba(255,90,54,0.3)] hover:shadow-[0_12px_20px_rgba(20,14,18,0.08)]" data-copy="${escapeHtml(
                              primarySubheadline
                            )}"><span class="mb-1.5 block text-[11px] font-bold uppercase tracking-[0.08em] text-[#6d5448]">Support line</span><strong class="block leading-[1.4]">${escapeHtml(
                              primarySubheadline
                            )}</strong></button>`
                          : ""
                      }
                      ${
                        primaryCta
                          ? `<button class="w-full rounded-[14px] border border-[#dbbaa4] bg-[linear-gradient(180deg,#fffdf9,#f7ece1)] p-3 text-left transition duration-150 hover:-translate-y-px hover:border-[rgba(255,90,54,0.3)] hover:shadow-[0_12px_20px_rgba(20,14,18,0.08)]" data-copy="${escapeHtml(
                              primaryCta
                            )}"><span class="mb-1.5 block text-[11px] font-bold uppercase tracking-[0.08em] text-[#6d5448]">CTA</span><strong class="block leading-[1.4]">${escapeHtml(
                              primaryCta
                            )}</strong></button>`
                          : ""
                      }
                    </div>
                  </div>
                </aside>
              </div>
              <details class="detail-panel mt-[14px]">
                <summary>More rewrite options</summary>
                <div class="detail-panel-body">
                  <div class="grid gap-[14px]">
                    <div class="rounded-xl border border-[#dcbba6] bg-[#fffdf9] p-3">
                      <h3 class="mb-2.5 text-sm text-[#6d5448]">${escapeHtml(data.rewrite_pack_section.headline_options_label)}</h3>
                      <div class="option-list">${renderCopyList(data.rewrite_pack_section.headlines)}</div>
                    </div>
                    <div class="rounded-xl border border-[#dcbba6] bg-[#fffdf9] p-3">
                      <h3 class="mb-2.5 text-sm text-[#6d5448]">${escapeHtml(data.rewrite_pack_section.subheadline_options_label)}</h3>
                      <div class="option-list">${renderCopyList(data.rewrite_pack_section.subheadlines)}</div>
                    </div>
                    <div class="rounded-xl border border-[#dcbba6] bg-[#fffdf9] p-3">
                      <h3 class="mb-2.5 text-sm text-[#6d5448]">${escapeHtml(data.rewrite_pack_section.cta_options_label)}</h3>
                      <div class="option-list">${renderCopyList(data.rewrite_pack_section.ctas)}</div>
                    </div>
                  </div>
                </div>
              </details>
            </section>

            <section class="section">
              <h2 class="mb-2.5 text-base tracking-[0.01em]">Appendix</h2>
              <details class="detail-panel" id="${sections.quickWins}" open>
                <summary>${escapeHtml(data.quick_wins_section.title)} (${escapeHtml(
                  data.quick_wins_section.subtitle
                )})</summary>
                <div class="detail-panel-body">
                  <ol class="m-0 pl-[18px] leading-[1.5]">
                    ${data.quick_wins_section.items
                      .map((item) => `<li class="[&:not(:first-child)]:mt-2">${escapeHtml(item)}</li>`)
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
                  <p class="mb-[14px] text-sm text-[#6d5448]">${escapeHtml(
                    data.mobile_section.score_label
                  )}: ${escapeHtml(String(data.mobile_section.score))}/10</p>
                  <ul class="m-0 pl-[18px] leading-[1.5]">
                    ${data.mobile_section.findings
                      .map((finding) => `<li class="[&:not(:first-child)]:mt-2">${escapeHtml(finding)}</li>`)
                      .join("")}
                  </ul>
                </div>
              </details>

              <details class="detail-panel" id="${sections.positives}">
                <summary>${escapeHtml(data.positives_section.title)}</summary>
                <div class="detail-panel-body">
                  <ul class="m-0 pl-[18px] leading-[1.5]">
                    ${data.positives_section.items
                      .map((item) => `<li class="[&:not(:first-child)]:mt-2">${escapeHtml(item)}</li>`)
                      .join("")}
                  </ul>
                </div>
              </details>

              <details class="detail-panel issue-overflow-panel">
                <summary>Full finding breakdown (${data.issue_cards.length})</summary>
                <div class="detail-panel-body">
                  <div class="issue-list">
                    ${topIssues.map(renderIssueCard).join("")}
                    ${overflowIssues.map(renderIssueCard).join("")}
                  </div>
                </div>
              </details>
            </section>

            <section class="section">
              <div class="flex flex-wrap items-center justify-between gap-3">
                <p class="m-0 text-[13px] text-[#6d5448]">${escapeHtml(data.footer.disclaimer)}</p>
                <button class="ghost-btn" data-action="rerun">${escapeHtml(
                  data.footer.rerun_cta
                )}</button>
              </div>
            </section>
          </main>

          <aside class="rail" aria-label="Summary sidebar">
            <section class="rail-card ship-card">
              <div class="eyebrow">Ship this first</div>
              <h3>${escapeHtml(topIssues[0] ? topIssues[0].title : data.header.verdict_chip)}</h3>
              <p>${escapeHtml(topIssues[0] ? topIssues[0].fix : data.summary_panel.cta_hint)}</p>
              ${
                topIssues[0] && topIssues[0].example_rewrite
                  ? `<button class="primary-btn rail-primary-btn" data-copy="${escapeHtml(topIssues[0].example_rewrite)}">Copy recommended rewrite</button>`
                  : `<a class="primary-btn text-btn rail-primary-btn" href="#${sections.rewrites}">Open Copy Lab</a>`
              }
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

        <div class="mobile-action-bar">
          <a class="primary-btn text-btn mobile-action-primary" href="#${sections.rewrites}">Open Copy Lab</a>
          ${
            topIssues[0] && topIssues[0].example_rewrite
              ? `<button class="ghost-btn mobile-action-secondary" data-copy="${escapeHtml(
                  topIssues[0].example_rewrite
                )}">Copy top fix</button>`
              : ""
          }
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
    state.analyzingSlow = false;
    state.progress = 4;
    state.completedSteps = 0;
    render();
    const slowTimer = window.setTimeout(() => {
      if (state.runId !== currentRunId || !state.analyzing) return;
      state.analyzingSlow = true;
      render();
    }, 12000);
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
        if (!shouldDegradeToFixture(error)) {
          throw {
            type: "ui-error",
            errorState: mappedError || getErrorStateFromTemplate(ERROR_COPY.analysisFailed),
          };
        }

        const fallback = await runFixtureFallbackForScenario(scenario);
        if (fallback.errorState) {
          throw {
            type: "ui-error",
            errorState: mappedError || fallback.errorState,
          };
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
          fallbackReason: getFallbackReasonForError(error),
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
      window.clearTimeout(slowTimer);
      if (state.runId !== currentRunId) return;
      state.analyzing = false;
      state.analyzingSlow = false;
      state.screen = "error";
      state.errorState =
        error && error.type === "ui-error" && error.errorState
          ? error.errorState
          : getErrorStateFromTemplate(ERROR_COPY.fixtureTimeout);
      render();
      return;
    }
    if (state.runId !== currentRunId) return;

    window.clearTimeout(slowTimer);
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
    state.analyzingSlow = false;
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
