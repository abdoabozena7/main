import assert from "node:assert/strict";
import { createRequire } from "node:module";
import { mkdir, writeFile } from "node:fs/promises";
import path from "node:path";

const require = createRequire(import.meta.url);
const { chromium } = require(process.env.PLAYWRIGHT_MODULE || "C:\\Users\\A-plus\\.cache\\codex-runtimes\\codex-primary-runtime\\dependencies\\node\\node_modules\\playwright");
const url = process.env.PORTFOLIO_URL || "http://127.0.0.1:8080/main/";
const out = process.env.PROVE_IT_OUTPUT_DIR || path.join("output", "playwright", "chapter-return");
await mkdir(out, { recursive: true });
const report = { url, scope: "Real Edge wheel, touch and keyboard. Instant positioning only sets up independent scenarios.", checks: [], errors: [], passed: false };
const check = (name, passed, evidence) => {
  report.checks.push({ name, passed: Boolean(passed), evidence });
  assert.ok(passed, name);
  console.log(`PASS ${name}`);
};
const browser = await chromium.launch({ channel: "msedge", headless: true });
const bounds = (page, id) => page.locator(`#${id}`).evaluate(section => ({
  start: section.querySelector("h2").getBoundingClientRect().top + scrollY,
  end: section.lastElementChild.getBoundingClientRect().bottom + scrollY,
}));
const position = async (page, y) => {
  await page.evaluate(y => scrollTo({ top: y, behavior: "instant" }), y);
  await page.waitForTimeout(360);
  await page.waitForFunction(() => !document.documentElement.hasAttribute("data-fluid-scroll"));
};
const events = page => page.evaluate(() => window.chapterReturns);
const arrive = (page, id) => page.waitForFunction(id => window.chapterReturns.some(pass => pass.id === id), id, { timeout: 6000 });
const current = page => page.evaluate(() => scrollY);
const wheelPast = async (page, distance) => {
  // Moderate steps in groups of three can cross a chapter briskly without
  // triggering the immediate brake on individual commands or longer bursts.
  const steps = Math.ceil(distance / 260);
  for (let step = 0; step < steps; step++) {
    if (step) await page.waitForTimeout(step % 3 === 0 ? 260 : 85);
    await page.mouse.wheel(0, 260);
  }
};

async function open(width) {
  const context = await browser.newContext({ viewport: { width, height: width === 390 ? 844 : 900 }, isMobile: width === 390, hasTouch: width === 390 });
  const page = await context.newPage();
  page.setDefaultTimeout(15000);
  page.on("pageerror", error => report.errors.push(error.message));
  await page.addInitScript(() => {
    window.chapterReturns = [];
    window.chapterTravel = [];
    window.scrollCommands = [];
    window.addEventListener("portfolio:section-return", event => window.chapterReturns.push(event.detail));
    window.addEventListener("scroll", () => window.chapterTravel.push({ y: scrollY, at: performance.now(), layout: document.documentElement.dataset.browsing }), { passive: true });
    window.addEventListener("portfolio:scroll-command", event => window.scrollCommands.push({ ...event.detail, at: performance.now() }));
  });
  await page.goto(url, { waitUntil: "domcontentloaded" });
  await page.getByRole("heading", { level: 1 }).waitFor();
  await page.evaluate(() => document.fonts.ready);
  return { context, page };
}

