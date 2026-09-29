import type { CharacterLesson, Stroke } from "@/lib/types";
import { phrases } from "@/content/phrases";
import { arc, join, line, tpl } from "./strokeTemplates/geometry";

// Форми за подготовка на ръката преди буквите: черти, зигзаг, вълни, кръг, квадрат…
// Записват се в прогреса с ключ „фигура-…“ (не се бъркат с буквите).

const wave = (): Stroke => {
  const pts: [number, number][] = [];
  for (let x = 10; x <= 90; x += 4) pts.push([x, Math.round((50 - 16 * Math.sin(((x - 10) / 40) * 2 * Math.PI)) * 100) / 100]);
  return line(...pts);
};

const SHAPES: { id: string; name: string; image: string; strokes: Stroke[] }[] = [
  { id: "rain", name: "права черта", image: "🌧️", strokes: [line([50, 12], [50, 88])] },
  { id: "road", name: "легнала черта", image: "🛣️", strokes: [line([12, 50], [88, 50])] },
  { id: "zigzag", name: "зигзаг", image: "⛰️", strokes: [line([10, 72], [26, 28], [42, 72], [58, 28], [74, 72], [90, 28])] },
  { id: "wave", name: "вълни", image: "🌊", strokes: [wave()] },
  { id: "circle", name: "кръг", image: "☀️", strokes: [arc(50, 50, 36, 36, -90, -450)] },
  { id: "square", name: "квадрат", image: "🖼️", strokes: [line([14, 14], [14, 86], [86, 86], [86, 14], [14, 14])] },
  { id: "triangle", name: "триъгълник", image: "⛺", strokes: [line([50, 14], [14, 84], [86, 84], [50, 14])] },
  {
    id: "heart",
    name: "сърце",
    image: "❤️",
    strokes: [join(arc(35, 36, 15, 15, 0, -180), line([20, 36], [50, 86])), join(arc(65, 36, 15, 15, 180, 360), line([80, 36], [50, 86]))],
  },
];

export const shapeLessons: CharacterLesson[] = SHAPES.map((s) => ({
  id: `shape-${s.id}`,
  character: `фигура-${s.id}`,
  type: "shape",
  spokenName: s.name,
  spokenText: phrases.drawShape(s.name),
  exampleImage: s.image,
  templates: [tpl(...s.strokes)],
}));

/** Цветовете за „Докосни червеното!“ (име в среден род — „червеното“). */
export const COLORS: { id: string; name: string; hex: string }[] = [
  { id: "red", name: "червеното", hex: "#ef4444" },
  { id: "blue", name: "синьото", hex: "#3b82f6" },
  { id: "yellow", name: "жълтото", hex: "#facc15" },
  { id: "green", name: "зеленото", hex: "#22c55e" },
  { id: "orange", name: "оранжевото", hex: "#f97316" },
  { id: "purple", name: "лилавото", hex: "#a855f7" },
  { id: "pink", name: "розовото", hex: "#f472b6" },
  { id: "brown", name: "кафявото", hex: "#92400e" },
  { id: "black", name: "черното", hex: "#1f2937" },
  { id: "white", name: "бялото", hex: "#ffffff" },
];
