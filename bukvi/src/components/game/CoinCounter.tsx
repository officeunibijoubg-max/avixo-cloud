"use client";

import Link from "next/link";
import { useGameStore } from "@/store/gameStore";
import { ui } from "@/content/phrases";

/** Монетите — натискането води в магазина, където се харчат. */
export function CoinCounter() {
  const coins = useGameStore((s) => s.progress.coins);
  return (
    <Link
      href="/shop/"
      id="coin-counter"
      className="card-soft flex items-center gap-1.5 shrink-0 rounded-full bg-white px-3 py-1.5 text-lg font-black sm:px-4 sm:py-2 sm:text-xl shadow-sm"
      aria-label={`${coins} ${ui.coins}`}
    >
      <span aria-hidden>🪙</span>
      <span key={coins} className="animate-pop tabular-nums">
        {coins}
      </span>
    </Link>
  );
}
