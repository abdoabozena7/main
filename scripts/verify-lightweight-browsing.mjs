import assert from "node:assert/strict";
import { createRequire } from "node:module";
import { mkdir, writeFile } from "node:fs/promises";
import path from "node:path";

const require = createRequire(import.meta.url);
const { chromium } = require(process.env.PLAYWRIGHT_MODULE || "playwright");
const url = process.env.PORTFOLIO_URL || "http://127.0.0.1:8080/main/";
const out = process.env.PROVE_IT_OUTPUT_DIR || path.join("output", "playwright", "lightweight-browsing");
await mkdir(out, { recursive: true });
const report = { url, capturedAt: new Date().toISOString(), checks: [], errors: [], passed: false };
const check = (name, passed, evidence) => {
  report.checks.push({ name, passed: Boolean(passed), evidence });
  assert.ok(passed, name);
  console.log(`PASS ${name}`);
};
const browser = await chromium.launch({
  headless: true,
  ...(process.env.PLAYWRIGHT_EXECUTABLE_PATH ? { executablePath: process.env.PLAYWRIGHT_EXECUTABLE_PATH } : {}),
  ...(process.env.PLAYWRIGHT_CHANNEL ? { channel: process.env.PLAYWRIGHT_CHANNEL } : {}),
});

try {
  for (const width of [1440, 768, 390, 320]) {
    const height = width === 768 ? 1024 : width === 390 ? 844 : width === 320 ? 568 : 900;
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
      check(`${width}: selected work immediately follows the hero`, await page.evaluate(() => document.getElementById("hero").nextElementSibling.id === "projects"));
      check(`${width}: native pointer and no historical animation layers`, await page.evaluate(() =>
        !document.documentElement.classList.contains("curzr-arrow-active") &&
        getComputedStyle(document.body).cursor !== "none" &&
        !document.querySelector("[data-agent-layer],[data-hero-agents],.virtual-agent,.curzr-arrow-pointer,[data-building]")));
      check(`${width}: hero links do not overlap`, await page.locator("#hero a").evaluateAll(links => {
        const rects = links.filter(link => link.getClientRects().length).map(link => link.getBoundingClientRect());
        return rects.every((a, index) => rects.slice(index + 1).every(b =>
          Math.min(a.right, b.right) - Math.max(a.left, b.left) <= 0 ||
          Math.min(a.bottom, b.bottom) - Math.max(a.top, b.top) <= 0));
      }));
      if (width < 768) {
        check(`${width}: mobile menu has a usable hit area`, await page.getByRole("button", { name: "Menu", exact: true }).evaluate(button => {
          const rect = button.getBoundingClientRect();
          return rect.width >= 44 && rect.height >= 44;
        }));
        check(`${width}: terminal does not float over mobile content`, await page.locator(".terminal-launcher").evaluate(element => getComputedStyle(element).position !== "fixed"));
      }
      await page.screenshot({ path: path.join(out, `${width}-hero.png`) });

      const downloadEvent = page.waitForEvent("download");
      await page.getByRole("link", { name: "Download CV", exact: true }).click();
      const download = await downloadEvent;
      check(`${width}: CV download`, await download.failure() === null && download.suggestedFilename() === "Abdelrahman_Abozena_CV.pdf");

      const navigate = async id => {
        let link = page.locator(`nav a[href="#${id}"]:visible`).first();
        if (await link.count() === 0 && width < 768 && ["projects", "workshop", "about"].includes(id)) {
          await page.getByRole("button", { name: "Menu", exact: true }).click();
          link = page.locator(`nav a[href="#${id}"]:visible`).first();
        }
        if (await link.count()) await link.click();
        else await page.goto(new URL(`#${id}`, url).href);
        try {
          await page.waitForFunction(id => {
            const rect = document.getElementById(id).getBoundingClientRect();
            return rect.top >= -1 && rect.top < 180;
          }, id);
        } catch (error) {
          report.navigationFailure = await page.evaluate(id => ({
            target: id, hash: location.hash, scrollY,
            top: document.getElementById(id).getBoundingClientRect().top,
            bodyOverflow: getComputedStyle(document.body).overflow,
          }), id);
          throw error;
        }
        await page.waitForTimeout(250);
      };

      await navigate("projects");
      check(`${width}: two featured projects, with more work optional`, await page.locator("[data-project]:visible").count() === 2);
      const image = page.locator('[data-project="hivo"] .project-media img');
      await image.evaluate(image => image.decode());
      const thumbnail = await image.evaluate(image => ({ src: image.currentSrc, width: image.naturalWidth, displayed: image.clientWidth }));
      check(`${width}: appropriately sized WebP thumbnail`, /hivo-\d+\.webp$/.test(thumbnail.src) && thumbnail.width <= thumbnail.displayed * 2.5, thumbnail);
      const featuredCards = page.locator("#projects > .project-grid > [data-project]");
      const heights = await featuredCards.evaluateAll(cards => cards.map(card => card.offsetHeight));
      await page.screenshot({ path: path.join(out, `${width}-projects.png`) });
      const from = await page.evaluate(() => scrollY);
      await page.mouse.move(width / 2, height / 2);
      for (let index = 0; index < 3; index++) {
        await page.mouse.wheel(0, 900);
        await page.waitForTimeout(40);
      }
      await page.waitForTimeout(400);
      const scroll = await page.evaluate(from => ({ from, to: scrollY, ...window.lightweightProbe }), from);
      check(`${width}: fast downward input stays native`, scroll.to > scroll.from && scroll.prevented === 0 && scroll.commands === 0, scroll);
      const afterScrollHeights = await featuredCards.evaluateAll(cards => cards.map(card => card.offsetHeight));
      check(`${width}: scrolling does not collapse cards`, await page.locator("[data-scan-active],.section-return-cue").count() === 0 &&
        JSON.stringify(heights) === JSON.stringify(afterScrollHeights), { before: heights, after: afterScrollHeights });
      const beforeUp = await page.evaluate(() => scrollY);
      await page.mouse.wheel(0, -600);
      await page.waitForTimeout(400);
      check(`${width}: upward input stays native`, await page.evaluate(() => scrollY) < beforeUp);

      if (width === 390) {
        const cdp = await context.newCDPSession(page);
        const beforeSwipe = await page.evaluate(() => scrollY);
        await cdp.send("Input.dispatchTouchEvent", { type: "touchStart", touchPoints: [{ x: 200, y: 680 }] });
        for (let step = 1; step <= 8; step++) {
          await cdp.send("Input.dispatchTouchEvent", { type: "touchMove", touchPoints: [{ x: 200, y: 680 - step * 45 }] });
          await page.waitForTimeout(20);
        }
        await cdp.send("Input.dispatchTouchEvent", { type: "touchEnd", touchPoints: [] });
        await page.waitForTimeout(450);
        check("390: native upward swipe moves down", await page.evaluate(() => scrollY) > beforeSwipe);
        await cdp.detach();
      }

      await navigate("projects");
      const zoom = page.getByRole("button", { name: "Zoom in Hivo Studio", exact: true });
      await zoom.click();
      const preview = page.getByRole("dialog").locator("img");
      await preview.evaluate(image => image.decode());
      check(`${width}: preview retains the full-resolution original`, await preview.evaluate(image => image.currentSrc.endsWith("/images/projects/hivo.png") && image.naturalWidth === 1920));
      await page.getByRole("button", { name: "Inspect full size", exact: true }).click();
      check(`${width}: full-size inspection exposes real detail`, await page.locator(".project-preview-viewport").evaluate(element => element.scrollWidth > element.clientWidth));
      await page.screenshot({ path: path.join(out, `${width}-zoom.png`) });
      await page.keyboard.press("Escape");
      await page.waitForFunction(() => document.activeElement === document.querySelector('[data-project="hivo"] .project-actions button'));
      check(`${width}: closing preview restores the opener`, await zoom.evaluate(button => button === document.activeElement));

      await navigate("workshop");
      check(`${width}: evidence is not credited for simply visiting`, await page.locator(".workshop-discoveries strong").first().textContent() === "0 / 2");
      await page.getByRole("button", { name: "See the build", exact: true }).click();
      await page.waitForFunction(() => {
        const heading = document.getElementById("workshop-build-heading").getBoundingClientRect();
        const controls = document.querySelector(".workshop-control-bar").getBoundingClientRect();
        return heading.top >= controls.bottom && heading.bottom <= innerHeight;
      });
      check(`${width}: the brief advances to the build`, await page.locator('[data-workshop-step="1"]').count() === 1 && await page.locator("#workshop-scene-1").isVisible());
      await page.waitForFunction(() => [...document.querySelectorAll("#workshop-scene-1, #workshop-scene-1 .workshop-agent")]
        .every(element => element.getAnimations().every(animation => animation.playState !== "running")));
      await page.screenshot({ path: path.join(out, `${width}-workshop.png`) });
      await page.getByRole("button", { name: "Show the evidence", exact: true }).click();
      check(`${width}: an explicit evidence selection earns one discovery`, await page.locator(".workshop-discoveries strong").first().textContent() === "1 / 2");
      await page.getByRole("button", { name: "Replay this brief", exact: true }).click();
      await page.getByRole("button", { name: "The evidence", exact: true }).click();
      check(`${width}: replay does not duplicate discovery credit`, await page.locator(".workshop-discoveries strong").first().textContent() === "1 / 2");
      await page.getByRole("button", { name: "Ask for testing evidence", exact: true }).click();
      await page.getByRole("button", { name: "The evidence", exact: true }).click();
      check(`${width}: both briefs unlock an in-page build note`, await page.locator(".workshop-discoveries strong").first().textContent() === "2 / 2" && await page.locator(".workshop-build-note").isVisible());
      check(`${width}: opaque reading score is not active`, await page.locator(".exploration-trigger").count() === 0);
      await page.getByRole("link", { name: "Skip to work", exact: true }).click();
      await page.waitForFunction(() => {
        const top = document.getElementById("projects").getBoundingClientRect().top;
        return top >= 75 && top < 180;
      });

      await navigate("honors");
      const certificate = page.locator("#honors .certificate-image-trigger").first();
      await certificate.click();
      await page.getByRole("dialog").locator("img").evaluate(image => image.decode());
      await page.keyboard.press("Escape");
      await page.waitForFunction(() => document.activeElement === document.querySelector("#honors .certificate-image-trigger"));
      check(`${width}: certificate preview restores focus`, await certificate.evaluate(button => button === document.activeElement));

      await navigate("contact");
      check(`${width}: contact fields have associated labels`, await page.getByRole("textbox", { name: "Your name", exact: true }).count() === 1 &&
        await page.getByRole("textbox", { name: "Email address", exact: true }).count() === 1 &&
        await page.getByRole("textbox", { name: "A little about your project", exact: true }).count() === 1);
      check(`${width}: email handoff is described before submission`, await page.locator("#email-draft-help").innerText().then(text => text.includes("nothing is submitted")));
      await page.screenshot({ path: path.join(out, `${width}-contact.png`) });

      await page.getByRole("button", { name: "Open Terminal", exact: true }).click();
      const terminal = page.getByRole("dialog", { name: "Portfolio terminal", exact: true });
      const input = page.getByRole("textbox", { name: "Terminal command", exact: true });
      await input.fill("help");
      await input.press("Enter");
      await terminal.getByText("List recent projects", { exact: true }).waitFor();
      await page.keyboard.press("Escape");
      check(`${width}: terminal closes back to its opener`, await page.getByRole("button", { name: "Open Terminal", exact: true }).evaluate(button => button === document.activeElement));

      await navigate("hero");
      await page.waitForFunction(() => scrollY < 2);
      const originalFocus = page.getByRole("link", { name: "Explore my work", exact: true });
      await originalFocus.focus();
      const beforeShortcut = await page.evaluate(() => scrollY);
      await page.keyboard.press("Control+k");
      await page.waitForFunction(() => document.activeElement?.id === "terminal-command");
      await page.keyboard.press("Escape");
      try {
        await page.waitForFunction(() => document.activeElement?.textContent?.includes("Explore my work"));
      } catch (error) {
        report.shortcutFailure = await page.evaluate(() => ({
          active: document.activeElement?.outerHTML.slice(0, 1000),
          dialogs: document.querySelectorAll('[role="dialog"]').length,
          scrollY,
        }));
        throw error;
      }
      check(`${width}: keyboard terminal does not jump to the footer on close`, Math.abs(await page.evaluate(() => scrollY) - beforeShortcut) < 2);

      await page.keyboard.press("Control+k");
      await page.waitForFunction(() => document.activeElement?.id === "terminal-command");
      await input.fill("projects");
      await input.press("Enter");
      await terminal.getByRole("link", { name: /Wazzefni/ }).click();
      await page.waitForFunction(() => document.activeElement?.id === "project-wazzefni" && !document.querySelector('[role="dialog"]'));
      check(`${width}: a terminal project link closes the dialog and opens the right card`, await page.locator("#project-wazzefni").isVisible());

      await page.goto(new URL("#project-wazzefni", url).href);
      await page.reload({ waitUntil: "load" });
      await page.locator("#project-wazzefni").waitFor({ state: "attached" });
      await page.evaluate(() => document.fonts.ready);
      await page.waitForFunction(() => {
        const target = document.getElementById("project-wazzefni");
        const top = target.getBoundingClientRect().top;
        return target.closest("details").open && top >= 75 && top < 180;
      });
      check(`${width}: a direct project link opens the optional work on reload`, true);
      check(`${width}: no duplicate SVG or control IDs`, await page.locator("[id]").evaluateAll(elements => new Set(elements.map(element => element.id)).size === elements.length));
      check(`${width}: no horizontal overflow`, await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth + 1));
    } finally {
      await context.close();
    }
  }

  const context = await browser.newContext({ viewport: { width: 390, height: 844 }, reducedMotion: "reduce" });
  try {
    const page = await context.newPage();
    await page.goto(new URL("#workshop", url).href, { waitUntil: "load" });
    await page.locator("#workshop-scene-2").waitFor();
    check("reduced motion: complete static workshop, without a tour requirement", await page.locator(".workshop-scene:visible").count() === 3);
    check("reduced motion: native anchors and no running choreography", await page.evaluate(() =>
      getComputedStyle(document.documentElement).scrollBehavior === "auto" &&
      [...document.querySelectorAll(".workshop-scene,.workshop-agent")].every(element => {
        const style = getComputedStyle(element);
        return style.animationName === "none" || parseFloat(style.animationDuration) <= 0.001;
      })));
    await page.screenshot({ path: path.join(out, "reduced-motion-workshop.png"), fullPage: true });
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
