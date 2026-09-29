import { describe, expect, it } from "vitest";
import { voiceLines } from "./voiceScript";

describe("сценарият за записан глас", () => {
  it("всяко id е уникално (иначе един запис би казал чужда фраза)", () => {
    const ids = voiceLines().map((l) => l.id);
    expect(new Set(ids).size).toBe(ids.length);
  });
});

describe("имената на записите", () => {
  it("са само с латински букви, цифри и тире (за сигурни адреси)", () => {
    for (const l of voiceLines()) expect(l.id, l.id).toMatch(/^[a-z0-9-]+$/);
  });
});

describe("записаните гласове", () => {
  it("всеки глас от настройките има запис за всяка фраза", async () => {
    const { existsSync } = await import("node:fs");
    const { VOICES } = await import("@/config/voices");
    for (const v of VOICES) {
      const missing = voiceLines().filter((l) => !existsSync(`public/audio/${v.id}/${l.id}.mp3`));
      expect(missing.map((l) => l.id).slice(0, 5), v.id).toEqual([]);
    }
  });
});
