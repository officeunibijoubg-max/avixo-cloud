"use client";

import { useMemo } from "react";
import { phrases, ui } from "@/content/phrases";

export type Celebration = {
  id: number;
  coins: number;
  starsGained: number;
  levelUp?: number;
  sticker?: string;
  challengeDone?: { bonus: number; streak: number };
};

const COLORS = ["#f472b6", "#38bdf8", "#fbbf24", "#22c55e", "#8b5cf6", "#fb7185"];

/** Конфети, летящи монети и звезда. Ново ниво или стикер се показват като голяма карта. */
export function RewardAnimation({ celebration, onCloseReward }: { celebration: Celebration | null; onCloseReward?: () => void }) {
  const pieces = useMemo(
    () =>
      celebration
        ? Array.from({ length: 36 }, (_, i) => ({
            left: `${(i * 37) % 100}%`,
            drift: `${((i * 53) % 40) - 20}vw`,
            dur: `${1.4 + ((i * 17) % 10) / 10}s`,
            delay: `${((i * 7) % 10) / 25}s`,
            color: COLORS[i % COLORS.length],
          }))
        : [],
    [celebration],
  );
  if (!celebration) return null;
  const big = celebration.sticker
    ? { icon: celebration.sticker, text: phrases.stickerEarned }
    : celebration.levelUp
      ? { icon: "🏅", text: phrases.levelUp(celebration.levelUp) }
      : celebration.challengeDone
        ? {
            icon: "🎯",
            text: `${phrases.challengeDone(celebration.challengeDone.streak)} +${celebration.challengeDone.bonus} 🪙`,
          }
        : null;
  return (
    <div key={celebration.id} aria-live="polite">
      {pieces.map((p, i) => (
        <span
          key={i}
          className="confetti-piece"
          style={{ left: p.left, background: p.color, animationDelay: p.delay, ["--drift" as string]: p.drift, ["--dur" as string]: p.dur }}
        />
      ))}
      {celebration.coins > 0 && (
        <div className="pointer-events-none fixed inset-x-0 top-1/3 z-50 flex justify-center">
          <span className="animate-float-up rounded-full bg-sun px-6 py-2 text-4xl font-black text-white shadow-lg [text-shadow:0_2px_0_rgb(0_0_0/0.15)]">
            +{celebration.coins} 🪙
          </span>
        </div>
      )}
      {celebration.starsGained > 0 && (
        <div className="pointer-events-none fixed inset-x-0 top-1/4 z-50 flex flex-col items-center">
          <span className="animate-pop text-8xl">⭐</span>
          <span className="animate-pop rounded-full bg-white px-5 py-2 text-2xl font-black shadow">{phrases.starEarned}</span>
        </div>
      )}
      {big && (
        <button
          type="button"
          onClick={onCloseReward}
          aria-label={ui.next}
          className="fixed inset-0 z-[70] flex flex-col items-center justify-center gap-4 bg-black/40 p-6"
        >
          <span className="card-soft flex animate-pop flex-col items-center gap-3 rounded-[2.5rem] bg-white px-10 py-8 shadow-2xl">
            <span className="text-9xl">{big.icon}</span>
            <span className="text-center text-3xl font-black">{big.text}</span>
            <span className="text-5xl">👍</span>
          </span>
        </button>
      )}
    </div>
  );
}
