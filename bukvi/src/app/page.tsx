"use client";

import Link from "next/link";
import { APP_CONFIG } from "@/config/app";
import { MASCOTS, DEFAULT_MASCOT } from "@/config/mascot";
import { phrases, ui } from "@/content/phrases";
import { useGameStore } from "@/store/gameStore";
import { BigButton } from "@/components/ui/BigButton";
import { Mascot } from "@/components/game/Mascot";
import { StarCounter } from "@/components/game/StarCounter";
import { CoinCounter } from "@/components/game/CoinCounter";
import { PATH } from "@/data/path";
import { levelOf, MAX_LEVEL } from "@/services/progress";
import { currentStepIndex } from "@/services/path";
import { playSound } from "@/services/sounds";
import { stepInfo } from "@/components/path/stepInfo";
import { cn } from "@/lib/cn";
import { speakPhrase } from "@/services/speech";

export default function HomePage() {
  const mascotKey = useGameStore((s) => s.settings.mascot);
  const progress = useGameStore((s) => s.progress);
  const hydrated = useGameStore((s) => s.hydrated);
  const profile = useGameStore((s) => s.profiles.find((p) => p.id === s.activeId));
  const level = levelOf(progress);
  const mascot = MASCOTS[mascotKey] ?? MASCOTS[DEFAULT_MASCOT];
  const greeting = phrases.greeting(mascot.name);
  const current = hydrated ? currentStepIndex(progress) : 0;
  const step = PATH[current];
  const info = step ? stepInfo(step) : null;

  return (
    <div className="mx-auto flex min-h-dvh w-full max-w-5xl flex-col gap-5 px-4 pb-8 pt-[max(1rem,env(safe-area-inset-top))] sm:px-6">
      <header className="flex items-center gap-3">
        {/* Кой играе — натискането води към избора на дете. */}
        <Link
          href="/profiles/"
          className="card-soft flex items-center gap-2 rounded-full bg-white py-1 pl-1 pr-4 text-xl font-black shadow-sm"
          aria-label={phrases.whoPlays}
        >
          <span className="flex size-10 items-center justify-center rounded-full bg-violet-100 text-3xl">{profile?.avatar}</span>
          <span className="max-w-32 truncate">{profile?.name}</span>
        </Link>
        <span className="card-soft rounded-full bg-white px-4 py-2 text-xl font-black shadow-sm" aria-label={`${ui.level} ${level}`}>
          🏅 {ui.level} {level}
          <span className="text-base text-slate-400">/{MAX_LEVEL}</span>
        </span>
        <div className="ml-auto flex gap-2">
          <StarCounter />
          <CoinCounter />
        </div>
      </header>

      <div className="flex flex-col items-center gap-3 text-center">
        <h1 className="bg-gradient-to-r from-grape via-berry to-sun bg-clip-text text-4xl font-black text-transparent sm:text-6xl">
          {APP_CONFIG.name}
        </h1>
        <button type="button" onClick={() => void speakPhrase(greeting)} className="text-left">
          <Mascot message={hydrated && current === 0 ? phrases.pathHello : greeting} mood="wave" />
        </button>
      </div>

      {/* Основното: ЕДНА следваща стъпка по пътя. Всичко друго е за повтаряне. */}
      <Link
        href="/step/"
        onClick={() => playSound("click")}
        className="card-soft flex min-h-36 animate-pulse-soft items-center gap-5 rounded-[2rem] bg-gradient-to-r from-leaf to-emerald-500 px-6 py-5 text-white shadow-[0_8px_0_rgb(0_0_0/0.15)]"
      >
        <span className="flex size-24 shrink-0 items-center justify-center rounded-3xl bg-white/25 text-6xl font-black">
          {hydrated ? (info?.icon ?? "🏆") : ""}
        </span>
        <span className="flex flex-1 flex-col">
          <span className="text-4xl font-black sm:text-5xl">▶ {phrases.continuePath}</span>
          <span className="text-xl font-bold opacity-95">{info?.label ?? phrases.pathDone}</span>
        </span>
      </Link>

      {/* Пътечка: минатите стъпки, текущата и следващите (заключени). */}
      {hydrated && (
        <Link href="/learn/" className="card-soft flex items-center justify-between gap-1 rounded-3xl bg-white/80 p-3 shadow-sm" aria-label={phrases.pathTitle}>
          {Array.from({ length: 7 }, (_, k) => current - 2 + k).map((i) => {
            const s = PATH[i];
            if (!s) return <span key={i} className="size-11" />;
            const done = i < current;
            const now = i === current;
            return (
              <span
                key={i}
                className={cn(
                  "flex items-center justify-center rounded-full font-black",
                  now ? "size-14 bg-leaf text-3xl text-white ring-4 ring-grape" : "size-11 text-xl",
                  done && "bg-lime-200",
                  !done && !now && "bg-slate-100 text-slate-300",
                )}
              >
                {done ? "✓" : now ? stepInfo(s).icon : "🔒"}
              </span>
            );
          })}
          <span className="ml-1 text-sm font-bold text-slate-500">
            {Math.min(current + 1, PATH.length)}/{PATH.length}
          </span>
        </Link>
      )}

      <nav className="grid flex-1 grid-cols-2 gap-4 sm:gap-5 lg:grid-cols-4">
        <BigButton href="/learn/" icon="🗺️" label={phrases.pathShort} size="lg" color="bg-lime-200" />
        <BigButton href="/games/" icon="🎮" label={ui.menu.play} size="lg" color="bg-sky-200" />
        <BigButton href="/rewards/" icon="🏆" label={ui.menu.rewards} size="lg" color="bg-pink-200" />
        <BigButton href="/shop/" icon="🛍️" label="Магазин" size="lg" color="bg-amber-200" />
      </nav>

      <div className="grid grid-cols-2 gap-4">
        <Link
          href="/parent/"
          className="card-soft flex min-h-16 items-center justify-center gap-3 rounded-[1.75rem] bg-white/70 text-lg font-extrabold shadow-sm"
        >
          <span className="text-3xl" aria-hidden>
            👨‍👩‍👧
          </span>
          {ui.menu.parents}
        </Link>
        <Link
          href="/settings/"
          className="card-soft flex min-h-16 items-center justify-center gap-3 rounded-[1.75rem] bg-white/70 text-lg font-extrabold shadow-sm"
        >
          <span className="text-3xl" aria-hidden>
            ⚙️
          </span>
          {ui.menu.settings}
        </Link>
      </div>
    </div>
  );
}
