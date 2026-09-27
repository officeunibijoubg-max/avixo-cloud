import type { CharacterLesson } from "@/lib/types";
import { phrases } from "@/content/phrases";
import { numberTemplates } from "./strokeTemplates/numbers";
import { numberWords } from "./words";

export const DIGITS = ["0", "1", "2", "3", "4", "5", "6", "7", "8", "9"] as const;

export const numberLessons: CharacterLesson[] = DIGITS.map((character) => {
  const w = numberWords[character];
  return {
    id: character,
    character,
    type: "number",
    spokenName: w.name,
    spokenText: phrases.numberIntro(w.name),
    exampleImage: w.image,
    count: Number(character),
    templates: numberTemplates[character],
  };
});
