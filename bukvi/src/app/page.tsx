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
import { DailyChallengeCard } from "@/components/game/DailyChallengeCard";
import { NextUnlockCard, UnlockPopup } from "@/components/game/UnlockProgress";
import { levelOf, MAX_LEVEL, todayKey } from "@/services/progress";
import { pickAdventureLetter } from "@/services/adventure";
import { playSound } from "@/services/sounds";
import { speakPhrase } from "@/services/speech";

export default function HomePage() {
  const mascotKey = useGameStore((s) => s.settings.mascot);
  const progress = useGameStore((s) => s.progress);
  const hydrated = useGameStore((s) => s.hydrated);
  const profile = useGameStore((s) => s.profiles.find((p) => p.id === s.activeId));
  const level = levelOf(progress);
  const mascot = MASCOTS[mascotKey] ?? MASCOTS[DEFAULT_MASCOT];
  const greeting = phrases.greeting(mascot.name);
  const todayLetter = hydrated ? pickAdventureLetter(progress) : "";
  const doneToday = progress.adventuresDone.includes(todayKey());

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
          <Mascot message={greeting} mood="wave" />
        </button>
      </div>

      {/* Основната игра: Днешно приключение. */}
      <Link
        href="/adventure/"
        onClick={() => playSound("click")}
        className="card-soft flex min-h-36 animate-pulse-soft items-center gap-5 rounded-[2rem] bg-gradient-to-r from-grape to-berry px-6 py-5 text-white shadow-[0_8px_0_rgb(0_0_0/0.15)]"
      >
        <span className="flex size-24 shrink-0 items-center justify-center rounded-3xl bg-white/25 text-7xl font-black">
          {todayLetter || "🌟"}
        </span>
        <span className="flex flex-col">
          <span className="text-3xl font-black sm:text-4xl">Днешно приключение</span>
          <span className="text-lg font-bold opacity-90">{doneToday ? "✓ Минато днес — може пак!" : "Нова буква, игри и стикер 🎁"}</span>
        </span>
      </Link>

      <DailyChallengeCard />
      <NextUnlockCard />
      <UnlockPopup />

      <nav className="grid flex-1 grid-cols-2 gap-4 sm:gap-5 lg:grid-cols-4">
        <BigButton href="/learn/" icon="🗺️" label="Карта" size="lg" color="bg-lime-200" />
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
