import assert from "node:assert/strict";
import { createRequire } from "node:module";
import { mkdir, writeFile } from "node:fs/promises";
import path from "node:path";

const require = createRequire(import.meta.url);
const { chromium } = require(process.env.PLAYWRIGHT_MODULE || "C:\\Users\\A-plus\\.cache\\codex-runtimes\\codex-primary-runtime\\dependencies\\node\\node_modules\\playwright");
const out = process.env.PROVE_IT_OUTPUT_DIR || path.join("output", "playwright", "media-handoff");
const url = process.env.PORTFOLIO_URL || "http://127.0.0.1:8080/main/";
await mkdir(out, { recursive: true });
const browser = await chromium.launch({ channel: "msedge", headless: true });
const report = { url, checks: [], errors: [], passed: false };
const check = (name, passed, evidence) => {
  report.checks.push({ name, passed: Boolean(passed), evidence });
  assert.ok(passed, name);
  console.log(`PASS ${name}`);
};
let release;
const hold = new Promise(resolve => { release = resolve; });
try {
  const context = await browser.newContext({ viewport: { width: 390, height: 844 }, isMobile: true, hasTouch: true });
  try {
    let requestHeld = false;
    await context.route(/\/images\/projects\/ya-rab-ostorha-\d+\.webp$/, async route => {
      requestHeld = true; await hold; await route.continue();
    });
    const page = await context.newPage();
    page.on("pageerror", error => report.errors.push(error.message));
    await page.goto(report.url, { waitUntil: "domcontentloaded" });
    await page.getByRole("heading", { level: 1 }).waitFor();
    await page.evaluate(() => document.fonts.ready);
    await page.getByRole("button", { name: "Menu", exact: true }).click();
    await page.locator('nav a[href="#projects"]:visible').click();
    await page.waitForFunction(() => Math.abs(document.getElementById("projects").getBoundingClientRect().top) < 180);
    const project = page.locator("#project-ya-rab-ostorha");
    // Let ordinary input start the scene; a direct deep link finishes it by design.
    await page.mouse.move(380, 660);
    for (let step = 0; step < 32; step++) {
      if ((await project.boundingBox())?.y < 160) break;
      await page.mouse.wheel(0, 80);
      await page.waitForTimeout(170);
    }
    await page.waitForFunction(() => document.getElementById("project-ya-rab-ostorha").dataset.sceneState === "complete");
    const waiting = await project.evaluate(card => {
      const title = card.querySelector("h3");
      const rect = title.getBoundingClientRect();
      const image = card.querySelector(".project-media img");
      const spot = document.elementFromPoint(rect.x + 12, Math.max(rect.y + rect.height / 2, 78));
      return {
        ready: image.complete && image.naturalWidth > 0,
        titleClip: getComputedStyle(title).clipPath,
        bodyClip: getComputedStyle(card.querySelector("p")).clipPath,
        seen: title.contains(spot),
        cardHeight: card.offsetHeight,
      };
    });
    check("Real delayed download cannot hold the project text or frame",
      requestHeld && !waiting.ready && waiting.seen && waiting.titleClip === "none" && waiting.bodyClip === "none", waiting);
    release();
    const image = project.locator(".project-media img");
    await image.evaluate(image => image.decode());
    const complete = await project.evaluate(card => ({
      src: card.querySelector(".project-media img").currentSrc,
      height: card.offsetHeight,
    }));
    check("Original responsive image paints on arrival with no layout jump",
      /ya-rab-ostorha-\d+\.webp$/.test(complete.src) && complete.height === waiting.cardHeight, complete);
    await page.screenshot({ path: path.join(out, "loaded-project.png") });
  } finally { release(); await context.close(); }
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
