import { describe, expect, it } from "vitest";
import { editorTravel, operationPose, operationTiming, registrationClip, registrationPlacement, type SceneMotion } from "@/lib/constructionScene";
import { compileRecipe, discoverScenes, type RuntimeScene, type SceneUnit, type Surface } from "@/lib/constructionRecipes";

const box = { left: 10, top: 20, width: 300, height: 180 };
function unit(id: string): SceneUnit {
  return { id, root: document.createElement("div"), kind: "project", motion: "rail", direction: 1, surfaces: [], end: 0, complete: false, box };
}
function surface(u: SceneUnit, id: string, kind: Surface["kind"], part: string, el: Surface["el"] = document.createElement("div")): Surface {
  const s: Surface = { id, el, kind, part, box, lines: [], originalStyle: "", progress: 0, populated: false };
  u.surfaces.push(s); return s;
}
function scene(units: SceneUnit[]): RuntimeScene {
  return { id: "test-project-row", root: units[0].root, kind: "project", units, jobs: [], timeline: [], state: "unstarted", duration: 0, elapsed: 0, progress: 0, lastAt: 0, top: 20, bottom: 200, entered: false };
}

describe("semantic construction obligations", () => {
  it("travels to the operation before work and reaches exact measured endpoints", () => {
    const from = { x: 20, y: 400 }, to = { x: 700, y: 900 };
    expect(editorTravel(from, to, 0, 0)).toEqual(from);
    const end = editorTravel(from, to, 1, 0);
    expect(end.x).toBeCloseTo(to.x); expect(end.y).toBeCloseTo(to.y);
    const approaching = operationTiming("drag", .1, 450);
    expect(approaching.phase).toBe("approach"); expect(approaching.work).toBe(0);
    expect(operationTiming("drag", .5, 450).phase).toBe("work");
    expect(operationTiming("drag", 1, 450).work).toBe(1);
    // Scroll projects world positions; it never changes the actual contact point.
    const point = editorTravel(from, to, .5, 0);
    const shifted = editorTravel({ x: from.x, y: from.y - 100 }, { x: to.x, y: to.y - 100 }, .5, 0);
    expect(shifted.x).toBeCloseTo(point.x); expect(shifted.y).toBeCloseTo(point.y - 100);
  });
  it("a populated project copy waits for all source content and for its destination outline", () => {
    const first = unit("first"), second = unit("second"); second.source = first;
    for (const u of [first, second]) {
      surface(u, `${u.id}-frame`, "shell", "frame");
      surface(u, `${u.id}-slot`, "shell", "slot");
      surface(u, `${u.id}-heading`, "text", "heading");
      surface(u, `${u.id}-body`, "text", "body");
      surface(u, `${u.id}-image`, "asset", "media");
    }
    const row = scene([first, second]); compileRecipe(row);
    const copy = row.timeline.find(j => j.unit === second && j.operation === "duplicate")!;
    const sourceContent = row.timeline.filter(j => j.unit === first && ["type", "drag"].includes(j.operation));
    expect(sourceContent.length).toBeGreaterThan(2);
    expect(copy.start).toBeGreaterThanOrEqual(Math.max(...sourceContent.map(j => j.end)));
    expect(row.timeline.filter(j => j.unit === second && ["type", "replace"].includes(j.operation)).every(j => j.start >= copy.end)).toBe(true);
    for (const job of row.timeline) for (const id of job.dependsOn) expect(job.start).toBeGreaterThanOrEqual(row.timeline.find(j => j.id === id)!.end);
    expect(row.duration).toBeLessThanOrEqual(3600);
  });

  it("flow nodes exist before their connections and labels", () => {
    const u = unit("flow"); surface(u, "frame", "shell", "frame");
    for (let i = 0; i < 5; i++) {
      const group = document.createElementNS("http://www.w3.org/2000/svg", "g");
      const rect = document.createElementNS("http://www.w3.org/2000/svg", "rect"), text = document.createElementNS("http://www.w3.org/2000/svg", "text");
      group.append(rect, text); surface(u, `node-${i}`, "shell", "node", rect); surface(u, `label-${i}`, "text", "node-label", text);
    }
    for (let i = 0; i < 4; i++) surface(u, `edge-${i}`, "edge", "connection", document.createElementNS("http://www.w3.org/2000/svg", "path"));
    const row = scene([u]); compileRecipe(row);
    const nodeEnd = Math.max(...row.timeline.filter(j => j.surface.part === "node").map(j => j.end));
    const edges = row.timeline.filter(j => j.surface.part === "connection");
    expect(edges.every(j => j.start >= nodeEnd)).toBe(true);
    expect(row.timeline.filter(j => j.surface.part === "node-label").every(j => j.start >= Math.max(...edges.map(e => e.end)))).toBe(true);
  });

  it("a duplicate keeps its source size at pickup and arrives exactly at the measured destination", () => {
    const source = { left: 10, top: 20, width: 100, height: 50 }, target = { left: 210, top: 120, width: 160, height: 90 };
    expect(operationPose("duplicate", target, source, 0).box).toEqual(source);
    expect(operationPose("duplicate", target, source, 1).box).toEqual(target);
    const middle = operationPose("duplicate", target, source, .5);
    expect(middle.box).toEqual({ left: 110, top: 70, width: 130, height: 70 });
    expect(middle.y).toBe(77);
    for (const p of [0, .2, .7, 1]) {
      const resized = operationPose("resize", target, source, p);
      expect([resized.box.left, resized.box.top]).toEqual([target.left, target.top]);
      expect(resized.x).toBe(resized.box.left + resized.box.width);
      expect(resized.y).toBe(resized.box.top + resized.box.height);
    }
  });

  it("uses distinguishable native masks and shared landing geometry", () => {
    const motions: SceneMotion[] = ["develop", "rail", "stamp", "unfold", "shutter", "diagonal", "signal"];
    const poses = motions.map(motion => registrationPlacement(motion, box, .4, 1));
    expect(new Set(poses.map(pose => JSON.stringify([pose.box, pose.clip]))).size).toBe(motions.length);
    for (const motion of motions) {
      expect(registrationPlacement(motion, box, .9, 1).box).toEqual(box);
      expect(registrationPlacement(motion, box, .9, -1).clip).toBe("none");
      expect(registrationClip(motion, 1, 1)).toBe("none");
    }
    expect(registrationPlacement("rail", box, .4, -1).box.left)
      .toBeLessThan(registrationPlacement("rail", box, .4, 1).box.left);
    expect(registrationPlacement("stamp", box, .4, 1).box.width).toBeGreaterThan(box.width);
    expect(registrationPlacement("unfold", box, .4, 1).box.top).toBe(box.top);
  });

  it("assigns neighboring work by subject rather than viewport or random replay", () => {
    const section = document.createElement("section");
    section.id = "projects";
    section.innerHTML = '<div data-project="hivo"></div><div data-project="harrtest"></div><div data-project="ya-rab-ostorha"></div>';
    const motions = () => discoverScenes([section]).flatMap(scene => scene.units.map(unit => unit.motion));
    const original = motions();
    expect(new Set(original).size).toBe(3);
    section.prepend(section.lastElementChild!);
    expect(motions()).toEqual([original[2], original[0], original[1]]);
  });
});
