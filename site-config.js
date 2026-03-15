// GitHub Pages cannot proxy /api requests, so point that host directly at Render.
(function configureRoastApiBase() {
  var host = window.location.hostname || "";
  if (host === "localhost" || host === "127.0.0.1") return;
  if (!host.endsWith("github.io")) return;
  window.ROAST_API_BASE_URL = "https://roast-landingpage-api.onrender.com";
})();
