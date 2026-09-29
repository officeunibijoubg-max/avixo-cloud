"use client";

import { useCallback } from "react";
import type { CharacterLesson } from "@/lib/types";
import { FeatureGate } from "@/components/layout/FeatureGate";
import { shapeLessons } from "@/data/shapes";
import { writeTaskText } from "@/services/speech";
import { pickOne } from "@/lib/random";
import { WriteRoundGame } from "@/components/games/WriteRoundGame";

/** „Форми“ — подготовка на ръката: черти, зигзаг, вълни, кръг, квадрат… по ред, с шаблон. */
function ShapesGame() {
  const pickLesson = useCallback((prev: CharacterLesson | null) => {
    if (!prev) return pickOne(shapeLessons.slice(0, 4));
    const i = shapeLessons.findIndex((l) => l.id === prev.id);
    return shapeLessons[(i + 1) % shapeLessons.length];
  }, []);
  const visual = useCallback(
    (l: CharacterLesson) => (
      <div className="card-soft flex items-center justify-center rounded-3xl bg-white p-4 text-8xl shadow-md" aria-hidden>
        {l.exampleImage}
      </div>
    ),
    [],
  );
  return (
    <WriteRoundGame
      game="shapes"
      pickLesson={pickLesson}
      prompt={(l) => writeTaskText(l, true)}
      caption={(l) => writeTaskText(l, true)}
      visual={visual}
      // Нормален режим: в лесния кръг и квадрат си приличат твърде много.
      difficulty="normal"
      showGuide
    />
  );
}

export default function Page() {
  return (
    <FeatureGate id="shapes">
      <ShapesGame />
    </FeatureGate>
  );
}
