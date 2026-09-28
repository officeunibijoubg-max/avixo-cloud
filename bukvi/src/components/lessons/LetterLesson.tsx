"use client";

import type { CharacterLesson } from "@/lib/types";
import { phrases } from "@/content/phrases";
import { speakCharacter } from "@/services/speech";
import { SoundButton } from "@/components/game/SoundButton";
import { Illustration } from "@/components/illustrations/Illustration";

/** Горната част на урока за буква: буквата, „А като Автобус“, картинка и 🔊. */
export function LetterLesson({ lesson }: { lesson: CharacterLesson }) {
  const word = lesson.exampleWord;
  return (
    <div className="card-soft flex items-center gap-4 rounded-[2rem] bg-white/80 p-4 shadow-md lg:flex-col lg:p-6">
      <div className="flex size-28 shrink-0 items-center justify-center rounded-3xl bg-violet-200 text-8xl font-black text-violet-700 sm:size-32 lg:size-44 lg:text-[8rem]">
        {lesson.character}
      </div>
      <div className="flex flex-1 flex-col items-center gap-2 text-center">
        <Illustration name={lesson.exampleImage} size={112} />
        {word ? (
          <p className="text-2xl font-extrabold sm:text-3xl">
            {phrases.asPrefix(lesson.character)}
            <span className="text-violet-600">
              <span className="underline decoration-4 underline-offset-4">{word[0].toUpperCase()}</span>
              {word.slice(1)}
            </span>
          </p>
        ) : (
          <p className="text-3xl font-extrabold tracking-wide">
            {/* Буквата в думата е оцветена: „сиНЬо“. */}
            {(lesson.inWord ?? "").split("").map((ch, i) => (
              <span key={i} className={ch.toUpperCase() === lesson.character ? "text-violet-600 underline decoration-4 underline-offset-4" : undefined}>
                {ch}
              </span>
            ))}
          </p>
        )}
      </div>
      <SoundButton size="lg" onPlay={() => void speakCharacter(lesson)} />
    </div>
  );
}
