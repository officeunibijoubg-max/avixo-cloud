"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import type { CharacterLesson, WritingResult } from "@/lib/types";
import { getLessonByChar } from "@/data/lessons";
import { getWordByText } from "@/data/wordsIsland";
import { phrases, ui } from "@/content/phrases";
import { useGameStore } from "@/store/gameStore";
import { pickTestItems, TEST_TRIES, type TestItem } from "@/services/chapterTest";
import { playSound } from "@/services/sounds";
import { speakPhrase, writeTaskText } from "@/services/speech";
import { cn } from "@/lib/cn";
import { PageShell } from "@/components/ui/PageShell";
import { BigButton } from "@/components/ui/BigButton";
import { Mascot, type MascotMood } from "@/components/game/Mascot";
import { WritingCanvas, type WritingCanvasHandle, type WritingFeedback } from "@/components/game/WritingCanvas";
import { useWritingExercise } from "@/components/game/useWritingExercise";
import { Illustration } from "@/components/illustrations/Illustration";
import { useContinue } from "./StepNav";

/**
 * Проверка в края на глава: детето пише без шаблон няколко букви и думи от главата.
 * Всяко нещо има TEST_TRIES опита; каквото не стане — упражнява се (с шаблон, после без),
 * и чак тогава пътят продължава. Така в следващата глава не се влиза с „дупки“.
 */
export function ChapterTest({ chapter }: { chapter: number }) {
  const countGame = useGameStore((s) => s.countGame);
  const cont = useContinue();
  // Задачите се избират веднъж при влизане.
  const [items] = useState<TestItem[]>(() => pickTestItems(useGameStore.getState().progress, chapter));
  const [phase, setPhase] = useState<"intro" | "test" | "results" | "practice" | "done">("intro");
  const [index, setIndex] = useState(0);
  const [results, setResults] = useState<boolean[]>([]);
  const failed = items.filter((_, i) => results[i] === false);
  // За упражнение: неуспешните символи + буквите от неуспешните думи (без повторения).
  const [practice, setPractice] = useState<string[]>([]);
  const [pIndex, setPIndex] = useState(0);
  const startPractice = () => {
    setPractice([...new Set(failed.flatMap((it) => (it.kind === "char" ? [it.char] : it.text.split(""))))]);
    setPhase("practice");
  };

  const finish = useCallback(
    (text: string) => {
      countGame(`test-chapter-${chapter}`);
      setPhase("done");
      playSound("levelUp");
      void speakPhrase(text);
    },
    [countGame, chapter],
  );

  useEffect(() => {
    if (phase === "intro") void speakPhrase(phrases.testIntro);
    if (phase === "results") void speakPhrase(failed.length ? phrases.testPractice : phrases.testPassed);
  }, [phase, failed.length]);

  const onItemDone = (passed: boolean) => {
    const next = [...results, passed];
    setResults(next);
    if (index + 1 < items.length) setIndex(index + 1);
    else setPhase("results");
  };

  return (
    <PageShell back="/" title={phrases.stepTest(chapter)}>
      <Dots items={items} results={results} current={phase === "test" ? index : -1} />
      <div className="mt-4 flex flex-1 flex-col">
        {phase === "intro" && (
          <div className="flex flex-1 flex-col items-center justify-center gap-6 text-center">
            <span className="animate-pop text-9xl">📝</span>
            <Mascot message={phrases.testIntro} mood="encourage" />
            <BigButton icon="▶️" label="Започваме" onClick={() => setPhase("test")} color="bg-leaf text-white" size="lg" pulse className="w-full max-w-md" />
          </div>
        )}
        {phase === "test" && items[index] && (
          items[index].kind === "char" ? (
            <TestChar key={`c${index}`} char={items[index].char} onDone={onItemDone} />
          ) : (
            <TestWord key={`w${index}`} text={items[index].text} onDone={onItemDone} />
          )
        )}
        {phase === "results" && (
          <div className="flex flex-1 flex-col items-center justify-center gap-6 text-center">
            <Mascot message={failed.length ? phrases.testPractice : phrases.testPassed} mood={failed.length ? "encourage" : "dance"} />
            <div className="flex flex-wrap justify-center gap-3">
              {items.map((it, i) => (
                <span
                  key={i}
                  className={cn(
                    "flex min-w-16 items-center justify-center gap-1 rounded-2xl px-3 py-2 text-3xl font-black",
                    results[i] ? "bg-lime-200" : "bg-amber-200",
                  )}
                >
                  {it.kind === "char" ? it.char : it.text} {results[i] ? "✓" : "✏️"}
                </span>
              ))}
            </div>
            {failed.length ? (
              <BigButton icon="✏️" label="Упражни" onClick={startPractice} color="bg-leaf text-white" size="lg" pulse className="w-full max-w-md" />
            ) : (
              <BigButton icon="➡️" label={phrases.continuePath} onClick={() => finish(phrases.testPassed)} color="bg-leaf text-white" size="lg" pulse className="w-full max-w-md" />
            )}
          </div>
        )}
        {phase === "practice" && practice[pIndex] && (
          <PracticeChar
            key={practice[pIndex]}
            char={practice[pIndex]}
            onDone={() => (pIndex + 1 < practice.length ? setPIndex(pIndex + 1) : finish(phrases.testPracticeDone))}
          />
        )}
        {phase === "done" && (
          <div className="flex flex-1 flex-col items-center justify-center gap-6 text-center">
            <span className="animate-pop text-9xl">🏆</span>
            <Mascot message={failed.length ? phrases.testPracticeDone : phrases.testPassed} mood="dance" />
            <BigButton icon="➡️" label={phrases.continuePath} onClick={cont} color="bg-leaf text-white" size="lg" pulse className="w-full max-w-md" />
          </div>
        )}
      </div>
    </PageShell>
  );
}

