const assert = require("assert");
const http = require("http");
const { spawn } = require("child_process");
const path = require("path");
const { chromium } = require("playwright");

const ROOT = path.resolve(__dirname, "..");

function wait(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

async function waitForServer(url, timeoutMs) {
  const startedAt = Date.now();
  while (Date.now() - startedAt < timeoutMs) {
    const ok = await new Promise((resolve) => {
      const req = http.get(url, (res) => {
        res.resume();
        resolve((res.statusCode || 500) < 500);
      });
      req.on("error", () => resolve(false));
      req.setTimeout(1000, () => {
        req.destroy();
        resolve(false);
      });
    });

    if (ok) return;
    await wait(250);
  }

  throw new Error(`Timed out waiting for server at ${url}`);
}

function startUiServer({ port, apiBaseUrl }) {
  const child = spawn(process.execPath, ["./scripts/dev.js", "--ui-only"], {
    cwd: ROOT,
    env: {
      ...process.env,
      UI_PORT: String(port),
      ...(apiBaseUrl ? { DEV_REMOTE_API_URL: apiBaseUrl } : {}),
    },
    stdio: "pipe",
  });

  child.stdout.on("data", (chunk) => process.stdout.write(chunk));
  child.stderr.on("data", (chunk) => process.stderr.write(chunk));
  return child;
}

async function stopUiServer(child) {
  if (!child) return;
  child.kill("SIGTERM");
  await wait(250);
  if (!child.killed) child.kill("SIGKILL");
}

async function withBrowser(fn) {
  const browser = await chromium.launch({ headless: true });
  try {
    await fn(browser);
  } finally {
    await browser.close();
  }
}

async function runHappyPathScenario() {
  const port = 8093;
  const baseUrl = `http://127.0.0.1:${port}`;
  const server = startUiServer({ port });

  try {
    await waitForServer(`${baseUrl}/healthz`, 15000);
    await withBrowser(async (browser) => {
      const page = await browser.newPage({ viewport: { width: 1440, height: 1100 } });
      await page.goto(baseUrl, { waitUntil: "networkidle" });

      await page.waitForSelector("h1");
      const heading = await page.locator("h1").textContent();
      assert(heading && heading.includes("Paste the page"), "Home hero did not render");

      await page.getByRole("button", { name: "View sample results" }).click();
      await page.waitForSelector("text=Polished design, fuzzy pitch");
      await page.waitForSelector("text=Top conversion blockers");
      await page.waitForSelector("text=Open Copy Lab");

      await page.setViewportSize({ width: 390, height: 844 });
      await page.waitForSelector(".mobile-action-bar");
      assert(await page.locator(".mobile-action-bar").isVisible(), "Mobile action bar is not visible");

      const faviconResponse = await page.request.get(`${baseUrl}/favicon.svg`);
      assert.strictEqual(faviconResponse.status(), 200, "Favicon did not load successfully");
    });
  } finally {
    await stopUiServer(server);
  }
}

async function runFallbackScenario() {
  const port = 8094;
  const baseUrl = `http://127.0.0.1:${port}`;
  const server = startUiServer({ port });

  try {
    await waitForServer(`${baseUrl}/healthz`, 15000);
    await withBrowser(async (browser) => {
      const page = await browser.newPage({ viewport: { width: 1280, height: 1000 } });
      await page.route(`${baseUrl}/api/**`, async (route) => {
        await route.abort("failed");
      });
      await page.goto(baseUrl, { waitUntil: "networkidle" });

      await page.getByRole("button", { name: "Use sample URL" }).click();
      await page.getByRole("button", { name: "Roast My Landing Page" }).click();

      await page.waitForSelector("text=API unavailable - showing local fixture", { timeout: 20000 });
      await page.waitForSelector("text=Top conversion blockers");

      const banner = page.locator("text=API unavailable - showing local fixture");
      assert(await banner.isVisible(), "Fallback warning banner did not appear");
      assert(
        await page.locator("text=Fixture fallback").first().isVisible(),
        "Fallback source badge did not render"
      );
    });
  } finally {
    await stopUiServer(server);
  }
}

async function runErrorScenario() {
  const port = 8095;
  const baseUrl = `http://127.0.0.1:${port}`;
  const server = startUiServer({ port });

  try {
    await waitForServer(`${baseUrl}/healthz`, 15000);
    await withBrowser(async (browser) => {
      const page = await browser.newPage({ viewport: { width: 1280, height: 1000 } });
      await page.route(`${baseUrl}/api/**`, async (route) => {
        await route.abort("failed");
      });
      await page.goto(baseUrl, { waitUntil: "networkidle" });

      await page.getByRole("button", { name: "Use sample URL" }).click();
      await page.locator('input[name="url"]').fill("https://example.com/blocked");
      await page.getByRole("button", { name: "Roast My Landing Page" }).click();

      await page.waitForSelector("text=We could not access that page", { timeout: 20000 });
      await page.waitForSelector("text=Page access blocked");

      assert(
        await page.locator("text=The page appears to be behind login, bot protection, or a permission gate").isVisible(),
        "Blocked error message did not render"
      );
      assert(
        await page.getByRole("button", { name: "Try another URL" }).isVisible(),
        "Blocked error primary action did not render"
      );
    });
  } finally {
    await stopUiServer(server);
  }
}

async function run() {
  await runHappyPathScenario();
  await runFallbackScenario();
  await runErrorScenario();
  console.log("Smoke tests passed.");
}

run().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
