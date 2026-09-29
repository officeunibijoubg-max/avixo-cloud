import { describe, expect, it } from "vitest";
import { resample, scoreDrawing } from "@/services/scoring";
import { TOLERANCE } from "@/config/scoring";
import { shapeLessons } from "./shapes";

describe("формите", () => {
  it("всяка форма, нарисувана точно, е отлична", () => {
    for (const l of shapeLessons)
      expect(scoreDrawing(l.templates[0].strokes, l.templates, "normal").score, l.id).toBeGreaterThanOrEqual(90);
  });

  it("треперещо, но вярно нарисуване минава", () => {
    for (const l of shapeLessons)
      for (let seed = 1; seed <= 4; seed++) {
        const shaky = l.templates[0].strokes.map((s) =>
          resample(s, 1.5).map((pt, i) => ({ x: pt.x + 2 + Math.sin(i / 5 + seed) * 3, y: pt.y - 2 + Math.cos(i / 7 + seed) * 3 })),
        );
        expect(scoreDrawing(shaky, l.templates, "normal").score, `${l.id} ${seed}`).toBeGreaterThanOrEqual(TOLERANCE.normal.passScore);
      }
  });

  it("кръг не минава за квадрат, черта не минава за кръг", () => {
    const get = (id: string) => shapeLessons.find((l) => l.id === `shape-${id}`)!;
    expect(scoreDrawing(get("circle").templates[0].strokes, get("square").templates, "normal").score).toBeLessThan(TOLERANCE.normal.passScore);
    expect(scoreDrawing(get("square").templates[0].strokes, get("circle").templates, "normal").score).toBeLessThan(TOLERANCE.normal.passScore);
    expect(scoreDrawing(get("rain").templates[0].strokes, get("circle").templates, "normal").score).toBeLessThan(TOLERANCE.normal.passScore);
  });
});