try {
  const { context: desktop, page } = await open(1440);
  try {
    const about = await bounds(page, "about");
    const experience = await bounds(page, "experience");
    await position(page, about.start - 205);
    const before = await current(page);
    await page.mouse.move(1360, 620);
    await wheelPast(page, experience.end + 70 - before);
    try { await arrive(page, "experience"); } catch (error) {
      report.wheelFailure = { about, experience, before, returns: await events(page), ...await page.evaluate(() => ({
        travel: window.chapterTravel, commands: window.scrollCommands,
      })) };
      throw error;
    }
    const returns = await events(page);
    check("wheel: two entire chapters passed, but only the last missed chapter returns", returns.length === 1 && returns[0].id === "experience" && returns[0].qualified === 0, returns);
    const last = await bounds(page, "experience");
    const after = await current(page);
    const tail = Math.max(last.start - 80, last.end - 900 + 72);
    check("wheel: lands at the missed chapter's tail, not its heading", Math.abs(after - tail) <= 3 && after > last.start, { after, tail });
    await page.getByRole("status").filter({ hasText: "Back to the end of Experience." }).waitFor({ state: "attached" });
    await page.screenshot({ path: path.join(out, "desktop-tail.png") });
    await page.mouse.wheel(0, 95);
    await page.waitForTimeout(1000);
    check("wheel: a visitor can continue normally immediately after the return", await current(page) > after + 80 && (await events(page)).length === 1);
    const project = await bounds(page, "projects");
    await position(page, (project.start + project.end) / 2);
    const middle = await current(page);
    await page.mouse.wheel(0, 240);
    await page.waitForTimeout(1100);
    check("wheel: an ordinary step inside a chapter is not a whole missed chapter", await current(page) >= middle + 235 && (await events(page)).length === 1);
    await page.locator('nav a[href="#education"]:visible').click();
    await page.waitForFunction(() => Math.abs(document.getElementById("education").getBoundingClientRect().top) < 180);
    const beforeEnd = await current(page);
    await page.keyboard.press("End");
    await page.waitForTimeout(750);
    await page.waitForFunction(() => !document.documentElement.hasAttribute("data-fluid-scroll"));
    const footer = await page.locator(".finale-footer p").evaluate(line => {
      const { top, bottom } = line.getBoundingClientRect();
      return { top, bottom, viewport: innerHeight, y: scrollY, anchor: location.hash };
    });
    const afterNavigation = await events(page);
    check("menu anchors and keyboard End reach the footer without an automatic return",
      footer.anchor === "#education" && footer.y > beforeEnd + footer.viewport &&
      footer.top >= 0 && footer.bottom <= footer.viewport && afterNavigation.length === 1,
      { beforeEnd, footer, returns: afterNavigation });

    await page.locator('nav a[href="#contact"]:visible').click();
    await page.waitForFunction(() => Number(document.querySelector("#contact .contact-info")?.dataset.qualityExposure) > 0);
    check("Contact can earn on-screen exposure as well as the story sections", (await events(page)).length === 1);
  } finally { await desktop.close(); }

  const { context: exposed, page: reader } = await open(1440);
  try {
    await reader.locator('[data-attention-id="experience-microsoft"]').scrollIntoViewIfNeeded();
    await reader.waitForFunction(() => {
      const story = document.querySelector('[data-attention-id="experience-microsoft"]');
      return Number(story?.dataset.qualityExposure) >= .6 && Number(story?.dataset.qualityCoverage) >= 75;
    }, null, { timeout: 15000 });
    const chapter = await bounds(reader, "experience");
    await position(reader, chapter.start - 205);
    const from = await current(reader);
    await reader.mouse.move(1360, 620);
    await wheelPast(reader, chapter.end + 70 - from);
    await reader.waitForTimeout(1200);
    check("wheel: genuinely observed story exposure exempts a later rapid full pass", (await events(reader)).length === 0 && await current(reader) > chapter.end - 80);

    const education = await bounds(reader, "education");
    await position(reader, education.start - 110);
    for (let move = 0; move < 20 && await current(reader) < education.end - 60; move++) {
      await reader.mouse.wheel(0, 90);
      await reader.waitForTimeout(370);
    }
    await reader.waitForTimeout(450);
    check("wheel: a whole section browsed in small, paced steps is not a skip", (await events(reader)).length === 0 && await current(reader) >= education.end - 85);
  } finally { await exposed.close(); }

  const { context: phone, page: mobile } = await open(390);
  try {
    const chapter = await bounds(mobile, "education");
    await position(mobile, chapter.start - 300);
    const from = await current(mobile);
    const client = await phone.newCDPSession(mobile);
    const swipes = [];
    for (let swipe = 0; swipe < 4 && await current(mobile) < chapter.end - 60; swipe++) {
      const before = await current(mobile);
      await client.send("Input.dispatchTouchEvent", { type: "touchStart", touchPoints: [{ x: 190, y: 757 }] });
      for (const y of [620, 483, 346]) {
        // Leave headroom for browser delivery time without triggering the brake.
        await mobile.waitForTimeout(44);
        await client.send("Input.dispatchTouchEvent", { type: "touchMove", touchPoints: [{ x: 190, y }] });
      }
      const held = await current(mobile);
      check(`touch: swipe ${swipe + 1} still travels forward while the finger is held`, held > before && (await events(mobile)).length === 0, { before, held });
      await client.send("Input.dispatchTouchEvent", { type: "touchEnd", touchPoints: [] });
      await mobile.waitForTimeout(260);
      swipes.push({ before, held, released: await current(mobile), chapter: await bounds(mobile, "education") });
    }
    try { await arrive(mobile, "education"); } catch (error) {
      report.touchFailure = { chapter, from, swipes, position: await current(mobile), returns: await events(mobile), ...await mobile.evaluate(() => ({
        travel: window.chapterTravel, commands: window.scrollCommands,
        exposure: Array.from(document.querySelectorAll("#education [data-discovery-id]"), el => ({ exposure: el.dataset.qualityExposure, coverage: el.dataset.qualityCoverage })),
      })) };
      throw error;
    }
    const [pass] = await events(mobile);
    const destination = await bounds(mobile, "education");
    const tail = Math.max(destination.start - 80, destination.end - 844 + 72);
    check("touch: a fast complete skip returns to the actual section tail after release", pass.id === "education" &&
      Math.abs(await current(mobile) - tail) <= 3 && pass.from > pass.to && pass.qualified === 0, { pass, tail });
    await mobile.screenshot({ path: path.join(out, "mobile-tail.png") });
    await client.detach();
  } finally { await phone.close(); }

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
