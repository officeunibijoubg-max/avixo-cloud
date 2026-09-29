import { describe, expect, it } from "vitest";
import { voiceLines } from "./voiceScript";

describe("сценарият за записан глас", () => {
  it("всяко id е уникално (иначе един запис би казал чужда фраза)", () => {
    const ids = voiceLines().map((l) => l.id);
    expect(new Set(ids).size).toBe(ids.length);
  });
});
