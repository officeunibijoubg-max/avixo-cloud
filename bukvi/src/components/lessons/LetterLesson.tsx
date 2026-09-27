"use client";

import type { CharacterLesson } from "@/lib/types";
import { phrases } from "@/content/phrases";
import { speakCharacter } from "@/services/speech";
import { SoundButton } from "@/components/game/SoundButton";

/** Горната част на урока за буква: буквата, „А като Автобус“, картинка и 🔊. */
export function LetterLesson({ lesson }: { lesson: CharacterLesson }) {
  const word = lesson.exampleWord;
  return (
    <div className="card-soft flex items-center gap-4 rounded-[2rem] bg-white/80 p-4 shadow-md lg:flex-col lg:p-6">
      <div className="flex size-28 shrink-0 items-center justify-center rounded-3xl bg-violet-200 text-8xl font-black text-violet-700 sm:size-32 lg:size-44 lg:text-[8rem]">
        {lesson.character}
      </div>
      <div className="flex flex-1 flex-col items-center gap-2 text-center">
        <span className="text-7xl lg:text-8xl" aria-hidden>
          {lesson.exampleImage}
        </span>
        {word ? (
          <p className="text-2xl font-extrabold sm:text-3xl">
            {phrases.asPrefix(lesson.character)}
            <span className="text-violet-600">
              <span className="underline decoration-4 underline-offset-4">{word[0].toUpperCase()}</span>
              {word.slice(1)}
            </span>
          </p>
        ) : (
          <p className="text-muted max-w-xs text-base font-bold text-slate-600 sm:text-lg">{lesson.note}</p>
        )}
      </div>
      <SoundButton size="lg" onPlay={() => void speakCharacter(lesson)} />
    </div>
  );
}
