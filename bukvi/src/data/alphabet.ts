import type { CharacterLesson } from "@/lib/types";
import { phrases } from "@/content/phrases";
import { letterTemplates } from "./strokeTemplates/letters";
import { letterWords } from "./words";

/** Българската азбука — точно 30 букви, в този ред. */
export const ALPHABET = [
  "А", "Б", "В", "Г", "Д", "Е", "Ж", "З", "И", "Й",
  "К", "Л", "М", "Н", "О", "П", "Р", "С", "Т", "У",
  "Ф", "Х", "Ц", "Ч", "Ш", "Щ", "Ъ", "Ь", "Ю", "Я",
] as const;

// Латински slug-ове за адресите (/practice/zh), за да няма кирилица в имената на файловете.
const SLUGS: Record<string, string> = {
  А: "a", Б: "b", В: "v", Г: "g", Д: "d", Е: "e", Ж: "zh", З: "z", И: "i", Й: "iy",
  К: "k", Л: "l", М: "m", Н: "n", О: "o", П: "p", Р: "r", С: "s", Т: "t", У: "u",
  Ф: "f", Х: "h", Ц: "ts", Ч: "ch", Ш: "sh", Щ: "sht", Ъ: "er", Ь: "yer", Ю: "yu", Я: "ya",
};

export const letterLessons: CharacterLesson[] = ALPHABET.map((character) => {
  const w = letterWords[character];
  return {
    id: SLUGS[character],
    character,
    type: "letter",
    spokenName: w.spokenName,
    spokenText: phrases.letterIntro(w.spokenName, w.word),
    exampleWord: w.word,
    exampleImage: w.image,
    note: w.note,
    templates: letterTemplates[character],
  };
});
