import type { Stroke, StrokeTemplate } from "@/lib/types";
import { arc, join, line, tpl } from "./geometry";
import { letterTemplates } from "./letters";

// Шаблони за малките печатни букви. Височината им е между средната линия (y=50)
// и основата (y=90); „б“ се качва до горната линия, а „р“, „у“, „ф“ слизат под основата.
// Повечето малки букви са умалени главни — правим ги от техните шаблони.

/** Умалява шаблон на главна буква до височината на малките (и малко по-тесен). */
const small = (t: StrokeTemplate): StrokeTemplate => ({
  strokes: t.strokes.map((s: Stroke) => s.map((p) => ({ x: 50 + (p.x - 50) * 0.8, y: 50 + (p.y - 10) * 0.5 }))),
});

const smallOf = (upper: string) => letterTemplates[upper].map(small);

export const lowercaseTemplates: Record<string, StrokeTemplate[]> = {
  а: [
    tpl(
      join(arc(50, 62, 14, 12, 200, 360), line([64, 62], [64, 90])),
      arc(52, 78, 12, 11, -40, -320),
    ),
  ],
  б: [tpl(line([68, 12], [44, 20], [36, 50], [36, 74]), arc(52, 74, 16, 16, 180, -180))],
  в: smallOf("В"),
  г: smallOf("Г"),
  д: smallOf("Д"),
  е: [tpl(join(line([32, 70], [68, 70]), arc(50, 70, 18, 20, 0, -300)))],
  ж: smallOf("Ж"),
  з: smallOf("З"),
  и: smallOf("И"),
  й: [tpl(...small(letterTemplates["И"][0]).strokes, arc(50, 42, 9, 5, 180, 0))],
  к: smallOf("К"),
  л: smallOf("Л"),
  м: smallOf("М"),
  н: smallOf("Н"),
  о: [tpl(arc(50, 70, 18, 20, -90, -450))],
  п: smallOf("П"),
  р: [tpl(line([34, 50], [34, 99]), join(line([34, 52], [50, 52]), arc(50, 68, 16, 16, -90, 90), line([50, 84], [34, 84])))],
  с: [tpl(arc(52, 70, 18, 20, -40, -320))],
  т: smallOf("Т"),
  у: [tpl(line([30, 50], [51, 84]), line([72, 50], [40, 99]))],
  ф: [tpl(line([50, 14], [50, 99]), arc(50, 70, 22, 18, -90, -450))],
  х: smallOf("Х"),
  ц: smallOf("Ц"),
  ч: smallOf("Ч"),
  ш: smallOf("Ш"),
  щ: smallOf("Щ"),
  ъ: smallOf("Ъ"),
  ь: smallOf("Ь"),
  ю: smallOf("Ю"),
  я: smallOf("Я"),
};
