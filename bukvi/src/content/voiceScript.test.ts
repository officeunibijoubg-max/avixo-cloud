import { describe, expect, it } from "vitest";
import { voiceLines } from "./voiceScript";

describe("сценарий за записан глас", () => {
  const lines = voiceLines();

  it("id-тата са уникални и годни за имена на файлове", () => {
    const ids = lines.map((l) => l.id);
    expect(new Set(ids).size).toBe(ids.length);
    for (const id of ids) expect(id).toMatch(/^[a-z0-9-]+$/);
  });

  it("съдържа звука и представянето на всяка буква и цифра", () => {
    const texts = new Set(lines.map((l) => l.text));
    expect(texts.has("Бъ")).toBe(true);
    expect(texts.has("Това е А. А като автобус.")).toBe(true);
    expect(texts.has("Проследи числото три.")).toBe(true);
    expect(lines.length).toBeGreaterThan(300);
  });
});
