"use client";

import { knownDigits } from "@/components/games/known";
import { FeatureGate } from "@/components/layout/FeatureGate";
import { useCallback } from "react";
import type { CharacterLesson } from "@/lib/types";
import { COUNT_ITEMS as ANIMALS } from "@/data/math";
import { phrases } from "@/content/phrases";
import { useGameStore } from "@/store/gameStore";
import { pickOne } from "@/lib/random";
import { WriteRoundGame } from "@/components/games/WriteRoundGame";
import { Illustration } from "@/components/illustrations/Illustration";

/** Игра 8 — „Цифрово броене“: преброй животните и напиши числото. */
function CountWriteGame() {
  const difficulty = useGameStore((s) => s.settings.difficulty);
  const pickLesson = useCallback(
    (prev: CharacterLesson | null) => pickOne(knownDigits().filter((l) => l.id !== prev?.id)),
    [],
  );
  const visual = useCallback((l: CharacterLesson) => {
    const animal = ANIMALS[Number(l.id) % ANIMALS.length];
    return (
      <div className="card-soft grid grid-cols-3 place-items-center gap-2 rounded-3xl bg-white p-4 shadow-md" aria-hidden>
        {Array.from({ length: l.count ?? 0 }, (_, i) => (
          <Illustration key={i} name={animal} size={64} />
        ))}
      </div>
    );
  }, []);
  return (
    <WriteRoundGame
      game="count-write"
      pickLesson={pickLesson}
      prompt={() => phrases.countThem}
      caption={() => phrases.countThem}
      visual={visual}
      difficulty={difficulty === "hard" ? "hard" : "normal"}
    />
  );
}

export default function Page() {
  return (
    <FeatureGate id="count-write">
      <CountWriteGame />
    </FeatureGate>
  );
}
