"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import type { CharacterLesson } from "@/lib/types";
import { getLessonByChar, letterLessons } from "@/data/lessons";
import { ALPHABET } from "@/data/alphabet";
import { similarOptions } from "@/data/similar";
import { phrases, ui } from "@/content/phrases";
import { useGameStore } from "@/store/gameStore";
import { pickAdventureLetter, reviewDue } from "@/services/adventure";
import { todayKey } from "@/services/progress";
import { playSound } from "@/services/sounds";
import { cancelSpeech, speakCharacter, speakPhrase, writeTaskText } from "@/services/speech";
import { shuffle } from "@/lib/random";
import { cn } from "@/lib/cn";
import { PageShell } from "@/components/ui/PageShell";
import { BigButton } from "@/components/ui/BigButton";
import { Mascot } from "@/components/game/Mascot";
import { SoundButton } from "@/components/game/SoundButton";
import { WritingCanvas } from "@/components/game/WritingCanvas";
import { RewardAnimation } from "@/components/game/RewardAnimation";
import { useWritingExercise } from "@/components/game/useWritingExercise";
import { useCelebration } from "@/components/game/useCelebration";
import { Illustration } from "@/components/illustrations/Illustration";

// Днешно приключение — кратка мисия с една буква, в този ред:
// („review“ — повторение на стара буква, само ако на някоя ѝ е дошло времето.)
const STEPS = ["intro", "listen", "meet", "trace", "write", "find", "picture", "review", "reward"] as const;
type Step = (typeof STEPS)[number];
const STEP_ICONS: Record<Step, string> = {
  intro: "👋",
  listen: "👂",
  meet: "🖼️",
  trace: "✏️",
  write: "✍️",
  find: "🔍",
  picture: "🎯",
  review: "🔁",
  reward: "🎁",
};

export default function AdventurePage() {
  const progress = useGameStore((s) => s.progress);
  const hydrated = useGameStore((s) => s.hydrated);
  const [letter, setLetter] = useState<string | null>(null);
  const [review, setReview] = useState<string | null>(null);
  const [step, setStep] = useState<Step>("intro");

  // Буквата (и тази за повторение) се избират веднъж, след като прогресът е зареден.
  useEffect(() => {
    if (!hydrated || letter) return;
    const l = pickAdventureLetter(progress);
    setLetter(l);
    setReview(reviewDue(progress, todayKey(), l));
  }, [hydrated, letter, progress]);

  useEffect(() => () => cancelSpeech(), []);

  const lesson = letter ? getLessonByChar(letter) : undefined;
  const reviewLesson = review ? getLessonByChar(review) : undefined;
  const steps = useMemo(() => STEPS.filter((s) => s !== "review" || reviewLesson), [reviewLesson]);
  const next = useCallback(() => setStep((s) => steps[Math.min(steps.length - 1, steps.indexOf(s) + 1)]), [steps]);
  const doneToday = progress.adventuresDone.includes(todayKey());

  return (
    <PageShell back="/" title="Днешно приключение">
      {lesson && (
        <>
          <StepTrail step={step} steps={steps} />
          <div className="mt-4 flex flex-1 flex-col">
            {step === "intro" && <Intro lesson={lesson} doneToday={doneToday} onNext={next} />}
            {step === "listen" && <Listen lesson={lesson} onNext={next} />}
            {step === "meet" && <Meet lesson={lesson} onNext={next} />}
            {step === "trace" && <WriteStep key="trace" lesson={lesson} trace onNext={next} />}
            {step === "write" && <WriteStep key="write" lesson={lesson} trace={false} onNext={next} />}
            {step === "find" && <Find lesson={lesson} onNext={next} />}
            {step === "picture" && <Picture lesson={lesson} onNext={next} />}
            {step === "review" && reviewLesson && <WriteStep key="review" lesson={reviewLesson} trace={false} review onNext={next} />}
            {step === "reward" && <Reward />}
          </div>
        </>
      )}
    </PageShell>
  );
}

/** Пътечка от стъпките: минатите са зелени, текущата подскача. */
function StepTrail({ step, steps }: { step: Step; steps: readonly Step[] }) {
  const at = steps.indexOf(step);
  return (
    <div className="card-soft flex items-center justify-between gap-1 rounded-3xl bg-white/80 p-2 shadow-sm" aria-label={`${at + 1}/${steps.length}`}>
      {steps.map((s, i) => (
        <span
          key={s}
          className={cn(
            "flex size-10 items-center justify-center rounded-full text-xl sm:size-12 sm:text-2xl",
            i < at ? "bg-leaf/30" : i === at ? "animate-bob bg-sun" : "bg-slate-100 opacity-60",
          )}
        >
          {i < at ? "✓" : STEP_ICONS[s]}
        </span>
      ))}
    </div>
  );
}

