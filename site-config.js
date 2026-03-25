// Deployed static hosts should call the Render API directly instead of relying on /api proxying.
(function configureRoastApiBase() {
  var host = window.location.hostname || "";
  if (host === "localhost" || host === "127.0.0.1") return;
  window.ROAST_API_BASE_URL = "https://roast-landingpage-api.onrender.com";
})();
