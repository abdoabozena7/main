import { FAST_SCROLL_RETURN_CONFIG as config } from "@/lib/fastScrollReturn";
import { wheelPixels } from "@/lib/scrollVelocity";
import { getScrollIntent, subscribeScrollIntent } from "@/lib/scrollIntent";
import type { WheelMotion } from "@/lib/fluidScroll";
import type { SectionReturn } from "@/lib/sectionReturn";

const inputTime = (event: Event) => {
  const timestamp = event.timeStamp;
  return timestamp > performance.timeOrigin ? timestamp - performance.timeOrigin : timestamp || performance.now();
};

let cue = { activation: 0, visible: false, chapter: "" };
let cueTimer: ReturnType<typeof setTimeout> | undefined;
let wheelMotion: WheelMotion | undefined;
let sectionReturn: SectionReturn | undefined;
let dispose: (() => void) | undefined;
const listeners = new Set<() => void>();
export const getScrollCue = () => cue;
export const subscribeScrollCue = (listener: () => void) => {
  listeners.add(listener);
  return () => { listeners.delete(listener); };
};
const publish = (next: typeof cue) => {
  cue = next;
  listeners.forEach(listener => listener());
};
function hideCue() {
  clearTimeout(cueTimer);
  if (cue.visible) publish({ ...cue, visible: false });
}
export function showScrollCue(chapter: string) {
  publish({ activation: cue.activation + 1, visible: true, chapter });
  clearTimeout(cueTimer);
  cueTimer = setTimeout(hideCue, 2200);
}
export function bindSectionReturn(controller: SectionReturn) {
  sectionReturn = controller;
  return () => {
    controller.dispose();
    if (sectionReturn === controller) { sectionReturn = undefined; hideCue(); }
  };
}
export function bindWheelMotion(motion?: WheelMotion) {
  wheelMotion = motion;
  if (motion) performance.mark("portfolio:fluid-ready");
  return () => {
    if (wheelMotion === motion) { motion?.stop(); wheelMotion = undefined; }
  };
}

