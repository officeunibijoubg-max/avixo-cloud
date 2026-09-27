"use client";

import { APP_CONFIG } from "@/config/app";
import { MASCOTS, DEFAULT_MASCOT } from "@/config/mascot";
import { phrases, ui } from "@/content/phrases";
import { useGameStore } from "@/store/gameStore";
import { BigButton } from "@/components/ui/BigButton";
import { Mascot } from "@/components/game/Mascot";
import { StarCounter } from "@/components/game/StarCounter";
import { ScoreCounter } from "@/components/game/ScoreCounter";
import { speakPhrase } from "@/services/speech";
import Link from "next/link";

export default function HomePage() {
  const mascotKey = useGameStore((s) => s.settings.mascot);
  const level = useGameStore((s) => s.progress.level);
  const mascot = MASCOTS[mascotKey] ?? MASCOTS[DEFAULT_MASCOT];
  const greeting = phrases.greeting(mascot.name);

  return (
    <div className="mx-auto flex min-h-dvh w-full max-w-5xl flex-col gap-6 px-4 pb-8 pt-[max(1rem,env(safe-area-inset-top))] sm:px-6">
      <header className="flex items-center gap-3">
        <span className="card-soft rounded-full bg-white px-4 py-2 text-xl font-black shadow-sm">
          🏅 {ui.level} {level}
        </span>
        <div className="ml-auto flex gap-2">
          <StarCounter />
          <ScoreCounter />
        </div>
      </header>

      <div className="flex flex-col items-center gap-4 text-center">
        <h1 className="bg-gradient-to-r from-grape via-berry to-sun bg-clip-text text-4xl font-black text-transparent sm:text-6xl">
          {APP_CONFIG.name}
        </h1>
        <button type="button" onClick={() => void speakPhrase(greeting)} className="text-left">
          <Mascot message={greeting} mood="wave" />
        </button>
      </div>

      <nav className="grid flex-1 grid-cols-2 gap-4 sm:gap-6 lg:grid-cols-3">
        <BigButton href="/learn/letters/" icon="🔤" label={ui.menu.letters} size="lg" color="bg-violet-200" />
        <BigButton href="/learn/numbers/" icon="🔢" label={ui.menu.numbers} size="lg" color="bg-amber-200" />
        <BigButton href="/games/" icon="🎮" label={ui.menu.play} size="lg" color="bg-sky-200" className="col-span-2 lg:col-span-1" />
        <BigButton href="/rewards/" icon="🏆" label={ui.menu.rewards} size="lg" color="bg-pink-200" />
        <BigButton href="/parent/" icon="👨‍👩‍👧" label={ui.menu.parents} size="lg" color="bg-lime-200" />
        <Link
          href="/settings/"
          className="card-soft col-span-2 flex min-h-16 items-center justify-center gap-3 rounded-[1.75rem] bg-white/70 text-xl font-extrabold shadow-sm lg:col-span-1"
        >
          <span className="text-3xl" aria-hidden>
            ⚙️
          </span>
          {ui.menu.settings}
        </Link>
      </nav>
    </div>
  );
}
