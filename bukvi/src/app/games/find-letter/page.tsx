"use client";

import { useCallback } from "react";
import { ALPHABET, letterLessons } from "@/data/alphabet";
import { GAMES } from "@/data/games";
import { phrases } from "@/content/phrases";
import { optionsWith, pickOne } from "@/lib/random";
import { ChoiceGame, type ChoiceRound } from "@/components/games/ChoiceGame";

/** Игра 2 — „Коя е буквата?“: чуваш буква и я намираш сред 4. */
export default function FindLetterGame() {
  const makeRound = useCallback((): ChoiceRound => {
    const lesson = pickOne(letterLessons);
    return {
      prompt: phrases.findLetter(lesson.spokenName),
      caption: phrases.findLetter(lesson.character),
      options: optionsWith(ALPHABET, lesson.character, 4),
      answer: lesson.character,
    };
  }, []);
  return <ChoiceGame title={GAMES[0].title} makeRound={makeRound} />;
}
