import { describe, expect, it } from "vitest";
import type { Stroke, StrokeTemplate } from "@/lib/types";
import { allLessons, getLessonByChar } from "@/data/lessons";
import { resample, scoreDrawing } from "./scoring";
import { TOLERANCE } from "@/config/scoring";

// Детерминиран генератор, за да са тестовете стабилни.
function rng(seed: number) {
  let s = seed;
  return () => {
    s = (s * 1664525 + 1013904223) % 4294967296;
    return s / 4294967296;
  };
}

/** „Детско“ изписване: леко треперене, изместване и мащаб. */
function childDraw(template: StrokeTemplate, seed: number, wobble = 3, shift = 4, scale = 0.08): Stroke[] {
  const r = rng(seed);
  const dx = (r() * 2 - 1) * shift;
  const dy = (r() * 2 - 1) * shift;
  const k = 1 + (r() * 2 - 1) * scale;
  const phase = r() * 6;
  return template.strokes.map((s) =>
    resample(s, 1.5).map((pt, i) => ({
      x: 50 + (pt.x - 50) * k + dx + Math.sin(i / 5 + phase) * wobble + (r() - 0.5),
      y: 50 + (pt.y - 50) * k + dy + Math.cos(i / 7 + phase) * wobble + (r() - 0.5),
    })),
  );
}

const lesson = (c: string) => {
  const l = getLessonByChar(c);
  if (!l) throw new Error(c);
  return l;
};

describe("шаблоните", () => {
  it("има шаблон за всички 70 символа (цифри, главни и малки букви)", () => {
    expect(allLessons).toHaveLength(70);
    for (const l of allLessons) expect(l.templates.length, l.character).toBeGreaterThan(0);
  });

  it("всеки шаблон оценен срещу себе си е отличен при всички трудности", () => {
    for (const l of allLessons)
      for (const d of ["easy", "normal", "hard"] as const)
        expect(scoreDrawing(l.templates[0].strokes, l.templates, d).score, `${l.character} ${d}`).toBeGreaterThanOrEqual(90);
  });
});

describe("детско изписване", () => {
  it("треперещо, но вярно изписване минава", () => {
    for (const l of allLessons)
      for (let seed = 1; seed <= 5; seed++) {
        const res = scoreDrawing(childDraw(l.templates[0], seed * 31 + l.character.charCodeAt(0)), l.templates, "normal");
        expect(res.score, `${l.character} seed ${seed}`).toBeGreaterThanOrEqual(TOLERANCE.normal.passScore);
      }
  });

  it("писане без помощ (hard) — по-малко и встрани, но вярно", () => {
    for (const c of ["А", "Б", "О", "М", "1", "2", "3", "8"]) {
      const l = lesson(c);
      const small = l.templates[0].strokes.map((s) => s.map((pt) => ({ x: 10 + pt.x * 0.5, y: 30 + pt.y * 0.5 })));
      expect(scoreDrawing(small, l.templates, "hard").score, c).toBeGreaterThanOrEqual(TOLERANCE.hard.passScore);
    }
  });

  it("А без чертичката не е вярна", () => {
    const a = lesson("А");
    const noBar = a.templates[0].strokes.slice(0, 2);
    expect(scoreDrawing(noBar, a.templates, "normal").score).toBeLessThan(TOLERANCE.normal.passScore);
  });

  it("обратната посока губи точки", () => {
    const o = lesson("О");
    const forward = scoreDrawing(o.templates[0].strokes, o.templates, "normal").score;
    const reversed = scoreDrawing([o.templates[0].strokes[0].slice().reverse()], o.templates, "normal").score;
    expect(reversed).toBeLessThan(forward);
  });

  it("точка или драсване не минават", () => {
    const a = lesson("А");
    expect(scoreDrawing([[{ x: 50, y: 50 }]], a.templates, "easy").score).toBeLessThan(30);
    expect(scoreDrawing([[{ x: 40, y: 40 }, { x: 45, y: 42 }]], a.templates, "easy").score).toBeLessThan(30);
  });

  it("драскане по цялото поле не минава", () => {
    const r = rng(7);
    const scribble: Stroke = Array.from({ length: 200 }, () => ({ x: 10 + r() * 80, y: 10 + r() * 80 }));
    for (const c of ["А", "О", "1", "3"])
      expect(scoreDrawing([scribble], lesson(c).templates, "easy").score, c).toBeLessThan(TOLERANCE.easy.passScore);
  });
});

describe("различава символите от демонстрационния набор", () => {
  const demo = ["А", "Б", "О", "М", "1", "2", "3", "8"];
  for (const target of demo)
    for (const drawn of demo) {
      if (target === drawn) continue;
      it(`${drawn} не се приема за ${target}`, () => {
        const res = scoreDrawing(lesson(drawn).templates[0].strokes, lesson(target).templates, "normal");
        expect(res.score).toBeLessThan(TOLERANCE.normal.passScore);
      });
    }
});

describe("обяснение на грешката", () => {
  it("вярната А няма нищо извън формата", async () => {
    const { diagnoseDrawing } = await import("./scoring");
    const a = lesson("А");
    const d = diagnoseDrawing(a.templates[0].strokes, a.templates[0], "easy");
    expect(d.offShape.flat().some(Boolean)).toBe(false);
    expect(d.missed).toHaveLength(0);
  });

  it("А без чертичка: липсва чертичката; драсване встрани е извън формата", async () => {
    const { diagnoseDrawing } = await import("./scoring");
    const a = lesson("А");
    const legs = a.templates[0].strokes.slice(0, 2);
    const stray = [{ x: 85, y: 20 }, { x: 95, y: 30 }];
    const d = diagnoseDrawing([...legs, stray], a.templates[0], "easy");
    expect(d.missed.length).toBeGreaterThan(0);
    expect(d.missed[0].every((p) => Math.abs(p.y - 60) < 1)).toBe(true);
    expect(d.offShape[2].every(Boolean)).toBe(true);
    expect(d.offShape[0].some(Boolean)).toBe(false);
  });
});
