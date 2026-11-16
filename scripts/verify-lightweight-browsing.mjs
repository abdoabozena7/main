import assert from "node:assert/strict";
import { createRequire } from "node:module";
import { mkdir, writeFile } from "node:fs/promises";
import path from "node:path";

const require = createRequire(import.meta.url);
const { chromium } = require(process.env.PLAYWRIGHT_MODULE || "C:\\Users\\A-plus\\.cache\\codex-runtimes\\codex-primary-runtime\\dependencies\\node\\node_modules\\playwright");
const url = process.env.PORTFOLIO_URL || "http://127.0.0.1:8080/main/";
const out = process.env.PROVE_IT_OUTPUT_DIR || path.join("output", "playwright", "lightweight-browsing");
await mkdir(out, { recursive: true });
const report = { url, capturedAt: new Date().toISOString(), checks: [], errors: [], passed: false };
const check = (name, passed, evidence) => {
  report.checks.push({ name, passed: Boolean(passed), evidence });
  assert.ok(passed, name);
  console.log(`PASS ${name}`);
};
const browser = await chromium.launch({ channel: "msedge", headless: true });
try {
  for (const width of [1440, 768, 390]) {
    const height = width === 768 ? 1024 : width === 390 ? 844 : 900;
    const context = await browser.newContext({
      viewport: { width, height }, hasTouch: width < 1024, isMobile: width < 1024,
    });
    try {
      const page = await context.newPage();
      page.setDefaultTimeout(15000);
      page.on("pageerror", error => report.errors.push(error.message));
      page.on("response", response => {
        if (response.status() >= 400) report.errors.push(`${response.status()} ${response.url()}`);
      });
      await page.addInitScript(() => {
        window.lightweightProbe = { prevented: 0, commands: 0 };
        window.addEventListener("wheel", event => {
          setTimeout(() => { if (event.defaultPrevented) window.lightweightProbe.prevented++; }, 0);
        });
        window.addEventListener("portfolio:scroll-command", () => window.lightweightProbe.commands++);
      });
      await page.goto(url, { waitUntil: "load" });
      await page.getByRole("heading", { level: 1 }).waitFor();
      await page.evaluate(() => document.fonts.ready);
      const noAgents = () => page.locator("[data-hero-agents],.agent-pointer-shape,.virtual-agent,.scan-agent,.curzr-arrow-pointer").count();
      check(`${width}: opening profile is complete without construction or cursor actors`, await noAgents() === 0 &&
        await page.locator("[data-name-assembly]").count() === 0 &&
        await page.locator("[data-content-construction]").count() === 1 &&
        await page.locator("#hero [data-building]").count() === 0);
      check(`${width}: native pointer`, await page.evaluate(() => !document.documentElement.classList.contains("curzr-arrow-active") && getComputedStyle(document.body).cursor !== "none"));
      await page.screenshot({ path: path.join(out, `${width}-hero.png`) });

      const downloadEvent = page.waitForEvent("download");
      await page.getByRole("link", { name: "Download CV", exact: true }).click();
      const download = await downloadEvent;
      check(`${width}: CV download`, await download.failure() === null && download.suggestedFilename() === "Abdelrahman_Abozena_CV.pdf");

      const navigate = async id => {
        if (width < 1024) await page.getByRole("button", { name: "Menu", exact: true }).click();
        await page.locator(`nav a[href="#${id}"]:visible`).click();
        await page.waitForFunction(id => Math.abs(document.getElementById(id).getBoundingClientRect().top) < 180, id);
        await page.waitForTimeout(300);
      };
      await navigate("projects");
      const image = page.locator('[data-project="hivo"] .project-media img');
      await image.evaluate(image => image.decode());
      const thumbnail = await image.evaluate(image => ({ src: image.currentSrc, width: image.naturalWidth, displayed: image.clientWidth }));
      check(`${width}: appropriately sized WebP thumbnail`, /hivo-\d+\.webp$/.test(thumbnail.src) && thumbnail.width <= thumbnail.displayed * 2.5, thumbnail);
      check(`${width}: readable project description`, await page.locator(".project-description").first().isVisible());
      const heights = await page.locator("[data-project]").evaluateAll(cards => cards.map(card => card.offsetHeight));
      await page.screenshot({ path: path.join(out, `${width}-projects.png`) });
      const from = await page.evaluate(() => scrollY);
      await page.mouse.move(width / 2, height / 2);
      for (let index = 0; index < 3; index++) {
        await page.mouse.wheel(0, 900);
        await page.waitForTimeout(40);
      }
      await page.waitForTimeout(400);
      const scroll = await page.evaluate(from => ({ from, to: scrollY, ...window.lightweightProbe }), from);
      check(`${width}: fast input restores resistance and feedback`, scroll.to < scroll.from && scroll.prevented === 3 && scroll.commands === 3 &&
        await page.locator('.section-return-cue[data-visible="true"] .return-popup').isVisible(), scroll);
      check(`${width}: details return after fast input stops`, await page.locator("[data-scan-active]").count() === 0 &&
        JSON.stringify(heights) === JSON.stringify(await page.locator("[data-project]").evaluateAll(cards => cards.map(card => card.offsetHeight))));
      const beforeUp = await page.evaluate(() => scrollY);
      await page.mouse.wheel(0, -600);
      await page.waitForTimeout(400);
      check(`${width}: upward input keeps its direction`, await page.evaluate(() => scrollY) < beforeUp);

      if (width === 390) {
        const cdp = await context.newCDPSession(page);
        const from = await page.evaluate(() => scrollY);
        await cdp.send("Input.dispatchTouchEvent", { type: "touchStart", touchPoints: [{ x: 200, y: 680 }] });
        for (let step = 1; step <= 8; step++) {
          await page.waitForTimeout(80);
          await cdp.send("Input.dispatchTouchEvent", { type: "touchMove", touchPoints: [{ x: 200, y: 680 - step * 25 }] });
        }
        await cdp.send("Input.dispatchTouchEvent", { type: "touchEnd", touchPoints: [] });
        await page.waitForTimeout(450);
        check("390: gentle upward swipe still moves down", await page.evaluate(() => scrollY) > from);
        await cdp.detach();
      }

      await navigate("projects");
      const zoom = page.getByRole("button", { name: "Zoom in Hivo Studio", exact: true });
      await zoom.click();
      const preview = page.getByRole("dialog").locator("img");
      await preview.evaluate(image => image.decode());
      check(`${width}: zoom retains the full-resolution original`, await preview.evaluate(image => image.currentSrc.endsWith("/images/projects/hivo.png") && image.naturalWidth === 1920));
      await page.screenshot({ path: path.join(out, `${width}-zoom.png`) });
      await page.keyboard.press("Escape");
      await page.waitForFunction(() => document.activeElement === document.querySelector('[data-project="hivo"] .project-actions button'));
      check(`${width}: closing preview restores focus`, await zoom.evaluate(button => button === document.activeElement));

      await page.locator(".exploration-trigger").click();
      await page.locator("#exploration-map").waitFor();
      check(`${width}: score still has registered stories`, await page.locator(".score-popup-count").evaluate(node => Number(node.textContent.split("/")[1]) > 0));
      await page.keyboard.press("Escape");
      check(`${width}: score closes and restores focus`, await page.locator("#exploration-map").count() === 0 && await page.locator(".exploration-trigger").evaluate(button => button === document.activeElement));

      await navigate("honors");
      check(`${width}: credential descriptions are readable`, await page.locator("#honors .credential-description p").first().isVisible());
      const certificate = page.locator("#honors .certificate-image-trigger").first();
      await certificate.click();
      await page.getByRole("dialog").locator("img").evaluate(image => image.decode());
      await page.keyboard.press("Escape");
      await page.waitForFunction(() => document.activeElement === document.querySelector("#honors .certificate-image-trigger"));
      check(`${width}: certificate preview restores focus`, await certificate.evaluate(button => button === document.activeElement));

      await page.getByRole("button", { name: "Open Terminal", exact: true }).click();
      const input = page.locator('input[autocomplete="off"]');
      await input.fill("help");
      await input.press("Enter");
      await page.getByText("List recent projects", { exact: true }).waitFor();
      await page.keyboard.press("Escape");
      check(`${width}: terminal commands still work`, await page.getByRole("button", { name: "Open Terminal", exact: true }).isVisible());

      await page.goto(new URL("#project-hivo", url).href);
      await page.reload({ waitUntil: "load" });
      await page.evaluate(() => document.fonts.ready);
      await page.waitForFunction(() => {
        const node = document.getElementById("project-hivo");
        if (!node) return false;
        const top = node.getBoundingClientRect().top;
        return top >= 75 && top < 180;
      });
      check(`${width}: direct project link survives reload`, true);
      check(`${width}: no agents return during browsing`, await noAgents() === 0);
      check(`${width}: no horizontal overflow`, await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth + 1));
    } finally {
      await context.close();
    }
  }
  const context = await browser.newContext({ viewport: { width: 390, height: 844 }, reducedMotion: "reduce" });
  try {
    const page = await context.newPage();
    await page.goto(url, { waitUntil: "load" });
    await page.locator("#hero .animate-bounce").waitFor();
    check("reduced motion: native anchors and minimal motion", await page.evaluate(() =>
      getComputedStyle(document.documentElement).scrollBehavior === "auto" &&
      parseFloat(getComputedStyle(document.querySelector(".animate-bounce")).animationDuration) <= 0.001));
  } finally {
    await context.close();
  }
  check("no browser or HTTP errors", report.errors.length === 0, report.errors);
  report.passed = true;
} catch (error) {
  report.failure = error.stack;
  console.error(error);
  process.exitCode = 1;
} finally {
  await browser.close();
  await writeFile(path.join(out, "report.json"), JSON.stringify(report, null, 2));
}
