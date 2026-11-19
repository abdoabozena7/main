import assert from "node:assert/strict";
import { createRequire } from "node:module";
import { mkdir, readFile, writeFile } from "node:fs/promises";
import { gzipSync } from "node:zlib";
import path from "node:path";

const require = createRequire(import.meta.url);
const { chromium } = require(process.env.PLAYWRIGHT_MODULE || "C:\\Users\\A-plus\\.cache\\codex-runtimes\\codex-primary-runtime\\dependencies\\node\\node_modules\\playwright");
const url = process.env.PORTFOLIO_URL || "http://127.0.0.1:4182/main/";
const out = process.env.PROVE_IT_OUTPUT_DIR || path.join("output", "playwright", "scroll-startup");
await mkdir(out, { recursive: true });
const html = await readFile(path.join("dist", "index.html"), "utf8");
const entry = html.match(/assets\/index-[\w-]+\.js/)[0];
const bytes = await readFile(path.join("dist", entry));
const report = {
  url, entry, entryBytes: bytes.length, entryGzip: gzipSync(bytes).length,
  conditions: "Fresh Edge contexts; 4x CPU, 150ms network latency and 500kb/s. Actual renderer JS/CSS held, not replaced. A temporary tall DOM surface tests native early gestures before real UI exists.",
  checks: [], errors: [], passed: false,
};
const check = (name, passed, evidence) => {
  report.checks.push({ name, passed: Boolean(passed), evidence });
  assert.ok(passed, name);
  console.log(`PASS ${name}`);
};
const browser = await chromium.launch({ channel: "msedge", headless: true });
try {
  check("critical entry stays below 8KB gzip and 25KB raw", report.entryGzip < 8192 && bytes.length < 25600, { raw: bytes.length, gzip: report.entryGzip });
  for (const width of [1440, 390]) {
    const context = await browser.newContext({ viewport: { width, height: 900 }, isMobile: width === 390, hasTouch: width === 390 });
    let release;
    const gate = new Promise(resolve => { release = resolve; });
    try {
      await context.route(/\/assets\/renderApp-[^/]+\.(js|css)$/, async route => { await gate; await route.continue(); });
      const page = await context.newPage();
      page.setDefaultTimeout(20000);
      page.on("pageerror", error => report.errors.push(error.message));
      const client = await context.newCDPSession(page);
      await client.send("Emulation.setCPUThrottlingRate", { rate: 4 });
      await client.send("Network.enable");
      await client.send("Network.emulateNetworkConditions", { offline: false, latency: 150, downloadThroughput: 62500, uploadThroughput: 62500 });
      await page.addInitScript(() => {
        window.guardRegistrations = 0;
        const listen = window.addEventListener.bind(window);
        window.addEventListener = (name, callback, options) => {
          if (name === "wheel" && options?.passive === false) window.guardRegistrations++;
          return listen(name, callback, options);
        };
        new MutationObserver(() => {
          if (!document.querySelector("h1") || window.firstPortfolioFrame !== undefined) return;
          window.firstPortfolioFrame = null;
          requestAnimationFrame(() => {
            window.firstPortfolioFrame = {
              guard: performance.getEntriesByName("portfolio:scroll-guard-ready").length,
              fluid: performance.getEntriesByName("portfolio:fluid-ready").length,
              chapters: performance.getEntriesByName("portfolio:chapter-tracker-ready").length,
            };
          });
        }).observe(document, { childList: true, subtree: true });
      });
      await page.goto(url, { waitUntil: "domcontentloaded" });
      await page.waitForFunction(() => performance.getEntriesByName("portfolio:scroll-guard-ready").length === 1);
      const ready = await page.evaluate(() => ({
        guardMs: performance.getEntriesByName("portfolio:scroll-guard-ready")[0].startTime,
        rendererPresent: !!document.querySelector("h1"),
        listeners: window.guardRegistrations,
      }));
      check(`${width}: protection starts while renderer is still unavailable`, !ready.rendererPresent && ready.listeners === 1, ready);
      await page.evaluate(() => {
        const surface = document.createElement("div");
        surface.id = "startup-gesture-surface";
        surface.style.height = "6000px";
        document.body.append(surface);
        scrollTo({ top: 2200, behavior: "instant" });
      });
      await page.mouse.move(width - 30, 500);
      await page.mouse.wheel(0, 500);
      await page.waitForTimeout(100);
      const wheelY = await page.evaluate(() => scrollY);
      check(`${width}: a placeholder with no chapters cannot trigger a blind reversal`, wheelY >= 2650, { from: 2200, to: wheelY });
      if (width === 390) {
        await page.evaluate(() => scrollTo({ top: 2200, behavior: "instant" }));
        await client.send("Input.dispatchTouchEvent", { type: "touchStart", touchPoints: [{ x: 195, y: 700 }] });
        await page.waitForTimeout(16);
        await client.send("Input.dispatchTouchEvent", { type: "touchMove", touchPoints: [{ x: 195, y: 350 }] });
        check("390: first held swipe still travels forward before sections exist", await page.evaluate(() => scrollY) > 2500);
        await client.send("Input.dispatchTouchEvent", { type: "touchEnd", touchPoints: [] });
        await page.waitForTimeout(750);
      }
      await page.locator("#startup-gesture-surface").evaluate(node => node.remove());
      await page.evaluate(() => scrollTo({ top: 0, behavior: "instant" }));
      release();
      await page.getByRole("heading", { level: 1 }).waitFor({ timeout: 60000 });
      await page.waitForFunction(() => window.firstPortfolioFrame !== null);
      const mounted = await page.evaluate(() => ({ frame: window.firstPortfolioFrame, listeners: window.guardRegistrations }));
      check(`${width}: guard, fluid input and chapter tracking are ready by first portfolio frame`,
        mounted.frame?.guard === 1 && mounted.frame?.fluid === 1 && mounted.frame?.chapters === 1, mounted);
      check(`${width}: mounting does not install a duplicate guard`, mounted.listeners === 1, mounted);
    } finally { release(); await context.close(); }
  }
  check("no browser runtime errors", report.errors.length === 0, report.errors);
  report.passed = true;
} catch (error) {
  report.failure = error.stack;
  console.error(error);
  process.exitCode = 1;
} finally {
  await browser.close();
  await writeFile(path.join(out, "report.json"), JSON.stringify(report, null, 2));
}
