import type { Point, Stroke, StrokeTemplate } from "@/lib/types";

// Малки помощници, с които шаблоните се описват като отсечки и дъги
// в квадрата 0..100. Главните букви са между y=10 (горна линия) и y=90 (основа).

export const p = (x: number, y: number): Point => ({ x, y });

/** Начупена линия през дадените точки. */
export const line = (...pts: [number, number][]): Stroke => pts.map(([x, y]) => p(x, y));

/**
 * Дъга на елипса. Ъглите са в градуси; y расте надолу, затова нарастващ ъгъл
 * върви по часовниковата стрелка. От a0 към a1 — в която посока е нужно.
 */
export function arc(cx: number, cy: number, rx: number, ry: number, a0: number, a1: number): Stroke {
  const span = Math.abs(a1 - a0);
  const steps = Math.max(6, Math.round(span / 10));
  const out: Stroke = [];
  for (let i = 0; i <= steps; i++) {
    const a = ((a0 + ((a1 - a0) * i) / steps) * Math.PI) / 180;
    out.push(p(round(cx + rx * Math.cos(a)), round(cy + ry * Math.sin(a))));
  }
  return out;
}

/** Слепва няколко части в едно непрекъснато движение (без повтаряне на общите точки). */
export function join(...parts: Stroke[]): Stroke {
  const out: Stroke = [];
  for (const part of parts) {
    for (const pt of part) {
      const last = out[out.length - 1];
      if (last && Math.abs(last.x - pt.x) < 0.01 && Math.abs(last.y - pt.y) < 0.01) continue;
      out.push(pt);
    }
  }
  return out;
}

export const tpl = (...strokes: Stroke[]): StrokeTemplate => ({ strokes });

function round(n: number) {
  return Math.round(n * 100) / 100;
}
