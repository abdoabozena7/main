import { clamp01, stageProgress } from "./construction";
import { waterArrival } from "./fluidScroll";

export type SceneBox = { left: number; top: number; width: number; height: number };
export type SceneMotion = "develop" | "rail" | "stamp" | "unfold" | "shutter" | "diagonal" | "signal";
export type SceneDirection = -1 | 1;
export type ConstructionOperation = "trace" | "create-slot" | "duplicate" | "drag" | "resize" | "populate" | "type" | "replace" | "align" | "commit";
export type ConstructionJob = {
  id: string;
  operation: ConstructionOperation;
  targetId: string;
  sourceId?: string;
  dependsOn: string[];
  agentRole: "layout" | "content" | "asset" | "style";
  durationMs: number;
};
export type ConstructionScene = { id: string; root: HTMLElement; jobs: ConstructionJob[]; state: "unstarted" | "building" | "complete" };
const smooth = (p: number) => p * p * (3 - 2 * p);
const mix = (a: number, b: number, p: number) => a + (b - a) * p;
export const editorApproachMs = 160;

/** Approach is part of the existing local job budget, never a scroll queue. */
export function operationTiming(operation: ConstructionOperation, progress: number, durationMs: number) {
  const lead = operation === "commit" ? 0 : Math.min(editorApproachMs, durationMs * .28) / Math.max(1, durationMs);
  const work = clamp01((progress - lead) / Math.max(.01, 1 - lead));
  return { approach: lead ? clamp01(progress / lead) : 1, work,
    phase: progress < lead ? "approach" : work > .94 ? "release" : "work" };
}

/** Document-space transfer: scrolling projects both ends equally, without lag. */
export function editorTravel(from: { x: number; y: number }, to: { x: number; y: number }, progress: number, lane: number) {
  const p = smooth(clamp01(progress)), dx = to.x - from.x, dy = to.y - from.y;
  const length = Math.hypot(dx, dy) || 1, bend = Math.min(24, length * .08) * (lane % 2 ? -1 : 1);
  const arc = Math.sin(p * Math.PI) * bend;
  return { x: mix(from.x, to.x, p) - dy / length * arc, y: mix(from.y, to.y, p) + dx / length * arc };
}

/** All coordinates are current DOM measurements. Only choreography ratios are fixed. */
export function constructionScene(destination: SceneBox, source: SceneBox, progress: number) {
  const carry = smooth(stageProgress(progress, .16, .60));
  const resize = smooth(stageProgress(progress, .60, .86));
  const scale = mix(.58, 1, resize);
  const width = destination.width * scale, height = destination.height * scale;
  const left = mix(source.left, destination.left, carry);
  const top = mix(source.top, destination.top, carry) - Math.sin(carry * Math.PI) * Math.min(38, destination.height * .18);
  const phase = progress < .16 ? "pick" : progress < .60 ? "carry" : progress < .86 ? "resize" : "align";
  return {
    left, top, width, height, scale, phase,
    // The cursor grips the top edge, then deliberately takes the resize handle.
    gripX: left + width * (progress < .60 ? .22 : .98),
    gripY: top + height * (progress < .60 ? .06 : .98),
    replacement: smooth(stageProgress(progress, .56, .73)),
    opacity: Math.min(1, clamp01(progress / .07)),
    handoff: smooth(stageProgress(progress, .94, 1)),
  };
}

/** Semantic operations use the measured component as their coordinate system.
 * A resize keeps its top-left anchor, and every pointer stays on the active edge. */
export function operationPose(operation: ConstructionOperation, destination: SceneBox, source: SceneBox, progress: number) {
  const p = smooth(clamp01(progress));
  let box = { ...destination };
  let x = destination.left, y = destination.top;
  if (operation === "duplicate" || operation === "drag") {
    box = {
      left: mix(source.left, destination.left, p), top: mix(source.top, destination.top, p),
      width: mix(source.width, destination.width, p), height: mix(source.height, destination.height, p),
    };
    x = box.left + box.width * .2; y = box.top + Math.min(12, box.height * .1);
  } else if (operation === "resize" || operation === "create-slot") {
    box.width *= mix(.22, 1, p); box.height *= mix(.24, 1, p);
    x = box.left + box.width; y = box.top + box.height;
  } else if (operation === "trace") {
    const perimeter = (box.width + box.height) * 2;
    const d = clamp01(progress) * perimeter;
    if (d < box.width) x += d;
    else if (d < box.width + box.height) { x += box.width; y += d - box.width; }
    else if (d < box.width * 2 + box.height) { x += box.width * 2 + box.height - d; y += box.height; }
    else y += perimeter - d;
  } else if (operation === "align") {
    x += box.width; y += box.height * p;
  } else {
    x += box.width * p; y += Math.min(18, box.height * .5);
  }
  return { box, x, y };
}

