import { describe, expect, it } from "vitest";
import { chapterTail, createChapterTracker } from "@/lib/sectionReturn";

const chapters = [
  { id: "about", start: 850, end: 1250 },
  { id: "experience", start: 1450, end: 2550 },
];
const noExposure = () => ({ qualified: 0, stories: 4 });

describe("whole chapter return", () => {
  it("uses the last complete fast traversal and lands at the chapter tail", () => {
    const tracker = createChapterTracker();
    tracker.advance(chapters, { y: 600, at: 0 }, { y: 2220, at: 590 }, 800, noExposure);
    expect(tracker.candidate()?.id).toBe("about");
    tracker.advance(chapters, { y: 2220, at: 590 }, { y: 2640, at: 730 }, 800, noExposure);
    expect(tracker.candidate()?.id).toBe("experience");
    expect(chapterTail(chapters[1], 800) + 800 - 72).toBe(chapters[1].end);
  });

  it("does not mistake leaving halfway, stopping to browse, or upward travel for skipping", () => {
    const tracker = createChapterTracker();
    tracker.advance(chapters, { y: 1890, at: 0 }, { y: 2600, at: 190 }, 800, noExposure);
    expect(tracker.candidate()).toBeUndefined();
    tracker.advance(chapters, { y: 1300, at: 410 }, { y: 1720, at: 500 }, 800, noExposure);
    tracker.advance(chapters, { y: 1720, at: 500 }, { y: 2630, at: 3070 }, 800, noExposure);
    expect(tracker.candidate()).toBeUndefined();
    tracker.advance(chapters, { y: 2630, at: 3100 }, { y: 700, at: 3400 }, 800, noExposure);
    expect(tracker.candidate()).toBeUndefined();
  });

  it("exempts meaningful exposure and only offers each missed chapter once per visit", () => {
    const tracker = createChapterTracker();
    const from = { y: 700, at: 0 }, to = { y: 2640, at: 620 };
    tracker.advance(chapters, from, to, 800, id => ({ qualified: id === "about" ? 1 : 0, stories: 4 }));
    expect(tracker.candidate()?.id).toBe("experience");
    tracker.accept("experience");
    tracker.advance(chapters, from, to, 800, noExposure);
    expect(tracker.candidate()?.id).toBe("about");
  });
});
