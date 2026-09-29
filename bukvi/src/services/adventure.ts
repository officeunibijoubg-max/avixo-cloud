import type { PlayerProgress } from "@/lib/types";
import { WORLDS, type World } from "@/data/adventure";
import { accuracy, learnedLetterCount, starsFor } from "./progress";

// Отключване по картата: светът се отваря, когато предходният е минат;
// всяка точка — когато предишната има поне една ⭐.

export const isWorldDone = (p: PlayerProgress, w: World) =>
  w.characters.length > 0 && w.characters.every((c) => starsFor(p, c) > 0);

export function isWorldUnlocked(p: PlayerProgress, w: World, unlockAll = false): boolean {
  if (w.comingSoon) return false;
  if (unlockAll) return true;
  if (w.unlockLetters && learnedLetterCount(p) < w.unlockLetters) return false;
  if (!w.requires) return true;
  const req = WORLDS.find((x) => x.id === w.requires);
  return !!req && isWorldDone(p, req);
}

/** Колко още букви трябват, за да се отвори светът (0, ако не зависи от букви). */
export const lettersToUnlock = (p: PlayerProgress, w: World) =>
  Math.max(0, (w.unlockLetters ?? 0) - learnedLetterCount(p));

export function isNodeUnlocked(p: PlayerProgress, w: World, index: number, unlockAll = false): boolean {
  if (!isWorldUnlocked(p, w, unlockAll)) return false;
  if (unlockAll || index === 0) return true;
  return starsFor(p, w.characters[index - 1]) > 0;
}

export function isCharacterUnlocked(p: PlayerProgress, character: string, unlockAll = false): boolean {
  const w = WORLDS.find((x) => x.characters.includes(character));
  if (!w) return true;
  return isNodeUnlocked(p, w, w.characters.indexOf(character), unlockAll);
}

/** Точката, до която е стигнало детето в света (първата отключена без звезда). */
export function currentNode(p: PlayerProgress, w: World, unlockAll = false): number {
  const i = w.characters.findIndex((c, idx) => isNodeUnlocked(p, w, idx, unlockAll) && starsFor(p, c) === 0);
  return i === -1 ? w.characters.length - 1 : i;
}

/**
 * Буквата за Днешното приключение: следващата нова буква по картата;
 * ако всички са минати — най-слабо усвоената.
 */
export function pickAdventureLetter(p: PlayerProgress): string {
  const letterWorlds = WORLDS.filter((x) => x.id !== "numbers" && x.kind !== "words" && !x.comingSoon);
  for (const w of letterWorlds) {
    if (!isWorldUnlocked(p, w)) continue;
    const next = w.characters.find((c) => starsFor(p, c) === 0);
    if (next) return next;
  }
  const letters = letterWorlds.flatMap((w) => w.characters);
  return [...letters].sort((a, b) => {
    const pa = p.characters[a];
    const pb = p.characters[b];
    return starsFor(p, a) - starsFor(p, b) || (pa ? accuracy(pa) : 0) - (pb ? accuracy(pb) : 0);
  })[0];
}

/** Трудните символи: поне 2 опита и под 70% точност, или 1 звезда след много опити. */
export function hardCharacters(p: PlayerProgress): string[] {
  return Object.values(p.characters)
    .filter((c) => c.character.length === 1 && c.attempts >= 2 && accuracy(c) < 70)
    .sort((a, b) => accuracy(a) - accuracy(b))
    .map((c) => c.character);
}
