"use client";

import { HeroSvg, type HeroPose } from "./hero/HeroSvg";

// Лъвчо без дрехи — там, където трябва точно той (напр. в родителските екрани).
export type LionPose = HeroPose;

export function LionSvg({ pose = "happy", size = 96, className }: { pose?: LionPose; size?: number; className?: string }) {
  return <HeroSvg hero="lion" pose={pose} size={size} className={className} />;
}