/** Точки за напредъка: зелено — стана, жълто — за упражнение, свети — текущото. */
function Dots({ items, results, current }: { items: TestItem[]; results: boolean[]; current: number }) {
  return (
    <div className="flex justify-center gap-2" aria-label={`${results.length}/${items.length}`}>
      {items.map((_, i) => (
        <span
          key={i}
          className={cn(
            "size-5 rounded-full",
            results[i] === true ? "bg-leaf" : results[i] === false ? "bg-amber-400" : i === current ? "animate-pulse-soft bg-white ring-4 ring-grape" : "bg-white",
          )}
        />
      ))}
    </div>
  );
}

/**
 * Едно писане без шаблон и без подсказки, с TEST_TRIES опита.
 * Вика onDone(true/false); говори `prompt` при показване.
 */
function BlindWrite({
  lesson,
  prompt,
  shown,
  onDone,
  visual,
}: {
  lesson: CharacterLesson;
  prompt: string;
  shown: string;
  onDone: (passed: boolean) => void;
  visual?: React.ReactNode;
}) {
  const canvasRef = useRef<WritingCanvasHandle>(null);
  const recordWriting = useGameStore((s) => s.recordWriting);
  const [attempt, setAttempt] = useState(1);
  const [feedback, setFeedback] = useState<WritingFeedback>(null);
  const [mood, setMood] = useState<MascotMood>("point");
  const [label, setLabel] = useState<string | null>(null);
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    void speakPhrase(prompt);
    return () => void (timer.current && clearTimeout(timer.current));
  }, [prompt]);

  const handle = (r: WritingResult) => {
    recordWriting(lesson.character, r.score, r.isCorrect, r.isCorrect ? 5 : 0);
    if (r.isCorrect) {
      setFeedback("correct");
      setMood("clap");
      playSound("correct");
      void speakPhrase(phrases.praise());
      timer.current = setTimeout(() => onDone(true), 1300);
      return;
    }
    setFeedback("wrong");
    playSound("wrong");
    if (attempt >= TEST_TRIES) {
      setMood("encourage");
      setLabel(phrases.testItemFailed);
      void speakPhrase(phrases.testItemFailed);
      timer.current = setTimeout(() => onDone(false), 2200);
      return;
    }
    setMood("encourage");
    setLabel(phrases.almost);
    void speakPhrase(phrases.almost);
    timer.current = setTimeout(() => {
      canvasRef.current?.clear();
      setFeedback(null);
      setLabel(null);
      setMood("point");
      setAttempt((a) => a + 1);
    }, 1800);
  };

  return (
    <div className="flex flex-1 flex-col items-center gap-4 short:flex-row short:items-start short:justify-center">
      <div className="flex w-full flex-col items-center gap-3 short:w-56">
        <Mascot compact message={label ?? shown} mood={mood} className="self-start" />
        {visual}
      </div>
      <div className="canvas-box">
        <WritingCanvas
          ref={canvasRef}
          character={lesson.character}
          templates={lesson.templates}
          difficulty="normal"
          showGuide={false}
          autoCheck
          attempt={attempt}
          feedback={feedback}
          locked={feedback !== null}
          onComplete={handle}
        />
      </div>
      {feedback === null && <BigButton icon="🧽" label={ui.clear} onClick={() => canvasRef.current?.clear()} color="bg-amber-100" />}
    </div>
  );
}

