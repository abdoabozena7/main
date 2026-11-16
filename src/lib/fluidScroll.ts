export type FluidState = { position: number; velocity: number };
export type WheelMotion = { move: (delta: number) => boolean; stop: () => void };

/** Exact critically damped motion, independent of the display's refresh rate. */
export function stepFluidMotion(state: FluidState, target: number, elapsedMs: number): FluidState {
  const dt = Math.min(64, Math.max(0, elapsedMs)) / 1000;
  const frequency = 14;
  const offset = state.position - target;
  const carry = state.velocity + frequency * offset;
  const decay = Math.exp(-frequency * dt);
  return {
    position: target + (offset + carry * dt) * decay,
    velocity: (state.velocity - frequency * carry * dt) * decay,
  };
}
