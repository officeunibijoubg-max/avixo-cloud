"use client";

import Link from "next/link";
import { WORLDS } from "@/data/adventure";
import { phrases } from "@/content/phrases";
import { useGameStore } from "@/store/gameStore";
import { starsFor } from "@/services/progress";
import { isWorldUnlocked, lettersToUnlock } from "@/services/adventure";
import { playSound } from "@/services/sounds";
import { cn } from "@/lib/cn";
import { PageShell } from "@/components/ui/PageShell";
import { Mascot } from "@/components/game/Mascot";

const HREF: Record<string, string> = {
  numbers: "/learn/numbers/",
  forest: "/learn/letters/",
  mountain: "/learn/letters/#mountain",
  lowercase: "/learn/small/",
  words: "/learn/words/",
};

/** Картата на световете: Градът на цифрите, Гората и Планината на буквите, Островът на думите. */
export default function WorldsPage() {
  const progress = useGameStore((s) => s.progress);
  const unlockAll = useGameStore((s) => s.settings.unlockAll);
  return (
    <PageShell back="/" title="Карта на приключението">
      <Mascot compact message={phrases.pickWorld} className="mb-4" />
      <div className="grid gap-4 sm:grid-cols-2">
        {WORLDS.map((w) => {
          const open = isWorldUnlocked(progress, w, unlockAll);
          const done = w.characters.filter((c) => starsFor(progress, c) > 0).length;
          const body = (
            <>
              <span className="text-7xl">{open ? w.icon : w.comingSoon ? "🏗️" : "🔒"}</span>
              <span className="text-2xl font-black">{w.title}</span>
              {w.comingSoon ? (
                <span className="rounded-full bg-white/80 px-3 py-1 font-bold">{phrases.comingSoon}</span>
              ) : !open ? (
                <span className="rounded-full bg-white/80 px-3 py-1 font-bold">
                  🔒{" "}
                  {lettersToUnlock(progress, w) > 0
                    ? phrases.needLetters(lettersToUnlock(progress, w))
                    : phrases.needWorld(WORLDS.find((x) => x.id === w.requires)?.title ?? "")}
                </span>
              ) : (
                <>
                  <span className="text-3xl tracking-widest">{w.characters.slice(0, 5).join(" ")}…</span>
                  <span className="h-4 w-4/5 overflow-hidden rounded-full bg-white/70">
                    <span className="block h-full rounded-full bg-leaf" style={{ width: `${(done / w.characters.length) * 100}%` }} />
                  </span>
                  <span className="font-bold">
                    {done} / {w.characters.length}
                  </span>
                </>
              )}
            </>
          );
          const cls = cn(
            "card-soft flex min-h-64 flex-col items-center justify-center gap-2 rounded-[2rem] p-5 text-center shadow-[0_8px_0_rgb(0_0_0/0.12)]",
            !open && "opacity-60 grayscale-[40%]",
          );
          return open ? (
            <Link key={w.id} href={HREF[w.id]} onClick={() => playSound("click")} className={cls} style={{ background: w.theme.bg }}>
              {body}
            </Link>
          ) : (
            <div key={w.id} className={cls} style={{ background: w.theme.bg }}>
              {body}
            </div>
          );
        })}
      </div>
    </PageShell>
  );
}
