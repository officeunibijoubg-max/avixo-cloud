"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import type { CharacterLesson } from "@/lib/types";
import { WORD_ITEMS, type WordItem } from "@/data/wordsIsland";
import { getLessonByChar } from "@/data/lessons";
import { POINTS } from "@/config/points";
import { phrases, ui } from "@/content/phrases";
import { useGameStore } from "@/store/gameStore";
import { isCharacterUnlocked } from "@/services/adventure";
import { playSound } from "@/services/sounds";
import { cancelSpeech, speakPhrase } from "@/services/speech";
import { cn } from "@/lib/cn";
import { PageShell } from "@/components/ui/PageShell";
import { BigButton } from "@/components/ui/BigButton";
import { Mascot, type MascotMood } from "@/components/game/Mascot";
import { SoundButton } from "@/components/game/SoundButton";
import { WritingCanvas } from "@/components/game/WritingCanvas";
import { RewardAnimation } from "@/components/game/RewardAnimation";
import { useWritingExercise } from "@/components/game/useWritingExercise";
import { useCelebration } from "@/components/game/useCelebration";
import { Illustration } from "@/components/illustrations/Illustration";

const BACK = "/learn/words/";

/**
 * Сричка или дума от Острова на думите: детето я пише буква по буква,
 * с шаблон и звездичка за всяка буква. Накрая празнуваме цялата дума.
 */
export function WordScreen({
  word,
  back = BACK,
  nextHref,
  task,
}: {
  word: WordItem;
  back?: string;
  /** Накъде води „Напред“ накрая; по подразбиране — следващата дума от Острова. */
  nextHref?: string;
  /** Текстът в балончето на Лъвчо докато пише. */
  task?: string;
}) {
  const router = useRouter();
  const letters = word.text.split("").map((c) => getLessonByChar(c)).filter((l): l is CharacterLesson => !!l);
  const [index, setIndex] = useState(0);
  const [done, setDone] = useState(false);
  const recordWriting = useGameStore((s) => s.recordWriting);
  const locked = useGameStore((s) => s.hydrated && !isCharacterUnlocked(s.progress, word.text, s.settings.unlockAll));
  const { celebration, celebrate, closeReward } = useCelebration();
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const next = WORD_ITEMS[(WORD_ITEMS.findIndex((w) => w.id === word.id) + 1) % WORD_ITEMS.length];
  const nextLink = nextHref ?? `/word/${next.id}/`;

  const intro = phrases.wordIntro(word.spoken, word.kind === "syllable");
  useEffect(() => {
    void speakPhrase(intro);
    return () => {
      cancelSpeech();
      if (timer.current) clearTimeout(timer.current);
    };
  }, [intro]);

  const onLetterSolved = useCallback(() => {
    timer.current = setTimeout(() => {
      if (index + 1 < letters.length) {
        setIndex(index + 1);
        void speakPhrase(phrases.wordNextLetter(letters[index + 1].spokenName));
        return;
      }
      // Цялата дума е написана.
      setDone(true);
      playSound("reward");
      celebrate(recordWriting(word.text, 100, true, POINTS.wordComplete));
      void speakPhrase(phrases.wordDone(word.spoken));
    }, 1100);
  }, [index, letters, celebrate, recordWriting, word]);

  const restart = () => {
    setDone(false);
    setIndex(0);
    void speakPhrase(intro);
  };

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
          <div className="card-soft flex items-center gap-4 rounded-[2rem] bg-white/80 p-4 shadow-md lg:flex-col lg:p-6">
            {word.image ? <Illustration name={word.image} size={120} /> : <span className="text-7xl">🗣️</span>}
            {/* Думата с плочки за всяка буква: написаните са зелени, текущата подскача. */}
            <div className="flex flex-1 justify-center gap-2">
              {letters.map((l, i) => (
                <span
                  key={i}
                  className={cn(
                    "flex h-16 w-12 items-center justify-center rounded-2xl text-4xl font-black sm:h-20 sm:w-14 sm:text-5xl",
                    done || i < index ? "bg-leaf text-white" : i === index ? "animate-bob bg-violet-200 text-violet-700" : "bg-slate-100 text-slate-400",
                  )}
                >
                  {l.character}
                </span>
              ))}
            </div>
            <SoundButton size="lg" onPlay={() => void speakPhrase(word.spoken)} />
          </div>
        </aside>

        <section className="flex flex-1 flex-col items-center gap-4">
          {done ? (
            <div className="flex flex-1 flex-col items-center justify-center gap-6 text-center">
              <span className="animate-pop text-7xl font-black tracking-widest text-grape sm:text-8xl">{word.text}</span>
              <Mascot message={phrases.wordDone(word.text)} mood="dance" />
              <div className="flex w-full max-w-md gap-3">
                <BigButton icon="🔁" label={ui.again} onClick={restart} color="bg-sky-100" />
                <BigButton
                  icon="➡️"
                  label={ui.next}
                  color="bg-leaf text-white"
                  pulse
                  className="flex-1"
                  onClick={() => router.push(nextLink)}
                />
              </div>
            </div>
          ) : (
            letters[index] && (
              <LetterStep
                key={`${index}-${letters[index].id}`}
                lesson={letters[index]}
                task={task ?? phrases.wordTask(word.text)}
                onSolved={onLetterSolved}
              />
            )
          )}
        </section>
      </div>
      <RewardAnimation celebration={celebration} onCloseReward={closeReward} />
    </PageShell>
  );
}

/** Една буква от думата — с шаблон и звездичка, без отделно празнуване. */
function LetterStep({ lesson, task, onSolved }: { lesson: CharacterLesson; task: string; onSolved: () => void }) {
  const ex = useWritingExercise(lesson, { introHint: true, quietSuccess: true, onSolved });
  const mood: MascotMood = ex.solved ? "clap" : ex.mood;
  return (
    <>
      <Mascot compact message={ex.label ?? task} mood={mood} className="self-start" />
      <div className="w-full max-w-[min(100%,58dvh)] lg:max-w-[min(100%,72dvh)]">
        <WritingCanvas
          ref={ex.canvasRef}
          character={lesson.character}
          templates={lesson.templates}
          difficulty="easy"
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
      {!ex.solved && (
        <div className="flex gap-3">
          <BigButton icon="🧽" label={ui.clear} onClick={ex.clear} color="bg-amber-100" disabled={ex.locked} />
          <BigButton icon="⭐" ariaLabel={ui.showMe} onClick={() => ex.showHint("star")} color="bg-violet-100" disabled={ex.locked} />
        </div>
      )}
    </>
  );
}