function Intro({ lesson, doneToday, onNext }: { lesson: CharacterLesson; doneToday: boolean; onNext: () => void }) {
  const text = phrases.adventureToday(lesson.spokenName);
  useEffect(() => {
    void speakPhrase(text);
  }, [text]);
  return (
    <div className="flex flex-1 flex-col items-center justify-center gap-6 text-center">
      <Mascot message={phrases.adventureToday(lesson.character)} mood="wave" />
      {doneToday && <p className="rounded-2xl bg-white/80 px-4 py-2 font-bold">{phrases.adventureAgain}</p>}
      <span className="animate-pop text-[10rem] font-black leading-none text-grape">{lesson.character}</span>
      <BigButton icon="▶️" label="Започваме" onClick={onNext} color="bg-leaf text-white" size="lg" pulse className="w-full max-w-md" />
    </div>
  );
}

function Listen({ lesson, onNext }: { lesson: CharacterLesson; onNext: () => void }) {
  const [heard, setHeard] = useState(false);
  const listen = () => {
    void speakPhrase(lesson.spokenName);
    setHeard(true);
  };
  useEffect(() => {
    void speakPhrase(phrases.adventureListen);
  }, []);
  return (
    <div className="flex flex-1 flex-col items-center justify-center gap-6 text-center">
      <Mascot message={phrases.adventureListen} />
      <span className="text-[9rem] font-black leading-none text-grape">{lesson.character}</span>
      <SoundButton size="lg" onPlay={listen} className="size-32 text-6xl" />
      <BigButton icon="➡️" label={ui.next} onClick={onNext} color="bg-leaf text-white" disabled={!heard} pulse={heard} className="w-full max-w-md" />
    </div>
  );
}

function Meet({ lesson, onNext }: { lesson: CharacterLesson; onNext: () => void }) {
  useEffect(() => {
    void speakCharacter(lesson);
  }, [lesson]);
  const word = lesson.exampleWord ?? lesson.inWord ?? "";
  return (
    <div className="flex flex-1 flex-col items-center justify-center gap-4 text-center">
      <div className="card-soft flex flex-col items-center gap-2 rounded-[2rem] bg-white px-10 py-6 shadow-md">
        <Illustration name={lesson.exampleImage} size={170} />
        <span className="text-4xl font-black">
          {word.split("").map((ch, i) => (
            <span key={i} className={ch.toUpperCase() === lesson.character ? "text-grape underline decoration-4 underline-offset-4" : undefined}>
              {i === 0 && lesson.exampleWord ? ch.toUpperCase() : ch}
            </span>
          ))}
        </span>
      </div>
      <SoundButton size="lg" onPlay={() => void speakCharacter(lesson)} />
      <BigButton icon="➡️" label={ui.next} onClick={onNext} color="bg-leaf text-white" pulse className="w-full max-w-md" />
    </div>
  );
}

/** Проследяване (с шаблон и звездичка) или писане без помощ. */
function WriteStep({ lesson, trace, review = false, onNext }: { lesson: CharacterLesson; trace: boolean; review?: boolean; onNext: () => void }) {
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const ex = useWritingExercise(lesson, {
    introHint: trace,
    onSolved: () => {
      timer.current = setTimeout(onNext, 2200);
    },
  });
  const alone = review ? phrases.reviewWrite : phrases.adventureWriteAlone;
  const text = trace ? writeTaskText(lesson, true) : alone(lesson.spokenName);
  const shown = trace ? writeTaskText({ ...lesson, spokenName: lesson.character }, true) : alone(lesson.character);
  useEffect(() => {
    void speakPhrase(text);
    return () => void (timer.current && clearTimeout(timer.current));
  }, [text]);
  return (
    <div className="flex flex-1 flex-col items-center gap-4">
      <Mascot compact message={ex.label ?? shown} mood={ex.mood} className="self-start" />
      <div className="w-full max-w-[min(100%,60dvh)]">
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
        <div className="flex gap-3">
          <BigButton icon="🧽" label={ui.clear} onClick={ex.clear} color="bg-amber-100" disabled={ex.locked} />
          <BigButton icon="⭐" ariaLabel={ui.showMe} onClick={() => ex.showHint("star")} color="bg-violet-100" disabled={ex.locked} />
        </div>
      )}
      <RewardAnimation celebration={ex.celebration} onCloseReward={ex.closeReward} />
    </div>
  );
}

