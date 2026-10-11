import type { PlayerProgress } from "@/lib/types";
import { SHOP_UNLOCK_STEPS } from "@/data/shop";
import { currentStepIndex } from "./path";
import { todayKey } from "./progress";

// Магазинът е награда за ученето: отваря се за деня, щом детето мине още
// SHOP_UNLOCK_STEPS стъпки по пътя, а на следващия ден пак се заключва.

/** От коя стъпка се брои до следващото отваряне (за стар прогрес — от последните пълни 10). */
const baseOf = (p: PlayerProgress) =>
  p.shop?.milestone ?? Math.floor(currentStepIndex(p) / SHOP_UNLOCK_STEPS) * SHOP_UNLOCK_STEPS;

/** Отворен ли е магазинът днес. */
export const isShopOpen = (p: PlayerProgress, unlockAll = false, today = todayKey()) =>
  unlockAll || p.shop?.openDay === today;

/** Колко стъпки остават до следващото отваряне. */
export const stepsToShop = (p: PlayerProgress) => Math.max(0, baseOf(p) + SHOP_UNLOCK_STEPS - currentStepIndex(p));

/** След всяка мината стъпка: ако са минати още 10, магазинът се отваря за днес. */
export function withShopUnlock(p: PlayerProgress, today = todayKey()): PlayerProgress {
  const base = baseOf(p);
  const current = currentStepIndex(p);
  if (current >= base + SHOP_UNLOCK_STEPS) {
    return { ...p, shop: { openDay: today, milestone: Math.floor(current / SHOP_UNLOCK_STEPS) * SHOP_UNLOCK_STEPS } };
  }
  // Запомняме началото веднъж, за да не „мърда“ при следващите стъпки.
  return p.shop ? p : { ...p, shop: { milestone: base } };
}
