"use client";

import { useCallback } from "react";
import { FeatureGate } from "@/components/layout/FeatureGate";
import { gameTitle } from "@/data/games";
import { COUNT_ITEMS, numberName, numberOptions, subRound } from "@/data/math";
import { phrases } from "@/content/phrases";
import { pickOne } from "@/lib/random";
import { ChoiceGame, type ChoiceRound } from "@/components/games/ChoiceGame";
import { ItemGroup } from "@/components/games/ItemGroup";

/** „Колко останаха?“ — изваждане до 10: избягалите са задраскани. */
function SubtractGame() {
  const makeRound = useCallback((): ChoiceRound => {
    const { a, b, answer } = subRound();
    const item = pickOne(COUNT_ITEMS);
    return {
      prompt: phrases.subQuestion(numberName(a), numberName(b)),
      caption: phrases.subQuestion(String(a), String(b)),
      visual: (
        <div className="card-soft rounded-[2rem] bg-white px-4 py-3 shadow-md">
          <ItemGroup item={item} count={a} gone={b} />
        </div>
      ),
      options: numberOptions(answer).map(String),
      answer: String(answer),
    };
  }, []);
  return <ChoiceGame title={gameTitle("subtract")} makeRound={makeRound} rounds={6} />;
}

export default function Page() {
  return (
    <FeatureGate id="subtract">
      <SubtractGame />
    </FeatureGate>
  );
}
