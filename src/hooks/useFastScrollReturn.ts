import { useLayoutEffect, useSyncExternalStore } from "react";
import { bindSectionReturn, bindWheelMotion, getScrollCue, showScrollCue, startScrollGuard, subscribeScrollCue } from "@/lib/scrollGuard";
import { createSectionReturn } from "@/lib/sectionReturn";
import type { WheelMotion } from "@/lib/fluidScroll";

export function useFastScrollReturn(wheelMotion?: WheelMotion) {
  useLayoutEffect(() => {
    startScrollGuard();
    const releaseMotion = bindWheelMotion(wheelMotion);
    const releaseSections = bindSectionReturn(createSectionReturn(showScrollCue, () => wheelMotion?.stop()));
    return () => { releaseSections(); releaseMotion(); };
  }, [wheelMotion]);
  return useSyncExternalStore(subscribeScrollCue, getScrollCue, getScrollCue);
}
