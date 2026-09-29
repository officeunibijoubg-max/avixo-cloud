import type { PlayerProgress } from "@/lib/types";
import { ALPHABET } from "@/data/alphabet";
import { DIGITS } from "@/data/numbers";
import { WORD_ITEMS } from "@/data/wordsIsland";
import { WORLDS } from "@/data/adventure";
import { FEATURES, getFeature, type Feature, type Unlock } from "@/data/unlocks";
import { phrases } from "@/content/phrases";
import { starsFor } from "./progress";
import { isWorldDone } from "./adventure";

// Отключване на игрите и частите извън картата според напредъка.

export function learnedCounts(p: PlayerProgress) {
  const count = (list: readonly string[]) => list.filter((c) => starsFor(p, c) > 0).length;
  return {
    letters: count(ALPHABET),
    digits: count(DIGITS),
    words: count(WORD_ITEMS.filter((w) => w.kind === "word").map((w) => w.text)),
  };
}

/** Какво още липсва: [] значи, че е отключено. */
export function missingFor(p: PlayerProgress, u: Unlock): string[] {
  const c = learnedCounts(p);
  const out: string[] = [];
  if (u.letters && c.letters < u.letters) out.push(phrases.needLetters(u.letters - c.letters));
  if (u.digits && c.digits < u.digits) out.push(phrases.needDigits(u.digits - c.digits));
  if (u.words && c.words < u.words) out.push(phrases.needWords(u.words - c.words));
  if (u.world) {
    const w = WORLDS.find((x) => x.id === u.world);
    if (w && !isWorldDone(p, w)) out.push(phrases.needWorld(w.title));
  }
  return out;
}

export function isFeatureUnlocked(p: PlayerProgress, id: string, unlockAll = false): boolean {
  const f = getFeature(id);
  return !f || unlockAll || missingFor(p, f.unlock).length === 0;
}

/** Колко близо е (0..1) — за да покажем най-близкото следващо отключване. */
function closeness(p: PlayerProgress, u: Unlock): number {
  const c = learnedCounts(p);
  const parts: number[] = [];
  if (u.letters) parts.push(Math.min(1, c.letters / u.letters));
  if (u.digits) parts.push(Math.min(1, c.digits / u.digits));
  if (u.words) parts.push(Math.min(1, c.words / u.words));
  if (u.world) {
    const w = WORLDS.find((x) => x.id === u.world);
    if (w) parts.push(w.characters.filter((ch) => starsFor(p, ch) > 0).length / w.characters.length);
  }
  return parts.length ? Math.min(...parts) : 1;
}

/** Следващото нещо за отключване (най-близкото), ако има. */
export function nextUnlock(p: PlayerProgress): { feature: Feature; missing: string[]; progress: number } | null {
  const locked = FEATURES.filter((f) => missingFor(p, f.unlock).length > 0);
  if (!locked.length) return null;
  const best = [...locked].sort((a, b) => closeness(p, b.unlock) - closeness(p, a.unlock))[0];
  return { feature: best, missing: missingFor(p, best.unlock), progress: closeness(p, best.unlock) };
}

/** Отключени, но още непоказани на детето (за картата „Отключи нова игра!“). */
export const newlyUnlocked = (p: PlayerProgress): Feature[] =>
  FEATURES.filter((f) => !(p.seenUnlocks ?? []).includes(f.id) && missingFor(p, f.unlock).length === 0);
