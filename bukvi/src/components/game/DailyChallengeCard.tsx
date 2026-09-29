"use client";

import { phrases } from "@/content/phrases";
import { useGameStore } from "@/store/gameStore";
import { challengeCount, challengeFor, dayStreak, todayKey } from "@/services/progress";
import { speakPhrase } from "@/services/speech";
import { cn } from "@/lib/cn";

/** Карта „Предизвикателство на деня“: задача, напредък и поредицата от дни 🔥. */
export function DailyChallengeCard({ className }: { className?: string }) {
  const progress = useGameStore((s) => s.progress);
  const hydrated = useGameStore((s) => s.hydrated);
  const day = todayKey();
  const challenge = challengeFor(day, progress);
  const count = hydrated ? Math.min(challenge.goal, challengeCount(progress, day)) : 0;
  const done = (progress.challengeDays ?? []).includes(day);
  const streak = hydrated ? dayStreak(progress, day) : 0;

  return (
    <button
      type="button"
      onClick={() => void speakPhrase(challenge.text)}
      className={cn(
        "card-soft flex w-full items-center gap-4 rounded-[1.75rem] px-5 py-4 text-left shadow-sm",
        done ? "bg-green-100" : "bg-white/80",
        className,
      )}
    >
      <span className="text-5xl" aria-hidden>
        {done ? "✅" : challenge.icon}
      </span>
      <span className="flex flex-1 flex-col gap-1">
        <span className="text-sm font-bold text-slate-500">🎯 {phrases.challengeToday}</span>
        <span className="text-xl font-black">{challenge.text}</span>
        <span className="h-3 overflow-hidden rounded-full bg-slate-200">
          <span className="block h-full rounded-full bg-leaf transition-all" style={{ width: `${(count / challenge.goal) * 100}%` }} />
        </span>
      </span>
      <span className="flex flex-col items-center">
        <span className="text-2xl font-black tabular-nums">
          {count}/{challenge.goal}
        </span>
        {streak > 0 && (
          <span className="rounded-full bg-orange-100 px-2 text-lg font-black text-orange-600" aria-label={`${streak} дни подред`}>
            🔥 {streak}
          </span>
        )}
      </span>
    </button>
  );
}
