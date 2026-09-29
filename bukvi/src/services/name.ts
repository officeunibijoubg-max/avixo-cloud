import type { PlayerProgress } from "@/lib/types";
import { ALPHABET } from "@/data/alphabet";
import { getWorld } from "@/data/adventure";
import { starsFor } from "./progress";
import { isWorldDone } from "./adventure";

// „Моето име“: буквите от името на детето (от профила), които умее да пише.

/** Само българските букви от името, главни: „Мария“ → „МАРИЯ“. */
export const nameLetters = (name: string): string =>
  name
    .toUpperCase()
    .split("")
    .filter((c) => (ALPHABET as readonly string[]).includes(c))
    .join("");

/** Как да се изпише: само главни, а след Долината на малките букви — „Мария“. */
export function nameToWrite(name: string, p: PlayerProgress): string {
  const upper = nameLetters(name);
  const lower = getWorld("lowercase");
  if (!upper || !lower || !isWorldDone(p, lower)) return upper;
  return upper[0] + upper.slice(1).toLowerCase();
}

/** Буквите от името, които детето още не е научило (без повторения). */
export const nameMissing = (name: string, p: PlayerProgress): string[] =>
  [...new Set(nameLetters(name).split(""))].filter((c) => starsFor(p, c) === 0);
