import assert from "node:assert/strict";
import { createHash } from "node:crypto";
import { createRequire } from "node:module";
import { mkdir, readFile, writeFile } from "node:fs/promises";
import path from "node:path";

const require = createRequire(import.meta.url);
const { chromium } = require(process.env.PLAYWRIGHT_MODULE || "C:\\Users\\A-plus\\.cache\\codex-runtimes\\codex-primary-runtime\\dependencies\\node\\node_modules\\playwright");
const url = process.env.PORTFOLIO_URL || "http://127.0.0.1:8080/main/";
const out = process.env.PROVE_IT_OUTPUT_DIR || path.join("output", "playwright", "fluid-motion");
await mkdir(out, { recursive: true });
const sources = [
  "src/main.tsx", "src/renderApp.tsx", "src/lib/scrollGuard.ts",
  "src/pages/Index.tsx", "src/components/AdaptiveBrowsing.tsx", "src/components/AgentConstruction.tsx",
  "src/hooks/useFluidScroll.ts", "src/hooks/useFastScrollReturn.ts", "src/hooks/useScrollConstruction.ts",
  "src/hooks/useAttentionJourney.ts", "src/lib/fluidScroll.ts", "src/lib/constructionDirector.ts",
  "src/styles/fluid-scroll.css",
];
const fingerprint = async () => {
  const hash = createHash("sha256");
  for (const source of sources) hash.update(source).update(await readFile(source));
  return hash.digest("hex");
};
const report = { url, sourceBefore: await fingerprint(), checks: [], errors: [], journeys: [], passed: false };
const check = (name, passed, evidence) => {
  report.checks.push({ name, passed: Boolean(passed), evidence });
  assert.ok(passed, name);
  console.log(`PASS ${name}`);
};
const browser = await chromium.launch({ channel: "msedge", headless: true });
try {
  for (const width of process.argv.includes("--mobile-only") ? [390] : [1440, 390]) {
    const height = width === 390 ? 844 : 900;
    const context = await browser.newContext({
      viewport: { width, height }, hasTouch: width === 390, isMobile: width === 390,
      recordVideo: { dir: out, size: { width, height } },
    });
    try {
      const page = await context.newPage();
      page.setDefaultTimeout(15000);
      page.on("pageerror", error => report.errors.push(error.message));
      await page.addInitScript(() => {
        window.motionCallbacks = 0;
        const request = requestAnimationFrame.bind(window);
        window.requestAnimationFrame = callback => request(at => { window.motionCallbacks++; callback(at); });
      });
      await page.goto(url, { waitUntil: "domcontentloaded" });
      await page.getByRole("heading", { level: 1 }).waitFor();
      const sampleHero = () => page.evaluate(() => ({
        workshops: document.querySelectorAll("[data-name-assembly],#hero [data-building],#hero [data-scene-building]").length,
        clip: getComputedStyle(document.querySelector("#hero h1")).clipPath,
        opacity: getComputedStyle(document.querySelector("#hero h1")).opacity,
      }));
      const initialHero = await sampleHero();
      await page.waitForTimeout(3200);
      await page.evaluate(() => document.fonts.ready);
      const settledHero = await sampleHero();
      check(`${width}: opening profile never enters worker construction`,
        initialHero.workshops === 0 && settledHero.workshops === 0 &&
        initialHero.clip === "none" && initialHero.opacity === "1", { initialHero, settledHero });
      await page.screenshot({ path: path.join(out, `${width}-hero-settled.png`) });
      if (width === 390) await page.getByRole("button", { name: "Menu", exact: true }).click();
      await page.locator('nav a[href="#projects"]:visible').click();
      await page.waitForFunction(() => Math.abs(document.querySelector("#projects").getBoundingClientRect().top) < 150);
      await page.waitForFunction(() => {
        const card = document.querySelector('[data-project="hivo"]');
        const complete = card?.getAttribute("data-scene-state") === "complete";
        return card && complete && !card.querySelector("[data-building]");
      });
      await page.waitForTimeout(700);
      await page.waitForFunction(() => !document.documentElement.hasAttribute("data-fluid-scroll"));
      await page.mouse.move(width - 12, height * .8);
      await page.waitForFunction(() => getComputedStyle(document.querySelector('[data-project="hivo"]')).transform === "none");
      const before = await page.locator('[data-project="hivo"]').evaluate(card => ({
        y: scrollY, top: card.getBoundingClientRect().top, pageHeight: document.documentElement.scrollHeight,
      }));
      const collect = async () => {
        await page.evaluate(() => {
          window.fluidFrames = [];
          window.fluidDone = false;
          const card = document.querySelector('[data-project="hivo"]');
          const sheet = document.querySelector("[data-fluid-page]");
          const start = performance.now();
          const sample = now => {
            const matrix = new DOMMatrixReadOnly(getComputedStyle(sheet).transform);
            window.fluidFrames.push({
              at: now - start, y: scrollY, top: card.getBoundingClientRect().top,
              mode: document.documentElement.dataset.fluidScroll || null,
              ty: matrix.m42, scale: matrix.m22, shear: matrix.m12,
              rawPull: matrix.m42,
              pageHeight: document.documentElement.scrollHeight,
              transitions: getComputedStyle(sheet).transitionProperty,
            });
            if (now - start < 2300) requestAnimationFrame(sample);
            else window.fluidDone = true;
          };
          requestAnimationFrame(sample);
        });
      };
      const objectSelectors = ["#projects > h2", '[data-project="hivo"] .project-description', '[data-project="hivo"] img', '[data-project="hivo"] .project-actions button'];
      const objectsBefore = await page.evaluate(selectors => selectors.map(selector => {
        const rect = document.querySelector(selector).getBoundingClientRect();
        return { top: rect.top, height: rect.height };
      }), objectSelectors);
      await collect();
      await page.mouse.wheel(0, 120);
      await page.waitForTimeout(180);
      const globalPose = await page.evaluate(({ selectors, tops, y }) => {
        const page = document.querySelector("[data-fluid-page]");
        const overlay = document.querySelector("[data-content-construction]");
        return {
          covered: selectors.map((selector, index) => {
            const node = document.querySelector(selector);
            const rect = node.getBoundingClientRect();
            return { selector, inPage: page.contains(node), displacement: rect.top - tops[index].top + scrollY - y, heightRatio: rect.height / tops[index].height };
          }),
          pageTransform: getComputedStyle(page).transform,
          overlayTransform: getComputedStyle(overlay).transform,
          activeLayers: document.querySelectorAll("[data-fluid-surface]").length,
        };
      }, { selectors: objectSelectors, tops: objectsBefore, y: before.y });
      check(`${width}: whole page content and construction share the same fluid field`,
        globalPose.covered.every(object => object.inPage && Math.abs(object.displacement) > 5) &&
        globalPose.pageTransform === globalPose.overlayTransform && globalPose.activeLayers === 2, globalPose);
      check(`${width}: actual visible image geometry stretches, not only its container matrix`,
        globalPose.covered[2].heightRatio > 1.02 && globalPose.covered.every(object => object.heightRatio < 1.15), globalPose.covered);
      await page.screenshot({ path: path.join(out, `${width}-page-pull.png`) });
      await page.waitForFunction(() => window.fluidDone);
      const frames = await page.evaluate(() => window.fluidFrames);
      await writeFile(path.join(out, `${width}-wheel-frames.json`), JSON.stringify(frames));
      const peak = frames.reduce((best, frame) => Math.abs(frame.ty) > Math.abs(best.ty) ? frame : best, frames[0]);
      const intermediate = new Set(frames.filter(frame => frame.y > before.y && frame.y < before.y + 120).map(frame => frame.y));
      check(`${width}: wheel input progresses through real intermediate positions`, intermediate.size >= 4, { positions: intermediate.size, from: before.y, to: frames.at(-1).y });
      check(`${width}: content bends and pulls rather than only smooth-scrolling`,
        Math.abs(peak.ty) >= 25 && Math.abs(peak.ty) <= 44 &&
        Math.abs(peak.shear) > .0001 && peak.scale > 1.018 && peak.scale < 1.06, peak);
      check(`${width}: visible deformation never inflates the native page bounds`,
        frames.every(frame => Math.abs(frame.pageHeight - before.pageHeight) <= 1),
        { before: before.pageHeight, maximum: Math.max(...frames.map(frame => frame.pageHeight)) });
      const after = await page.locator('[data-project="hivo"]').evaluate(card => ({
        y: scrollY, top: card.getBoundingClientRect().top, transform: getComputedStyle(document.querySelector("[data-fluid-page]")).transform,
        active: document.querySelectorAll("[data-fluid-surface]").length,
      }));
      check(`${width}: settling restores exact geometry and full input distance`,
        Math.abs(after.y - before.y - 120) <= 1 && Math.abs(after.top - before.top + 120) <= 1 &&
        after.transform === "none" && after.active === 0, { before, after });
      await page.screenshot({ path: path.join(out, `${width}-page-settled.png`) });
      const idleStart = await page.evaluate(() => window.motionCallbacks);
      await page.waitForTimeout(600);
      const idleFrames = await page.evaluate(start => window.motionCallbacks - start, idleStart);
      check(`${width}: no continuous idle animation loop`, idleFrames <= 3, { callbacksIn600ms: idleFrames });
      const fastStart = await page.evaluate(() => scrollY);
      await page.mouse.wheel(0, 500);
      await page.waitForTimeout(120);
      const fast = await page.evaluate(() => ({
        y: scrollY,
        cue: document.querySelector(".section-return-cue")?.getAttribute("data-visible"),
        spatial: document.querySelectorAll("[data-fluid-surface]").length,
      }));
      check(`${width}: fast-scroll resistance interrupts the fluid motion immediately`, fast.y <= fastStart - 450 && fast.cue === "true", { fastStart, fast });
      await page.screenshot({ path: path.join(out, `${width}-fast-scroll-message.png`) });
      await page.waitForTimeout(900);
      check(`${width}: no queued forward drift after fast reversal`, Math.abs(await page.evaluate(() => scrollY) - fast.y) <= 2);
      check(`${width}: cursor shapes never return`, await page.locator(".agent-pointer-shape,.virtual-agent,.curzr-arrow-pointer,[data-hero-agents]").count() === 0);
      check(`${width}: no horizontal overflow`, await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth + 1));
      report.journeys.push({ width, before, peak, after, idleFrames, frames });
      if (width === 390) {
        await page.getByRole("button", { name: "Menu", exact: true }).click();
        await page.locator('nav a[href="#projects"]:visible').click();
        await page.waitForFunction(() => Math.abs(document.querySelector("#projects").getBoundingClientRect().top) < 150);
        await page.waitForTimeout(1000);
        await page.waitForFunction(() => !document.documentElement.hasAttribute("data-fluid-scroll"));
        const client = await context.newCDPSession(page);
        await collect();
        await client.send("Input.dispatchTouchEvent", { type: "touchStart", touchPoints: [{ x: 375, y: 680 }] });
        for (let step = 1; step <= 8; step++) {
          await page.waitForTimeout(80);
          await client.send("Input.dispatchTouchEvent", { type: "touchMove", touchPoints: [{ x: 375, y: 680 - step * 20 }] });
          if (step === 4) {
            const active = await page.evaluate(() => document.documentElement.hasAttribute("data-fluid-scroll"));
            await page.setViewportSize({ width, height: height - 70 });
            check("390: browser toolbar resizing preserves the visible water response", active &&
              await page.evaluate(() => document.documentElement.hasAttribute("data-fluid-scroll")));
          }
        }
        await page.screenshot({ path: path.join(out, "390-touch-drag.png") });
        await client.send("Input.dispatchTouchEvent", { type: "touchEnd", touchPoints: [] });
        await page.waitForFunction(() => window.fluidDone);
        const touchFrames = await page.evaluate(() => window.fluidFrames);
        check("390: gentle touch visibly drags the page while held", touchFrames.some(frame => frame.at < 850 && Math.abs(frame.ty) > 2), touchFrames.filter(frame => Math.abs(frame.ty) > 2).length);
        await writeFile(path.join(out, "390-touch-frames.json"), JSON.stringify(touchFrames));
        await page.setViewportSize({ width, height });
        await page.waitForFunction(() => !document.documentElement.hasAttribute("data-fluid-scroll"));
        await page.mouse.wheel(0, 80);
        await page.waitForTimeout(120);
        const zoom = page.getByRole("button", { name: "Zoom in Hivo Studio", exact: true });
        const button = await zoom.boundingBox();
        assert.ok(button && button.y > 76 && button.y + button.height < height, "Moving preview control must be inside the viewport");
        await page.evaluate(() => {
          window.movingControlEvents = [];
          for (const type of ["pointerdown", "pointerup", "click"]) document.addEventListener(type, event => {
            const button = document.querySelector('[data-project="hivo"] .project-actions button');
            window.movingControlEvents.push({
              type, label: event.target.closest("button")?.getAttribute("aria-label"),
              x: event.clientX, y: event.clientY, box: button.getBoundingClientRect().toJSON(),
            });
          }, true);
        });
        const point = { x: button.x + button.width / 2, y: button.y + button.height / 2 };
        await client.send("Input.dispatchTouchEvent", { type: "touchStart", touchPoints: [point] });
        const heldButton = await zoom.boundingBox();
        await page.waitForTimeout(100);
        const stableButton = await zoom.boundingBox();
        check("390: a moving control stays under the finger throughout a held press",
          heldButton && stableButton && Math.abs(heldButton.y - stableButton.y) <= 1 &&
          Math.abs(heldButton.x - stableButton.x) <= 1, { heldButton, stableButton });
        await client.send("Input.dispatchTouchEvent", { type: "touchEnd", touchPoints: [] });
        report.movingControl = { button, point, events: await page.evaluate(() => window.movingControlEvents) };
        await page.getByRole("dialog").waitFor();
        check("390: a real tap still activates a control during the page pull", await page.getByRole("dialog").isVisible());
        await page.keyboard.press("Escape");
        await client.detach();
      }
    } finally { await context.close(); }
  }
  const context = await browser.newContext({ viewport: { width: 390, height: 844 }, reducedMotion: "reduce" });
  try {
    const page = await context.newPage();
    await page.goto(url, { waitUntil: "load" });
    await page.getByRole("heading", { level: 1 }).waitFor();
    const from = await page.evaluate(() => scrollY);
    await page.mouse.wheel(0, 80);
    await page.waitForTimeout(250);
    check("reduced motion: spatial drag stays disabled while ordinary scrolling works", await page.evaluate(from =>
      scrollY > from && !document.documentElement.hasAttribute("data-fluid-scroll") &&
      !document.querySelector("[data-fluid-surface]"), from));
  } finally { await context.close(); }
  check("no runtime errors", report.errors.length === 0, report.errors);
  report.sourceAfter = await fingerprint();
  check("current motion sources stayed coherent", report.sourceBefore === report.sourceAfter);
  report.passed = true;
} catch (error) {
  report.failure = error.stack;
  console.error(error);
  process.exitCode = 1;
} finally {
  await browser.close();
  await writeFile(path.join(out, "report.json"), JSON.stringify(report, null, 2));
}
