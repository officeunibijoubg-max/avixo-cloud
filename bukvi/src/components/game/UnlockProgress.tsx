"use client";

import { useEffect } from "react";
import Link from "next/link";
import { phrases } from "@/content/phrases";
import { useGameStore } from "@/store/gameStore";
import { newlyUnlocked, nextUnlock } from "@/services/unlocks";
import { playSound } from "@/services/sounds";
import { speakPhrase } from "@/services/speech";

/** „Следва да отключиш: 🎈 Балони — научи още 2 букви“ — видима цел за детето. */
export function NextUnlockCard() {
  const progress = useGameStore((s) => s.progress);
  const hydrated = useGameStore((s) => s.hydrated);
  const unlockAll = useGameStore((s) => s.settings.unlockAll);
  if (!hydrated || unlockAll) return null;
  const next = nextUnlock(progress);
  if (!next) return null;
  return (
    <button
      type="button"
      onClick={() => void speakPhrase(phrases.lockedFeature(next.missing.join(" и ")))}
      className="card-soft flex w-full items-center gap-4 rounded-[1.75rem] bg-white/80 px-5 py-4 text-left shadow-sm"
    >
      <span className="relative text-5xl">
        <span className="opacity-50 grayscale">{next.feature.icon}</span>
        <span className="absolute -bottom-1 -right-2 text-2xl">🔒</span>
      </span>
      <span className="flex flex-1 flex-col gap-1">
        <span className="text-sm font-bold text-slate-500">🔓 {phrases.nextUnlock}</span>
        <span className="text-xl font-black">{next.feature.title}</span>
        <span className="h-3 overflow-hidden rounded-full bg-slate-200">
          <span className="block h-full rounded-full bg-grape transition-all" style={{ width: `${next.progress * 100}%` }} />
        </span>
        <span className="text-sm font-bold text-slate-600">{next.missing.join(" и ")}</span>
      </span>
    </button>
  );
}

/** Голяма карта „Отключи нова игра!“, веднъж за всяко ново отключване. */
export function UnlockPopup() {
  const progress = useGameStore((s) => s.progress);
  const hydrated = useGameStore((s) => s.hydrated);
  const markSeen = useGameStore((s) => s.markUnlocksSeen);
  const fresh = hydrated ? newlyUnlocked(progress) : [];
  const title = fresh.length === 1 ? phrases.unlockedNew(fresh[0].title) : phrases.unlockedMany;

  useEffect(() => {
    if (!fresh.length) return;
    playSound("reward");
    void speakPhrase(title);
    // Само при нова поява — зависим от броя, не от масива.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [fresh.length, title]);

  if (!fresh.length) return null;
  return (
    <div className="fixed inset-0 z-[70] flex items-center justify-center bg-black/40 p-6">
      <div className="card-soft flex max-w-lg animate-pop flex-col items-center gap-4 rounded-[2.5rem] bg-white px-8 py-8 text-center shadow-2xl">
        <span className="text-7xl">🔓</span>
        <span className="text-3xl font-black">{title}</span>
        <div className="flex flex-wrap justify-center gap-3">
          {fresh.slice(0, 4).map((f) => (
            <Link
              key={f.id}
              href={f.href}
              onClick={() => markSeen(fresh.map((x) => x.id))}
              className="flex flex-col items-center rounded-3xl bg-violet-100 px-4 py-3 font-bold"
            >
              <span className="text-5xl">{f.icon}</span>
              {f.title}
            </Link>
          ))}
        </div>
        <button
          type="button"
          onClick={() => markSeen(fresh.map((x) => x.id))}
          className="rounded-2xl bg-leaf px-8 py-3 text-xl font-black text-white"
        >
          👍 Супер!
        </button>
      </div>
    </div>
  );
}
