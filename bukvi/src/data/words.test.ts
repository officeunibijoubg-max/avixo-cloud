import { describe, expect, it } from "vitest";
import { letterLessons } from "./alphabet";
import { phrases } from "@/content/phrases";

describe("текстове за синтезатора на говор", () => {
  // Срички като „Бъ“ гласовете спелуват буква по буква и казват „ъ“ като „ер малък“.
  const badSyllable = /(^|[\s.,!?])[бвгджзклмнпрстфхцчшщ]ъ(?=$|[\s.,!?])/iu;

  it("няма самостоятелни срички съгласна + ъ", () => {
    for (const l of letterLessons) {
      const texts = [l.spokenText, phrases.writeLetter(l.spokenName), phrases.correctFor("letter", l.spokenName)];
      for (const t of texts) expect(t, l.character).not.toMatch(badSyllable);
    }
  });

  it("Ъ не се казва сама (гласовете я четат като „ер малък“)", () => {
    for (const l of letterLessons) expect(l.spokenName.trim(), l.character).not.toBe("Ъ");
  });
});
