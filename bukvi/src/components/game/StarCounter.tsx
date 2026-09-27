"use client";

import { useGameStore } from "@/store/gameStore";
import { ui } from "@/content/phrases";

export function StarCounter() {
  const stars = useGameStore((s) => s.progress.stars);
  return (
    <div
      id="star-counter"
      className="card-soft flex items-center gap-1.5 rounded-full bg-white px-4 py-2 text-xl font-black shadow-sm"
      aria-label={`${stars} ${ui.stars}`}
    >
      <span aria-hidden>⭐</span>
      <span key={stars} className="animate-pop tabular-nums">
        {stars}
      </span>
    </div>
  );
}
