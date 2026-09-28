import type { CharacterProgress, PlayerProgress } from "@/lib/types";
import { APP_CONFIG } from "@/config/app";
import { POINTS } from "@/config/points";
import { LEVELS } from "@/data/lessons";
import { getShopItem, STICKERS } from "@/data/shop";
import { CHALLENGE_BONUS, CHALLENGES, type Challenge, type ChallengeMetric } from "@/config/challenges";

// Чисти функции върху прогреса — лесни за тест и за бъдещ cloud sync.
//
// Три отделни системи с ясен смисъл:
//   ⭐ звезди — колко добре е усвоен всеки урок (0–3 на символ);
//   🪙 монети — печелят се от писане и игри и се харчат в магазина;
//   ниво — общият напредък: колко групи символи са минати.

export const emptyProgress = (): PlayerProgress => ({
  coins: 0,
  coinsEarned: 0,
  streak: 0,
  bestStreak: 0,
  characters: {},
  exercises: 0,
  gamesPlayed: 0,
  owned: [],
  equipped: {},
  stickers: [],
  playSeconds: {},
  adventuresDone: [],
  daily: { day: "", counts: {} },
  challengeDays: [],
});

const emptyChar = (character: string): CharacterProgress => ({
  character,
  attempts: 0,
  correct: 0,
  bestScore: 0,
  lastScore: 0,
  mastered: false,
});

// ───────────────────────── звезди ─────────────────────────

/** 1⭐ — написал я е вярно; 2⭐ — поне 2 пъти и добре; 3⭐ — поне 3 пъти и отлично. */
export function lessonStars(c: CharacterProgress | undefined): number {
  if (!c || c.correct === 0) return 0;
  if (c.correct >= 3 && c.bestScore >= 85) return 3;
  if (c.correct >= 2 && c.bestScore >= 75) return 2;
  return 1;
}

export const starsFor = (p: PlayerProgress, character: string) => lessonStars(p.characters[character]);

export const totalStars = (p: PlayerProgress) =>
  Object.values(p.characters).reduce((a, c) => a + lessonStars(c), 0);

// ───────────────────────── ниво ─────────────────────────

/** Ниво = 1 + броят групи (от LEVELS), в които всеки символ има поне една ⭐. */
export function levelOf(p: PlayerProgress): number {
  const done = LEVELS.filter((l) => l.characters.every((c) => starsFor(p, c) > 0)).length;
  return 1 + done;
}

export const MAX_LEVEL = LEVELS.length + 1;

// ───────────────────────── записи ─────────────────────────

export type ProgressDelta = {
  coins: number;
  /** С колко звезди се е вдигнал урокът (0, ако не се е вдигнал). */
  starsGained: number;
  /** Ново ниво, ако е достигнато. */
  levelUp?: number;
  /** Нов стикер (от Днешно приключение). */
  sticker?: string;
  /** Току-що изпълнено Предизвикателство на деня (бонусът е отделно от `coins`). */
  challengeDone?: { bonus: number; streak: number };
};

/** Монети за верен опит според това кой поред е и дали е имало подсказка. */
export function pointsForAttempt(attempt: number, hintShown: boolean): number {
  if (hintShown) return POINTS.afterHint;
  return attempt <= 1 ? POINTS.firstTry : attempt === 2 ? POINTS.secondTry : POINTS.afterHint;
}

function earn(p: PlayerProgress, coins: number): PlayerProgress {
  return { ...p, coins: p.coins + coins, coinsEarned: p.coinsEarned + coins };
}

