"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import type { CharacterLesson } from "@/lib/types";
import { FeatureGate } from "@/components/layout/FeatureGate";
import { letterLessons } from "@/data/alphabet";
import { gameTitle } from "@/data/games";
import { phrases } from "@/content/phrases";
import { useGameStore } from "@/store/gameStore";
import { starsFor } from "@/services/progress";
import { playSound } from "@/services/sounds";
import { cancelSpeech, speakPhrase } from "@/services/speech";
import { shuffle } from "@/lib/random";
import { cn } from "@/lib/cn";
import { PageShell } from "@/components/ui/PageShell";
import { Mascot } from "@/components/game/Mascot";
import { RewardAnimation } from "@/components/game/RewardAnimation";
import { useCelebration } from "@/components/game/useCelebration";
import { GameEnd } from "@/components/games/GameEnd";
import { Illustration, hasIllustration } from "@/components/illustrations/Illustration";

type Card = { key: string; lesson: CharacterLesson; face: "letter" | "picture" };

/** Двойки само от научените букви (с картинка); първите игри са с 3 двойки, после 4 и 6. */
function makeDeck(learned: CharacterLesson[], pairs: number): Card[] {
  const pool = learned.filter((l) => !l.inWord && hasIllustration(l.exampleImage));
  const picked = shuffle(pool).slice(0, pairs);
  return shuffle(picked.flatMap((l) => [
    { key: `${l.id}-l`, lesson: l, face: "letter" as const },
    { key: `${l.id}-p`, lesson: l, face: "picture" as const },
  ]));
}

function MemoryGame() {
  const hydrated = useGameStore((s) => s.hydrated);
  const recordGameAnswer = useGameStore((s) => s.recordGameAnswer);
  const countGame = useGameStore((s) => s.countGame);
  const { celebration, celebrate, closeReward } = useCelebration();
  const [deck, setDeck] = useState<Card[]>([]);
  const [open, setOpen] = useState<string[]>([]);
  const [found, setFound] = useState<string[]>([]);
  const [message, setMessage] = useState<string>(phrases.memoryStart);
  const [misses, setMisses] = useState(0);
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Прогресът се чете при старт (влизане и „Пак“), не при всяка спечелена монета.
  const start = useCallback(() => {
    const { progress } = useGameStore.getState();
    const gamesPlayed = progress.gamesPlayed;
    const learned = letterLessons.filter((l) => starsFor(progress, l.character) > 0);
    const pairs = gamesPlayed < 5 ? 3 : gamesPlayed < 15 ? 4 : 6;
    setDeck(makeDeck(learned.length >= 3 ? learned : letterLessons.slice(0, 6), pairs));
    setOpen([]);
    setFound([]);
    setMisses(0);
    setMessage(phrases.memoryStart);
    void speakPhrase(phrases.memoryStart);
  }, []);

  useEffect(() => {
    if (hydrated) start();
  }, [hydrated, start]);

  useEffect(
    () => () => {
      if (timer.current) clearTimeout(timer.current);
      cancelSpeech();
    },
    [],
  );

  const flip = (card: Card) => {
    if (open.length >= 2 || open.includes(card.key) || found.includes(card.lesson.id)) return;
    playSound("click");
    const next = [...open, card.key];
    setOpen(next);
    if (next.length < 2) {
      if (card.face === "letter") void speakPhrase(card.lesson.spokenName);
      else if (card.lesson.exampleWord) void speakPhrase(card.lesson.exampleWord);
      return;
    }
    const first = deck.find((c) => c.key === next[0])!;
    if (first.lesson.id === card.lesson.id) {
      const word = (card.lesson.exampleWord ?? "").toLowerCase();
      const text = phrases.memoryPair(card.lesson.spokenName, word);
      setFound((f) => [...f, card.lesson.id]);
      setOpen([]);
      setMessage(phrases.memoryPair(card.lesson.character, word));
      playSound("correct");
      celebrate(recordGameAnswer(true));
      void speakPhrase(text);
      if (found.length + 1 === deck.length / 2) countGame();
    } else {
      setMisses((m) => m + 1);
      setMessage(phrases.memoryNo);
      playSound("wrong");
      timer.current = setTimeout(() => setOpen([]), 1300);
    }
  };

  const done = deck.length > 0 && found.length === deck.length / 2;
  return (
    <PageShell back="/games/" title={gameTitle("memory")}>
      {done ? (
        <GameEnd correct={Math.max(2, 10 - misses)} onAgain={start} />
      ) : (
        <div className="flex flex-1 flex-col items-center gap-5">
          <Mascot compact message={message} className="w-full" />
          <div className={cn("grid w-full max-w-3xl gap-3", deck.length > 8 ? "grid-cols-4" : "grid-cols-3 sm:grid-cols-4")}>
            {deck.map((c) => {
              const shown = open.includes(c.key) || found.includes(c.lesson.id);
              return (
                <button
                  key={c.key}
                  type="button"
                  onClick={() => flip(c)}
                  aria-label={shown ? (c.face === "letter" ? c.lesson.character : c.lesson.exampleWord) : "?"}
                  className={cn(
                    "card-soft flex aspect-square items-center justify-center rounded-[1.75rem] text-7xl font-black shadow-[0_6px_0_rgb(0_0_0/0.12)] transition active:translate-y-1",
                    found.includes(c.lesson.id) ? "bg-leaf/30" : shown ? "bg-white" : "bg-grape text-white",
                  )}
                >
                  {!shown ? "?" : c.face === "letter" ? c.lesson.character : <Illustration name={c.lesson.exampleImage} size={96} />}
                </button>
              );
            })}
          </div>
        </div>
      )}
      <RewardAnimation celebration={celebration} onCloseReward={closeReward} />
    </PageShell>
  );
}

export default function Page() {
  return (
    <FeatureGate id="memory">
      <MemoryGame />
    </FeatureGate>
  );
}
