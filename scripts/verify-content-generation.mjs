import assert from "node:assert/strict";
import { createRequire } from "node:module";
import { mkdir, writeFile } from "node:fs/promises";
import path from "node:path";

const require = createRequire(import.meta.url);
const { chromium } = require(process.env.PLAYWRIGHT_MODULE || "C:\\Users\\A-plus\\.cache\\codex-runtimes\\codex-primary-runtime\\dependencies\\node\\node_modules\\playwright");
const url = process.env.PORTFOLIO_URL || "http://127.0.0.1:4186/main/";
const out = process.env.PROVE_IT_OUTPUT_DIR || path.join("output", "playwright", "content-generation");
await mkdir(out, { recursive: true });
const report = { url, mode: "Real Edge, native paced wheel input; 4x CPU on mobile; original text and image paint sampled over time.", checks: [], errors: [], passed: false };
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
      const client = await context.newCDPSession(page);
      if (width === 390) await client.send("Emulation.setCPUThrottlingRate", { rate: 4 });
      await page.goto(url, { waitUntil: "domcontentloaded" });
      await page.getByRole("heading", { level: 1 }).waitFor();
      await page.evaluate(() => document.fonts.ready);
      await page.waitForFunction(() => document.querySelector('[data-attention-id="experience-microsoft"]')?.hasAttribute("data-scene-id"), null, { timeout: 5000 });
      check(`${width}: below-fold generation is registered`, true);
      await page.evaluate(() => {
        window.generationFrames = [];
        window.generationDone = false;
        window.generationInteractions = [];
        for (const type of ["pointerdown", "focusin", "click"]) document.addEventListener(type, event => {
          window.generationInteractions.push({ type, at: performance.now(), target: event.target.tagName, pointerType: event.pointerType });
        }, true);
        const row = document.querySelector('[data-attention-id="experience-microsoft"]');
        const nextLogo = row.nextElementSibling.querySelector(".company-logo img");
        const heading = row.querySelector("h3");
        const image = row.querySelector("img");
        const layer = document.querySelector("[data-content-construction]");
        const start = performance.now();
        let last = 0;
        const sample = now => {
          if (now - last >= 32) {
            last = now;
            const range = document.createRange();
            range.selectNodeContents(heading);
            const text = range.getBoundingClientRect();
            const hit = fraction => {
              const node = document.elementFromPoint(text.left + text.width * fraction, text.top + text.height * .5);
              return node === heading || heading.contains(node);
            };
            const logo = image.getBoundingClientRect();
            const actors = [...layer.querySelectorAll(".scene-actor")].filter(actor => Number(getComputedStyle(actor).opacity) > .05);
            const prop = [...layer.querySelectorAll("[data-scene-prop]")].find(node =>
              node.dataset.sceneTarget === image.dataset.sceneTargetId &&
              Number(getComputedStyle(node.parentElement).opacity) > .05);
            const box = prop?.getBoundingClientRect();
            const decoded = prop?.querySelector("img");
            const nextProp = [...layer.querySelectorAll("[data-scene-prop]")].find(node =>
              node.dataset.sceneTarget === nextLogo.dataset.sceneTargetId &&
              Number(getComputedStyle(node.parentElement).opacity) > .05);
            const nextBox = nextProp?.getBoundingClientRect();
            window.generationFrames.push({
              at: now - start, state: row.dataset.sceneState,
              left: hit(.12), right: hit(.88), clip: getComputedStyle(heading).clipPath,
              workers: actors.length,
              asset: !!box && decoded?.complete && decoded.naturalWidth > 0 &&
                getComputedStyle(layer).visibility === "visible" && box.bottom > 76 && box.top < innerHeight,
              ratio: box ? box.width / logo.width : null,
              offset: box ? Math.hypot(box.left - logo.left, box.top - logo.top) : null,
              nextRatio: nextBox && nextBox.bottom > 76 && nextBox.top < innerHeight ?
                nextBox.width / nextLogo.getBoundingClientRect().width : null,
            });
          }
          if (!window.generationDone && now - start < 20000) requestAnimationFrame(sample);
          else window.generationDone = true;
        };
        requestAnimationFrame(sample);
      });
      await page.mouse.move(width - 12, height * .8);
      for (let step = 0; step < 90; step++) {
        const top = await page.locator('[data-attention-id="experience-microsoft"]').evaluate(node => node.getBoundingClientRect().top);
        if (top < height * .84) break;
        await page.mouse.wheel(0, 80);
        await page.waitForTimeout(170);
      }
      await page.waitForFunction(() => {
        const frame = window.generationFrames.at(-1);
        return frame?.asset && frame.left && !frame.right && frame.state === "building";
      });
      if (width === 390) {
        const beforeTouch = await page.locator('[data-attention-id="experience-microsoft"]').evaluate(node => ({ state: node.dataset.sceneState, at: performance.now() }));
        const box = await page.locator('[data-attention-id="experience-microsoft"]').boundingBox();
        assert.ok(box && box.y > 76 && box.y + 20 < height);
        const point = { x: box.x + box.width - 10, y: box.y + 15 };
        await client.send("Input.dispatchTouchEvent", { type: "touchStart", touchPoints: [point] });
        await page.waitForTimeout(50);
        await client.send("Input.dispatchTouchEvent", { type: "touchMove", touchPoints: [{ ...point, y: point.y - 10 }] });
        const afterTouch = await page.locator('[data-attention-id="experience-microsoft"]').evaluate(node => ({
          state: node.dataset.sceneState, at: performance.now(), events: window.generationInteractions,
        }));
        check("390: a real touch scroll does not skip in-progress generation",
          beforeTouch.state === "building" && afterTouch.state === "building", { beforeTouch, afterTouch });
        await client.send("Input.dispatchTouchEvent", { type: "touchEnd", touchPoints: [] });
      }
      await page.screenshot({ path: path.join(out, `${width}-generating.png`) });
      await page.waitForFunction(() => document.querySelector('[data-attention-id="experience-microsoft"]').dataset.sceneState === "complete");
      if (width === 390) {
        const next = page.locator('[data-attention-id="experience-microsoft"] + [data-experience-item]');
        for (let step = 0; step < 8; step++) {
          if ((await next.boundingBox())?.y < height * .84) break;
          await page.mouse.wheel(0, 80);
          await page.waitForTimeout(170);
        }
        await page.waitForFunction(() => document.querySelector('[data-attention-id="experience-microsoft"]').nextElementSibling.dataset.sceneState === "complete");
      }
      await page.evaluate(() => { window.generationDone = true; });
      const frames = await page.evaluate(() => window.generationFrames);
      await writeFile(path.join(out, `${width}-frames.json`), JSON.stringify(frames));
      const partial = frames.filter(frame => frame.left && !frame.right && frame.clip !== "none");
      const assets = frames.filter(frame => frame.asset);
      check(`${width}: real heading paint progresses through partial text`, partial.length >= 2 && new Set(partial.map(frame => frame.clip)).size >= 2, { partialFrames: partial.length });
      check(`${width}: decoded icon pixels are generated, resized and placed`,
        assets.length >= 3 && Math.min(...assets.map(frame => frame.ratio)) < .9 &&
        Math.max(...assets.map(frame => frame.ratio)) > .98 &&
        Math.min(...assets.map(frame => frame.offset)) < 4, {
          frames: assets.length, smallest: Math.min(...assets.map(frame => frame.ratio)),
          largest: Math.max(...assets.map(frame => frame.ratio)), closest: Math.min(...assets.map(frame => frame.offset)),
        });
      if (width === 390) {
        const stamp = frames.flatMap(frame => frame.nextRatio == null ? [] : [frame.nextRatio]);
        check("390: neighboring logos use visibly opposite placement gestures",
          Math.max(...stamp) > 1.06 && stamp.some(ratio => Math.abs(ratio - 1) < .02),
          { railSmallest: Math.min(...assets.map(frame => frame.ratio)), stampLargest: Math.max(...stamp) });
      }
      const final = await page.locator('[data-attention-id="experience-microsoft"]').evaluate(row => {
        const image = row.querySelector("img");
        return { masks: row.querySelectorAll("[data-building],[data-scene-building]").length, decoded: image.complete && image.naturalWidth > 0 };
      });
      check(`${width}: generation hands off to the real readable content`, final.masks === 0 && final.decoded, final);
      if (width === 390) check("390: mobile generation uses at most three simultaneous visual jobs", Math.max(...frames.map(frame => frame.workers)) <= 3);
      check(`${width}: no hero builders or moving cursors return`, await page.locator("[data-name-assembly],#hero [data-building],.agent-pointer-shape,.virtual-agent").count() === 0);
      await page.waitForFunction(() => !document.documentElement.hasAttribute("data-fluid-scroll"));
      await page.screenshot({ path: path.join(out, `${width}-generated.png`) });
      if (width === 390) {
        await page.getByRole("button", { name: "Menu", exact: true }).click();
        await page.locator('nav a[href="#projects"]:visible').click();
        await page.waitForFunction(() => Math.abs(document.querySelector("#projects").getBoundingClientRect().top) < 150);
        await page.waitForTimeout(600);
        await page.evaluate(() => {
          window.projectGeneration = [];
          window.projectGenerationDone = false;
          const row = document.querySelector('[data-project="ya-rab-ostorha"]');
          const image = row.querySelector(".project-media img");
          const start = performance.now();
          let last = 0;
          const sample = now => {
            if (now - last >= 32) {
              last = now;
              const prop = [...document.querySelectorAll("[data-scene-prop]")].find(node =>
                node.dataset.sceneTarget === image.dataset.sceneTargetId &&
                Number(getComputedStyle(node.parentElement).opacity) > .05);
              const clone = prop?.querySelector("img");
              const rect = prop?.getBoundingClientRect();
              const tokens = [...row.querySelectorAll(".palette-tag")].map(node => {
                const clip = getComputedStyle(node).clipPath;
                const rect = node.getBoundingClientRect();
                const hits = [.12, .5, .88].filter(fraction =>
                  node.contains(document.elementFromPoint(rect.left + rect.width * fraction, rect.top + rect.height / 2)));
                return { clip, hitCount: hits.length };
              });
              window.projectGeneration.push({
                state: row.dataset.sceneState,
                tokens,
                source: image.currentSrc,
                clone: clone?.currentSrc,
                mask: prop ? getComputedStyle(prop).clipPath : null,
                placed: !!rect && rect.top < innerHeight && rect.bottom > 76 && clone?.complete && clone.naturalWidth > 0,
              });
            }
            if (!window.projectGenerationDone && now - start < 20000) requestAnimationFrame(sample);
            else window.projectGenerationDone = true;
          };
          requestAnimationFrame(sample);
        });
        for (let step = 0; step < 70; step++) {
          const top = await page.locator('[data-project="ya-rab-ostorha"] .project-media').evaluate(node => node.getBoundingClientRect().top);
          if (top < height * .8) break;
          await page.mouse.wheel(0, 80);
          await page.waitForTimeout(170);
        }
        await page.waitForFunction(() => document.querySelector('[data-project="ya-rab-ostorha"]').dataset.sceneState === "complete");
        await page.evaluate(() => { window.projectGenerationDone = true; });
        const projectFrames = await page.evaluate(() => window.projectGeneration);
        await writeFile(path.join(out, "390-project-generation.json"), JSON.stringify(projectFrames));
        check("390: project technology tokens have real intermediate reveal paint",
          projectFrames.some(frame => frame.tokens.some(token => token.clip !== "none" && token.hitCount > 0 && token.hitCount < 3)));
        const placements = projectFrames.filter(frame => frame.placed);
        check("390: project media has decoded moving placement frames", placements.length >= 2, { frames: placements.length });
        check("390: driving project uses a diagonal mask before the screenshot lands",
          placements.some(frame => frame.mask?.startsWith("polygon(")) &&
          placements.some(frame => frame.mask === "none"));
        check("390: moving media reuses the already-selected responsive thumbnail",
          placements.every(frame => frame.source === frame.clone), placements.map(frame => ({ source: frame.source, clone: frame.clone })));
        await page.screenshot({ path: path.join(out, "390-project-generated.png") });
      }
      await client.detach();
    } finally { await context.close(); }
  }
  const context = await browser.newContext({ viewport: { width: 390, height: 844 }, reducedMotion: "reduce" });
  try {
    const page = await context.newPage();
    await page.goto(url, { waitUntil: "domcontentloaded" });
    await page.getByRole("heading", { level: 1 }).waitFor();
    check("reduced motion exposes content without generation masks", await page.locator("[data-building],[data-scene-building]").count() === 0);
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
