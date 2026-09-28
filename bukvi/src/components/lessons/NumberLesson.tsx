"use client";

import type { CharacterLesson } from "@/lib/types";
import { speakCharacter } from "@/services/speech";
import { SoundButton } from "@/components/game/SoundButton";
import { Illustration } from "@/components/illustrations/Illustration";

/** Горната част на урока за цифра: цифрата, името ѝ и толкова предмета. */
export function NumberLesson({ lesson }: { lesson: CharacterLesson }) {
  const count = lesson.count ?? 0;
  return (
    <div className="card-soft flex items-center gap-4 rounded-[2rem] bg-white/80 p-4 shadow-md lg:flex-col lg:p-6">
      <div className="flex size-28 shrink-0 items-center justify-center rounded-3xl bg-amber-200 text-8xl font-black text-amber-700 sm:size-32 lg:size-44 lg:text-[8rem]">
        {lesson.character}
      </div>
      <div className="flex flex-1 flex-col items-center gap-2 text-center">
        <div className="flex max-w-64 flex-wrap justify-center gap-1" aria-hidden>
          {count === 0 ? (
            <Illustration name={lesson.exampleImage} size={72} className="opacity-60" />
          ) : (
            Array.from({ length: count }, (_, i) => <Illustration key={i} name={lesson.exampleImage} size={count > 6 ? 40 : 48} />)
          )}
        </div>
        <p className="text-3xl font-extrabold text-amber-700">{lesson.spokenName}</p>
      </div>
      <SoundButton size="lg" onPlay={() => void speakCharacter(lesson)} />
    </div>
  );
}
