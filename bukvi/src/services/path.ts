import type { PlayerProgress } from "@/lib/types";
import { PATH, stepIndex, stepKey, type PathStep } from "@/data/path";
import { starsFor } from "./progress";

// Къде е детето по пътя. „Текущата“ стъпка е първата немината; всичко преди нея
// е отворено за повтаряне, а всичко след нея е заключено.

export const playedKey = (s: PathStep) => (s.kind === "story" ? `story-${s.id}` : s.kind === "game" ? s.id : "");

export function isStepDone(p: PlayerProgress, s: PathStep): boolean {
  switch (s.kind) {
    case "shape":
      return (p.characters[`фигура-${s.id}`]?.correct ?? 0) > 0;
    case "char":
      return starsFor(p, s.char) > 0;
    case "word":
      return starsFor(p, s.text) > 0;
    default:
      return (p.played?.[playedKey(s)] ?? 0) > 0;
  }
}

/** Номерът на текущата стъпка (PATH.length, ако пътят е изминат целият). */
export function currentStepIndex(p: PlayerProgress): number {
  const i = PATH.findIndex((s) => !isStepDone(p, s));
  return i === -1 ? PATH.length : i;
}

export const currentStep = (p: PlayerProgress): PathStep | null => PATH[currentStepIndex(p)] ?? null;

/** Стигнала ли е детето до тази стъпка (минато или текущо). Неща извън пътя са винаги отворени. */
export function isReached(p: PlayerProgress, key: string, unlockAll = false): boolean {
  if (unlockAll) return true;
  const i = stepIndex(key);
  return i === -1 || i <= currentStepIndex(p);
}

/** Колко стъпки има още до тази (0, ако е стигната). */
export function stepsUntil(p: PlayerProgress, key: string): number {
  const i = stepIndex(key);
  return i === -1 ? 0 : Math.max(0, i - currentStepIndex(p));
}

export { stepKey };
