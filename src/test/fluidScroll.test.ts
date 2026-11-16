import { describe, expect, it } from "vitest";
import { stepFluidMotion } from "@/lib/fluidScroll";

describe("fluid page pull", () => {
  it("moves progressively instead of jumping to the wheel target", () => {
    let state = { position: 0, velocity: 0 };
    for (let frame = 0; frame < 60; frame++) {
      const next = stepFluidMotion(state, 160, 1000 / 60);
      expect(next.position).toBeGreaterThanOrEqual(state.position);
      expect(next.position).toBeLessThan(160);
      state = next;
    }
    expect(state.position).toBeCloseTo(160, 1);
    expect(state.velocity).toBeLessThan(.1);
  });

  it("settles consistently at 60 and 120 Hz", () => {
    const simulate = (rate: number) => {
      let state = { position: 28, velocity: 70 };
      for (let frame = 0; frame < rate; frame++) state = stepFluidMotion(state, 0, 1000 / rate);
      return state;
    };
    expect(simulate(60).position).toBeCloseTo(simulate(120).position, 8);
    expect(simulate(60).velocity).toBeCloseTo(simulate(120).velocity, 8);
  });

  it("converges after a target reversal without a perpetual oscillation", () => {
    let state = { position: 100, velocity: 500 };
    for (let frame = 0; frame < 120; frame++) state = stepFluidMotion(state, 40, 1000 / 60);
    expect(state.position).toBeCloseTo(40, 5);
    expect(Math.abs(state.velocity)).toBeLessThan(.001);
  });
});
