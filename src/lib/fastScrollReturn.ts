/** The enabled flag controls assisted scrolling and feedback.
 * Sharp downward input uses the immediate reversal threshold below. */
type FastReturnConfig = {
  enabled: boolean; destination: "input-command";
  speedViewportsPerSecond: number; sustainedMs: number; minTravelViewports: number;
  minSamples: number;
};
export const FAST_SCROLL_RETURN_CONFIG: FastReturnConfig = {
  enabled: true,
  destination: "input-command",
  speedViewportsPerSecond: 4.5,
  sustainedMs: 180,
  minTravelViewports: 1,
  minSamples: 3,
};
