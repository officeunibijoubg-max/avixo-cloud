"use client";

import { useEffect } from "react";
import type { CharacterLesson } from "@/lib/types";
import { phrases, ui } from "@/content/phrases";
import { speakPhrase } from "@/services/speech";
import { PageShell } from "@/components/ui/PageShell";
import { BigButton } from "@/components/ui/BigButton";
import { Mascot } from "@/components/game/Mascot";
import { WritingCanvas } from "@/components/game/WritingCanvas";
import { RewardAnimation } from "@/components/game/RewardAnimation";
import { useWritingExercise } from "@/components/game/useWritingExercise";
import { useContinue } from "./StepNav";

/** Стъпка „нарисувай форма“ (подготовка на ръката): с шаблон и звездичка, после „Продължи“. */
export function ShapeStep({ lesson }: { lesson: CharacterLesson }) {
  const ex = useWritingExercise(lesson, { introHint: true });
  const cont = useContinue();
  const text = phrases.shapeIntro(lesson.spokenName);
  useEffect(() => {
    void speakPhrase(text);
  }, [text]);
  return (
    <PageShell back="/">
      <div className="flex flex-1 flex-col items-center gap-4">
        <div className="flex w-full items-center gap-3">
          <Mascot compact message={ex.label ?? text} mood={ex.mood} className="flex-1" />
          <span className="text-7xl" aria-hidden>
            {lesson.exampleImage}
          </span>
        </div>
        <div className="w-full max-w-[min(100%,60dvh)]">
          <WritingCanvas
            ref={ex.canvasRef}
            character={lesson.character}
            templates={lesson.templates}
            difficulty="normal"
            showGuide
            autoCheck
            attempt={ex.attempt}
            feedback={ex.feedback}
            hint={ex.hint}
            hintKey={ex.hintKey}
            locked={ex.locked || ex.solved}
            onComplete={ex.handleResult}
          />
        </div>
        {ex.solved ? (
          <BigButton onClick={cont} icon="➡️" label={phrases.continuePath} color="bg-leaf text-white" size="lg" pulse className="w-full max-w-md" />
        ) : (
          <div className="flex gap-3">
            <BigButton icon="🧽" label={ui.clear} onClick={ex.clear} color="bg-amber-100" disabled={ex.locked} />
            <BigButton icon="⭐" ariaLabel={ui.showMe} onClick={() => ex.showHint("star")} color="bg-violet-100" disabled={ex.locked} />
          </div>
        )}
      </div>
      <RewardAnimation celebration={ex.celebration} onCloseReward={ex.closeReward} />
    </PageShell>
  );
}
