import type { CharacterProgress, PlayerProgress } from "@/lib/types";
import { APP_CONFIG } from "@/config/app";
import { POINTS } from "@/config/points";
import type { Reward } from "@/data/rewards";
import { levelForPoints, rewardsForStars, starsForPoints } from "./rewards";

// Чисти функции върху прогреса — лесни за тест и за бъдещ cloud sync.

export const emptyProgress = (): PlayerProgress => ({
  totalPoints: 0,
  stars: 0,
  level: 1,
  streak: 0,
  bestStreak: 0,
  unlockedRewards: [],
  characters: {},
  exercises: 0,
  gamesPlayed: 0,
});

const emptyChar = (character: string): CharacterProgress => ({
  character,
  attempts: 0,
  correct: 0,
  bestScore: 0,
  lastScore: 0,
  mastered: false,
});

export type ProgressDelta = {
  points: number;
  starsGained: number;
  newRewards: Reward[];
};

/** Точките за верен опит според това кой поред е и дали е имало подсказка. */
export function pointsForAttempt(attempt: number, hintShown: boolean): number {
  if (hintShown) return POINTS.afterHint;
  return attempt <= 1 ? POINTS.firstTry : attempt === 2 ? POINTS.secondTry : POINTS.afterHint;
}

function addPoints(p: PlayerProgress, points: number): { progress: PlayerProgress; delta: ProgressDelta } {
  const totalPoints = p.totalPoints + points;
  const stars = starsForPoints(totalPoints);
  const earned = rewardsForStars(stars).filter((r) => !p.unlockedRewards.includes(r.id));
  return {
    progress: {
      ...p,
      totalPoints,
      stars,
      level: levelForPoints(totalPoints),
      unlockedRewards: [...p.unlockedRewards, ...earned.map((r) => r.id)],
    },
    delta: { points, starsGained: stars - p.stars, newRewards: earned },
  };
}

/** Записва един опит за изписване. Грешен опит не отнема точки — само нулира поредицата. */
export function recordWriting(
  p: PlayerProgress,
  character: string,
  score: number,
  isCorrect: boolean,
  points: number,
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
  const base: PlayerProgress = {
    ...p,
    streak,
    bestStreak: Math.max(p.bestStreak, streak),
    exercises: p.exercises + 1,
    characters: { ...p.characters, [character]: ch },
  };
  return addPoints(base, isCorrect ? points : 0);
}

/** Верен или грешен избор в минигра. */
export function recordGameAnswer(p: PlayerProgress, isCorrect: boolean): { progress: PlayerProgress; delta: ProgressDelta } {
  const streak = isCorrect ? p.streak + 1 : 0;
  const base = { ...p, streak, bestStreak: Math.max(p.bestStreak, streak) };
  return addPoints(base, isCorrect ? POINTS.miniGameCorrect : 0);
}

/** Точност за символ в проценти (за родителския екран). */
export const accuracy = (c: CharacterProgress) => (c.attempts ? Math.round((c.correct / c.attempts) * 100) : 0);
