"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { phrases } from "@/content/phrases";
import { useGameStore } from "@/store/gameStore";
import { playSound } from "@/services/sounds";
import { cancelSpeech, speakPhrase } from "@/services/speech";
import { tileColor } from "@/lib/colors";
import { cn } from "@/lib/cn";
import { PageShell } from "@/components/ui/PageShell";
import { Mascot } from "@/components/game/Mascot";
import { SoundButton } from "@/components/game/SoundButton";
import { RewardAnimation } from "@/components/game/RewardAnimation";
import { useCelebration } from "@/components/game/useCelebration";
import { GameEnd } from "./GameEnd";

export type ChoiceRound = {
  /** Какво казва играта. */
  prompt: string;
  /** Какво пише в балончето на героя. */
  caption: string;
  visual?: React.ReactNode;
  options: string[];
  answer: string;
};

type Props = { title: string; makeRound: (index: number) => ChoiceRound; rounds?: number };

/** Обща механика за игрите „избери правилния отговор“ (Коя е буквата?, С коя буква започва?). */
export function ChoiceGame({ title, makeRound, rounds = 8 }: Props) {
  const recordGameAnswer = useGameStore((s) => s.recordGameAnswer);
  const countGame = useGameStore((s) => s.countGame);
  const { celebration, celebrate, closeReward } = useCelebration();
  const [index, setIndex] = useState(0);
  const [round, setRound] = useState<ChoiceRound | null>(null);
  const [wrong, setWrong] = useState<string[]>([]);
  const [solved, setSolved] = useState(false);
  const [correctCount, setCorrectCount] = useState(0);
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Рундовете са случайни — създаваме ги само в браузъра, за да няма разминаване с HTML-а.
  useEffect(() => {
    if (index >= rounds) return;
    const r = makeRound(index);
    setRound(r);
    setWrong([]);
    setSolved(false);
    void speakPhrase(r.prompt);
  }, [index, rounds, makeRound]);

  useEffect(
    () => () => {
      if (timer.current) clearTimeout(timer.current);
      cancelSpeech();
    },
    [],
  );

  const choose = (option: string) => {
    if (!round || solved) return;
    if (option === round.answer) {
      setSolved(true);
      setCorrectCount((c) => c + (wrong.length === 0 ? 1 : 0));
      playSound("correct");
      celebrate(recordGameAnswer(true));
      void speakPhrase(phrases.praise());
      timer.current = setTimeout(() => {
        if (index + 1 >= rounds) countGame();
        setIndex((i) => i + 1);
      }, 1500);
    } else if (!wrong.includes(option)) {
      setWrong((w) => [...w, option]);
      recordGameAnswer(false);
      playSound("wrong");
      void speakPhrase(phrases.wrongChoice);
    }
  };

  const restart = useCallback(() => {
    setCorrectCount(0);
    setIndex(0);
  }, []);

  return (
    <PageShell back="/games/" title={title}>
      {index >= rounds ? (
        <GameEnd correct={correctCount} onAgain={restart} />
      ) : (
        round && (
          <div className="flex flex-1 flex-col items-center gap-6">
            <div className="flex w-full items-center gap-3">
              <Mascot compact message={round.caption} mood={solved ? "clap" : wrong.length ? "encourage" : "point"} className="flex-1" />
              <SoundButton size="lg" onPlay={() => void speakPhrase(round.prompt)} />
            </div>
            <Progress current={index} total={rounds} />
            {round.visual}
            <div className={cn("grid w-full max-w-3xl gap-4", round.options.length === 3 ? "grid-cols-3" : "grid-cols-2 lg:grid-cols-4")}>
              {round.options.map((o, i) => {
                const isWrong = wrong.includes(o);
                const isRight = solved && o === round.answer;
                return (
                  <button
                    key={o}
                    type="button"
                    onClick={() => choose(o)}
                    aria-label={o}
                    className={cn(
                      "card-soft flex aspect-square items-center justify-center rounded-[2rem] text-7xl font-black shadow-[0_8px_0_rgb(0_0_0/0.12)] transition active:translate-y-1 sm:text-8xl",
                      isRight ? "scale-105 bg-leaf text-white" : isWrong ? "animate-wiggle bg-rose-200 opacity-50" : tileColor(i),
                    )}
                  >
                    {o}
                  </button>
                );
              })}
            </div>
          </div>
        )
      )}
      <RewardAnimation celebration={celebration} onCloseReward={closeReward} />
    </PageShell>
  );
}

export function Progress({ current, total }: { current: number; total: number }) {
  return (
    <div className="flex gap-2" aria-label={`${current}/${total}`}>
      {Array.from({ length: total }, (_, i) => (
        <span key={i} className={cn("size-4 rounded-full", i < current ? "bg-leaf" : i === current ? "bg-sun" : "bg-white")} />
      ))}
    </div>
  );
}
