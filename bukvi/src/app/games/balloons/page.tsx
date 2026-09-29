"use client";

import { FeatureGate } from "@/components/layout/FeatureGate";
import { useCallback, useEffect, useRef, useState } from "react";
import { ALPHABET, letterLessons } from "@/data/alphabet";
import { gameTitle } from "@/data/games";
import { phrases } from "@/content/phrases";
import { useGameStore } from "@/store/gameStore";
import { playSound } from "@/services/sounds";
import { cancelSpeech, speakPhrase } from "@/services/speech";
import { optionsWith, pickOne, randomInt } from "@/lib/random";
import { cn } from "@/lib/cn";
import { PageShell } from "@/components/ui/PageShell";
import { Mascot } from "@/components/game/Mascot";
import { SoundButton } from "@/components/game/SoundButton";
import { RewardAnimation } from "@/components/game/RewardAnimation";
import { useCelebration } from "@/components/game/useCelebration";
import { Progress } from "@/components/games/ChoiceGame";
import { GameEnd } from "@/components/games/GameEnd";

type Balloon = { id: number; char: string; left: number; color: string; duration: number; wrong?: boolean };

const GOAL = 6;
const SPAWN_MS = 1100;
const COLORS = ["#f472b6", "#38bdf8", "#fbbf24", "#a78bfa", "#4ade80", "#fb923c", "#f87171"];

/** Игра 6 — „Балони“: спукай балона с правилната буква. */
function BalloonsGame() {
  const reduceMotion = useGameStore((s) => s.settings.reduceMotion);
  const recordGameAnswer = useGameStore((s) => s.recordGameAnswer);
  const countGame = useGameStore((s) => s.countGame);
  const { celebration, celebrate, closeReward } = useCelebration();
  const [target, setTarget] = useState<(typeof letterLessons)[number] | null>(null);
  const [balloons, setBalloons] = useState<Balloon[]>([]);
  const [popped, setPopped] = useState(0);
  const seq = useRef(0);
  const done = popped >= GOAL;

  const newTarget = useCallback(() => {
    const t = pickOne(letterLessons);
    setTarget(t);
    void speakPhrase(phrases.popBalloon(t.spokenName));
    return t;
  }, []);

  const makeBalloon = useCallback((char: string, left?: number): Balloon => {
    seq.current += 1;
    return {
      id: seq.current,
      char,
      left: left ?? 5 + randomInt(80),
      color: COLORS[seq.current % COLORS.length],
      duration: 8 + randomInt(3),
    };
  }, []);

  // Без анимации: статичен ред балони за всяка задача.
  const staticSet = useCallback(
    (char: string) => optionsWith(ALPHABET, char, 6).map((c, i) => makeBalloon(c, 4 + i * 16)),
    [makeBalloon],
  );

  useEffect(() => {
    const t = newTarget();
    if (reduceMotion) setBalloons(staticSet(t.character));
    return () => cancelSpeech();
  }, [newTarget, reduceMotion, staticSet]);

  // Нови балони на всеки SPAWN_MS; правилната буква идва често, за да не чака детето.
  useEffect(() => {
    if (reduceMotion || done || !target) return;
    const id = setInterval(() => {
      const char = Math.random() < 0.3 ? target.character : pickOne(ALPHABET);
      setBalloons((b) => [...b.slice(-14), makeBalloon(char)]);
    }, SPAWN_MS);
    return () => clearInterval(id);
  }, [reduceMotion, done, target, makeBalloon]);

  const tap = (b: Balloon) => {
    if (!target || done) return;
    if (b.char === target.character) {
      playSound("pop");
      setBalloons((list) => list.filter((x) => x.id !== b.id));
      celebrate(recordGameAnswer(true));
      const next = popped + 1;
      setPopped(next);
      if (next >= GOAL) {
        countGame();
        setBalloons([]);
        return;
      }
      setTimeout(() => {
        const t = newTarget();
        if (reduceMotion) setBalloons(staticSet(t.character));
      }, 900);
    } else {
      playSound("wrong");
      setBalloons((list) => list.map((x) => (x.id === b.id ? { ...x, wrong: true } : x)));
    }
  };

  const restart = () => {
    setPopped(0);
    const t = newTarget();
    setBalloons(reduceMotion ? staticSet(t.character) : []);
  };

  return (
    <PageShell back="/games/" title={gameTitle("balloons")}>
      {done ? (
        <GameEnd correct={GOAL * 2} onAgain={restart} />
      ) : (
        <div className="flex flex-1 flex-col gap-3">
          <div className="flex items-center gap-3">
            {target && <Mascot compact message={phrases.popBalloon(target.character)} className="flex-1" />}
            {target && (
              <span className="card-soft flex size-20 items-center justify-center rounded-3xl bg-white text-6xl font-black shadow-md">
                {target.character}
              </span>
            )}
            {target && <SoundButton size="lg" onPlay={() => void speakPhrase(phrases.popBalloon(target.spokenName))} />}
          </div>
          <Progress current={popped} total={GOAL} />
          <div className="card-soft relative min-h-[60dvh] flex-1 overflow-hidden rounded-[2rem] bg-gradient-to-b from-sky-200 to-sky-50">
            <span className="absolute left-[8%] top-[12%] text-6xl opacity-80" aria-hidden>
              ☁️
            </span>
            <span className="absolute right-[12%] top-[30%] text-5xl opacity-70" aria-hidden>
              ☁️
            </span>
            {balloons.map((b) => (
              <button
                key={b.id}
                type="button"
                aria-label={b.char}
                onClick={() => tap(b)}
                onAnimationEnd={(e) => {
                  if (e.animationName === "balloon-rise") setBalloons((list) => list.filter((x) => x.id !== b.id));
                }}
                className={cn("absolute flex flex-col items-center", reduceMotion ? "top-1/3" : "-bottom-40")}
                style={{
                  left: `${b.left}%`,
                  animation: reduceMotion ? undefined : `balloon-rise ${b.duration}s linear forwards`,
                }}
              >
                <span
                  className={cn(
                    "flex h-28 w-24 items-center justify-center rounded-[50%] text-5xl font-black text-white shadow-lg [text-shadow:0_2px_0_rgb(0_0_0/0.2)] sm:h-32 sm:w-28",
                    b.wrong && "animate-wiggle opacity-50",
                  )}
                  style={{ background: b.color, animation: reduceMotion ? undefined : "sway 2.4s ease-in-out infinite" }}
                >
                  {b.char}
                </span>
                <span className="h-12 w-px bg-slate-400" aria-hidden />
              </button>
            ))}
          </div>
        </div>
      )}
      <RewardAnimation celebration={celebration} onCloseReward={closeReward} />
    </PageShell>
  );
}

export default function Page() {
  return (
    <FeatureGate id="balloons">
      <BalloonsGame />
    </FeatureGate>
  );
}
