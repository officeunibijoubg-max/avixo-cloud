"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { CHAPTERS, CHAPTER_START } from "@/data/path";
import { phrases } from "@/content/phrases";
import { useGameStore } from "@/store/gameStore";
import { currentStepIndex, isStepDone } from "@/services/path";
import { playSound } from "@/services/sounds";
import { speakPhrase } from "@/services/speech";
import { cn } from "@/lib/cn";
import { PageShell } from "@/components/ui/PageShell";
import { Mascot, CurrentHero } from "@/components/game/Mascot";
import { stepInfo } from "@/components/path/stepInfo";

/**
 * Пътят на Лъвчо: всички стъпки подред, по глави. Минатите са зелени и могат да се
 * повторят, текущата свети, а следващите са заключени — детето вижда накъде върви.
 */
export default function PathPage() {
  const router = useRouter();
  const progress = useGameStore((s) => s.progress);
  const hydrated = useGameStore((s) => s.hydrated);
  const unlockAll = useGameStore((s) => s.settings.unlockAll);
  const [message, setMessage] = useState<string>(phrases.pathHello);
  const currentRef = useRef<HTMLButtonElement>(null);
  const current = hydrated ? currentStepIndex(progress) : -1;

  useEffect(() => {
    if (current >= 0) currentRef.current?.scrollIntoView({ block: "center", behavior: "smooth" });
  }, [current]);

  const open = (i: number) => {
    const step = CHAPTERS.flatMap((c) => c.steps)[i];
    if (i === current) {
      playSound("click");
      router.push("/step/");
      return;
    }
    if (i > current && !unlockAll) {
      playSound("wrong");
      setMessage(phrases.pathLocked);
      void speakPhrase(phrases.pathLocked);
      return;
    }
    playSound("click");
    const info = stepInfo(step);
    router.push(info.href ?? `/step/?i=${i}`);
  };

  return (
    <PageShell back="/" title={`🗺️ ${phrases.pathTitle}`}>
      <Mascot compact message={message} className="sticky top-2 z-10 mb-4" />
      <div className="flex flex-col gap-6">
        {CHAPTERS.map((chapter, ci) => {
          const start = CHAPTER_START[ci];
          const done = chapter.steps.filter((s) => isStepDone(progress, s)).length;
          const ahead = current >= 0 && start > current && !unlockAll;
          return (
            <section key={chapter.title} className={cn("card-soft rounded-[2rem] bg-white/70 p-4 shadow-sm", ahead && "opacity-60")}>
              <h2 className="mb-3 flex items-center gap-2 text-xl font-black sm:text-2xl">
                <span className="text-3xl">{ahead ? "🔒" : chapter.icon}</span>
                <span className="flex-1">
                  {ci + 1}. {chapter.title}
                </span>
                <span className="text-base text-slate-500">
                  {done}/{chapter.steps.length}
                </span>
              </h2>
              <div className="flex flex-wrap gap-3">
                {chapter.steps.map((s, k) => {
                  const i = start + k;
                  const info = stepInfo(s);
                  const isDone = isStepDone(progress, s);
                  const isCurrent = i === current;
                  const locked = i > current && !unlockAll;
                  return (
                    <button
                      key={i}
                      ref={isCurrent ? currentRef : undefined}
                      type="button"
                      onClick={() => open(i)}
                      aria-label={info.label}
                      title={info.label}
                      className={cn(
                        "relative flex size-16 items-center justify-center rounded-full text-3xl font-black shadow-[0_4px_0_rgb(0_0_0/0.12)] transition active:translate-y-1 sm:size-20 sm:text-4xl",
                        isCurrent
                          ? "size-20 animate-pulse-soft bg-leaf text-white ring-4 ring-grape sm:size-24"
                          : isDone
                            ? "bg-lime-200"
                            : locked
                              ? "bg-slate-100 text-slate-300"
                              : "bg-white",
                      )}
                    >
                      {locked ? "🔒" : info.icon}
                      {isDone && !isCurrent && <span className="absolute -right-1 -top-1 rounded-full bg-leaf px-1.5 text-sm text-white">✓</span>}
                      {isCurrent && (
                        <span className="absolute -top-12 left-1/2 -translate-x-1/2" aria-hidden>
                          <CurrentHero pose="point" size={44} />
                        </span>
                      )}
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
