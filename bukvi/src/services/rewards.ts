import { POINTS } from "@/config/points";
import { REWARDS, type Reward } from "@/data/rewards";

export const starsForPoints = (points: number) => Math.floor(points / POINTS.pointsPerStar);
export const levelForPoints = (points: number) => 1 + Math.floor(points / POINTS.pointsPerLevel);

/** Наградите, които трябва да са отключени при този брой звезди. */
export function rewardsForStars(stars: number): Reward[] {
  const count = Math.min(REWARDS.length, Math.floor(stars / POINTS.starsPerReward));
  return REWARDS.slice(0, count);
}

export const nextRewardAt = (stars: number) =>
  (Math.floor(stars / POINTS.starsPerReward) + 1) * POINTS.starsPerReward;

export const getReward = (id: string) => REWARDS.find((r) => r.id === id);
