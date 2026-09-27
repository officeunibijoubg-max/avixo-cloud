"use client";

import { useCallback } from "react";
import type { CharacterLesson } from "@/lib/types";
import { letterLessons } from "@/data/alphabet";
import { GAMES } from "@/data/games";
import { phrases } from "@/content/phrases";
import { useGameStore } from "@/store/gameStore";
import { pickOne } from "@/lib/random";
import { WriteRoundGame } from "@/components/games/WriteRoundGame";

/** Игра 4 — „Чуй и напиши“: буквата не се показва, само се чува. */
export default function ListenWriteGame() {
  const difficulty = useGameStore((s) => s.settings.difficulty);
  const pickLesson = useCallback(
    (prev: CharacterLesson | null) => pickOne(letterLessons.filter((l) => l.id !== prev?.id)),
    [],
  );
  return (
    <WriteRoundGame
      title={GAMES[3].title}
      pickLesson={pickLesson}
      prompt={(l) => phrases.listenWrite(l.spokenName)}
      // Без глас детето трябва да види коя е буквата — затова е и в балончето.
      caption={(l) => phrases.listenWrite(l.character)}
      // Без шаблон, но с по-меко оценяване от „трудно“, освен ако родителят не е избрал трудно.
      difficulty={difficulty === "hard" ? "hard" : "normal"}
    />
  );
}
