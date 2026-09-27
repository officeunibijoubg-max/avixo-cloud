"use client";

import { REWARDS } from "@/data/rewards";
import { MASCOTS } from "@/config/mascot";
import { POINTS } from "@/config/points";
import { ui } from "@/content/phrases";
import { useGameStore } from "@/store/gameStore";
import { nextRewardAt } from "@/services/rewards";
import { playSound } from "@/services/sounds";
import { cn } from "@/lib/cn";
import { PageShell } from "@/components/ui/PageShell";

// Кои награди отключват нов герой.
const HERO_REWARDS: Record<string, string> = { "hero-bear": "bear", "hero-fox": "fox", "hero-robot": "robot" };

export default function RewardsPage() {
  const progress = useGameStore((s) => s.progress);
  const mascot = useGameStore((s) => s.settings.mascot);
  const updateSettings = useGameStore((s) => s.updateSettings);
  const target = nextRewardAt(progress.stars);
  const starsInCycle = progress.stars % POINTS.starsPerReward;
  const heroes = ["lion", ...progress.unlockedRewards.map((id) => HERO_REWARDS[id]).filter(Boolean)];

  const stats = [
    { icon: "⭐", value: progress.stars, label: ui.stars },
    { icon: "🪙", value: progress.totalPoints, label: ui.points },
    { icon: "🏅", value: progress.level, label: ui.level },
    { icon: "🔥", value: progress.streak, label: ui.streak },
  ];

  return (
    <PageShell back="/" title={ui.menu.rewards} showScore={false}>
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        {stats.map((s) => (
          <div key={s.label} className="card-soft flex flex-col items-center rounded-3xl bg-white p-4 shadow-sm">
            <span className="text-5xl" aria-hidden>
              {s.icon}
            </span>
            <span className="text-4xl font-black tabular-nums">{s.value}</span>
            <span className="text-muted font-bold text-slate-500">{s.label}</span>
          </div>
        ))}
      </div>

      <div className="card-soft mt-5 rounded-3xl bg-white p-4 shadow-sm">
        <div className="flex items-center gap-3 text-2xl">
          <span aria-hidden>🎁</span>
          <div className="h-6 flex-1 overflow-hidden rounded-full bg-slate-100">
            <div className="h-full rounded-full bg-sun transition-all" style={{ width: `${(starsInCycle / POINTS.starsPerReward) * 100}%` }} />
          </div>
          <span className="font-black tabular-nums">
            {progress.stars}/{target} ⭐
          </span>
        </div>
      </div>

      <h2 className="mb-3 mt-6 text-2xl font-black">🦁 Моят приятел</h2>
      <div className="flex flex-wrap gap-3">
        {heroes.map((h) => (
          <button
            key={h}
            type="button"
            onClick={() => {
              playSound("pop");
              updateSettings({ mascot: h });
            }}
            aria-label={MASCOTS[h].name}
            className={cn(
              "card-soft flex size-24 flex-col items-center justify-center rounded-3xl bg-white text-5xl shadow-sm",
              mascot === h && "ring-4 ring-grape",
            )}
          >
            {MASCOTS[h].emoji}
            <span className="text-sm font-bold">{MASCOTS[h].name}</span>
          </button>
        ))}
      </div>

      <h2 className="mb-3 mt-6 text-2xl font-black">🏆 {ui.menu.rewards}</h2>
      <div className="grid grid-cols-3 gap-3 sm:grid-cols-4 lg:grid-cols-6">
        {REWARDS.map((r) => {
          const unlocked = progress.unlockedRewards.includes(r.id);
          return (
            <div
              key={r.id}
              className={cn("card-soft flex aspect-square flex-col items-center justify-center gap-1 rounded-3xl p-2 text-center shadow-sm", unlocked ? "bg-white" : "bg-white/40")}
            >
              <span className={cn("text-5xl", !unlocked && "opacity-30 grayscale")}>{unlocked ? r.icon : "🔒"}</span>
              {unlocked && <span className="text-sm font-bold leading-tight">{r.name}</span>}
            </div>
          );
        })}
      </div>
    </PageShell>
  );
}
