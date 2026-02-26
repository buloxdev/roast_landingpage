"use strict";

/**
 * Lightweight runtime validation for the frozen pass2 UI payload.
 * This is intentionally schema-aligned (not a full JSON Schema engine) so the
 * frontend can guard rendering and fall back safely before DOM work.
 */

(function (root, factory) {
  if (typeof module === "object" && module.exports) {
    module.exports = factory();
    return;
  }

  root.Pass2Validation = factory();
})(typeof globalThis !== "undefined" ? globalThis : window, function () {
  var SCORE_CATEGORIES = [
    "Clarity of offer",
    "Target audience clarity",
    "Headline strength",
    "CTA quality",
    "Messaging / differentiation",
    "Trust / proof",
    "Structure / hierarchy",
    "Objection handling",
    "Mobile experience"
  ];

  var ALLOWED_TOP_KEYS = [
    "header",
    "summary_panel",
    "tabs",
    "issue_cards",
    "score_section",
    "quick_wins_section",
    "rewrite_pack_section",
    "mobile_section",
    "positives_section",
    "share_card_copy",
    "footer"
  ];

  var REQUIRED_TOP_KEYS = ALLOWED_TOP_KEYS.slice();

  function isObject(value) {
    return !!value && typeof value === "object" && !Array.isArray(value);
  }

  function isInteger(value) {
    return Number.isInteger(value);
  }

  function isNonEmptyString(value) {
    return typeof value === "string" && value.trim().length > 0;
  }

  function pushError(errors, path, message) {
    errors.push({ path: path, message: message });
  }

  function requireObject(errors, value, path) {
    if (!isObject(value)) {
      pushError(errors, path, "must be an object");
      return false;
    }
    return true;
  }

  function requireString(errors, value, path, opts) {
    if (!isNonEmptyString(value)) {
      pushError(errors, path, "must be a non-empty string");
      return false;
    }

    if (opts && isInteger(opts.maxLength) && value.length > opts.maxLength) {
      pushError(errors, path, "must be at most " + opts.maxLength + " chars");
      return false;
    }

    return true;
  }

  function requireInteger(errors, value, path, min, max) {
    if (!isInteger(value)) {
      pushError(errors, path, "must be an integer");
      return false;
    }
    if (typeof min === "number" && value < min) {
      pushError(errors, path, "must be >= " + min);
      return false;
    }
    if (typeof max === "number" && value > max) {
      pushError(errors, path, "must be <= " + max);
      return false;
    }
    return true;
  }

  function requireEnum(errors, value, path, allowed) {
    if (allowed.indexOf(value) === -1) {
      pushError(errors, path, "must be one of: " + allowed.join(", "));
      return false;
    }
    return true;
  }

  function requireArray(errors, value, path, minItems, maxItems) {
    if (!Array.isArray(value)) {
      pushError(errors, path, "must be an array");
      return false;
    }
    if (typeof minItems === "number" && value.length < minItems) {
      pushError(errors, path, "must contain at least " + minItems + " items");
      return false;
    }
    if (typeof maxItems === "number" && value.length > maxItems) {
      pushError(errors, path, "must contain at most " + maxItems + " items");
      return false;
    }
    return true;
  }

  function requireExactKeys(errors, value, path, allowedKeys, requiredKeys) {
    if (!requireObject(errors, value, path)) return false;

    var keys = Object.keys(value);
    var i;

    for (i = 0; i < requiredKeys.length; i += 1) {
      if (!(requiredKeys[i] in value)) {
        pushError(errors, path + "." + requiredKeys[i], "is required");
      }
    }

    for (i = 0; i < keys.length; i += 1) {
      if (allowedKeys.indexOf(keys[i]) === -1) {
        pushError(errors, path + "." + keys[i], "is not allowed");
      }
    }

    return true;
  }

  function validateHeader(errors, header) {
    if (
      !requireExactKeys(errors, header, "header", [
        "eyebrow",
        "title",
        "subtitle",
        "score_label",
        "score_value",
        "score_band",
        "verdict_chip"
      ], [
        "eyebrow",
        "title",
        "subtitle",
        "score_label",
        "score_value",
        "score_band",
        "verdict_chip"
      ])
    ) {
      return;
    }

    requireString(errors, header.eyebrow, "header.eyebrow");
    requireString(errors, header.title, "header.title");
    requireString(errors, header.subtitle, "header.subtitle");
    requireString(errors, header.score_label, "header.score_label");
    requireInteger(errors, header.score_value, "header.score_value", 0, 100);
    requireString(errors, header.score_band, "header.score_band");
    requireString(errors, header.verdict_chip, "header.verdict_chip");
  }

  function validateSummary(errors, summary) {
    if (
      !requireExactKeys(errors, summary, "summary_panel", [
        "one_liner",
        "top_problems_title",
        "top_3_problems",
        "cta_hint"
      ], [
        "one_liner",
        "top_problems_title",
        "top_3_problems",
        "cta_hint"
      ])
    ) {
      return;
    }

    requireString(errors, summary.one_liner, "summary_panel.one_liner");
    requireString(errors, summary.top_problems_title, "summary_panel.top_problems_title");
    if (requireArray(errors, summary.top_3_problems, "summary_panel.top_3_problems", 3, 3)) {
      for (var i = 0; i < summary.top_3_problems.length; i += 1) {
        requireString(errors, summary.top_3_problems[i], "summary_panel.top_3_problems[" + i + "]");
      }
    }
    requireString(errors, summary.cta_hint, "summary_panel.cta_hint");
  }

  function validateTabs(errors, tabs) {
    if (!requireArray(errors, tabs, "tabs", 5)) return;

    for (var i = 0; i < tabs.length; i += 1) {
      var tab = tabs[i];
      if (
        !requireExactKeys(errors, tab, "tabs[" + i + "]", ["id", "label"], ["id", "label"])
      ) {
        continue;
      }
      requireString(errors, tab.id, "tabs[" + i + "].id");
      requireString(errors, tab.label, "tabs[" + i + "].label");
    }
  }

  function validateEvidence(errors, evidence, path) {
    if (!requireArray(errors, evidence, path, 1)) return;

    for (var i = 0; i < evidence.length; i += 1) {
      var item = evidence[i];
      if (
        !requireExactKeys(errors, item, path + "[" + i + "]", ["type", "value"], ["type", "value"])
      ) {
        continue;
      }
      if (typeof item.type !== "string") {
        pushError(errors, path + "[" + i + "].type", "must be a string");
      } else {
        requireEnum(errors, item.type, path + "[" + i + "].type", ["quote", "ui_observation"]);
      }
      requireString(errors, item.value, path + "[" + i + "].value");
    }
  }

  function validateIssueCards(errors, cards) {
    if (!requireArray(errors, cards, "issue_cards", 1, 5)) return;

    var seenRanks = Object.create(null);

    for (var i = 0; i < cards.length; i += 1) {
      var card = cards[i];
      var base = "issue_cards[" + i + "]";
      if (
        !requireExactKeys(errors, card, base, [
          "rank",
          "category",
          "title",
          "impact_badge",
          "confidence_badge",
          "problem",
          "why_it_hurts",
          "evidence_label",
          "evidence",
          "fix_label",
          "fix",
          "rewrite_label",
          "example_rewrite"
        ], [
          "rank",
          "category",
          "title",
          "impact_badge",
          "confidence_badge",
          "problem",
          "why_it_hurts",
          "evidence_label",
          "evidence",
          "fix_label",
          "fix",
          "rewrite_label",
          "example_rewrite"
        ])
      ) {
        continue;
      }

      if (requireInteger(errors, card.rank, base + ".rank", 1, 5)) {
        if (seenRanks[card.rank]) {
          pushError(errors, base + ".rank", "rank must be unique");
        }
        seenRanks[card.rank] = true;
      }
      requireString(errors, card.category, base + ".category");
      requireString(errors, card.title, base + ".title");
      if (typeof card.impact_badge !== "string") {
        pushError(errors, base + ".impact_badge", "must be a string");
      } else {
        requireEnum(errors, card.impact_badge, base + ".impact_badge", ["High", "Medium", "Low"]);
      }
      if (typeof card.confidence_badge !== "string") {
        pushError(errors, base + ".confidence_badge", "must be a string");
      } else {
        requireEnum(errors, card.confidence_badge, base + ".confidence_badge", ["High", "Medium", "Low"]);
      }
      requireString(errors, card.problem, base + ".problem");
      requireString(errors, card.why_it_hurts, base + ".why_it_hurts");
      requireString(errors, card.evidence_label, base + ".evidence_label");
      validateEvidence(errors, card.evidence, base + ".evidence");
      requireString(errors, card.fix_label, base + ".fix_label");
      requireString(errors, card.fix, base + ".fix");
      requireString(errors, card.rewrite_label, base + ".rewrite_label");
      if (typeof card.example_rewrite !== "string") {
        pushError(errors, base + ".example_rewrite", "must be a string (can be empty)");
      }
    }
  }

  function validateScoreSection(errors, section) {
    if (
      !requireExactKeys(errors, section, "score_section", ["title", "items"], ["title", "items"])
    ) {
      return;
    }

    requireString(errors, section.title, "score_section.title");
    if (!requireArray(errors, section.items, "score_section.items", 9, 9)) return;

    var seenCategories = Object.create(null);
    for (var i = 0; i < section.items.length; i += 1) {
      var item = section.items[i];
      var base = "score_section.items[" + i + "]";
      if (
        !requireExactKeys(errors, item, base, [
          "category",
          "score",
          "weight",
          "display_score",
          "note"
        ], [
          "category",
          "score",
          "weight",
          "display_score",
          "note"
        ])
      ) {
        continue;
      }

      if (typeof item.category !== "string") {
        pushError(errors, base + ".category", "must be a string");
      } else if (requireEnum(errors, item.category, base + ".category", SCORE_CATEGORIES)) {
        if (seenCategories[item.category]) {
          pushError(errors, base + ".category", "category must be unique");
        }
        seenCategories[item.category] = true;
      }
      requireInteger(errors, item.score, base + ".score", 0, 10);
      requireEnum(errors, item.weight, base + ".weight", [20, 10, 15, 5]);
      requireString(errors, item.display_score, base + ".display_score");
      requireString(errors, item.note, base + ".note");
    }
  }

  function validateStringListSection(errors, section, path, titleKey, extraKeys, listKey, min, max) {
    var allowed = [titleKey, listKey].concat(extraKeys || []);
    var required = [titleKey, listKey].concat(extraKeys || []);
    if (!requireExactKeys(errors, section, path, allowed, required)) return;

    requireString(errors, section[titleKey], path + "." + titleKey);
    for (var i = 0; i < (extraKeys || []).length; i += 1) {
      requireString(errors, section[extraKeys[i]], path + "." + extraKeys[i]);
    }
    if (requireArray(errors, section[listKey], path + "." + listKey, min, max)) {
      for (var j = 0; j < section[listKey].length; j += 1) {
        requireString(errors, section[listKey][j], path + "." + listKey + "[" + j + "]");
      }
    }
  }

  function validateRewritePack(errors, section) {
    if (
      !requireExactKeys(errors, section, "rewrite_pack_section", [
        "title",
        "headline_options_label",
        "headlines",
        "subheadline_options_label",
        "subheadlines",
        "cta_options_label",
        "ctas"
      ], [
        "title",
        "headline_options_label",
        "headlines",
        "subheadline_options_label",
        "subheadlines",
        "cta_options_label",
        "ctas"
      ])
    ) {
      return;
    }

    requireString(errors, section.title, "rewrite_pack_section.title");
    requireString(errors, section.headline_options_label, "rewrite_pack_section.headline_options_label");
    requireString(errors, section.subheadline_options_label, "rewrite_pack_section.subheadline_options_label");
    requireString(errors, section.cta_options_label, "rewrite_pack_section.cta_options_label");

    if (requireArray(errors, section.headlines, "rewrite_pack_section.headlines", 3, 3)) {
      for (var i = 0; i < section.headlines.length; i += 1) {
        requireString(errors, section.headlines[i], "rewrite_pack_section.headlines[" + i + "]");
      }
    }
    if (requireArray(errors, section.subheadlines, "rewrite_pack_section.subheadlines", 2, 2)) {
      for (var j = 0; j < section.subheadlines.length; j += 1) {
        requireString(errors, section.subheadlines[j], "rewrite_pack_section.subheadlines[" + j + "]");
      }
    }
    if (requireArray(errors, section.ctas, "rewrite_pack_section.ctas", 5, 5)) {
      for (var k = 0; k < section.ctas.length; k += 1) {
        requireString(errors, section.ctas[k], "rewrite_pack_section.ctas[" + k + "]");
      }
    }
  }

  function validateMobile(errors, section) {
    if (
      !requireExactKeys(errors, section, "mobile_section", ["title", "score_label", "score", "findings"], [
        "title",
        "score_label",
        "score",
        "findings"
      ])
    ) {
      return;
    }
    requireString(errors, section.title, "mobile_section.title");
    requireString(errors, section.score_label, "mobile_section.score_label");
    requireInteger(errors, section.score, "mobile_section.score", 0, 10);
    if (requireArray(errors, section.findings, "mobile_section.findings", 1)) {
      for (var i = 0; i < section.findings.length; i += 1) {
        requireString(errors, section.findings[i], "mobile_section.findings[" + i + "]");
      }
    }
  }

  function validateShareCard(errors, section) {
    if (
      !requireExactKeys(errors, section, "share_card_copy", [
        "title",
        "quote",
        "score_text",
        "top_issues",
        "footer_cta"
      ], [
        "title",
        "quote",
        "score_text",
        "top_issues",
        "footer_cta"
      ])
    ) {
      return;
    }

    requireString(errors, section.title, "share_card_copy.title");
    requireString(errors, section.quote, "share_card_copy.quote", { maxLength: 140 });
    requireString(errors, section.score_text, "share_card_copy.score_text");
    if (requireArray(errors, section.top_issues, "share_card_copy.top_issues", 3, 3)) {
      for (var i = 0; i < section.top_issues.length; i += 1) {
        requireString(errors, section.top_issues[i], "share_card_copy.top_issues[" + i + "]");
      }
    }
    requireString(errors, section.footer_cta, "share_card_copy.footer_cta");
  }

  function validateFooter(errors, footer) {
    if (
      !requireExactKeys(errors, footer, "footer", ["disclaimer", "rerun_cta"], [
        "disclaimer",
        "rerun_cta"
      ])
    ) {
      return;
    }
    requireString(errors, footer.disclaimer, "footer.disclaimer");
    requireString(errors, footer.rerun_cta, "footer.rerun_cta");
  }

  function validatePass2Payload(payload, options) {
    var errors = [];
    var maxErrors = isInteger(options && options.maxErrors) ? options.maxErrors : 100;

    if (!requireExactKeys(errors, payload, "$", ALLOWED_TOP_KEYS, REQUIRED_TOP_KEYS)) {
      return { ok: false, errors: errors, errorCount: errors.length };
    }

    validateHeader(errors, payload.header);
    validateSummary(errors, payload.summary_panel);
    validateTabs(errors, payload.tabs);
    validateIssueCards(errors, payload.issue_cards);
    validateScoreSection(errors, payload.score_section);
    validateStringListSection(
      errors,
      payload.quick_wins_section,
      "quick_wins_section",
      "title",
      ["subtitle"],
      "items",
      3,
      5
    );
    validateRewritePack(errors, payload.rewrite_pack_section);
    validateMobile(errors, payload.mobile_section);
    validateStringListSection(
      errors,
      payload.positives_section,
      "positives_section",
      "title",
      [],
      "items",
      2,
      4
    );
    validateShareCard(errors, payload.share_card_copy);
    validateFooter(errors, payload.footer);

    if (errors.length > maxErrors) {
      errors = errors.slice(0, maxErrors);
      pushError(errors, "$", "error list truncated at " + maxErrors);
    }

    return {
      ok: errors.length === 0,
      errors: errors,
      errorCount: errors.length
    };
  }

  /**
   * Returns the first valid payload (candidate preferred, then fallback).
   * Intended for fixture/API boundary handling before UI render.
   */
  function choosePass2Payload(candidatePayload, fallbackPayload, options) {
    var candidateValidation = validatePass2Payload(candidatePayload, options);
    if (candidateValidation.ok) {
      return {
        ok: true,
        payload: candidatePayload,
        source: "candidate",
        usedFallback: false,
        validation: candidateValidation,
        fallbackValidation: null
      };
    }

    var fallbackValidation = validatePass2Payload(fallbackPayload, options);
    if (fallbackValidation.ok) {
      return {
        ok: true,
        payload: fallbackPayload,
        source: "fallback",
        usedFallback: true,
        validation: candidateValidation,
        fallbackValidation: fallbackValidation
      };
    }

    return {
      ok: false,
      payload: null,
      source: "none",
      usedFallback: false,
      validation: candidateValidation,
      fallbackValidation: fallbackValidation
    };
  }

  function normalizeFixtureKind(kind, allowedKinds, defaultKind) {
    var fallbackKind = defaultKind || "sample";
    if (!Array.isArray(allowedKinds) || allowedKinds.length === 0) {
      return fallbackKind;
    }
    if (typeof kind !== "string") return fallbackKind;
    return allowedKinds.indexOf(kind) >= 0 ? kind : fallbackKind;
  }

  return {
    SCORE_CATEGORIES: SCORE_CATEGORIES.slice(),
    validatePass2Payload: validatePass2Payload,
    choosePass2Payload: choosePass2Payload,
    normalizeFixtureKind: normalizeFixtureKind
  };
});

