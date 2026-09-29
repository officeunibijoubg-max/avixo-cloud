"use client";

import { knownLetters } from "@/components/games/known";
import { FeatureGate } from "@/components/layout/FeatureGate";
import { useCallback } from "react";
import { ALPHABET } from "@/data/alphabet";
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
function FindLetterGame() {
  const makeRound = useCallback((): ChoiceRound => {
    const lesson = pickOne(knownLetters());
    return {
      prompt: phrases.findLetter(lesson.spokenName),
      caption: hasBulgarianVoice() ? phrases.findHeard : phrases.findLetter(lesson.character),
      options: similarOptions(lesson.character, 4, ALPHABET),
      answer: lesson.character,
    };
  }, []);
  return <ChoiceGame game="find-letter" makeRound={makeRound} />;
}

export default function Page() {
  return (
    <FeatureGate id="find-letter">
      <FindLetterGame />
    </FeatureGate>
  );
}
