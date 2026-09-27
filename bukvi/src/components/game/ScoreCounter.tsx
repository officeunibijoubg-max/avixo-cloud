"use client";

import { useGameStore } from "@/store/gameStore";
import { ui } from "@/content/phrases";

export function ScoreCounter() {
  const points = useGameStore((s) => s.progress.totalPoints);
  return (
    <div className="card-soft flex items-center gap-1.5 rounded-full bg-white px-4 py-2 text-xl font-black shadow-sm" aria-label={`${points} ${ui.points}`}>
      <span aria-hidden>🪙</span>
      <span key={points} className="animate-pop tabular-nums">
        {points}
      </span>
    </div>
  );
}
