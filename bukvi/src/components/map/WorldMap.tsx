"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import type { World } from "@/data/adventure";
import { getLessonByChar } from "@/data/lessons";
import { getWordByText } from "@/data/wordsIsland";
import { LionSvg } from "@/components/game/LionSvg";
import { MASCOTS, DEFAULT_MASCOT } from "@/config/mascot";
import { phrases } from "@/content/phrases";
import { useGameStore } from "@/store/gameStore";
import { starsFor } from "@/services/progress";
import { currentNode, isNodeUnlocked, isWorldUnlocked } from "@/services/adventure";
import { playSound } from "@/services/sounds";
import { speakPhrase } from "@/services/speech";
import { cn } from "@/lib/cn";

const STEP = 118; // px между точките по вертикала
const X = (i: number) => 50 + 30 * Math.sin(i * 0.95); // криволичеща пътека, в %

/**
 * Карта на един свят: пътека с точки (по един символ). Минатите имат звезди,
 * текущата пулсира и до нея стои героят, следващите са заключени.
 */
export function WorldMap({ world, onMessage }: { world: World; onMessage?: (text: string) => void }) {
  const router = useRouter();
  const progress = useGameStore((s) => s.progress);
  const unlockAll = useGameStore((s) => s.settings.unlockAll);
  const hydrated = useGameStore((s) => s.hydrated);
  const mascotKey = useGameStore((s) => s.settings.mascot);
  const hero = (MASCOTS[mascotKey] ?? MASCOTS[DEFAULT_MASCOT]).emoji;
  const current = currentNode(progress, world, unlockAll);
  const worldOpen = isWorldUnlocked(progress, world, unlockAll);
  const currentRef = useRef<HTMLButtonElement>(null);
  const [scrolled, setScrolled] = useState(false);

  const n = world.characters.length;
  const height = n * STEP + 40;
  const pathD = useMemo(() => {
    const pts = world.characters.map((_, i) => [X(i), i * STEP + 60] as const);
    return pts.map(([x, y], i) => `${i ? "L" : "M"}${x} ${y}`).join(" ");
  }, [world.characters]);

  // Показваме директно докъде е стигнало детето.
  useEffect(() => {
    if (!hydrated || scrolled || !currentRef.current || !worldOpen) return;
    currentRef.current.scrollIntoView({ block: "center", behavior: "smooth" });
    setScrolled(true);
  }, [hydrated, scrolled, worldOpen]);

  const tap = (c: string, i: number) => {
    // Точката е или символ (урок), или сричка/дума от Острова на думите.
    const lesson = getLessonByChar(c);
    const word = getWordByText(c);
    const href = lesson ? `/practice/${lesson.id}/` : word ? `/word/${word.id}/` : null;
    if (!href) return;
    if (!isNodeUnlocked(progress, world, i, unlockAll)) {
      playSound("wrong");
      const text = worldOpen ? phrases.lockedNode : phrases.lockedWorld;
      onMessage?.(text);
      void speakPhrase(text);
      return;
    }
    playSound("click");
    router.push(href);
  };

  return (
    <div className="card-soft relative overflow-hidden rounded-[2.5rem] shadow-inner" style={{ background: world.theme.bg, height }}>
      {/* Пътеката: SVG с разтегнат viewBox — x е в проценти, y в пиксели. */}
      <svg className="absolute inset-0 size-full" viewBox={`0 0 100 ${height}`} preserveAspectRatio="none" aria-hidden>
        <path d={pathD} fill="none" stroke="#fff" strokeWidth="26" strokeLinecap="round" strokeLinejoin="round" vectorEffect="non-scaling-stroke" />
        <path
          d={pathD}
          fill="none"
          stroke={world.theme.path}
          strokeWidth="10"
          strokeDasharray="2 16"
          strokeLinecap="round"
          vectorEffect="non-scaling-stroke"
        />
      </svg>

      {/* Украса отстрани на пътеката. */}
      {world.characters.map((_, i) => (
        <span
          key={`d${i}`}
          className="pointer-events-none absolute text-4xl opacity-80 sm:text-5xl"
          style={{ top: i * STEP + 40, left: X(i) > 50 ? "6%" : "80%" }}
          aria-hidden
        >
          {world.decor[i % world.decor.length]}
        </span>
      ))}

      {world.characters.map((c, i) => {
        const unlocked = isNodeUnlocked(progress, world, i, unlockAll);
        const stars = starsFor(progress, c);
        const isCurrent = unlocked && i === current;
        return (
          <button
            key={c}
            ref={isCurrent ? currentRef : undefined}
            type="button"
            onClick={() => tap(c, i)}
            aria-label={c}
            className="absolute flex -translate-x-1/2 -translate-y-1/2 flex-col items-center"
            style={{ left: `${X(i)}%`, top: i * STEP + 60 }}
          >
            <span
              className={cn(
                "relative flex size-20 items-center justify-center rounded-full border-4 border-white font-black shadow-[0_6px_0_rgb(0_0_0/0.15)] sm:size-24",
                // Думите са по-дълги — по-малък шрифт, за да се съберат в кръгчето.
                c.length === 1 ? "text-5xl sm:text-6xl" : c.length === 2 ? "text-3xl sm:text-4xl" : "text-xl sm:text-2xl",
                !unlocked && "bg-slate-200 text-slate-400",
                unlocked && stars > 0 && world.theme.node,
                unlocked && stars === 0 && "bg-white",
                isCurrent && "animate-pulse-soft ring-4 ring-grape",
              )}
            >
              {unlocked ? c : "🔒"}
              {isCurrent && (
                <span className="absolute -right-14 -top-2 text-5xl" aria-hidden>
                  {mascotKey === "lion" ? <LionSvg pose="point" size={60} /> : hero}
                </span>
              )}
            </span>
            {unlocked && (
              <span className="mt-1 h-6 rounded-full bg-white/80 px-2 text-base leading-6">{"⭐".repeat(stars) + "☆".repeat(3 - stars)}</span>
            )}
          </button>
        );
      })}
    </div>
  );
}
