import type { PlayerProgress } from "@/lib/types";
import { WORLDS, type World } from "@/data/adventure";
import { PATH } from "@/data/path";
import { accuracy, starsFor } from "./progress";
import { currentStep, currentStepIndex, isReached } from "./path";

// Картите на световете показват буквите по групи, но кое е отворено решава
// пътят на обучение: отворено е всичко, до което детето е стигнало.

export const isWorldDone = (p: PlayerProgress, w: World) =>
  w.characters.length > 0 && w.characters.every((c) => starsFor(p, c) > 0);

const nodeKey = (w: World, c: string) => (w.kind === "words" ? `word:${c}` : `char:${c}`);

export function isWorldUnlocked(p: PlayerProgress, w: World, unlockAll = false): boolean {
  if (w.comingSoon) return false;
  return w.characters.some((c) => isReached(p, nodeKey(w, c), unlockAll));
}

export function isNodeUnlocked(p: PlayerProgress, w: World, index: number, unlockAll = false): boolean {
  return isReached(p, nodeKey(w, w.characters[index]), unlockAll);
}

export function isCharacterUnlocked(p: PlayerProgress, character: string, unlockAll = false): boolean {
  const w = WORLDS.find((x) => x.characters.includes(character));
  if (!w) return true;
  return isNodeUnlocked(p, w, w.characters.indexOf(character), unlockAll);
}

/** Точката от този свят, която е текущата стъпка по пътя (или първата отворена без звезда). */
export function currentNode(p: PlayerProgress, w: World, unlockAll = false): number {
  const step = currentStep(p);
  const now = step?.kind === "char" ? step.char : step?.kind === "word" ? step.text : null;
  if (now && w.characters.includes(now)) return w.characters.indexOf(now);
  const i = w.characters.findIndex((c, idx) => isNodeUnlocked(p, w, idx, unlockAll) && starsFor(p, c) === 0);
  return i === -1 ? -1 : i;
}

/**
 * Буквата за урока: текущата буква по пътя; ако сега е друга стъпка — следващата
 * буква по пътя; ако всичко е минато — най-слабо усвоената.
 */
export function pickAdventureLetter(p: PlayerProgress): string {
  const from = currentStepIndex(p);
  const next = PATH.slice(from).find((s) => s.kind === "char");
  if (next?.kind === "char") return next.char;
  const letters = PATH.flatMap((s) => (s.kind === "char" ? [s.char] : []));
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

// ───────────── повторение през дни (spaced repetition) ─────────────

/** След колко дни да се върнем към символ според звездите му: 1⭐ → 1 ден, 2⭐ → 3, 3⭐ → 7. */
const REVIEW_DAYS = [0, 1, 3, 7];

const daysBetween = (from: string, to: string) =>
  Math.round((Date.parse(`${to}T00:00:00Z`) - Date.parse(`${from}T00:00:00Z`)) / 86_400_000);

/** Научен символ, на който му е време за повторение (най-просроченият), или null. */
export function reviewDue(p: PlayerProgress, today: string, exclude?: string): string | null {
  const due = Object.values(p.characters)
    .filter((c) => c.character.length === 1 && c.character !== exclude)
    .map((c) => {
      const stars = starsFor(p, c.character);
      const waited = c.lastDay ? daysBetween(c.lastDay, today) : 30;
      return { c: c.character, stars, over: waited / REVIEW_DAYS[stars] };
    })
    .filter((x) => x.stars > 0 && x.over >= 1)
    .sort((a, b) => b.over - a.over);
  return due[0]?.c ?? null;
}
