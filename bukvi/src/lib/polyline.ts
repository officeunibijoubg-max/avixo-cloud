import type { Point, Stroke } from "./types";

/** Дължина на линия и точка/посока на дадено разстояние по нея (за анимации и стрелки). */
export function measure(stroke: Stroke) {
  const cum: number[] = [0];
  for (let i = 1; i < stroke.length; i++)
    cum.push(cum[i - 1] + Math.hypot(stroke[i].x - stroke[i - 1].x, stroke[i].y - stroke[i - 1].y));
  const length = cum[cum.length - 1];

  const at = (d: number): { pt: Point; angle: number } => {
    if (stroke.length === 1) return { pt: stroke[0], angle: 0 };
    const target = Math.max(0, Math.min(length, d));
    let i = 1;
    while (i < cum.length - 1 && cum[i] < target) i++;
    const a = stroke[i - 1];
    const b = stroke[i];
    const seg = cum[i] - cum[i - 1] || 1;
    const k = (target - cum[i - 1]) / seg;
    return {
      pt: { x: a.x + (b.x - a.x) * k, y: a.y + (b.y - a.y) * k },
      angle: (Math.atan2(b.y - a.y, b.x - a.x) * 180) / Math.PI,
    };
  };

  return { length, at };
}

export const toPathD = (stroke: Stroke) =>
  stroke.map((pt, i) => `${i ? "L" : "M"}${pt.x.toFixed(2)} ${pt.y.toFixed(2)}`).join(" ");
