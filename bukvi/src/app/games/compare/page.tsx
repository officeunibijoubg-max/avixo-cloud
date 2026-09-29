"use client";

import { useCallback } from "react";
import { FeatureGate } from "@/components/layout/FeatureGate";
import { gameTitle } from "@/data/games";
import { COUNT_ITEMS, compareRound } from "@/data/math";
import { phrases } from "@/content/phrases";
import { pickOne } from "@/lib/random";
import { ChoiceGame, type ChoiceRound } from "@/components/games/ChoiceGame";
import { ItemGroup } from "@/components/games/ItemGroup";

/** „Къде има повече?“ — две групи, детето избира по-голямата (или по-малката). */
function CompareGame() {
  const makeRound = useCallback((): ChoiceRound => {
    const { a, b, askMore } = compareRound();
    const item = pickOne(COUNT_ITEMS);
    const text = askMore ? phrases.compareMore : phrases.compareFewer;
    const answer = (askMore ? a > b : a < b) ? "left" : "right";
    const counts: Record<string, number> = { left: a, right: b };
    return {
      prompt: text,
      caption: text,
      options: ["left", "right"],
      answer,
      wide: true,
      renderOption: (o) => <ItemGroup item={item} count={counts[o]} size={44} />,
      optionLabel: (o) => String(counts[o]),
    };
  }, []);
  return <ChoiceGame title={gameTitle("compare")} makeRound={makeRound} rounds={6} />;
}

export default function Page() {
  return (
    <FeatureGate id="compare">
      <CompareGame />
    </FeatureGate>
  );
}
