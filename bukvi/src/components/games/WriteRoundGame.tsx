"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import type { CharacterLesson, Difficulty } from "@/lib/types";
import { MASCOTS, DEFAULT_MASCOT } from "@/config/mascot";
import { useGameStore } from "@/store/gameStore";
import { cancelSpeech, speakPhrase } from "@/services/speech";
import { cn } from "@/lib/cn";
import { ui } from "@/content/phrases";
import { PageShell } from "@/components/ui/PageShell";
import { BigButton } from "@/components/ui/BigButton";
import { Mascot } from "@/components/game/Mascot";
import { SoundButton } from "@/components/game/SoundButton";
import { WritingCanvas } from "@/components/game/WritingCanvas";
import { RewardAnimation } from "@/components/game/RewardAnimation";
import { useWritingExercise } from "@/components/game/useWritingExercise";
import { GameEnd } from "./GameEnd";

type Props = {
  title: string;
  pickLesson: (previous: CharacterLesson | null) => CharacterLesson;
  prompt: (lesson: CharacterLesson) => string;
  caption: (lesson: CharacterLesson) => string;
  visual?: (lesson: CharacterLesson) => React.ReactNode;
  difficulty: Difficulty;
  rounds?: number;
};

/**
 * Игри с писане без готова буква (Чуй и напиши, Преброй и напиши).
 * Всяко вярно изписване придвижва героя с една стъпка по пътя към наградата (Буквен път).
 */
export function WriteRoundGame({ title, pickLesson, prompt, caption, visual, difficulty, rounds = 5 }: Props) {
  const [lesson, setLesson] = useState<CharacterLesson | null>(null);
  const [step, setStep] = useState(0);
  const countGame = useGameStore((s) => s.countGame);
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const nextRound = useCallback(() => setLesson((prev) => pickLesson(prev)), [pickLesson]);

  useEffect(() => {
    nextRound();
    return () => {
      if (timer.current) clearTimeout(timer.current);
      cancelSpeech();
    };
  }, [nextRound]);

  const onSolved = useCallback(() => {
    timer.current = setTimeout(() => {
      const n = step + 1;
      setStep(n);
      if (n >= rounds) countGame();
      else nextRound();
    }, 2200);
  }, [step, rounds, countGame, nextRound]);

  const restart = () => {
    setStep(0);
    nextRound();
  };

  return (
    <PageShell back="/games/" title={title}>
      {step >= rounds ? (
        <GameEnd correct={rounds * 2} onAgain={restart} />
      ) : (
        lesson && (
          <Round
            key={`${step}-${lesson.id}`}
            lesson={lesson}
            step={step}
            rounds={rounds}
            prompt={prompt(lesson)}
            caption={caption(lesson)}
            visual={visual?.(lesson)}
            difficulty={difficulty}
            onSolved={onSolved}
          />
        )
      )}
    </PageShell>
  );
}

type RoundProps = {
  lesson: CharacterLesson;
  step: number;
  rounds: number;
  prompt: string;
  caption: string;
  visual?: React.ReactNode;
  difficulty: Difficulty;
  onSolved: () => void;
};

function Round({ lesson, step, rounds, prompt, caption, visual, difficulty, onSolved }: RoundProps) {
  const ex = useWritingExercise(lesson, { onSolved });

  useEffect(() => {
    void speakPhrase(prompt);
  }, [prompt]);

  return (
    <div className="flex flex-1 flex-col gap-4 lg:flex-row lg:items-start">
      <aside className="flex flex-col gap-4 lg:w-80">
        <div className="flex items-center gap-3">
          <Mascot compact message={ex.label ?? caption} mood={ex.mood} className="flex-1" />
          <SoundButton size="lg" onPlay={() => void speakPhrase(prompt)} />
        </div>
        <LetterPath step={step + (ex.solved ? 1 : 0)} total={rounds} />
        {visual}
      </aside>
      <section className="flex flex-1 flex-col items-center gap-4">
        <div className="w-full max-w-[min(100%,62dvh)] lg:max-w-[min(100%,76dvh)]">
          <WritingCanvas
            ref={ex.canvasRef}
            character={lesson.character}
            templates={lesson.templates}
            difficulty={difficulty}
            showGuide={false}
            autoCheck={difficulty !== "hard"}
            attempt={ex.attempt}
            feedback={ex.feedback}
            hint={ex.hint}
            hintKey={ex.hintKey}
            locked={ex.locked || ex.solved}
            onComplete={ex.handleResult}
          />
        </div>
        {!ex.solved && (
          <div className="flex w-full max-w-[min(100%,76dvh)] gap-3">
            <BigButton icon="🧽" label={ui.clear} onClick={ex.clear} color="bg-amber-100" disabled={ex.locked} />
            {difficulty === "hard" && (
              <BigButton icon="✅" label={ui.check} onClick={ex.check} color="bg-leaf text-white" className="flex-1" disabled={ex.locked} />
            )}
          </div>
        )}
      </section>
      <RewardAnimation celebration={ex.celebration} onCloseReward={ex.closeReward} />
    </div>
  );
}

/** Игра 7 — „Буквен път“: героят крачи към наградата с всяко вярно изписване. */
function LetterPath({ step, total }: { step: number; total: number }) {
  const key = useGameStore((s) => s.settings.mascot);
  const hero = (MASCOTS[key] ?? MASCOTS[DEFAULT_MASCOT]).emoji;
  return (
    <div className="card-soft flex items-center justify-between gap-1 rounded-3xl bg-white/80 p-3 shadow-sm" aria-label={`${step}/${total}`}>
      {Array.from({ length: total + 1 }, (_, i) => (
        <div
          key={i}
          className={cn(
            "flex size-11 items-center justify-center rounded-full text-2xl transition-all",
            i < step ? "bg-leaf/30" : "bg-slate-100",
            i === total && "bg-amber-100",
          )}
        >
          {i === step ? <span className="animate-bob">{hero}</span> : i === total ? "🎁" : i < step ? "⭐" : ""}
        </div>
      ))}
    </div>
  );
}
