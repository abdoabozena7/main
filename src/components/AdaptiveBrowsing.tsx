import { createPortal } from "react-dom";
import { useAdaptiveBrowsing } from "@/hooks/useAdaptiveBrowsing";
import { useFastScrollReturn } from "@/hooks/useFastScrollReturn";
import { useFluidScroll } from "@/hooks/useFluidScroll";
import "@/styles/adaptive.css";
import "@/styles/section-return.css";

const returnMessages = [
  ["What's the rush?", "We haven't even met properly."],
  ["Nice try.", "You're not skipping the good part."],
  ["Easy, speedrunner.", "This isn't a race to the footer."],
  ["Plot twist.", "We're going back to the beginning."],
  ["Hold your horses.", "I haven't shown you the cool stuff yet."],
  ["That was quick.", "At least pretend you're interested."],
  ["Already in a hurry?", "Come on, enjoy the ride."],
];
const returnVariants = ["ticket", "terminal", "note", "editorial", "layers", "glitch"];

export default function AdaptiveBrowsing() {
  const wheelMotion = useFluidScroll();
  const cue = useFastScrollReturn(wheelMotion);
  useAdaptiveBrowsing();
  const index = Math.max(0, cue.activation - 1);
  const variant = returnVariants[index % returnVariants.length];
  const [title, subtitle] = returnMessages[index % returnMessages.length];
  const message = cue.chapter ? `Back to the end of ${cue.chapter}.` : `${title} ${subtitle}`;
  return <>
    {createPortal(
      <div className="section-return-cue" data-visible={cue.visible} data-variant={variant}>
        {cue.activation > 0 && <div className="return-popup" key={cue.activation} aria-hidden="true">
          <strong>Slow Down</strong><span>{message}</span>
        </div>}
        <div role="status" aria-atomic="true" className="sr-only">{cue.visible ? `Slow Down. ${message}` : ""}</div>
      </div>, document.body,
    )}
  </>;
}
