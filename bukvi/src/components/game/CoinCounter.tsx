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
      className="card-soft flex items-center gap-1.5 rounded-full bg-white px-4 py-2 text-xl font-black shadow-sm"
      aria-label={`${coins} ${ui.coins}`}
    >
      <span aria-hidden>🪙</span>
      <span key={coins} className="animate-pop tabular-nums">
        {coins}
      </span>
    </Link>
  );
}
