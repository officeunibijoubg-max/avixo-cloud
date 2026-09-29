import type { CharacterLesson } from "@/lib/types";
import { letterLessons } from "@/data/alphabet";
import { numberLessons } from "@/data/numbers";
import { LETTER_ORDER } from "@/data/path";
import { useGameStore } from "@/store/gameStore";
import { starsFor } from "@/services/progress";

// Игрите питат само за това, което детето вече е научило по пътя, за да няма
// „непознати“ букви. Ако родителят е отключил всичко — всичко.

const byPath = (a: CharacterLesson, b: CharacterLesson) => LETTER_ORDER.indexOf(a.character) - LETTER_ORDER.indexOf(b.character);

/** Научените главни букви (поне 3 — първите от буквара, ако още няма толкова). */
export function knownLetters(): CharacterLesson[] {
  const { progress, settings } = useGameStore.getState();
  if (settings.unlockAll) return letterLessons;
  const known = letterLessons.filter((l) => starsFor(progress, l.character) > 0);
  return known.length >= 3 ? known : [...letterLessons].sort(byPath).slice(0, 3);
}

/** Научените цифри 1–9 (поне 1, 2, 3). */
export function knownDigits(): CharacterLesson[] {
  const { progress, settings } = useGameStore.getState();
  const all = numberLessons.filter((l) => l.character !== "0");
  if (settings.unlockAll) return all;
  const known = all.filter((l) => starsFor(progress, l.character) > 0);
  return known.length >= 3 ? known : all.slice(0, 3);
}

/** Думи, в които всички букви са научени (поне няколко, за да има игра). */
export function knownWords<T>(list: readonly T[], text: (w: T) => string, min = 3): T[] {
  const letters = new Set(knownLetters().map((l) => l.character));
  const ok = list.filter((w) => text(w).toUpperCase().split("").every((c) => letters.has(c)));
  return ok.length >= min ? ok : list.slice(0, Math.max(min, ok.length));
}
