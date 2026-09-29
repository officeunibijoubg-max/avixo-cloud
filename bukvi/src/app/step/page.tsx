"use client";

import { Suspense, useEffect, useMemo, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { PATH, type PathStep } from "@/data/path";
import { shapeLessons } from "@/data/shapes";
import { getWordByText } from "@/data/wordsIsland";
import { phrases } from "@/content/phrases";
import { useGameStore } from "@/store/gameStore";
import { currentStepIndex } from "@/services/path";
import { speakPhrase } from "@/services/speech";
import { PageShell } from "@/components/ui/PageShell";
import { BigButton } from "@/components/ui/BigButton";
import { Mascot } from "@/components/game/Mascot";
import { LessonFlow } from "@/components/lessons/LessonFlow";
import { WordScreen } from "@/components/lessons/WordScreen";
import { ShapeStep } from "@/components/path/ShapeStep";
import { stepInfo } from "@/components/path/stepInfo";
import { StepNavContext, useContinue } from "@/components/path/StepNav";

/**
 * Изпълнява една стъпка от пътя: по подразбиране текущата; с ?i=N — минала стъпка
 * (за повтаряне). Стъпки напред не могат да се отворят.
 */
export default function StepPage() {
  return (
    <Suspense fallback={null}>
      <StepRunner />
    </Suspense>
  );
}

function StepRunner() {
  const params = useSearchParams();
  const router = useRouter();
  const hydrated = useGameStore((s) => s.hydrated);
  const asked = params.get("i");
  // Стъпката се избира веднъж и не се сменя, докато детето я минава (иначе щом я мине,
  // екранът би скочил напред, преди да види наградата). „Продължи“ избира наново.
  const [run, setRun] = useState(0);
  const [index, setIndex] = useState<number | null>(null);
  useEffect(() => {
    if (!hydrated) return;
    const { progress, settings } = useGameStore.getState();
    const current = currentStepIndex(progress);
    const n = Number(asked);
    const replay = run === 0 && asked !== null && Number.isInteger(n) && n >= 0 && (n <= current || settings.unlockAll);
    setIndex(replay ? n : current);
  }, [hydrated, asked, run]);

  const nav = useMemo(
    () => ({
      next: () => {
        if (asked !== null) router.replace("/step/");
        setIndex(null);
        setRun((r) => r + 1);
      },
    }),
    [asked, router],
  );

  if (index === null) return null;
  const step = PATH[index];
  return (
    <StepNavContext.Provider value={nav}>
      {step ? <RunStep key={`${run}-${index}`} step={step} /> : <PathFinished />}
    </StepNavContext.Provider>
  );
}

function RunStep({ step }: { step: PathStep }) {
  switch (step.kind) {
    case "char":
      return <LessonFlow character={step.char} />;
    case "shape": {
      const lesson = shapeLessons.find((l) => l.id === `shape-${step.id}`);
      return lesson ? <ShapeStep lesson={lesson} /> : null;
    }
    case "word": {
      const word = getWordByText(step.text);
      return word ? <WordStep text={step.text} /> : null;
    }
    default:
      return <OpenStep step={step} />;
  }
}

function WordStep({ text }: { text: string }) {
  const cont = useContinue();
  const word = getWordByText(text);
  return word ? <WordScreen word={word} back="/" onNext={cont} /> : null;
}

/** Нова игра или приказка: кратко представяне и голям бутон към нея. */
function OpenStep({ step }: { step: PathStep }) {
  const info = stepInfo(step);
  const title = info.title;
  const text = step.kind === "story" ? phrases.newStoryIntro(title) : phrases.newGameIntro(title);
  useEffect(() => {
    void speakPhrase(text);
  }, [text]);
  return (
    <PageShell back="/">
      <div className="flex flex-1 flex-col items-center justify-center gap-6 text-center">
        <span className="animate-pop text-[9rem] leading-none">{info.icon}</span>
        <Mascot message={text} mood="cheer" />
        {info.href && <BigButton href={info.href} icon="▶️" label={title} color="bg-leaf text-white" size="lg" pulse className="w-full max-w-md" />}
      </div>
    </PageShell>
  );
}

function PathFinished() {
  useEffect(() => {
    void speakPhrase(phrases.pathDone);
  }, []);
  return (
    <PageShell back="/">
      <div className="flex flex-1 flex-col items-center justify-center gap-6 text-center">
        <span className="animate-pop text-9xl">🏆</span>
        <Mascot message={phrases.pathDone} mood="dance" />
        <BigButton href="/learn/" icon="🗺️" label={phrases.pathTitle} color="bg-leaf text-white" size="lg" />
      </div>
    </PageShell>
  );
}
