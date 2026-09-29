import type { CharacterLesson } from "@/lib/types";
import { LOWERCASE, letterLessons, lowercaseLessons } from "./alphabet";
import { numberLessons } from "./numbers";
import { WORD_ITEMS } from "./wordsIsland";

export const allLessons: CharacterLesson[] = [...numberLessons, ...letterLessons, ...lowercaseLessons];

const byId = new Map(allLessons.map((l) => [l.id, l]));
const byChar = new Map(allLessons.map((l) => [l.character, l]));

export const getLessonById = (id: string) => byId.get(id);
export const getLessonByChar = (char: string) => byChar.get(char);

/** Следващият символ от същия вид (след Я идва А, след 9 — 0, след я — а). */
export function nextLesson(lesson: CharacterLesson): CharacterLesson {
  const list = lesson.type === "number" ? numberLessons : lesson.lowercase ? lowercaseLessons : letterLessons;
  const i = list.findIndex((l) => l.id === lesson.id);
  return list[(i + 1) % list.length];
}

export type LevelDef = { level: number; title: string; characters: string[] };

/** Групите за нивото: ниво = 1 + броят групи, в които всеки символ има поне една ⭐. */
export const LEVELS: LevelDef[] = [
  { level: 1, title: "Цифри 0–3", characters: ["0", "1", "2", "3"] },
  { level: 2, title: "Цифри 4–9", characters: ["4", "5", "6", "7", "8", "9"] },
  { level: 3, title: "А – Е", characters: ["А", "Б", "В", "Г", "Д", "Е"] },
  { level: 4, title: "Ж – К", characters: ["Ж", "З", "И", "Й", "К"] },
  { level: 5, title: "Л – П", characters: ["Л", "М", "Н", "О", "П"] },
  { level: 6, title: "Р – У", characters: ["Р", "С", "Т", "У"] },
  { level: 7, title: "Ф – Я", characters: ["Ф", "Х", "Ц", "Ч", "Ш", "Щ", "Ъ", "Ь", "Ю", "Я"] },
  { level: 8, title: "Срички", characters: WORD_ITEMS.filter((w) => w.kind === "syllable").map((w) => w.text) },
  { level: 9, title: "Думи", characters: WORD_ITEMS.filter((w) => w.kind === "word").map((w) => w.text) },
  { level: 10, title: "Малки букви а–п", characters: LOWERCASE.slice(0, 16) },
  { level: 11, title: "Малки букви р–я", characters: LOWERCASE.slice(16) },
];

export { letterLessons, numberLessons, lowercaseLessons };
