import type { PlayerProgress } from "@/lib/types";
import { getFeature } from "@/data/unlocks";
import { PATH, stepKey } from "@/data/path";
import { phrases } from "@/content/phrases";
import { isReached, stepsUntil } from "./path";

// Игрите се отварят, когато детето стигне до тях по пътя на обучение.

/** Ключът на стъпката за игра; „Приказки“ се отварят с първата приказка по пътя. */
export function featureKey(id: string): string {
  if (id === "stories") {
    const first = PATH.find((s) => s.kind === "story");
    return first ? stepKey(first) : "";
  }
  return `game:${id}`;
}

export function isFeatureUnlocked(p: PlayerProgress, id: string, unlockAll = false): boolean {
  return !getFeature(id) || isReached(p, featureKey(id), unlockAll);
}

/** Защо е заключено ([] значи отворено) — кратко, за детето и родителя. */
export function lockReason(p: PlayerProgress, key: string, unlockAll = false): string[] {
  if (isReached(p, key, unlockAll)) return [];
  return [phrases.stepsAway(stepsUntil(p, key))];
}

export const featureLockReason = (p: PlayerProgress, id: string, unlockAll = false) =>
  getFeature(id) ? lockReason(p, featureKey(id), unlockAll) : [];
