"use client";

import { useCallback } from "react";
import type { CharacterLesson } from "@/lib/types";
import { numberLessons } from "@/data/numbers";
import { GAMES } from "@/data/games";
import { phrases } from "@/content/phrases";
import { useGameStore } from "@/store/gameStore";
import { pickOne } from "@/lib/random";
import { WriteRoundGame } from "@/components/games/WriteRoundGame";
import { Illustration } from "@/components/illustrations/Illustration";

// Какво броим — илюстрации в стила на Лъвчо.
const ANIMALS = ["ladybug", "duckling", "frog", "bunny", "kitten", "elephant", "teddy", "deer"];

/** Игра 8 — „Цифрово броене“: преброй животните и напиши числото. */
export default function CountWriteGame() {
  const difficulty = useGameStore((s) => s.settings.difficulty);
  const pickLesson = useCallback(
    (prev: CharacterLesson | null) => pickOne(numberLessons.filter((l) => l.id !== "0" && l.id !== prev?.id)),
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
      title={GAMES[4].title}
      pickLesson={pickLesson}
      prompt={() => phrases.countThem}
      caption={() => phrases.countThem}
      visual={visual}
      difficulty={difficulty === "hard" ? "hard" : "normal"}
    />
  );
}
