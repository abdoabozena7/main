import assert from "node:assert/strict";
import { createRequire } from "node:module";
import { mkdir, writeFile } from "node:fs/promises";
import path from "node:path";

const require = createRequire(import.meta.url);
const { chromium } = require(process.env.PLAYWRIGHT_MODULE || "C:\\Users\\A-plus\\.cache\\codex-runtimes\\codex-primary-runtime\\dependencies\\node\\node_modules\\playwright");
const url = process.env.PORTFOLIO_URL || "http://127.0.0.1:4184/main/";
const out = process.env.PROVE_IT_OUTPUT_DIR || path.join("output", "playwright", "viewport-feedback");
await mkdir(out, { recursive: true });
const report = { url, checks: [], errors: [], passed: false };
const check = (name, passed, evidence) => {
  report.checks.push({ name, passed: Boolean(passed), evidence });
  assert.ok(passed, name);
  console.log(`PASS ${name}`);
};
const browser = await chromium.launch({ channel: "msedge", headless: true });
try {
  for (const width of [1440, 390]) {
    const context = await browser.newContext({ viewport: { width, height: 900 }, hasTouch: width === 390, isMobile: width === 390 });
    try {
      await context.addInitScript(() => {
        document.hasFocus = () => false;
        window.testPageHidden = false;
        Object.defineProperty(document, "hidden", { configurable: true, get: () => window.testPageHidden });
      });
      const page = await context.newPage();
      page.setDefaultTimeout(15000);
      page.on("pageerror", error => report.errors.push(error.message));
      await page.goto(new URL("#experience", url).href, { waitUntil: "domcontentloaded" });
      const row = page.locator('[data-attention-id="experience-microsoft"]');
      await row.waitFor();
      await page.waitForFunction(() => {
        const rect = document.querySelector('[data-attention-id="experience-microsoft"]').getBoundingClientRect();
        return rect.top >= 76 && rect.bottom < innerHeight - 56;
      });
      const at = Date.now();
      await page.waitForFunction(() => document.querySelector('[data-attention-id="experience-microsoft"]').hasAttribute("data-viewport-active"), null, { timeout: 350 });
      const early = await row.evaluate(node => ({ quality: Number(node.dataset.quality), complete: node.dataset.explorationComplete, active: node.hasAttribute("data-viewport-active") }));
      check(`${width}: visible Experience is detected within 350ms despite hasFocus=false`, early.active && Date.now() - at <= 350, early);
      check(`${width}: immediate feedback does not pretend the story was fully read`, early.complete !== "true" && early.quality < 95, early);
      await page.waitForFunction(() => {
        const image = document.querySelector('[data-attention-id="experience-microsoft"] .company-logo img');
        const filter = getComputedStyle(image).filter;
        const outline = document.querySelector('[data-attention-id="experience-microsoft"] .company-evidence-progress');
        return (filter === "none" || filter.includes("grayscale(0)")) && parseFloat(getComputedStyle(outline).strokeDashoffset) < .05;
      }, null, { timeout: 500 });
      const outline = await row.locator(".company-evidence-progress").evaluate(node => parseFloat(getComputedStyle(node).strokeDashoffset));
      check(`${width}: visible company color and outline respond without a reading delay`, outline < .05, outline);
      await page.screenshot({ path: path.join(out, `${width}-experience-active.png`) });
      await page.evaluate(() => { window.testPageHidden = true; document.dispatchEvent(new Event("visibilitychange")); });
      check(`${width}: hidden page clears active feedback`, await row.evaluate(node => !node.hasAttribute("data-viewport-active")));
      const hiddenCredit = await row.getAttribute("data-quality");
      await page.waitForTimeout(400);
      check(`${width}: hidden page earns no exposure`, await row.getAttribute("data-quality") === hiddenCredit);
      await page.evaluate(() => { window.testPageHidden = false; document.dispatchEvent(new Event("visibilitychange")); });
      await page.waitForFunction(() => document.querySelector('[data-attention-id="experience-microsoft"]').hasAttribute("data-viewport-active"));
      check(`${width}: returning visible restores feedback immediately`, true);
      if (width === 390) await page.getByRole("button", { name: "Menu", exact: true }).click();
      await page.locator('nav a[href="#projects"]:visible').click();
      await page.waitForFunction(() => document.querySelector('[data-attention-id="experience-microsoft"]').getBoundingClientRect().bottom < 76);
      await page.waitForFunction(() => !document.querySelector('[data-attention-id="experience-microsoft"]').hasAttribute("data-viewport-active"), null, { timeout: 350 });
      check(`${width}: leaving Experience clears its active-region marker`, true);
    } finally { await context.close(); }
  }
  check("no runtime errors", report.errors.length === 0, report.errors);
  report.passed = true;
} catch (error) {
  report.failure = error.stack;
  console.error(error);
  process.exitCode = 1;
} finally {
  await browser.close();
  await writeFile(path.join(out, "report.json"), JSON.stringify(report, null, 2));
}
