"use client";

import { useEffect, useMemo, useState } from "react";
import { FeatureGate } from "@/components/layout/FeatureGate";
import { STORIES, type Story } from "@/content/stories";
import { phrases, ui } from "@/content/phrases";
import { ALPHABET } from "@/data/alphabet";
import { getLessonByChar } from "@/data/lessons";
import { similarOptions } from "@/data/similar";
import { useGameStore } from "@/store/gameStore";
import { missingFor } from "@/services/unlocks";
import { playSound } from "@/services/sounds";
import { cancelSpeech, speakPhrase } from "@/services/speech";
import { cn } from "@/lib/cn";
import { PageShell } from "@/components/ui/PageShell";
import { BigButton } from "@/components/ui/BigButton";
import { Mascot } from "@/components/game/Mascot";
import { SoundButton } from "@/components/game/SoundButton";
import { RewardAnimation } from "@/components/game/RewardAnimation";
import { useCelebration } from "@/components/game/useCelebration";

/** Приказки с Лъвчо: списък (отключват се една по една) и четене страница по страница. */
function Stories() {
  const [story, setStory] = useState<Story | null>(null);
  return story ? <Reader story={story} onClose={() => setStory(null)} /> : <StoryList onPick={setStory} />;
}

function StoryList({ onPick }: { onPick: (s: Story) => void }) {
  const progress = useGameStore((s) => s.progress);
  const unlockAll = useGameStore((s) => s.settings.unlockAll);
  const [message, setMessage] = useState<string>(phrases.storyPick);
  return (
    <PageShell back="/games/" title="📚 Приказки">
      <Mascot compact message={message} className="mb-4" />
      <div className="grid grid-cols-2 gap-4 lg:grid-cols-3">
        {STORIES.map((s) => {
          const missing = unlockAll ? [] : missingFor(progress, s.unlock);
          const open = missing.length === 0;
          return (
            <button
              key={s.id}
              type="button"
              onClick={() => {
                if (open) {
                  playSound("click");
                  onPick(s);
                } else {
                  const text = phrases.lockedFeature(missing.join(" и "));
                  playSound("wrong");
                  setMessage(text);
                  void speakPhrase(text);
                }
              }}
              className={cn(
                "card-soft relative flex min-h-44 flex-col items-center justify-center gap-2 rounded-[2rem] p-4 text-center shadow-[0_8px_0_rgb(0_0_0/0.12)]",
                open ? "bg-amber-100" : "bg-slate-100",
              )}
            >
              {!open && <span className="absolute right-3 top-3 text-3xl">🔒</span>}
              <span className={cn("text-7xl", !open && "opacity-40 grayscale")}>{s.icon}</span>
              <span className={cn("text-xl font-extrabold", !open && "text-slate-500")}>{s.title}</span>
              {!open && <span className="rounded-full bg-white px-3 py-1 text-sm font-bold text-slate-600">{missing.join(" и ")}</span>}
            </button>
          );
        })}
      </div>
    </PageShell>
  );
}

/** Думите, които започват с буквата на приказката, светят. */
function StoryText({ text, letter }: { text: string; letter: string }) {
  return (
    <p className="text-3xl font-bold leading-relaxed sm:text-4xl">
      {text.split(/(\s+)/).map((w, i) => {
        const clean = w.replace(/^[„“"]+/, "");
        const hit = clean.toUpperCase().startsWith(letter);
        return (
          <span key={i} className={hit ? "font-black text-grape" : undefined}>
            {w}
          </span>
        );
      })}
    </p>
  );
}

function Reader({ story, onClose }: { story: Story; onClose: () => void }) {
  const [page, setPage] = useState(0);
  const [wrong, setWrong] = useState<string[]>([]);
  const [solved, setSolved] = useState(false);
  const recordGameAnswer = useGameStore((s) => s.recordGameAnswer);
  const countGame = useGameStore((s) => s.countGame);
  const { celebration, celebrate, closeReward } = useCelebration();
  const lesson = getLessonByChar(story.letter);
  const options = useMemo(() => similarOptions(story.letter, 3, ALPHABET), [story.letter]);
  const atQuestion = page >= story.pages.length;

  useEffect(() => {
    void speakPhrase(atQuestion ? phrases.storyQuestion : story.pages[page].text);
  }, [atQuestion, page, story]);
  useEffect(() => () => cancelSpeech(), []);

  const choose = (o: string) => {
    if (solved) return;
    if (o === story.letter) {
      setSolved(true);
      playSound("correct");
      celebrate(recordGameAnswer(true));
      countGame();
      void speakPhrase(phrases.storyEnd(lesson?.spokenName ?? o));
    } else if (!wrong.includes(o)) {
      setWrong((w) => [...w, o]);
      recordGameAnswer(false);
      playSound("wrong");
      void speakPhrase(phrases.wrongChoice);
    }
  };

  return (
    <PageShell onBack={onClose} title={`${story.icon} ${story.title}`}>
      {!atQuestion ? (
        <div className="flex flex-1 flex-col items-center justify-center gap-6 text-center">
          <div className="card-soft flex w-full max-w-3xl flex-col items-center gap-6 rounded-[2rem] bg-white/90 p-6 shadow-md">
            <span className="text-8xl sm:text-9xl" aria-hidden>
              {story.pages[page].scene}
            </span>
            <StoryText text={story.pages[page].text} letter={story.letter} />
          </div>
          <div className="flex w-full max-w-md items-center gap-3">
            <SoundButton size="lg" onPlay={() => void speakPhrase(story.pages[page].text)} />
            <BigButton icon="➡️" label={ui.next} onClick={() => setPage(page + 1)} color="bg-leaf text-white" className="flex-1" pulse />
          </div>
          <p className="font-bold text-slate-500">
            {page + 1} / {story.pages.length}
          </p>
        </div>
      ) : (
        <div className="flex flex-1 flex-col items-center justify-center gap-6 text-center">
          <Mascot message={solved ? phrases.storyEnd(story.letter) : phrases.storyQuestion} mood={solved ? "dance" : "think"} />
          <div className="grid w-full max-w-xl grid-cols-3 gap-4">
            {options.map((o) => (
              <button
                key={o}
                type="button"
                onClick={() => choose(o)}
                className={cn(
                  "card-soft flex aspect-square items-center justify-center rounded-[2rem] bg-white text-8xl font-black shadow-[0_8px_0_rgb(0_0_0/0.12)] transition active:translate-y-1",
                  solved && o === story.letter && "scale-105 bg-leaf text-white",
                  wrong.includes(o) && "animate-wiggle bg-rose-100 opacity-50",
                )}
              >
                {o}
              </button>
            ))}
          </div>
          {solved && (
            <div className="flex w-full max-w-md gap-3">
              <BigButton icon="🔁" label={ui.again} onClick={() => { setPage(0); setSolved(false); setWrong([]); }} color="bg-sky-100" />
              <BigButton icon="📚" label="Още приказки" onClick={onClose} color="bg-leaf text-white" className="flex-1" pulse />
            </div>
          )}
        </div>
      )}
      <RewardAnimation celebration={celebration} onCloseReward={closeReward} />
    </PageShell>
  );
}

export default function Page() {
  return (
    <FeatureGate id="stories">
      <Stories />
    </FeatureGate>
  );
}
