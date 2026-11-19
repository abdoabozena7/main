import { waterArrival } from "./fluidScroll";
import { endScrollReturn, getScrollIntent, navigateForScrollReturn, subscribeScrollTravel } from "./scrollIntent";

type Chapter = { id: string; start: number; end: number };
type Exposure = { qualified: number; stories: number };
type Passage = Exposure & { id: string; elapsedMs: number };
type Sample = { y: number; at: number };
const idleMs = 180;
const readingTop = 80;
const readingBottom = 72;
const readingBlocked = '[role="dialog"],[data-exploration-map],nav button[aria-expanded="true"]';

export function createChapterTracker() {
  const entries = new Map<string, number>();
  const returned = new Set<string>();
  let pending: Passage | undefined;
  const reset = () => { entries.clear(); pending = undefined; };
  return {
    advance(chapters: Chapter[], from: Sample, to: Sample, viewport: number, evidenceFor: (id: string) => Exposure) {
      if (to.y < from.y - 2) { reset(); return; }
      if (to.y <= from.y) return;
      const start = from.y + readingTop, end = to.y + readingTop;
      const crossing = (edge: number) => from.at + (to.at - from.at) * (edge - start) / (end - start);
      for (const chapter of chapters) {
        if (returned.has(chapter.id)) continue;
        if (start <= chapter.start && end >= chapter.start && !entries.has(chapter.id)) {
          entries.set(chapter.id, crossing(chapter.start));
        }
        if (start >= chapter.end || end < chapter.end) continue;
        const entered = entries.get(chapter.id);
        entries.delete(chapter.id);
        if (entered === undefined) continue;
        const elapsedMs = Math.max(16, crossing(chapter.end) - entered);
        const screens = (chapter.end - chapter.start) / viewport;
        const budget = Math.min(2800, Math.max(850, 1500 * screens));
        if (elapsedMs > budget || screens * 1000 / elapsedMs < 1.25) continue;
        const exposure = evidenceFor(chapter.id);
        if (!exposure.qualified) pending = { id: chapter.id, elapsedMs, ...exposure };
      }
    },
    candidate: () => pending,
    accept(id: string) { returned.add(id); reset(); },
    reset,
  };
}

export function chapterTail(chapter: Chapter, viewport: number) {
  return Math.max(0, chapter.start - readingTop, chapter.end - viewport + readingBottom);
}

const documentTop = (element: HTMLElement) => {
  let top = 0;
  for (let node: HTMLElement | null = element; node; node = node.offsetParent instanceof HTMLElement ? node.offsetParent : null) top += node.offsetTop;
  return top;
};

function chapterExposure(section: HTMLElement): Exposure {
  const stories = section.querySelectorAll<HTMLElement>("[data-discovery-id]");
  let qualified = 0;
  for (const story of stories) {
    if (Number(story.dataset.qualityExposure) >= .6 && Number(story.dataset.qualityCoverage) >= 75) qualified++;
  }
  return { stories: stories.length, qualified };
}

export type SectionReturn = ReturnType<typeof createSectionReturn>;

