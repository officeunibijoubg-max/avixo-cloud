"use client";

import { knownWords } from "@/components/games/known";
import { FeatureGate } from "@/components/layout/FeatureGate";
import { useCallback } from "react";
import { READING_WORDS } from "@/data/readingWords";
import { phrases } from "@/content/phrases";
import { pickOne, shuffle } from "@/lib/random";
import { ChoiceGame, type ChoiceRound } from "@/components/games/ChoiceGame";
import { Illustration } from "@/components/illustrations/Illustration";

/**
 * „Прочети и избери“ — първо четене: думата е написана (разделена на срички),
 * но НЕ се изговаря. Детето я прочита и избира картинката.
 */
function ReadWordGame() {
  const makeRound = useCallback((): ChoiceRound => {
    const w = pickOne(knownWords(READING_WORDS, (x) => x.word));
    const others = shuffle(READING_WORDS.filter((x) => x.image !== w.image)).slice(0, 2);
    const options = shuffle([w, ...others]);
    return {
      prompt: phrases.readWord,
      caption: phrases.readWord,
      visual: (
        <div className="card-soft flex items-center gap-2 rounded-[2rem] bg-white px-8 py-5 shadow-md">
          {w.syllables.map((s, i) => (
            <span key={i} className="flex items-center gap-2 text-6xl font-black tracking-wide sm:text-7xl">
              {i > 0 && <span className="text-3xl text-slate-300">•</span>}
              <span className={i % 2 ? "text-grape" : "text-sky-600"}>{s}</span>
            </span>
          ))}
        </div>
      ),
      options: options.map((o) => o.image),
      answer: w.image,
      renderOption: (img) => <Illustration name={img} size={120} />,
      optionLabel: (img) => options.find((o) => o.image === img)?.word ?? img,
    };
  }, []);
  return <ChoiceGame game="read-word" makeRound={makeRound} rounds={6} />;
}

export default function Page() {
  return (
    <FeatureGate id="read-word">
      <ReadWordGame />
    </FeatureGate>
  );
}