function TestChar({ char, onDone }: { char: string; onDone: (passed: boolean) => void }) {
  const lesson = getLessonByChar(char);
  if (!lesson) return null;
  return (
    <BlindWrite
      lesson={lesson}
      prompt={writeTaskText(lesson, false)}
      shown={writeTaskText({ ...lesson, spokenName: lesson.type === "number" ? lesson.spokenName : lesson.character }, false)}
      onDone={onDone}
    />
  );
}

/** Думата се пише буква по буква без шаблон; не стане ли една буква — думата е за упражнение. */
function TestWord({ text, onDone }: { text: string; onDone: (passed: boolean) => void }) {
  const word = getWordByText(text);
  const letters = text.split("").map((c) => getLessonByChar(c)).filter((l): l is CharacterLesson => !!l);
  const [i, setI] = useState(0);
  const [ok, setOk] = useState(true);
  if (!word || !letters[i]) return null;
  const prompt = i === 0 ? phrases.wordIntro(word.spoken, word.kind === "syllable") : phrases.wordNextLetter(letters[i].spokenName);
  const visual = (
    <div className="card-soft flex items-center gap-3 rounded-[2rem] bg-white/80 p-3 shadow-md">
      {word.image && <Illustration name={word.image} size={72} />}
      <div className="flex gap-1.5">
        {letters.map((l, k) => (
          <span
            key={k}
            className={cn(
              "flex h-12 w-10 items-center justify-center rounded-xl text-3xl font-black",
              k < i ? "bg-leaf text-white" : k === i ? "animate-bob bg-violet-200 text-violet-700" : "bg-slate-100 text-slate-300",
            )}
          >
            {k < i ? l.character : "?"}
          </span>
        ))}
      </div>
    </div>
  );
  return (
    <BlindWrite
      key={i}
      lesson={letters[i]}
      prompt={prompt}
      shown={phrases.wordTask(text)}
      visual={visual}
      onDone={(passed) => {
        const all = ok && passed;
        setOk(all);
        if (i + 1 < letters.length) setI(i + 1);
        else onDone(all);
      }}
    />
  );
}

/** Упражнение на символ: първо с шаблон и звездичка, после сам — с всички подсказки. */
function PracticeChar({ char, onDone }: { char: string; onDone: () => void }) {
  const lesson = getLessonByChar(char);
  const [trace, setTrace] = useState(true);
  if (!lesson) return null;
  return <PracticeRound key={String(trace)} lesson={lesson} trace={trace} onSolved={() => (trace ? setTrace(false) : onDone())} />;
}

function PracticeRound({ lesson, trace, onSolved }: { lesson: CharacterLesson; trace: boolean; onSolved: () => void }) {
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const ex = useWritingExercise(lesson, {
    introHint: trace,
    quietSuccess: true,
    onSolved: () => {
      timer.current = setTimeout(onSolved, 1300);
    },
  });
  const text = writeTaskText(lesson, trace);
  useEffect(() => {
    void speakPhrase(text);
    return () => void (timer.current && clearTimeout(timer.current));
  }, [text]);
  return (
    <div className="flex flex-1 flex-col items-center gap-4 short:flex-row short:items-start short:justify-center">
      <Mascot compact message={ex.label ?? writeTaskText({ ...lesson, spokenName: lesson.type === "number" ? lesson.spokenName : lesson.character }, trace)} mood={ex.mood} className="self-start short:w-56" />
      <div className="canvas-box">
        <WritingCanvas
          ref={ex.canvasRef}
          character={lesson.character}
          templates={lesson.templates}
          difficulty={trace ? "easy" : "normal"}
          showGuide={trace}
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
        <div className="flex gap-3 short:flex-col">
          <BigButton icon="🧽" label={ui.clear} onClick={ex.clear} color="bg-amber-100" disabled={ex.locked} />
          <BigButton icon="⭐" ariaLabel={ui.showMe} onClick={() => ex.showHint("star")} color="bg-violet-100" disabled={ex.locked} />
        </div>
      )}
    </div>
  );
}
