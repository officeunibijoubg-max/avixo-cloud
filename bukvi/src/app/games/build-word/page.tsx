"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { READING_WORDS, type ReadingWord } from "@/data/readingWords";
import { gameTitle } from "@/data/games";
import { phrases, ui } from "@/content/phrases";
import { useGameStore } from "@/store/gameStore";
import { playSound } from "@/services/sounds";
import { cancelSpeech, speakPhrase } from "@/services/speech";
import { pickOne, shuffle } from "@/lib/random";
import { tileColor } from "@/lib/colors";
import { cn } from "@/lib/cn";
import { PageShell } from "@/components/ui/PageShell";
import { Mascot } from "@/components/game/Mascot";
import { SoundButton } from "@/components/game/SoundButton";
import { RewardAnimation } from "@/components/game/RewardAnimation";
import { useCelebration } from "@/components/game/useCelebration";
import { Illustration } from "@/components/illustrations/Illustration";
import { Progress } from "@/components/games/ChoiceGame";
import { GameEnd } from "@/components/games/GameEnd";

const ROUNDS = 6;

type Tile = { id: number; text: string };

/**
 * „Сглоби думата“ — сричане: детето чува думата и я подрежда от срички
 * (МА + МА = МАМА). Всяка сричка се изговаря при натискане, накрая — цялата дума.
 */
export default function BuildWordGame() {
  const recordGameAnswer = useGameStore((s) => s.recordGameAnswer);
  const countGame = useGameStore((s) => s.countGame);
  const { celebration, celebrate, closeReward } = useCelebration();
  const [round, setRound] = useState(0);
  const [word, setWord] = useState<ReadingWord | null>(null);
  const [tiles, setTiles] = useState<Tile[]>([]);
  const [placed, setPlaced] = useState<Tile[]>([]);
  const [wrongId, setWrongId] = useState<number | null>(null);
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const done = !!word && placed.length === word.syllables.length;

  const newRound = useCallback((prev: ReadingWord | null) => {
    const w = pickOne(READING_WORDS.filter((x) => x.word !== prev?.word));
    // Една излишна сричка от друга дума, за да има избор.
    const extra = pickOne(READING_WORDS.filter((x) => x.word !== w.word)).syllables[0];
    const all = [...w.syllables, ...(w.syllables.includes(extra) ? [] : [extra])];
    setWord(w);
    setTiles(shuffle(all.map((text, id) => ({ id, text }))));
    setPlaced([]);
    void speakPhrase(phrases.buildWord(w.word.toLowerCase()));
  }, []);

  useEffect(() => {
    newRound(null);
    return () => {
      cancelSpeech();
      if (timer.current) clearTimeout(timer.current);
    };
  }, [newRound]);

  const tap = (t: Tile) => {
    if (!word || done || placed.some((p) => p.id === t.id)) return;
    const expected = word.syllables[placed.length];
    if (t.text !== expected) {
      playSound("wrong");
      setWrongId(t.id);
      setTimeout(() => setWrongId(null), 600);
      recordGameAnswer(false);
      return;
    }
    playSound("pop");
    void speakPhrase(t.text.toLowerCase());
    const next = [...placed, t];
    setPlaced(next);
    if (next.length === word.syllables.length) {
      playSound("correct");
      celebrate(recordGameAnswer(true));
      void speakPhrase(phrases.wordBuilt(word.syllables.map((s) => s.toLowerCase()).join(" - "), word.word.toLowerCase()));
      timer.current = setTimeout(() => {
        const n = round + 1;
        setRound(n);
        if (n >= ROUNDS) countGame();
        else newRound(word);
      }, 2600);
    }
  };

  return (
    <PageShell back="/games/" title={gameTitle("build-word")}>
      {round >= ROUNDS ? (
        <GameEnd correct={ROUNDS * 2} onAgain={() => { setRound(0); newRound(word); }} />
      ) : (
        word && (
          <div className="flex flex-1 flex-col items-center gap-5">
            <div className="flex w-full items-center gap-3">
              <Mascot compact message={phrases.buildWordQ} mood={done ? "dance" : "point"} className="flex-1" />
              <SoundButton size="lg" onPlay={() => void speakPhrase(word.word.toLowerCase())} />
            </div>
            <Progress current={round} total={ROUNDS} />
            <Illustration name={word.image} size={150} />
            {/* Местата за сричките. */}
            <div className="flex gap-3">
              {word.syllables.map((_, i) => (
                <span
                  key={i}
                  className={cn(
                    "flex h-24 min-w-24 items-center justify-center rounded-3xl border-4 border-dashed px-3 text-5xl font-black",
                    placed[i] ? "border-leaf bg-leaf text-white" : "border-slate-300 bg-white/60",
                  )}
                >
                  {placed[i]?.text ?? ""}
                </span>
              ))}
            </div>
            {done && <span className="animate-pop text-6xl font-black tracking-widest text-grape">{word.word}</span>}
            {/* Сричките за избор. */}
            {!done && (
              <div className="flex flex-wrap justify-center gap-4">
                {tiles.map((t, i) => {
                  const used = placed.some((p) => p.id === t.id);
                  return (
                    <button
                      key={t.id}
                      type="button"
                      onClick={() => tap(t)}
                      disabled={used}
                      aria-label={t.text}
                      className={cn(
                        "card-soft flex h-28 min-w-28 items-center justify-center rounded-[2rem] px-4 text-5xl font-black shadow-[0_8px_0_rgb(0_0_0/0.12)] transition active:translate-y-1",
                        used ? "invisible" : tileColor(i),
                        wrongId === t.id && "animate-wiggle bg-rose-200",
                      )}
                    >
                      {t.text}
                    </button>
                  );
                })}
              </div>
            )}
            <p className="sr-only">{ui.listen}</p>
          </div>
        )
      )}
      <RewardAnimation celebration={celebration} onCloseReward={closeReward} />
    </PageShell>
  );
}
