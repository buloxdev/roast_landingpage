"use strict";

(function (window) {
  if (!window || typeof window.fetch !== "function") return;

  var validationApi = window.Pass2Validation;
  if (!validationApi || typeof validationApi.choosePass2Payload !== "function") {
    console.warn("[pass2-boundary] Pass2Validation not found; boundary checks disabled.");
    return;
  }

  var originalFetch = window.fetch.bind(window);
  var SAMPLE_FIXTURE_URL = "./fixtures/pass2-ui.sample.json";
  var PASS2_FIXTURE_RE = /(?:^|\/)fixtures\/pass2-ui\.[^/]+\.json(?:[?#].*)?$/i;
  var handlingFallback = false;

  function isPass2FixtureRequest(input) {
    var url = typeof input === "string" ? input : input && input.url;
    if (typeof url !== "string") return false;
    return PASS2_FIXTURE_RE.test(url);
  }

  async function fetchJsonWithOriginalFetch(url, init) {
    var response = await originalFetch(url, init);
    if (!response.ok) {
      throw new Error("fallback fixture status " + response.status);
    }
    return response.json();
  }

  function jsonResponseLike(sourceResponse, payload) {
    var headers = new Headers(sourceResponse && sourceResponse.headers ? sourceResponse.headers : {});
    if (!headers.has("content-type")) {
      headers.set("content-type", "application/json");
    }

    return new Response(JSON.stringify(payload), {
      status: sourceResponse && sourceResponse.status ? sourceResponse.status : 200,
      statusText: sourceResponse && sourceResponse.statusText ? sourceResponse.statusText : "OK",
      headers: headers
    });
  }

  window.fetch = async function patchedFetch(input, init) {
    var response = await originalFetch(input, init);

    if (!isPass2FixtureRequest(input) || handlingFallback) {
      return response;
    }

    try {
      var candidatePayload = await response.clone().json();
      var fallbackPayload = await fetchJsonWithOriginalFetch(SAMPLE_FIXTURE_URL, { cache: "no-store" });
      var choice = validationApi.choosePass2Payload(candidatePayload, fallbackPayload);

      if (!choice.ok) {
        console.warn("[pass2-boundary] Candidate and fallback fixtures failed validation.", {
          candidateErrors: choice.validation && choice.validation.errors,
          fallbackErrors: choice.fallbackValidation && choice.fallbackValidation.errors
        });
        return response;
      }

      if (choice.usedFallback) {
        console.warn("[pass2-boundary] Invalid pass2 fixture payload. Using sample fixture fallback.", {
          candidateErrors: choice.validation && choice.validation.errors
        });
        return jsonResponseLike(response, choice.payload);
      }

      return response;
    } catch (error) {
      if (response && response.ok) {
        console.warn("[pass2-boundary] Pass2 fixture validation skipped due to parse/fallback error.", error);
      }

      try {
        handlingFallback = true;
        var recoveryPayload = await fetchJsonWithOriginalFetch(SAMPLE_FIXTURE_URL, { cache: "no-store" });
        var recoveryValidation = validationApi.validatePass2Payload(recoveryPayload);
        if (recoveryValidation.ok) {
          console.warn("[pass2-boundary] Recovered with validated sample fixture fallback after error.", error);
          return jsonResponseLike(response, recoveryPayload);
        }
      } catch (fallbackError) {
        console.warn("[pass2-boundary] Sample fixture fallback recovery failed.", fallbackError);
      } finally {
        handlingFallback = false;
      }

      return response;
    }
  };
})(typeof window !== "undefined" ? window : null);

