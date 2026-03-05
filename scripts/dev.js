const http = require("http");
const https = require("https");
const fs = require("fs");
const path = require("path");
const { spawn } = require("child_process");

const ROOT = path.resolve(__dirname, "..");

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

loadEnvFile(path.join(ROOT, ".env"));
loadEnvFile(path.join(ROOT, ".env.local"));

const UI_PORT = Number(process.env.UI_PORT || 8091);
const LOCAL_API_PORT = Number(process.env.PORT || 8788);
const UI_ONLY = process.argv.includes("--ui-only");
const USE_LOCAL_API = process.argv.includes("--local-api");
const REMOTE_API_URL = String(
  process.env.DEV_REMOTE_API_URL || "https://roast-landingpage-api.onrender.com"
).replace(/\/+$/, "");

const MIME_TYPES = {
  ".html": "text/html; charset=utf-8",
  ".js": "application/javascript; charset=utf-8",
  ".css": "text/css; charset=utf-8",
  ".json": "application/json; charset=utf-8",
  ".svg": "image/svg+xml",
  ".png": "image/png",
  ".jpg": "image/jpeg",
  ".jpeg": "image/jpeg",
  ".ico": "image/x-icon",
  ".txt": "text/plain; charset=utf-8",
};

function send(res, status, body, contentType = "text/plain; charset=utf-8") {
  const payload = Buffer.isBuffer(body) ? body : Buffer.from(String(body));
  res.writeHead(status, {
    "Content-Type": contentType,
    "Content-Length": payload.length,
    "Cache-Control": "no-store",
  });
  res.end(payload);
}

function resolveFilePath(urlPathname) {
  const cleanPath = decodeURIComponent(urlPathname.split("?")[0]);
  const relativePath = cleanPath === "/" ? "/index.html" : cleanPath;
  const absolutePath = path.normalize(path.join(ROOT, relativePath));
  if (!absolutePath.startsWith(ROOT)) return null;
  return absolutePath;
}

function proxyRequest(req, res, targetBaseUrl) {
  const targetUrl = new URL((req.url || "").replace(/^\/api/, ""), targetBaseUrl);
  const transport = targetUrl.protocol === "https:" ? https : http;

  const proxyReq = transport.request(
    targetUrl,
    {
      method: req.method,
      headers: {
        ...req.headers,
        host: targetUrl.host,
      },
    },
    (proxyRes) => {
      res.writeHead(proxyRes.statusCode || 502, proxyRes.headers);
      proxyRes.pipe(res);
    }
  );

  proxyReq.on("error", (error) => {
    send(res, 502, `API proxy failed: ${error.message}`);
  });

  req.pipe(proxyReq);
}

function createUiServer(getApiTarget) {
  return http.createServer((req, res) => {
    const url = req.url || "/";

    if (url === "/healthz") {
      send(res, 200, JSON.stringify({ ok: true }), "application/json; charset=utf-8");
      return;
    }

    if (url.startsWith("/api/")) {
      proxyRequest(req, res, getApiTarget());
      return;
    }

    const targetPath = resolveFilePath(url);
    if (!targetPath) {
      send(res, 403, "Forbidden");
      return;
    }

    fs.stat(targetPath, (statError, stats) => {
      if (statError || !stats.isFile()) {
        send(res, 404, "Not Found");
        return;
      }

      const ext = path.extname(targetPath).toLowerCase();
      const contentType = MIME_TYPES[ext] || "application/octet-stream";
      fs.readFile(targetPath, (readError, data) => {
        if (readError) {
          send(res, 500, "Failed to read file");
          return;
        }
        send(res, 200, data, contentType);
      });
    });
  });
}

function startApiProcess() {
  const child = spawn(process.execPath, ["server.js"], {
    cwd: ROOT,
    env: {
      ...process.env,
      PORT: String(LOCAL_API_PORT),
    },
    stdio: "inherit",
  });

  child.on("exit", (code, signal) => {
    if (signal) {
      console.log(`[dev] Local API exited via signal ${signal}`);
      return;
    }
    if (code !== 0) {
      console.log(`[dev] Local API exited with code ${code}`);
    }
  });

  return child;
}

const localApiTarget = `http://127.0.0.1:${LOCAL_API_PORT}`;
const shouldRunLocalApi = !UI_ONLY && USE_LOCAL_API && Boolean(process.env.OPENAI_API_KEY);
const apiTarget = shouldRunLocalApi ? localApiTarget : REMOTE_API_URL;

const uiServer = createUiServer(() => apiTarget);
let apiProcess = null;

uiServer.on("error", (error) => {
  if (error && error.code === "EADDRINUSE") {
    console.error(
      `[dev] Port ${UI_PORT} is already in use. Run this project with a different port, for example: UI_PORT=8092 PORT=8789 npm run dev`
    );
    process.exit(1);
  }

  console.error("[dev] UI server failed to start:", error);
  process.exit(1);
});

uiServer.listen(UI_PORT, "127.0.0.1", () => {
  console.log(`[dev] UI server running at http://127.0.0.1:${UI_PORT}`);
  if (UI_ONLY) {
    console.log(`[dev] UI-only mode enabled. API requests proxy to ${REMOTE_API_URL}`);
    return;
  }

  if (shouldRunLocalApi) {
    console.log(`[dev] Starting local API on http://127.0.0.1:${LOCAL_API_PORT}`);
    console.log(`[dev] Browser requests proxy to ${apiTarget}`);
    apiProcess = startApiProcess();
    return;
  }

  if (USE_LOCAL_API && !process.env.OPENAI_API_KEY) {
    console.log(
      `[dev] --local-api requested without OPENAI_API_KEY. Proxying to ${REMOTE_API_URL} instead.`
    );
    return;
  }

  console.log(`[dev] API requests proxy to ${REMOTE_API_URL}`);
  console.log(`[dev] Use npm run dev:local-api only when you want to test the backend locally.`);
});

function shutdown() {
  if (apiProcess && !apiProcess.killed) {
    apiProcess.kill("SIGTERM");
  }
  uiServer.close(() => {
    process.exit(0);
  });
}

process.on("SIGINT", shutdown);
process.on("SIGTERM", shutdown);