/** Watches actual document travel, not the size or rate of wheel events. */
export function createSectionReturn(announce: (chapter: string) => void, stopMotion: () => void) {
  const sections = [...document.querySelectorAll<HTMLElement>("[data-fluid-page] section[id][data-construction-section]:not(#hero)")];
  const byId = new Map(sections.map(section => [section.id, section]));
  const tracker = createChapterTracker();
  const reduced = matchMedia("(prefers-reduced-motion: reduce)");
  let bounds: Chapter[] = [], dirty = true, touching = false;
  let observedAt = 0, inputUntil = 0;
  let timer: ReturnType<typeof setTimeout> | undefined, frame = 0;
  const blocked = () => document.hidden || Boolean(document.querySelector(readingBlocked)) ||
    Boolean(document.activeElement?.matches('input,textarea,select,[contenteditable]:not([contenteditable="false"])'));
  const measure = () => {
    bounds = sections.flatMap(section => {
      const heading = section.querySelector<HTMLElement>(":scope > h2");
      const tail = section.lastElementChild;
      if (!heading || !(tail instanceof HTMLElement) || !tail.offsetHeight) return [];
      return [{ id: section.id, start: documentTop(heading), end: documentTop(tail) + tail.offsetHeight }];
    }).sort((a, b) => a.start - b.start);
    dirty = false;
  };
  const evidenceFor = (id: string) => chapterExposure(byId.get(id)!);
  const cancel = () => {
    clearTimeout(timer);
    if (frame) { cancelAnimationFrame(frame); frame = 0; endScrollReturn(); }
    observedAt = 0; inputUntil = 0; tracker.reset();
  };
  const returnToTail = () => {
    const pass = tracker.candidate();
    if (!pass || touching) return;
    if (blocked() || evidenceFor(pass.id).qualified) { cancel(); return; }
    stopMotion();
    navigateForScrollReturn(scrollY, true);
    measure();
    const chapter = bounds.find(chapter => chapter.id === pass.id);
    if (!chapter) { endScrollReturn(); cancel(); return; }
    const target = Math.min(chapterTail(chapter, innerHeight), document.documentElement.scrollHeight - innerHeight);
    const from = scrollY;
    if (from <= target + 2) { endScrollReturn(); cancel(); return; }
    tracker.accept(pass.id);
    observedAt = 0; inputUntil = 0;
    const title = byId.get(pass.id)?.querySelector("h2")?.textContent?.trim().replace(/\.$/, "") || pass.id;
    announce(title);
    const complete = () => {
      navigateForScrollReturn(target, false);
      window.dispatchEvent(new CustomEvent("portfolio:section-return", { detail: { ...pass, from, to: scrollY } }));
    };
    if (reduced.matches) { complete(); return; }
    const start = performance.now();
    const move = (at: number) => {
      frame = 0;
      if (blocked()) { endScrollReturn(); return; }
      const progress = (at - start) / 430;
      if (progress >= 1) { complete(); return; }
      navigateForScrollReturn(from + (target - from) * waterArrival(progress), false);
      frame = requestAnimationFrame(move);
    };
    frame = requestAnimationFrame(move);
  };
  const settle = () => {
    clearTimeout(timer);
    if (tracker.candidate() && !touching) timer = setTimeout(returnToTail, idleMs);
  };
  const observe = (from: number, to: number, now: number) => {
    if (frame || !observedAt) return;
    const intent = getScrollIntent();
    if (intent.automatic || intent.hardJump || blocked()) { cancel(); return; }
    if (now > inputUntil && !touching) { cancel(); return; }
    if (dirty) measure();
    tracker.advance(bounds, { y: from, at: observedAt }, { y: to, at: now }, innerHeight, evidenceFor);
    observedAt = now;
    settle();
  };
  const invalidate = () => { dirty = true; };
  const onClick = (event: MouseEvent) => {
    if (event.target instanceof Element && event.target.closest("a,button")) cancel();
  };
  const resize = new ResizeObserver(invalidate);
  sections.forEach(section => resize.observe(section));
  const unsubscribe = subscribeScrollTravel(observe);
  window.addEventListener("resize", invalidate, { passive: true });
  window.addEventListener("portfolio:layout-start", invalidate);
  window.addEventListener("portfolio:layout-settled", invalidate);
  document.addEventListener("click", onClick, true);
  if (sections.length) performance.mark("portfolio:chapter-tracker-ready");
  return {
    input(delta: number) {
      if (frame || delta < 0) cancel();
      endScrollReturn();
      const now = performance.now();
      if (now > inputUntil) { tracker.reset(); observedAt = now; }
      inputUntil = now + 1400;
      settle();
    },
    touch(active: boolean) { touching = active; if (active && frame) cancel(); settle(); },
    cancel() { touching = false; cancel(); },
    dispose() {
      cancel(); resize.disconnect(); unsubscribe();
      window.removeEventListener("resize", invalidate);
      window.removeEventListener("portfolio:layout-start", invalidate);
      window.removeEventListener("portfolio:layout-settled", invalidate);
      document.removeEventListener("click", onClick, true);
    },
  };
}