export function registrationClip(motion: SceneMotion, progress: number, direction: SceneDirection) {
  const p = clamp01(progress);
  if (p === 1) return "none";
  const remaining = (1 - p) * 100;
  switch (motion) {
    case "develop": return `inset(0 0 ${remaining}% 0)`;
    case "unfold": return `inset(${remaining}% 0 0 0)`;
    case "stamp": return `inset(${remaining / 2}%)`;
    case "shutter": return `inset(0 ${remaining / 2}%)`;
    case "diagonal": {
      const reach = p * 200;
      const x = (n: number) => `${direction === 1 ? n : 100 - n}%`;
      return reach <= 100
        ? `polygon(${x(0)} 0%, ${x(reach)} 0%, ${x(0)} ${reach}%)`
        : `polygon(${x(0)} 0%, ${x(100)} 0%, ${x(100)} ${reach - 100}%, ${x(reach - 100)} 100%, ${x(0)} 100%)`;
    }
    default: return direction === 1 ? `inset(0 ${remaining}% 0 0)` : `inset(0 0 0 ${remaining}%)`;
  }
}

/** Place the same decoded surface with a chapter-specific stroke, then hold the exact landing. */
export function registrationPlacement(motion: SceneMotion, destination: SceneBox, progress: number, direction: SceneDirection) {
  const { left, top, width, height } = destination;
  if (progress >= .82) return { box: destination, x: left + width * .2, y: top + Math.min(12, height * .1), clip: "none" };
  const p = waterArrival(progress / .82), slack = 1 - p;
  let sx = 1, sy = 1, dx = 0, dy = 0, pivot = .5;
  let clip = "none";
  switch (motion) {
    case "develop":
      sx = sy = mix(.96, 1, p); dy = -Math.min(17, height * .13) * slack;
      clip = registrationClip(motion, p, direction);
      break;
    case "rail":
      sx = sy = mix(.76, 1, p); dx = direction * Math.min(28, width * .32) * slack;
      break;
    case "stamp":
      sx = sy = mix(1.13, 1, p); dy = -Math.min(10, height * .12) * slack;
      break;
    case "unfold":
      sy = mix(.54, 1, p); pivot = 0;
      break;
    case "shutter":
      dy = Math.min(15, height * .12) * slack;
      clip = registrationClip(motion, p, direction);
      break;
    case "diagonal":
      sx = sy = mix(.84, 1, p); dx = direction * Math.min(30, width * .2) * slack;
      dy = Math.min(22, height * .18) * slack - Math.sin(Math.PI * p) * 5;
      clip = registrationClip(motion, mix(.42, 1, p), direction);
      break;
    case "signal":
      sx = mix(.54, 1, p); dy = -Math.min(9, height * .12) * slack;
      clip = registrationClip(motion, p, direction);
  }
  const box = { left: left + (1 - sx) * width / 2 + dx, top: top + (1 - sy) * height * pivot + dy, width: width * sx, height: height * sy };
  return { box, x: box.left + box.width * .2, y: box.top + Math.min(12, box.height * .1), clip };
}

export function registrationMarks(motion: SceneMotion, box: SceneBox, progress: number, direction: SceneDirection) {
  const { left: x, top: y, width, height } = box;
  const right = x + width, bottom = y + height, middle = x + width / 2;
  const tick = Math.min(7, width / 4, height / 4);
  switch (motion) {
    case "develop": {
      const line = y + height * progress;
      return `M${x - tick},${line}h${tick * 2}M${right - tick},${line}h${tick * 2}`;
    }
    case "rail": {
      const line = x + width * (direction === 1 ? progress : 1 - progress);
      return `M${x},${bottom}H${right}M${line},${bottom - tick}v${tick * 2}`;
    }
    case "stamp":
      return `M${middle - tick},${y}h${tick * 2}m${-tick},${-tick}v${tick * 2}M${middle - tick},${bottom}h${tick * 2}m${-tick},${-tick}v${tick * 2}`;
    case "unfold":
      return `M${x},${y + tick}v${-tick}H${right}v${tick}M${x},${bottom}h${tick * 2}M${right - tick * 2},${bottom}h${tick * 2}`;
    case "shutter":
      return `M${middle - width * progress / 2},${y}v${tick}M${middle + width * progress / 2},${bottom}v${-tick}`;
    case "diagonal":
      return direction === 1
        ? `M${x},${y + tick}l${tick},${-tick}M${right - tick},${bottom}l${tick},${-tick}`
        : `M${right - tick},${y}l${tick},${tick}M${x},${bottom - tick}l${tick},${tick}`;
    case "signal":
      return `M${x},${bottom}h${tick * 2}v${-tick}h${tick * 2}v${tick}h${tick * 2}`;
  }
}
