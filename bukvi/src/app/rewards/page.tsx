"use client";

import Link from "next/link";
import { SHOP_ITEMS, STICKERS } from "@/data/shop";
import { MASCOTS } from "@/config/mascot";
import { ui } from "@/content/phrases";
import { useGameStore } from "@/store/gameStore";
import { levelOf, MAX_LEVEL, totalStars } from "@/services/progress";
import { allLessons } from "@/data/lessons";
import { playSound } from "@/services/sounds";
import { cn } from "@/lib/cn";
import { PageShell } from "@/components/ui/PageShell";
import { Mascot } from "@/components/game/Mascot";
import { DailyChallengeCard } from "@/components/game/DailyChallengeCard";
import { HeroSvg } from "@/components/game/hero/HeroSvg";

/** Моите награди: звезди, монети, ниво, албум със стикери и моята стая. */
export default function RewardsPage() {
  const progress = useGameStore((s) => s.progress);
  const mascot = useGameStore((s) => s.settings.mascot);
  const updateSettings = useGameStore((s) => s.updateSettings);
  const toys = SHOP_ITEMS.filter((i) => i.category === "toy" && progress.owned.includes(i.id));
  const friends = [
    "lion",
    ...SHOP_ITEMS.filter((i) => i.category === "friend" && progress.owned.includes(i.id)).map((i) => i.mascot as string),
  ];
  const maxStars = allLessons.length * 3;

  const stats = [
    { icon: "⭐", value: `${totalStars(progress)}/${maxStars}`, label: "звезди от уроците" },
    { icon: "🪙", value: progress.coins, label: "монети за магазина" },
    { icon: "🏅", value: `${levelOf(progress)}/${MAX_LEVEL}`, label: ui.level.toLowerCase() },
  ];

  return (
    <PageShell back="/" title={ui.menu.rewards} showScore={false}>
      <div className="grid grid-cols-3 gap-3">
        {stats.map((s) => (
          <div key={s.label} className="card-soft flex flex-col items-center rounded-3xl bg-white p-4 text-center shadow-sm">
            <span className="text-5xl" aria-hidden>
              {s.icon}
            </span>
            <span className="text-3xl font-black tabular-nums">{s.value}</span>
            <span className="text-muted text-sm font-bold text-slate-500">{s.label}</span>
          </div>
        ))}
      </div>

      <DailyChallengeCard className="mt-4" />

      <Link
        href="/shop/"
        className="card-soft mt-4 flex min-h-20 items-center justify-center gap-3 rounded-3xl bg-sun text-2xl font-black text-white shadow-[0_6px_0_rgb(0_0_0/0.12)]"
      >
        <span className="text-4xl">🛍️</span> Магазин
      </Link>

      <h2 className="mb-3 mt-6 text-2xl font-black">🏠 Моята стая</h2>
      <div className="card-soft flex min-h-40 flex-wrap items-end gap-4 rounded-3xl bg-gradient-to-b from-amber-50 to-orange-100 p-5 shadow-sm">
        <Mascot />
        {toys.map((t) => (
          <span key={t.id} className="text-6xl" title={t.name}>
            {t.icon}
          </span>
        ))}
        {toys.length === 0 && <span className="text-muted self-center font-bold text-slate-500">Купи играчки от магазина! 🧸</span>}
      </div>

      <h2 className="mb-3 mt-6 text-2xl font-black">🐾 Моят приятел</h2>
      <div className="flex flex-wrap gap-3">
        {friends.map((h) => (
          <button
            key={h}
            type="button"
            onClick={() => {
              playSound("pop");
              updateSettings({ mascot: h });
            }}
            aria-label={MASCOTS[h].name}
            className={cn("card-soft flex w-28 flex-col items-center justify-center rounded-3xl bg-white p-2 shadow-sm", mascot === h && "ring-4 ring-grape")}
          >
            <HeroSvg hero={h} size={56} />
            <span className="text-sm font-bold">{MASCOTS[h].name}</span>
          </button>
        ))}
      </div>

      <h2 className="mb-3 mt-6 text-2xl font-black">📒 Албум със стикери</h2>
      <p className="text-muted mb-3 font-bold text-slate-500">Всяко Днешно приключение носи нов стикер.</p>
      <div className="grid grid-cols-4 gap-3 sm:grid-cols-6 lg:grid-cols-8">
        {STICKERS.map((s) => {
          const has = progress.stickers.includes(s);
          return (
            <div
              key={s}
              className={cn(
                "card-soft flex aspect-square items-center justify-center rounded-2xl text-5xl shadow-sm",
                has ? "bg-white" : "border-2 border-dashed border-slate-300 bg-white/40",
              )}
            >
              {has ? s : <span className="text-2xl text-slate-300">?</span>}
            </div>
          );
        })}
      </div>
    </PageShell>
  );
}
