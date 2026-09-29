"use client";

import { FeatureGate } from "@/components/layout/FeatureGate";
import { useCallback } from "react";
import { ALPHABET, letterLessons } from "@/data/alphabet";
import { gameTitle } from "@/data/games";
import { phrases } from "@/content/phrases";
import { optionsWith, pickOne } from "@/lib/random";
import { ChoiceGame, type ChoiceRound } from "@/components/games/ChoiceGame";
import { Illustration } from "@/components/illustrations/Illustration";

// Буквите с ясна примерна дума (без Ь, чиято дума умишлено липсва).
const withWords = letterLessons.filter((l) => l.exampleWord);

/** Игра 3 — „С коя буква започва?“: картинка, дума и три букви. */
function FirstLetterGame() {
  const makeRound = useCallback((): ChoiceRound => {
    const lesson = pickOne(withWords);
    const word = lesson.exampleWord as string;
    return {
      prompt: phrases.startsWith(word),
      caption: phrases.startsWithQuestion(word),
      visual: (
        <div className="card-soft flex flex-col items-center rounded-[2rem] bg-white px-10 py-4 shadow-md">
          <Illustration name={lesson.exampleImage} size={150} />
          {/* Първата буква е скрита — иначе отговорът е пред очите. */}
          <span className="text-3xl font-black tracking-wide">
            <span className="text-grape">?</span>
            {word.slice(1)}
          </span>
        </div>
      ),
      options: optionsWith(ALPHABET, lesson.character, 3),
      answer: lesson.character,
    };
  }, []);
  return <ChoiceGame title={gameTitle("first-letter")} makeRound={makeRound} />;
}

export default function Page() {
  return (
    <FeatureGate id="first-letter">
      <FirstLetterGame />
    </FeatureGate>
  );
}
