"use client";

import { useCallback } from "react";
import { FeatureGate } from "@/components/layout/FeatureGate";
import { gameTitle } from "@/data/games";
import { COLORS } from "@/data/shapes";
import { phrases } from "@/content/phrases";
import { optionsWith, pickOne } from "@/lib/random";
import { ChoiceGame, type ChoiceRound } from "@/components/games/ChoiceGame";

/** „Цветове“ — „Докосни червеното!“: избор между 3 (после 4) цветни балона. */
function ColorsGame() {
  const makeRound = useCallback((index: number): ChoiceRound => {
    const color = pickOne(COLORS);
    const options = optionsWith(COLORS, color, index < 3 ? 3 : 4);
    const text = phrases.touchColor(color.name);
    return {
      prompt: text,
      caption: text,
      options: options.map((c) => c.id),
      answer: color.id,
      renderOption: (id) => {
        const c = COLORS.find((x) => x.id === id)!;
        return <span className="block size-3/4 rounded-full border-4 border-slate-200" style={{ background: c.hex }} />;
      },
      optionLabel: (id) => COLORS.find((x) => x.id === id)?.name ?? id,
    };
  }, []);
  return <ChoiceGame title={gameTitle("colors")} makeRound={makeRound} rounds={8} />;
}

export default function Page() {
  return (
    <FeatureGate id="colors">
      <ColorsGame />
    </FeatureGate>
  );
}
