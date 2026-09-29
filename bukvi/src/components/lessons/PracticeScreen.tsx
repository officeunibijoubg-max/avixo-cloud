"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import type { CharacterLesson } from "@/lib/types";
import { nextLesson } from "@/data/lessons";
import { phrases, ui } from "@/content/phrases";
import { isCharacterUnlocked } from "@/services/adventure";
import { useGameStore } from "@/store/gameStore";
import { cancelSpeech, speakCharacter, speakWriteTask, writeTaskText } from "@/services/speech";
import { PageShell } from "@/components/ui/PageShell";
import { BigButton } from "@/components/ui/BigButton";
import { WritingCanvas } from "@/components/game/WritingCanvas";
import { Mascot } from "@/components/game/Mascot";
import { RewardAnimation } from "@/components/game/RewardAnimation";
import { useWritingExercise } from "@/components/game/useWritingExercise";
import { LetterLesson } from "./LetterLesson";
import { NumberLesson } from "./NumberLesson";

/** Екранът за упражнение на една буква или цифра. */
export function PracticeScreen({ lesson }: { lesson: CharacterLesson }) {
  const router = useRouter();
  const difficulty = useGameStore((s) => s.settings.difficulty);
  const showGuide = useGameStore((s) => s.settings.showGuide);
  // С шаблон детето проследява; в трудния режим пише само и потвърждава с „Готово“.
  const trace = showGuide && difficulty !== "hard";
  const manualCheck = difficulty === "hard";
  const ex = useWritingExercise(lesson, { introHint: trace && difficulty === "easy" });
  const next = nextLesson(lesson);
  const back = lesson.lowercase ? "/learn/small/" : lesson.type === "letter" ? "/learn/letters/" : "/learn/numbers/";
  const locked = useGameStore((s) => s.hydrated && !isCharacterUnlocked(s.progress, lesson.character, s.settings.unlockAll));

  // Представяме символа и задачата. (Без докосване някои браузъри мълчат — 🔊 е винаги наблизо.)
  useEffect(() => {
    void speakCharacter(lesson).then(() => speakWriteTask(lesson, trace));
    return () => cancelSpeech();
  }, [lesson, trace]);

  const task = writeTaskText({ ...lesson, spokenName: lesson.type === "letter" ? lesson.character : lesson.spokenName }, trace);

  if (locked)
    return (
      <PageShell back={back}>
        <div className="flex flex-1 flex-col items-center justify-center gap-6 text-center">
          <span className="text-9xl">🔒</span>
          <Mascot message={phrases.lockedNode} mood="think" />
          <BigButton href={back} icon="🗺️" label="Към картата" color="bg-sky-200" size="lg" />
        </div>
      </PageShell>
    );

  return (
    <PageShell back={back}>
      <div className="flex flex-1 flex-col gap-4 lg:flex-row lg:items-start lg:gap-6">
        <aside className="flex flex-col gap-4 lg:w-80 lg:shrink-0">
          {lesson.type === "letter" ? <LetterLesson lesson={lesson} /> : <NumberLesson lesson={lesson} />}
          <Mascot compact message={ex.label ?? task} mood={ex.mood} className="hidden lg:flex" />
        </aside>

        <section className="flex flex-1 flex-col items-center gap-4">
          <Mascot compact message={ex.label ?? task} mood={ex.mood} className="self-start lg:hidden" />
          <div className="w-full max-w-[min(100%,62dvh)] lg:max-w-[min(100%,78dvh)]">
            <WritingCanvas
              ref={ex.canvasRef}
              character={lesson.character}
              templates={lesson.templates}
              difficulty={difficulty}
              showGuide={showGuide}
              autoCheck={!manualCheck}
              attempt={ex.attempt}
              feedback={ex.feedback}
              hint={ex.hint}
              hintKey={ex.hintKey}
              locked={ex.locked}
              onComplete={ex.handleResult}
            />
          </div>

          <div className="flex w-full max-w-[min(100%,78dvh)] flex-wrap justify-center gap-3">
            {ex.solved ? (
              <>
                <BigButton icon="🔁" label={ui.again} onClick={ex.reset} color="bg-sky-100" />
                <BigButton
                  icon="➡️"
                  label={ui.next}
                  color="bg-leaf text-white"
                  pulse
                  className="flex-1"
                  onClick={() => router.push(`/practice/${next.id}/`)}
                />
              </>
            ) : (
              <>
                <BigButton icon="🧽" label={ui.clear} onClick={ex.clear} color="bg-amber-100" disabled={ex.locked} />
                <BigButton icon="⭐" ariaLabel={ui.showMe} onClick={() => ex.showHint("star")} color="bg-violet-100" disabled={ex.locked} />
                {manualCheck && (
                  <BigButton icon="✅" label={ui.check} onClick={ex.check} color="bg-leaf text-white" className="flex-1" disabled={ex.locked} />
                )}
              </>
            )}
          </div>
        </section>
      </div>
      <RewardAnimation celebration={ex.celebration} onCloseReward={ex.closeReward} />
    </PageShell>
  );
}