/** Записва един опит за изписване. Грешен опит не отнема нищо — само нулира поредицата. */
export function recordWriting(
  p: PlayerProgress,
  character: string,
  score: number,
  isCorrect: boolean,
  coins: number,
  day = todayKey(),
): { progress: PlayerProgress; delta: ProgressDelta } {
  const prev = p.characters[character] ?? emptyChar(character);
  const correct = prev.correct + (isCorrect ? 1 : 0);
  const bestScore = Math.max(prev.bestScore, score);
  const ch: CharacterProgress = {
    ...prev,
    attempts: prev.attempts + 1,
    correct,
    lastScore: score,
    bestScore,
    mastered: prev.mastered || (correct >= APP_CONFIG.masteryCorrect && bestScore >= APP_CONFIG.masteryScore),
  };
  const streak = isCorrect ? p.streak + 1 : 0;
  const next: PlayerProgress = earn(
    {
      ...p,
      streak,
      bestStreak: Math.max(p.bestStreak, streak),
      exercises: p.exercises + 1,
      characters: { ...p.characters, [character]: ch },
    },
    isCorrect ? coins : 0,
  );
  const levelBefore = levelOf(p);
  const levelAfter = levelOf(next);
  const metric: ChallengeMetric = character.length > 1 ? "words" : /\d/.test(character) ? "numbers" : "letters";
  const daily = isCorrect ? bumpDaily(next, metric, day) : { progress: next };
  return {
    progress: daily.progress,
    delta: {
      coins: isCorrect ? coins : 0,
      starsGained: lessonStars(ch) - lessonStars(prev),
      levelUp: levelAfter > levelBefore ? levelAfter : undefined,
      challengeDone: daily.challengeDone,
    },
  };
}

/** Верен или грешен избор в минигра. */
export function recordGameAnswer(
  p: PlayerProgress,
  isCorrect: boolean,
  day = todayKey(),
): { progress: PlayerProgress; delta: ProgressDelta } {
  const streak = isCorrect ? p.streak + 1 : 0;
  const coins = isCorrect ? POINTS.miniGameCorrect : 0;
  const next = earn({ ...p, streak, bestStreak: Math.max(p.bestStreak, streak) }, coins);
  const daily = isCorrect ? bumpDaily(next, "games", day) : { progress: next };
  return { progress: daily.progress, delta: { coins, starsGained: 0, challengeDone: daily.challengeDone } };
}

// ───────────────────────── предизвикателство на деня ─────────────────────────

/** Поредният номер на деня — за да се сменя предизвикателството всеки ден по ред. */
const dayNumber = (day: string) => Math.floor(Date.parse(`${day}T12:00:00Z`) / 86_400_000);

export const challengeFor = (day = todayKey()): Challenge => CHALLENGES[((dayNumber(day) % CHALLENGES.length) + CHALLENGES.length) % CHALLENGES.length];

/** Колко е направено днес по метриката на днешното предизвикателство. */
export function challengeCount(p: PlayerProgress, day = todayKey()): number {
  const c = challengeFor(day);
  return p.daily?.day === day ? (p.daily.counts[c.metric] ?? 0) : 0;
}

/** Поредица от дни с изпълнено предизвикателство, до днес (или до вчера, ако днес още не е). */
export function dayStreak(p: PlayerProgress, day = todayKey()): number {
  const done = new Set(p.challengeDays ?? []);
  let n = dayNumber(day);
  if (!done.has(dayKey(n))) n -= 1;
  let streak = 0;
  while (done.has(dayKey(n))) {
    streak += 1;
    n -= 1;
  }
  return streak;
}

function dayKey(n: number): string {
  return new Date(n * 86_400_000 + 12 * 3_600_000).toISOString().slice(0, 10);
}

/** Отброява действие за деня; ако предизвикателството стане изпълнено — дава бонуса веднъж. */
function bumpDaily(
  p: PlayerProgress,
  metric: ChallengeMetric,
  day: string,
): { progress: PlayerProgress; challengeDone?: ProgressDelta["challengeDone"] } {
  const counts = p.daily?.day === day ? p.daily.counts : {};
  const next: PlayerProgress = { ...p, daily: { day, counts: { ...counts, [metric]: (counts[metric] ?? 0) + 1 } } };
  const c = challengeFor(day);
  const days = next.challengeDays ?? [];
  if (c.metric !== metric || days.includes(day) || (next.daily.counts[metric] ?? 0) < c.goal) return { progress: next };
  const progress = earn({ ...next, challengeDays: [...days, day] }, CHALLENGE_BONUS);
  return { progress, challengeDone: { bonus: CHALLENGE_BONUS, streak: dayStreak(progress, day) } };
}

