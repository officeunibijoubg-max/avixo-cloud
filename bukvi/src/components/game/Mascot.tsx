"use client";

import { MASCOTS, DEFAULT_MASCOT } from "@/config/mascot";
import type { Equipped } from "@/lib/types";
import { useGameStore } from "@/store/gameStore";
import { cn } from "@/lib/cn";
import { HeroSvg, type HeroPose } from "./hero/HeroSvg";

/** Настроенията на героя = позите му. */
export type MascotMood = HeroPose;

const WEAR_SLOTS = ["back", "neck", "face", "head", "hand"] as const;

/** Облечените неща в реда, в който се рисуват. */
export const wornItems = (e: Equipped) => WEAR_SLOTS.map((s) => e[s]);

/** Избраният герой и какво носи — за всички места, където се показва. */
export function useHeroLook() {
  const key = useGameStore((s) => s.settings.mascot);
  const equipped = useGameStore((s) => s.progress.equipped);
  const hero = MASCOTS[key] ? key : DEFAULT_MASCOT;
  return { hero, wearing: wornItems(equipped) };
}

/** Текущият герой с дрехите му. */
export function CurrentHero({ pose = "happy", size = 96, className }: { pose?: HeroPose; size?: number; className?: string }) {
  const { hero, wearing } = useHeroLook();
  return <HeroSvg hero={hero} pose={pose} wearing={wearing} size={size} className={className} />;
}

type Props = { message?: string; mood?: MascotMood; className?: string; compact?: boolean };

/** Героят-водач с балонче за текст. */
export function Mascot({ message, mood = "happy", className, compact }: Props) {
  const size = compact ? 64 : 104;
  return (
    <div className={cn("flex items-center gap-3", className)}>
      <div className="shrink-0" style={{ width: size }} aria-hidden>
        <CurrentHero pose={mood} size={size} />
      </div>
      {message && (
        <div
          key={message}
          className="card-soft relative animate-pop rounded-3xl bg-white px-5 py-3 text-lg font-extrabold shadow-md sm:text-xl"
          role="status"
        >
          <span className="absolute -left-2 top-1/2 size-4 -translate-y-1/2 rotate-45 bg-white" aria-hidden />
          {message}
        </div>
      )}
    </div>
  );
}
