import { useEffect, useMemo, useRef } from "react";
import { stepFluidMotion, type FluidState, type WheelMotion } from "@/lib/fluidScroll";
import "@/styles/fluid-scroll.css";

type Sheet = { top: number; height: number; weight: number };
const properties = ["--fluid-pull", "--fluid-shear", "--fluid-stretch", "--fluid-origin"];
const clamp = (value: number, limit: number) => Math.max(-limit, Math.min(limit, value));

export function useFluidScroll(): WheelMotion {
  const engine = useRef<WheelMotion | null>(null);
  useEffect(() => {
    const reduced = matchMedia("(prefers-reduced-motion: reduce)");
    const surfaces = [...document.querySelectorAll<HTMLElement>(
      "#hero > .text-center, section > h2, #about > div, [data-scan-item], [data-project], #contact form, .finale-content, .finale-footer",
    )];
    const visible = new Set<HTMLElement>();
    const sheets = new Map<HTMLElement, Sheet>();
    let frame = 0, lastAt = 0, lastY = scrollY, target = scrollY, ignoreUntil = 0;
    let wheelActive = false, held = false, dirty = true;
    let releaseTimer: ReturnType<typeof setTimeout> | undefined;
    let pressX = 0, pressY = 0;
    let scroll: FluidState = { position: scrollY, velocity: 0 };
    let pull: FluidState = { position: 0, velocity: 0 };
    const blocked = () => document.hidden || reduced.matches ||
      !!document.querySelector('[role="dialog"],[data-exploration-map],nav button[aria-expanded="true"]') ||
      !!document.activeElement?.matches('input,textarea,select,[contenteditable="true"]');
    const clearSheet = (section: HTMLElement) => {
      section.removeAttribute("data-fluid-surface");
      properties.forEach(property => section.style.removeProperty(property));
      // The restored hover rule must not animate the final reset a second time.
      for (const animation of section.getAnimations()) {
        if (animation instanceof CSSTransition && animation.transitionProperty === "transform") animation.cancel();
      }
    };
    const reset = () => {
      cancelAnimationFrame(frame); frame = 0;
      wheelActive = false; lastY = target = scrollY;
      scroll = { position: lastY, velocity: 0 }; pull = { position: 0, velocity: 0 };
      const painted = sheets.size > 0;
      sheets.forEach((_, section) => clearSheet(section)); sheets.clear();
      delete document.documentElement.dataset.fluidScroll;
      dirty = true;
      if (painted) window.dispatchEvent(new Event("portfolio:fluid-settled"));
    };
    const stop = () => {
      ignoreUntil = performance.now() + 180;
      if (held) { wheelActive = false; cancelAnimationFrame(frame); frame = 0; return; }
      reset();
    };
    const collect = () => {
      for (const section of visible) {
        if (sheets.has(section) || section.closest("[data-building],[data-scene-building]") ||
          section.querySelector("[data-building],[data-scene-building]")) continue;
        const box = section.getBoundingClientRect();
        sheets.set(section, { top: box.top + scrollY, height: box.height, weight: .85 + surfaces.indexOf(section) % 3 * .075 });
      }
      dirty = false;
    };
    const tick = (now: number) => {
      frame = 0;
      if (held) return;
      if (blocked()) { reset(); return; }
      const dt = now - lastAt; lastAt = now;
      if (wheelActive) {
        scroll = stepFluidMotion(scroll, target, dt);
        if (Math.abs(target - scroll.position) < .35 && Math.abs(scroll.velocity) < 3) {
          scroll = { position: target, velocity: 0 }; wheelActive = false;
        }
        window.scrollTo({ top: scroll.position, behavior: "instant" });
      }
      const y = scrollY;
      pull.position = clamp(pull.position + (y - lastY) * .38, 28);
      pull = stepFluidMotion(pull, 0, dt);
      lastY = y;
      if (!wheelActive && Math.abs(pull.position) < .08 && Math.abs(pull.velocity) < 1) { reset(); return; }
      if (dirty) collect();
      document.documentElement.dataset.fluidScroll = wheelActive ? "pull" : "settle";
      for (const [section, sheet] of sheets) {
        if (!visible.has(section) || section.closest("[data-building],[data-scene-building]") ||
          section.querySelector("[data-building],[data-scene-building]")) {
          clearSheet(section); sheets.delete(section); continue;
        }
        const amount = pull.position * sheet.weight;
        section.setAttribute("data-fluid-surface", "");
        section.style.setProperty("--fluid-pull", `${amount}px`);
        section.style.setProperty("--fluid-shear", `${-amount * .009}deg`);
        section.style.setProperty("--fluid-stretch", String(1 + amount * .65 / Math.max(320, sheet.height)));
        section.style.setProperty("--fluid-origin", `${Math.max(0, Math.min(sheet.height, y + innerHeight * .5 - sheet.top))}px`);
      }
      frame = requestAnimationFrame(tick);
    };
    const wake = () => {
      if (!frame && !held && !blocked()) { lastAt = performance.now(); frame = requestAnimationFrame(tick); }
    };
    engine.current = {
      move(delta) {
        if (blocked() || held) return false;
        const maximum = Math.max(0, document.documentElement.scrollHeight - innerHeight);
        if (!wheelActive || Math.sign(delta) !== Math.sign(target - scrollY)) {
          target = scrollY; scroll = { position: scrollY, velocity: 0 };
        }
        target = Math.max(0, Math.min(maximum, target + delta));
        if (Math.abs(target - scrollY) < .5) return false;
        ignoreUntil = 0; wheelActive = true; wake();
        return true;
      },
      stop,
    };
    const observer = new IntersectionObserver(entries => {
      for (const entry of entries) {
        const section = entry.target as HTMLElement;
        if (entry.isIntersecting) visible.add(section); else visible.delete(section);
      }
      dirty = true;
    }, { rootMargin: "100px 0px" });
    surfaces.forEach(surface => observer.observe(surface));
    const onScroll = () => {
      if (held || blocked() || performance.now() < ignoreUntil) { lastY = scrollY; return; }
      if (!wheelActive && Math.abs(scrollY - lastY) > innerHeight * .45) { reset(); return; }
      if (wheelActive || Math.abs(scrollY - lastY) > .5) wake();
    };
    const onNavigation = () => { ignoreUntil = performance.now() + 500; reset(); };
    const onPointerDown = (event: PointerEvent) => {
      if (!(event.target instanceof Element) || !event.target.closest("a,button,input,textarea,select")) { stop(); return; }
      // Keep a moving control under the finger until its real click is delivered.
      held = true; pressX = event.clientX; pressY = event.clientY;
      wheelActive = false; cancelAnimationFrame(frame); frame = 0;
    };
    const onTouchMove = (event: TouchEvent) => {
      const touch = event.touches[0];
      if (touch) ignoreUntil = 0;
      if (held && touch && Math.hypot(touch.clientX - pressX, touch.clientY - pressY) > 8) { held = false; lastY = scrollY; wake(); }
    };
    const onPointerUp = () => {
      if (held) { clearTimeout(releaseTimer); releaseTimer = setTimeout(() => { held = false; stop(); }, 400); }
    };
    const release = () => { clearTimeout(releaseTimer); held = false; stop(); };
    const onFocus = () => { if (!held) stop(); };
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("keydown", onNavigation, true);
    window.addEventListener("hashchange", onNavigation); window.addEventListener("popstate", onNavigation);
    window.addEventListener("resize", onNavigation); window.addEventListener("blur", release);
    window.addEventListener("portfolio:layout-start", stop); window.addEventListener("portfolio:regroup", stop);
    window.addEventListener("portfolio:fast-return-start", stop);
    document.addEventListener("pointerdown", onPointerDown, true);
    document.addEventListener("pointerup", onPointerUp, true); document.addEventListener("pointercancel", release, true);
    document.addEventListener("touchmove", onTouchMove, { passive: true });
    document.addEventListener("click", release, true); document.addEventListener("focusin", onFocus, true);
    document.addEventListener("visibilitychange", release); reduced.addEventListener("change", release);
    return () => {
      engine.current = null; observer.disconnect(); clearTimeout(releaseTimer); reset();
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("keydown", onNavigation, true);
      window.removeEventListener("hashchange", onNavigation); window.removeEventListener("popstate", onNavigation);
      window.removeEventListener("resize", onNavigation); window.removeEventListener("blur", release);
      window.removeEventListener("portfolio:layout-start", stop); window.removeEventListener("portfolio:regroup", stop);
      window.removeEventListener("portfolio:fast-return-start", stop);
      document.removeEventListener("pointerdown", onPointerDown, true);
      document.removeEventListener("pointerup", onPointerUp, true); document.removeEventListener("pointercancel", release, true);
      document.removeEventListener("touchmove", onTouchMove);
      document.removeEventListener("click", release, true); document.removeEventListener("focusin", onFocus, true);
      document.removeEventListener("visibilitychange", release); reduced.removeEventListener("change", release);
    };
  }, []);
  return useMemo(() => ({
    move: (delta: number) => engine.current?.move(delta) ?? false,
    stop: () => engine.current?.stop(),
  }), []);
}