// ───────────────────────── магазин ─────────────────────────

export type BuyResult = { ok: true; progress: PlayerProgress } | { ok: false; reason: "owned" | "coins" | "unknown" };

export function buyItem(p: PlayerProgress, id: string): BuyResult {
  const item = getShopItem(id);
  if (!item) return { ok: false, reason: "unknown" };
  if (p.owned.includes(id)) return { ok: false, reason: "owned" };
  if (p.coins < item.price) return { ok: false, reason: "coins" };
  const progress: PlayerProgress = { ...p, coins: p.coins - item.price, owned: [...p.owned, id] };
  // Новата вещ веднага се слага — детето вижда за какво е платило.
  return { ok: true, progress: equipItem(progress, id) };
}

/** Слага или сваля аксесоар/фон. Играчките и приятелите не се „обличат“. */
export function equipItem(p: PlayerProgress, id: string | null, slot?: "accessory" | "background"): PlayerProgress {
  if (id === null) return slot ? { ...p, equipped: { ...p.equipped, [slot]: undefined } } : p;
  const item = getShopItem(id);
  if (!item || !p.owned.includes(id)) return p;
  if (item.category === "accessory") return { ...p, equipped: { ...p.equipped, accessory: id } };
  if (item.category === "background") return { ...p, equipped: { ...p.equipped, background: id } };
  return p;
}

// ───────────────────────── стикери и време ─────────────────────────

export const todayKey = (d = new Date()) =>
  `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;

/** Завършено Днешно приключение: нов стикер (следващият, който още няма) и бонус монети. */
export function completeAdventure(p: PlayerProgress, day = todayKey()): { progress: PlayerProgress; delta: ProgressDelta } {
  const sticker = STICKERS.find((s) => !p.stickers.includes(s)) ?? STICKERS[p.stickers.length % STICKERS.length];
  const coins = POINTS.adventureBonus;
  const earned = earn(
    {
      ...p,
      stickers: p.stickers.includes(sticker) ? p.stickers : [...p.stickers, sticker],
      adventuresDone: p.adventuresDone.includes(day) ? p.adventuresDone : [...p.adventuresDone, day],
    },
    coins,
  );
  const daily = bumpDaily(earned, "adventure", day);
  return { progress: daily.progress, delta: { coins, starsGained: 0, sticker, challengeDone: daily.challengeDone } };
}

export function addPlayTime(p: PlayerProgress, seconds: number, day = todayKey()): PlayerProgress {
  return { ...p, playSeconds: { ...p.playSeconds, [day]: (p.playSeconds[day] ?? 0) + seconds } };
}

/** Точност за символ в проценти (за родителския екран). */
export const accuracy = (c: CharacterProgress) => (c.attempts ? Math.round((c.correct / c.attempts) * 100) : 0);

/** Прехвърля стар запис (с точки и звезди на всеки 50 точки) към новия модел. */
export function migrateProgress(old: Record<string, unknown>): PlayerProgress {
  const base = { ...emptyProgress(), ...(old as Partial<PlayerProgress>) };
  const legacyPoints = typeof old.totalPoints === "number" ? old.totalPoints : 0;
  if (!("coins" in old)) {
    base.coins = legacyPoints;
    base.coinsEarned = legacyPoints;
  }
  const cleaned = base as PlayerProgress & Record<string, unknown>;
  delete cleaned.totalPoints;
  delete cleaned.stars;
  delete cleaned.level;
  delete cleaned.unlockedRewards;
  return cleaned;
}
