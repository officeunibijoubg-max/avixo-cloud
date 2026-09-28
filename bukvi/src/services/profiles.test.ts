import { describe, expect, it } from "vitest";
import { addProfile, defaultProfile, removeProfile, switchProfile, type ProfilesSlice } from "./profiles";
import { emptyProgress, recordWriting } from "./progress";

const start = (): ProfilesSlice => ({
  progress: recordWriting(emptyProgress(), "А", 90, true, 10).progress,
  mascot: "bear",
  profiles: [defaultProfile()],
  activeId: "p1",
  stored: {},
});

describe("профили", () => {
  it("новото дете започва отначало, а старото си пази прогреса и героя", () => {
    let s = addProfile(start(), "Мария", "🐰");
    expect(s.activeId).toBe("p2");
    expect(s.progress.coins).toBe(0);
    expect(s.mascot).toBe("lion");
    s = { ...s, progress: recordWriting(s.progress, "О", 90, true, 10).progress };
    s = switchProfile(s, "p1");
    expect(s.progress.coins).toBe(10);
    expect(s.progress.characters["А"]).toBeDefined();
    expect(s.progress.characters["О"]).toBeUndefined();
    expect(s.mascot).toBe("bear");
    s = switchProfile(s, "p2");
    expect(s.progress.characters["О"]).toBeDefined();
  });

  it("не трие активното или последното дете", () => {
    const one = start();
    expect(removeProfile(one, "p1")).toBe(one);
    const two = addProfile(one, "Иво", "🐻");
    expect(removeProfile(two, "p2").profiles).toHaveLength(2);
    const back = switchProfile(two, "p1");
    const removed = removeProfile(back, "p2");
    expect(removed.profiles.map((p) => p.id)).toEqual(["p1"]);
    expect(removed.stored.p2).toBeUndefined();
  });
});
