import type { PlayerProgress } from "@/lib/types";
import { CHAPTERS } from "@/data/path";
import { accuracy } from "./progress";

// Какво влиза в проверката на една глава: до 5 символа (първо най-слабите, после
// случайни) и до 2 думи от главата. Детето ги пише без шаблон.

export type TestItem = { kind: "char"; char: string } | { kind: "word"; text: string };

export const TEST_CHARS = 5;
export const TEST_WORDS = 2;
/** Опити за всяко нещо в проверката, преди да се отбележи за упражнение. */
export const TEST_TRIES = 2;

export function pickTestItems(p: PlayerProgress, chapter: number, rand: () => number = Math.random): TestItem[] {
  const steps = CHAPTERS[chapter - 1]?.steps ?? [];
  const chars = steps.flatMap((s) => (s.kind === "char" ? [s.char] : []));
  const words = steps.flatMap((s) => (s.kind === "word" ? [s.text] : []));
  const shuffle = <T>(list: T[]) => list.map((x) => [rand(), x] as const).sort((a, b) => a[0] - b[0]).map(([, x]) => x);
  const score = (c: string) => (p.characters[c] ? accuracy(p.characters[c]) : 0);
  // Трите най-слаби + случайни от останалите; после ги разбъркваме, за да не се познава редът.
  const weakest = [...chars].sort((a, b) => score(a) - score(b)).slice(0, 3);
  const rest = shuffle(chars.filter((c) => !weakest.includes(c))).slice(0, TEST_CHARS - weakest.length);
  return [
    ...shuffle([...weakest, ...rest]).map((char) => ({ kind: "char" as const, char })),
    ...shuffle(words).slice(0, TEST_WORDS).map((text) => ({ kind: "word" as const, text })),
  ];
}
