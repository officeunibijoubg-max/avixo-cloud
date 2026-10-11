"use client";

import { useGameStore } from "@/store/gameStore";
import { totalStars } from "@/services/progress";
import { ui } from "@/content/phrases";

/** Звездите от уроците: колко добре са усвоени буквите и цифрите. */
export function StarCounter() {
  const stars = useGameStore((s) => totalStars(s.progress));
  return (
    <div
      id="star-counter"
      className="card-soft flex items-center gap-1.5 shrink-0 rounded-full bg-white px-3 py-1.5 text-lg font-black sm:px-4 sm:py-2 sm:text-xl shadow-sm"
      aria-label={`${stars} ${ui.stars}`}
    >
      <span aria-hidden>⭐</span>
      <span key={stars} className="animate-pop tabular-nums">
        {stars}
      </span>
    </div>
  );
}
