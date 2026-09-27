"use client";

import Link from "next/link";
import type { CharacterLesson } from "@/lib/types";
import { useGameStore } from "@/store/gameStore";
import { playSound } from "@/services/sounds";
import { cn } from "@/lib/cn";

type Props = { lesson: CharacterLesson; color: string };

/** Плочка със символ в картата на буквите/цифрите; показва и напредъка. */
export function CharacterCard({ lesson, color }: Props) {
  const progress = useGameStore((s) => s.progress.characters[lesson.character]);
  const stars = progress ? (progress.bestScore >= 85 ? 3 : progress.bestScore >= 70 ? 2 : progress.correct > 0 ? 1 : 0) : 0;
  return (
    <Link
      href={`/practice/${lesson.id}/`}
      onClick={() => playSound("click")}
      aria-label={lesson.character}
      className={cn(
        "card-soft relative flex aspect-square flex-col items-center justify-center rounded-3xl text-5xl font-black shadow-[0_6px_0_rgb(0_0_0/0.12)] transition active:translate-y-1 active:shadow-[0_2px_0_rgb(0_0_0/0.12)] sm:text-6xl",
        color,
      )}
    >
      <span>{lesson.character}</span>
      <span className="mt-1 h-5 text-base leading-none" aria-hidden>
        {"⭐".repeat(stars)}
      </span>
      {progress?.mastered && (
        <span className="absolute -right-1 -top-1 flex size-8 items-center justify-center rounded-full bg-leaf text-lg text-white shadow">
          ✓
        </span>
      )}
    </Link>
  );
}
