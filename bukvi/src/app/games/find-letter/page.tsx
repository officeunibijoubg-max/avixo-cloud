"use client";

import { useCallback } from "react";
import { ALPHABET, letterLessons } from "@/data/alphabet";
import { gameTitle } from "@/data/games";
import { similarOptions } from "@/data/similar";
import { phrases } from "@/content/phrases";
import { hasBulgarianVoice } from "@/services/speech";
import { pickOne } from "@/lib/random";
import { ChoiceGame, type ChoiceRound } from "@/components/games/ChoiceGame";

/**
 * Игра 2 — „Коя е буквата?“ (упражнение за слушане): детето само чува буквата
 * и я намира между приличащи ѝ (М между Н, Ш и Л). Буквата не се показва,
 * освен ако устройството няма български глас.
 */
export default function FindLetterGame() {
  const makeRound = useCallback((): ChoiceRound => {
    const lesson = pickOne(letterLessons);
    return {
      prompt: phrases.findLetter(lesson.spokenName),
      caption: hasBulgarianVoice() ? phrases.findHeard : phrases.findLetter(lesson.character),
      options: similarOptions(lesson.character, 4, ALPHABET),
      answer: lesson.character,
    };
  }, []);
  return <ChoiceGame title={gameTitle("find-letter")} makeRound={makeRound} />;
}
