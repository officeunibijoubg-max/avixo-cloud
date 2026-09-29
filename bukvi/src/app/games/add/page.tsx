"use client";

import { useCallback } from "react";
import { FeatureGate } from "@/components/layout/FeatureGate";
import { COUNT_ITEMS, addRound, numberName, numberOptions } from "@/data/math";
import { phrases } from "@/content/phrases";
import { pickOne } from "@/lib/random";
import { ChoiceGame, type ChoiceRound } from "@/components/games/ChoiceGame";
import { ItemGroup } from "@/components/games/ItemGroup";

/** „Колко станаха?“ — събиране до 10 с предмети, които се броят. */
function AddGame() {
  const makeRound = useCallback((): ChoiceRound => {
    const { a, b, answer } = addRound();
    const item = pickOne(COUNT_ITEMS);
    return {
      prompt: phrases.addQuestion(numberName(a), numberName(b)),
      caption: phrases.addQuestion(String(a), String(b)),
      visual: (
        <div className="card-soft flex flex-wrap items-center justify-center gap-3 rounded-[2rem] bg-white px-4 py-3 shadow-md">
          <ItemGroup item={item} count={a} />
          <span className="text-6xl font-black text-grape">+</span>
          <ItemGroup item={item} count={b} />
        </div>
      ),
      options: numberOptions(answer).map(String),
      answer: String(answer),
    };
  }, []);
  return <ChoiceGame game="add" makeRound={makeRound} rounds={6} />;
}

export default function Page() {
  return (
    <FeatureGate id="add">
      <AddGame />
    </FeatureGate>
  );
}
