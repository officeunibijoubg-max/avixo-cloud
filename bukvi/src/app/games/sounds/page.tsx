"use client";

import { FeatureGate } from "@/components/layout/FeatureGate";
import { useCallback } from "react";
import { ALPHABET } from "@/data/alphabet";
import { gameTitle } from "@/data/games";
import { similarOptions } from "@/data/similar";
import { SOUND_WORDS, firstSound, hasClearLastSound, lastSound } from "@/data/soundWords";
import { phrases } from "@/content/phrases";
import { pickOne } from "@/lib/random";
import { ChoiceGame, type ChoiceRound } from "@/components/games/ChoiceGame";
import { Illustration } from "@/components/illustrations/Illustration";

/**
 * „Звуците в думата“ — звуков анализ, основното умение преди четенето:
 * детето чува думата и намира първия или последния ѝ звук.
 */
function SoundsGame() {
  const makeRound = useCallback((index: number): ChoiceRound => {
    // Редуваме: първи звук, последен звук.
    const askLast = index % 2 === 1;
    const pool = askLast ? SOUND_WORDS.filter(hasClearLastSound) : SOUND_WORDS;
    const w = pickOne(pool);
    const answer = askLast ? lastSound(w) : firstSound(w);
    const letters = w.word.toUpperCase().split("");
    return {
      prompt: askLast ? phrases.lastSound(w.word) : phrases.firstSound(w.word),
      caption: askLast ? phrases.lastSoundQ(w.word) : phrases.firstSoundQ(w.word),
      visual: (
        <div className="card-soft flex flex-col items-center gap-2 rounded-[2rem] bg-white px-10 py-4 shadow-md">
          <Illustration name={w.image} size={140} />
          {/* Търсената буква е скрита, за да не е отговорът пред очите. */}
          <span className="text-3xl font-black tracking-widest">
            {letters.map((c, i) => {
              const hidden = askLast ? i === letters.length - 1 : i === 0;
              return (
                <span key={i} className={hidden ? "text-grape" : undefined}>
                  {hidden ? "?" : c}
                </span>
              );
            })}
          </span>
        </div>
      ),
      options: similarOptions(answer, 3, ALPHABET),
      answer,
    };
  }, []);
  return <ChoiceGame title={gameTitle("sounds")} makeRound={makeRound} />;
}

export default function Page() {
  return (
    <FeatureGate id="sounds">
      <SoundsGame />
    </FeatureGate>
  );
}