/** Избор между няколко големи бутона; грешният леко се поклаща и избледнява. */
function ChoiceStep({
  prompt,
  shownPrompt,
  options,
  answer,
  render,
  onNext,
}: {
  prompt: string;
  shownPrompt: string;
  options: string[];
  answer: string;
  render: (o: string) => React.ReactNode;
  onNext: () => void;
}) {
  const recordGameAnswer = useGameStore((s) => s.recordGameAnswer);
  const { celebration, celebrate, closeReward } = useCelebration();
  const [wrong, setWrong] = useState<string[]>([]);
  const [solved, setSolved] = useState(false);
  useEffect(() => {
    void speakPhrase(prompt);
  }, [prompt]);
  const choose = (o: string) => {
    if (solved) return;
    if (o === answer) {
      setSolved(true);
      playSound("correct");
      celebrate(recordGameAnswer(true));
      void speakPhrase(phrases.praise());
      setTimeout(onNext, 1600);
    } else if (!wrong.includes(o)) {
      setWrong((w) => [...w, o]);
      playSound("wrong");
      void speakPhrase(phrases.wrongChoice);
    }
  };
  return (
    <div className="flex flex-1 flex-col items-center gap-6">
      <div className="flex w-full items-center gap-3">
        <Mascot compact message={shownPrompt} mood={solved ? "clap" : wrong.length ? "encourage" : "point"} className="flex-1" />
        <SoundButton size="lg" onPlay={() => void speakPhrase(prompt)} />
      </div>
      <div className="grid w-full max-w-3xl grid-cols-3 gap-4">
        {options.map((o) => (
          <button
            key={o}
            type="button"
            onClick={() => choose(o)}
            className={cn(
              "card-soft flex aspect-square items-center justify-center rounded-[2rem] bg-white text-7xl font-black shadow-[0_8px_0_rgb(0_0_0/0.12)] transition active:translate-y-1 sm:text-8xl",
              solved && o === answer && "scale-105 bg-leaf text-white",
              wrong.includes(o) && "animate-wiggle bg-rose-100 opacity-50",
            )}
          >
            {render(o)}
          </button>
        ))}
      </div>
      <RewardAnimation celebration={celebration} onCloseReward={closeReward} />
    </div>
  );
}

function Find({ lesson, onNext }: { lesson: CharacterLesson; onNext: () => void }) {
  const options = useMemo(() => similarOptions(lesson.character, 3, ALPHABET), [lesson.character]);
  return (
    <ChoiceStep
      prompt={phrases.findLetter(lesson.spokenName)}
      shownPrompt={phrases.findLetter(lesson.character)}
      options={options}
      answer={lesson.character}
      render={(o) => o}
      onNext={onNext}
    />
  );
}

function Picture({ lesson, onNext }: { lesson: CharacterLesson; onNext: () => void }) {
  // Правилната картинка + две от други букви (само такива, които имат дума).
  const options = useMemo(() => {
    const others = shuffle(letterLessons.filter((l) => l.exampleWord && l.id !== lesson.id)).slice(0, 2);
    return shuffle([lesson, ...others]);
  }, [lesson]);
  // С Ь не започва дума — тогава питаме в коя дума се вижда („синьо“).
  const ask = lesson.inWord ? phrases.adventurePictureIn : phrases.adventurePicture;
  return (
    <ChoiceStep
      prompt={ask(lesson.spokenName)}
      shownPrompt={ask(lesson.character)}
      options={options.map((o) => o.id)}
      answer={lesson.id}
      render={(id) => (
        <Illustration name={options.find((o) => o.id === id)?.exampleImage} size={140} />
      )}
      onNext={onNext}
    />
  );
}

function Reward() {
  const completeAdventure = useGameStore((s) => s.completeAdventure);
  const { celebration, celebrate, closeReward } = useCelebration();
  const done = useRef(false);
  useEffect(() => {
    if (done.current) return;
    done.current = true;
    celebrate(completeAdventure());
    void speakPhrase(phrases.adventureDone);
  }, [celebrate, completeAdventure]);
  return (
    <div className="flex flex-1 flex-col items-center justify-center gap-6 text-center">
      <span className="animate-pop text-9xl">🏆</span>
      <Mascot message={phrases.adventureDone} mood="dance" />
      <div className="flex w-full max-w-md gap-4">
        <BigButton href="/" icon="🏠" ariaLabel={ui.home} color="bg-sky-100" />
        <BigButton href="/rewards/" icon="📒" label="Албумът" color="bg-sun text-white" className="flex-1" pulse />
      </div>
      <RewardAnimation celebration={celebration} onCloseReward={closeReward} />
    </div>
  );
}
