import { createPortal } from "react-dom";
import { useAdaptiveBrowsing } from "@/hooks/useAdaptiveBrowsing";
import { useFastScrollReturn } from "@/hooks/useFastScrollReturn";
import { useFluidScroll } from "@/hooks/useFluidScroll";
import "@/styles/adaptive.css";
import "@/styles/section-return.css";

export default function AdaptiveBrowsing() {
  const wheelMotion = useFluidScroll();
  const cue = useFastScrollReturn(wheelMotion);
  useAdaptiveBrowsing();
  const message = cue.chapter ? `Back to the end of ${cue.chapter}.` : "Scroll a little slower to keep going.";
  return <>
    {createPortal(
      <div className="section-return-cue" data-visible={cue.visible}>
        {cue.activation > 0 && <div className="return-popup" key={cue.activation} aria-hidden="true">
          <strong>Slow Down</strong><span>{message}</span>
        </div>}
        <div role="status" aria-atomic="true" className="sr-only">{cue.visible ? `Slow Down. ${message}` : ""}</div>
      </div>, document.body,
    )}
  </>;
}
