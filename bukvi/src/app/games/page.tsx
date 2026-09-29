"use client";

import { useState } from "react";
import { GAME_GROUPS, GAMES } from "@/data/games";
import { getFeature } from "@/data/unlocks";
import { phrases, ui } from "@/content/phrases";
import { useGameStore } from "@/store/gameStore";
import { missingFor } from "@/services/unlocks";
import { playSound } from "@/services/sounds";
import { speakPhrase } from "@/services/speech";
import { PageShell } from "@/components/ui/PageShell";
import { BigButton } from "@/components/ui/BigButton";
import { Mascot } from "@/components/game/Mascot";

export default function GamesPage() {
  const progress = useGameStore((s) => s.progress);
  const unlockAll = useGameStore((s) => s.settings.unlockAll);
  const hydrated = useGameStore((s) => s.hydrated);
  const [message, setMessage] = useState<string>(phrases.pickGame);

  // Какво липсва за всяка игра ([] = отключена). До зареждането всичко изглежда заключено.
  const missing = (id: string) => {
    const f = getFeature(id);
    if (!f || unlockAll) return [];
    return hydrated ? missingFor(progress, f.unlock) : ["…"];
  };

  return (
    <PageShell back="/" title={ui.menu.play}>
      <Mascot compact message={message} className="mb-4" />
      <div className="flex flex-col gap-6">
        {GAME_GROUPS.map((group) => {
          const games = GAMES.filter((g) => g.group === group.id);
          if (!games.length) return null;
          return (
            <section key={group.id}>
              <h2 className="mb-3 text-2xl font-black">{group.title}</h2>
              <div className="grid grid-cols-2 gap-4 lg:grid-cols-3">
                {games.map((g) => {
                  const need = missing(g.id);
                  if (need.length === 0)
                    return <BigButton key={g.id} href={g.href} icon={g.icon} label={g.title} size="lg" color={g.color} />;
                  const text = phrases.lockedFeature(need.join(" и "));
                  return (
                    <button
                      key={g.id}
                      type="button"
                      onClick={() => {
                        playSound("wrong");
                        setMessage(text);
                        void speakPhrase(text);
                      }}
                      className="card-soft relative flex min-h-32 flex-col items-center justify-center gap-1 rounded-[1.75rem] bg-slate-100 p-4 text-center shadow-sm"
                    >
                      <span className="absolute right-3 top-3 text-3xl">🔒</span>
                      <span className="text-5xl opacity-40 grayscale">{g.icon}</span>
                      <span className="text-xl font-extrabold text-slate-500">{g.title}</span>
                      <span className="rounded-full bg-white px-3 py-1 text-sm font-bold text-slate-600">{need.join(" и ")}</span>
                    </button>
                  );
                })}
              </div>
            </section>
          );
        })}
      </div>
    </PageShell>
  );
}
