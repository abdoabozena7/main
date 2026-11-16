import { useLayoutEffect, useSyncExternalStore } from "react";
import { bindWheelMotion, getScrollCue, startScrollGuard, subscribeScrollCue } from "@/lib/scrollGuard";
import type { WheelMotion } from "@/lib/fluidScroll";

export function useFastScrollReturn(wheelMotion?: WheelMotion) {
  useLayoutEffect(() => {
    startScrollGuard();
    return bindWheelMotion(wheelMotion);
  }, [wheelMotion]);
  return useSyncExternalStore(subscribeScrollCue, getScrollCue, getScrollCue);
}
