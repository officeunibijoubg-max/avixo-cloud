import { letterLessons } from "./alphabet";
import { WORD_ITEMS } from "./wordsIsland";

// Думи с картинки за звуковия анализ („Кой е първият/последният звук?“).

export type SoundWord = { word: string; image: string };

// Звучните съгласни в края на думата се изговарят беззвучно („хляб“ звучи „хляп“),
// затова такива думи не се ползват за въпроса за последния звук.
const DEVOICED_AT_END = new Set(["б", "в", "г", "д", "ж", "з"]);

export const SOUND_WORDS: SoundWord[] = [
  ...letterLessons.filter((l) => l.exampleWord && l.exampleImage).map((l) => ({ word: l.exampleWord as string, image: l.exampleImage as string })),
  ...WORD_ITEMS.filter((w) => w.kind === "word" && w.image).map((w) => ({ word: w.spoken, image: w.image as string })),
]
  // Без дублирани думи и без тирета (йо-йо).
  .filter((w, i, all) => !w.word.includes("-") && all.findIndex((x) => x.word === w.word) === i);

export const firstSound = (w: SoundWord) => w.word[0].toUpperCase();
export const lastSound = (w: SoundWord) => w.word[w.word.length - 1].toUpperCase();
export const hasClearLastSound = (w: SoundWord) => !DEVOICED_AT_END.has(w.word[w.word.length - 1]);