/** Install before downloading React and the portfolio, not after its first render. */
export function startScrollGuard() {
    if (dispose) return;
    if (!config.enabled) return;
    // Input tracking must precede interception so reversed movement stays automatic.
    const releaseIntent = subscribeScrollIntent(() => {});
    let frame = 0;
    let touching = false, owned = false;
    let x = 0, y = 0, touchAt = 0, releaseVelocity = 0, lastMove = 0;
    let touchOrigin: EventTarget | null = null, touchOriginBlocked = false, touchOriginDirty = true;
    let viewportWidth = innerWidth;
    let lineHeight: number | undefined;
    const wheelLineHeight = () => {
      if (lineHeight === undefined) {
        const style = getComputedStyle(document.documentElement);
        lineHeight = parseFloat(style.lineHeight) || parseFloat(style.fontSize) * 1.2 || 20;
      }
      return lineHeight;
    };
    const stopInertia = () => { cancelAnimationFrame(frame); frame = 0; };
    const cancel = () => {
      wheelMotion?.stop();
      sectionReturn?.cancel(); hideCue();
      stopInertia(); touching = false; owned = false; releaseVelocity = 0;
    };
    // Visible WebViews may deliver real input while hasFocus() remains false.
    const blockedByPage = () => document.hidden ||
      !!document.querySelector('[role="dialog"],[data-exploration-map],nav button[aria-expanded="true"]') ||
      !!document.activeElement?.matches('input,textarea,select,[contenteditable]:not([contenteditable="false"])');
    const blockedByOrigin = (origin: EventTarget | null) => {
      let el = origin instanceof Element ? origin : null;
      if (el?.closest('input,textarea,select,[contenteditable]:not([contenteditable="false"]),[role="dialog"]')) return true;
      for (; el && el !== document.body; el = el.parentElement) {
        if (el.scrollHeight > el.clientHeight + 2 && /(auto|scroll)/.test(getComputedStyle(el).overflowY)) return true;
      }
      return false;
    };
    const blocked = (origin: EventTarget | null) => blockedByPage() || blockedByOrigin(origin);
    const invalidateTouchOrigin = () => { touchOriginDirty = true; };
    const apply = (delta: number, input: "touch" | "momentum") => {
      const from = scrollY;
      window.scrollTo({ top: Math.max(0, from + delta), behavior: 'instant' });
      const to = scrollY;
      window.dispatchEvent(new CustomEvent('portfolio:scroll-command', { detail: { input, reverse: false, from, to, delta } }));
      return to - from;
    };
    const wheel = (event: WheelEvent) => {
      stopInertia();
      if (event.defaultPrevented || !event.cancelable || event.ctrlKey || event.metaKey || Math.abs(event.deltaX) > Math.abs(event.deltaY) || blocked(event.target)) { cancel(); return; }
      const viewport = innerHeight;
      const mode = event.deltaMode, delta = wheelPixels(event.deltaY, mode, viewport, mode === 1 ? wheelLineHeight() : 20);
      if (!delta) return;
      sectionReturn?.input(delta);
      if (wheelMotion?.move(delta)) event.preventDefault();
    };
    const touchStart = (event: TouchEvent) => {
      wheelMotion?.stop();
      stopInertia(); touching = false; owned = false; releaseVelocity = 0;
      if (event.touches.length !== 1 || blocked(event.target)) { cancel(); return; }
      touchOrigin = event.target; touchOriginBlocked = false; touchOriginDirty = false;
      sectionReturn?.touch(true);
      touching = true;
      x = event.touches[0].clientX; y = event.touches[0].clientY; touchAt = inputTime(event);
    };
    const touchMove = (event: TouchEvent) => {
      if (!touching) return;
      if (event.touches.length !== 1 || blockedByPage()) { cancel(); return; }
      if (touchOriginDirty || event.target !== touchOrigin) {
        touchOrigin = event.target; touchOriginDirty = false;
        touchOriginBlocked = blockedByOrigin(touchOrigin);
      }
      if (touchOriginBlocked) { cancel(); return; }
      const point = event.touches[0], at = inputTime(event), delta = y - point.clientY, dx = point.clientX - x;
      if (!owned && Math.abs(delta) < 4 && Math.abs(dx) < 4) return;
      if (!owned && Math.abs(dx) > Math.abs(delta) * 1.2) { cancel(); return; }
      // Cancel the FIRST vertical move, before native momentum takes ownership.
      // Taps, horizontal gestures, nested scrolling and pinch keep native behavior.
      if (!event.cancelable) { cancel(); return; }
      event.preventDefault(); owned = true;
      if (!delta) return;
      const elapsed = at - touchAt;
      sectionReturn?.input(delta);
      apply(delta, 'touch');
      releaseVelocity = delta / Math.max(1, elapsed); lastMove = at;
      touchAt = at; y = point.clientY; x = point.clientX;
    };
    const touchEnd = (event: TouchEvent) => {
      touching = false;
      sectionReturn?.touch(false);
      if (!owned) return;
      owned = false;
      const pause = inputTime(event) - lastMove, now = performance.now();
      const releasedSpeed = releaseVelocity * Math.exp(-Math.max(0, pause - 16) / 100);
      if (pause >= 240 || Math.abs(releasedSpeed) < .05 || matchMedia('(prefers-reduced-motion: reduce)').matches) return;
      let previous = now, elapsed = 0, pending = 0, speed = Math.max(-6, Math.min(6, releasedSpeed));
      const coast = (at: number) => {
        frame = 0;
        if (touching || getScrollIntent().automatic || blocked(null)) return;
        const dt = Math.min(32, at - previous); previous = at; elapsed += dt;
        speed *= Math.exp(-dt / 180);
        pending += speed * dt;
        let boundary = false;
        if (Math.abs(pending) >= .5) {
          pending -= apply(pending, 'momentum');
          // Fractional scroll coordinates can round by a pixel. A larger
          // remainder means the browser clamped the step at a document edge.
          boundary = Math.abs(pending) > 1;
        }
        if (Math.abs(speed) > .05 && elapsed < 700 && !boundary) frame = requestAnimationFrame(coast);
      };
      frame = requestAnimationFrame(coast);
    };
    const resize = () => {
      lineHeight = undefined;
      invalidateTouchOrigin();
      if (innerWidth !== viewportWidth) { viewportWidth = innerWidth; cancel(); }
    };
    const visibility = () => { if (document.hidden) cancel(); };
    window.addEventListener('wheel', wheel, { passive: false });
    window.addEventListener('portfolio:layout-start', invalidateTouchOrigin);
    window.addEventListener('portfolio:layout-settled', invalidateTouchOrigin);
    window.addEventListener('touchstart', touchStart, { passive: true }); window.addEventListener('touchmove', touchMove, { passive: false }); window.addEventListener('touchend', touchEnd, { passive: true }); window.addEventListener('touchcancel', cancel, { passive: true });
    window.addEventListener('keydown', cancel); window.addEventListener('hashchange', cancel); window.addEventListener('popstate', cancel); window.addEventListener('blur', cancel); window.addEventListener('resize', resize); document.addEventListener('visibilitychange', visibility);
    performance.mark("portfolio:scroll-guard-ready");
    dispose = () => {
      cancel();
      releaseIntent();
      window.removeEventListener('wheel', wheel); window.removeEventListener('touchstart', touchStart); window.removeEventListener('touchmove', touchMove); window.removeEventListener('touchend', touchEnd); window.removeEventListener('touchcancel', cancel);
      window.removeEventListener('portfolio:layout-start', invalidateTouchOrigin);
      window.removeEventListener('portfolio:layout-settled', invalidateTouchOrigin);
      window.removeEventListener('keydown', cancel); window.removeEventListener('hashchange', cancel); window.removeEventListener('popstate', cancel); window.removeEventListener('blur', cancel); window.removeEventListener('resize', resize); document.removeEventListener('visibilitychange', visibility);
    };
}

if (import.meta.hot) import.meta.hot.dispose(() => { dispose?.(); dispose = undefined; });
