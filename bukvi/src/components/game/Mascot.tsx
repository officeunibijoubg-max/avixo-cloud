"use client";

import { MASCOTS, DEFAULT_MASCOT } from "@/config/mascot";
import { useGameStore } from "@/store/gameStore";
import { cn } from "@/lib/cn";

export type MascotMood = "happy" | "cheer" | "think" | "wave";

type Props = { message?: string; mood?: MascotMood; className?: string; compact?: boolean };

/** Героят-водач. Кой герой е — идва от настройките, а видът — от config/mascot.ts. */
export function Mascot({ message, mood = "happy", className, compact }: Props) {
  const key = useGameStore((s) => s.settings.mascot);
  const m = MASCOTS[key] ?? MASCOTS[DEFAULT_MASCOT];
  return (
    <div className={cn("flex items-center gap-3", className)}>
      <div className={cn("relative shrink-0", mood === "cheer" ? "animate-wiggle" : "animate-bob")} aria-hidden>
        <span className={compact ? "text-5xl" : "text-7xl"}>{m.emoji}</span>
        <span className="absolute -right-2 -top-1 text-2xl">{m.moods[mood]}</span>
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
