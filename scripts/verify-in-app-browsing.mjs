import assert from "node:assert/strict";
import { createRequire } from "node:module";
import { mkdir, writeFile } from "node:fs/promises";
import path from "node:path";

const require = createRequire(import.meta.url);
const { chromium } = require(process.env.PLAYWRIGHT_MODULE || "C:\\Users\\A-plus\\.cache\\codex-runtimes\\codex-primary-runtime\\dependencies\\node\\node_modules\\playwright");
const url = process.env.PORTFOLIO_URL || "http://127.0.0.1:4183/main/";
const out = process.env.PROVE_IT_OUTPUT_DIR || path.join("output", "playwright", "in-app");
await mkdir(out, { recursive: true });
const report = { url, scope: "Real Edge input with simulated embedded-browser focus/API conditions; not actual Instagram/TikTok or WKWebView devices.", checks: [], errors: [], passed: false };
const check = (name, passed, evidence) => {
  report.checks.push({ name, passed: Boolean(passed), evidence });
  assert.ok(passed, name);
  console.log(`PASS ${name}`);
};
const browser = await chromium.launch({ channel: "msedge", headless: true });
try {
  const context = await browser.newContext({ viewport: { width: 390, height: 844 }, isMobile: true, hasTouch: true });
  try {
    await context.addInitScript(() => {
      document.hasFocus = () => false;
      Object.defineProperty(window, "CSSTransition", { value: undefined, configurable: true });
      window.embeddedCommands = [];
      window.addEventListener("portfolio:scroll-command", event => window.embeddedCommands.push(event.detail));
    });
    const page = await context.newPage();
    page.on("pageerror", error => report.errors.push(error.message));
    await page.goto(url, { waitUntil: "load" });
    await page.getByRole("heading", { level: 1 }).waitFor();
    check("test page is visible while hasFocus reports false", await page.evaluate(() => !document.hidden && !document.hasFocus()));
    await page.locator("#projects").evaluate(section => scrollTo({ top: scrollY + section.getBoundingClientRect().top + 180, behavior: "instant" }));
    await page.waitForTimeout(350);
    const from = await page.evaluate(() => scrollY);
    await page.mouse.wheel(0, 500);
    await page.waitForTimeout(1000);
    const wheel = await page.evaluate(() => scrollY);
    check("visible embedded page brakes a strong wheel before any whole-section skip", wheel <= from - 490, { from, wheel });
    await page.evaluate(() => scrollTo({ top: 2200, behavior: "instant" }));
    await page.waitForTimeout(500);
    const client = await context.newCDPSession(page);
    await client.send("Input.dispatchTouchEvent", { type: "touchStart", touchPoints: [{ x: 195, y: 700 }] });
    await page.waitForTimeout(16);
    await client.send("Input.dispatchTouchEvent", { type: "touchMove", touchPoints: [{ x: 195, y: 550 }] });
    await page.waitForTimeout(16);
    await client.send("Input.dispatchTouchEvent", { type: "touchMove", touchPoints: [{ x: 195, y: 250 }] });
    const held = await page.evaluate(() => scrollY);
    const command = await page.evaluate(() => window.embeddedCommands.filter(step => step.input === "touch").at(-1));
    check("visible embedded page brakes a fast gesture while the finger is held",
      command?.reverse === true && command.delta === -300 && command.to === command.from - 300, { command, held });
    await page.setViewportSize({ width: 390, height: 744 });
    await page.waitForTimeout(25);
    const resized = await page.evaluate(() => scrollY);
    await client.send("Input.dispatchTouchEvent", { type: "touchMove", touchPoints: [{ x: 195, y: 150 }] });
    const continued = await page.evaluate(() => scrollY);
    check("height-only browser chrome resize does not drop a held fast gesture", continued < resized - 50, { resized, continued });
    await client.send("Input.dispatchTouchEvent", { type: "touchEnd", touchPoints: [] });
    await page.waitForTimeout(800);
    await page.getByRole("button", { name: "Menu", exact: true }).click();
    await page.locator('nav a[href="#projects"]:visible').click();
    await page.waitForFunction(() => Math.abs(document.querySelector("#projects").getBoundingClientRect().top) < 150);
    await page.waitForTimeout(1800);
    await page.mouse.move(380, 650);
    await page.mouse.wheel(0, 120);
    await page.waitForTimeout(2300);
    check("fluid cleanup works without the global CSSTransition constructor",
      await page.evaluate(() => !document.querySelector("[data-fluid-surface]")) && report.errors.length === 0, report.errors);
    await page.screenshot({ path: path.join(out, "embedded-projects.png") });
    const input = page.locator("#contact textarea");
    await input.fill("Keep form input working");
    await page.evaluate(() => scrollTo({ top: 2200, behavior: "instant" }));
    await page.mouse.move(380, 500);
    await page.mouse.wheel(0, 500);
    await page.waitForTimeout(200);
    check("focused form still bypasses interception", await page.evaluate(() => scrollY) > 2500 && await input.inputValue() === "Keep form input working");
  } finally { await context.close(); }
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
