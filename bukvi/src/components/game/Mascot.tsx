"use client";

import { MASCOTS, DEFAULT_MASCOT } from "@/config/mascot";
import { useGameStore } from "@/store/gameStore";
import { cn } from "@/lib/cn";
import { getShopItem } from "@/data/shop";
import { LionSvg, type LionPose } from "./LionSvg";

/** Настроенията на героя = позите на Лъвчо. */
export type MascotMood = LionPose;

// За героите, които още са емоджи: малка иконка за настроението.
const MOOD_BADGE: Record<MascotMood, string> = {
  happy: "😊",
  wave: "👋",
  think: "🤔",
  point: "👉",
  cheer: "🎉",
  dance: "🎶",
  clap: "👏",
  encourage: "💪",
  sleep: "😴",
};

type Props = { message?: string; mood?: MascotMood; className?: string; compact?: boolean };

/** Героят-водач. Лъвчо е SVG с пози; купените приятели засега са емоджи. */
export function Mascot({ message, mood = "happy", className, compact }: Props) {
  const key = useGameStore((s) => s.settings.mascot);
  const m = MASCOTS[key] ?? MASCOTS[DEFAULT_MASCOT];
  const accessory = useGameStore((s) => getShopItem(s.progress.equipped.accessory ?? ""));
  const isLion = key === "lion" || !MASCOTS[key];
  const size = compact ? 64 : 104;

  return (
    <div className={cn("flex items-center gap-3", className)}>
      <div className="relative shrink-0" style={{ width: size }} aria-hidden>
        {isLion ? (
          <LionSvg pose={mood} size={size} />
        ) : (
          <div className={cn(mood === "cheer" || mood === "dance" ? "animate-wiggle" : "animate-bob")}>
            <span className={compact ? "text-5xl" : "text-7xl"}>{m.emoji}</span>
            <span className="absolute -right-2 -top-1 text-2xl">{MOOD_BADGE[mood]}</span>
          </div>
        )}
        {/* Купеният аксесоар: шапка/корона на главата или очила на лицето. */}
        {accessory && (
          <span
            className="pointer-events-none absolute left-1/2 -translate-x-1/2 leading-none"
            style={
              accessory.placement === "face"
                ? { top: isLion ? size * 0.33 : size * 0.18, fontSize: size * 0.34 }
                : { top: isLion ? -size * 0.14 : -size * 0.3, fontSize: size * 0.42 }
            }
          >
            {accessory.icon}
          </span>
        )}
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
