"use client";

import { useCallback, useMemo } from "react";
import type { CharacterLesson } from "@/lib/types";
import { getLessonByChar, letterLessons } from "@/data/lessons";
import { useGameStore } from "@/store/gameStore";
import { hardCharacters, pickAdventureLetter } from "@/services/adventure";
import { writeTaskText } from "@/services/speech";
import { WriteRoundGame } from "@/components/games/WriteRoundGame";

/** „Упражнявай трудните букви“ (от родителския екран): пет кръга с най-трудните символи, с шаблон. */
export default function ReviewPage() {
  const progress = useGameStore((s) => s.progress);
  const hydrated = useGameStore((s) => s.hydrated);

  // Списъкът се взима веднъж след зареждане, за да не се мени по време на играта.
  const list = useMemo(() => {
    if (!hydrated) return [];
    const hard = hardCharacters(progress);
    const chars = hard.length ? hard : [pickAdventureLetter(progress)];
    return chars.map((c) => getLessonByChar(c)).filter((l): l is CharacterLesson => !!l);
  }, [hydrated]); // eslint-disable-line react-hooks/exhaustive-deps

  const pickLesson = useCallback(
    (prev: CharacterLesson | null) => {
      const pool = list.length ? list : letterLessons.slice(0, 1);
      const i = prev ? (pool.findIndex((l) => l.id === prev.id) + 1) % pool.length : 0;
      return pool[i];
    },
    [list],
  );

  if (!hydrated) return null;
  return (
    <WriteRoundGame
      key={list.map((l) => l.id).join()}
      game="review"
      title="Трудните букви"
      back="/parent/"
      pickLesson={pickLesson}
      prompt={(l) => writeTaskText(l, true)}
      caption={(l) => writeTaskText({ ...l, spokenName: l.type === "letter" ? l.character : l.spokenName }, true)}
      difficulty="easy"
      showGuide
    />
  );
}
