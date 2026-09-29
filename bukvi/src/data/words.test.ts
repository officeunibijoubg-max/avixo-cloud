import { describe, expect, it } from "vitest";
import { ALPHABET, letterLessons } from "./alphabet";
import { WORD_ITEMS } from "./wordsIsland";
import { READING_WORDS } from "./readingWords";
import { SOUND_WORDS, hasClearLastSound } from "./soundWords";
import { numberLessons } from "./numbers";
import { prepareForTts } from "@/services/speech";
import { hasIllustration } from "@/components/illustrations/Illustration";

describe("илюстрациите", () => {
  it("всяка буква и цифра има собствена илюстрация (не системно емоджи)", () => {
    for (const l of [...letterLessons, ...numberLessons])
      expect(hasIllustration(l.exampleImage) || l.exampleImage === "lion", `${l.character}: ${l.exampleImage}`).toBe(true);
    for (const w of WORD_ITEMS.filter((x) => x.image)) expect(hasIllustration(w.image), w.text).toBe(true);
  });

  it("думите от Острова са само от букви от Гората (А–П)", () => {
    const forest = new Set(ALPHABET.slice(0, 16));
    for (const w of WORD_ITEMS) for (const c of w.text) expect(forest.has(c as never), `${w.text}: ${c}`).toBe(true);
  });
});

describe("думите за четене и звуков анализ", () => {
  it("сричките образуват точно думата и има картинка", () => {
    for (const w of READING_WORDS) {
      expect(w.syllables.join(""), w.word).toBe(w.word);
      expect(hasIllustration(w.image), w.word).toBe(true);
    }
  });

  it("думите за „последния звук“ не завършват на звучна съгласна", () => {
    for (const w of SOUND_WORDS.filter(hasClearLastSound)) expect("бвгджз").not.toContain(w.word.at(-1));
    expect(SOUND_WORDS.filter(hasClearLastSound).length).toBeGreaterThan(15);
  });
});

describe("звуковете на буквите", () => {
  it("съгласните се учат като звук: Бъ, Въ, Жъ…", () => {
    const vowels = ["А", "Е", "И", "О", "У", "Ю", "Я"];
    for (const l of letterLessons) {
      if (vowels.includes(l.character) || ["Й", "Ъ", "Ь"].includes(l.character)) continue;
      expect(l.spokenName, l.character).toBe(`${l.character}ъ`);
    }
  });

  it("пренаписва само самостоятелните звукове, не думите", () => {
    const text = "Бъ. Бъ като балон. Напиши буквата Ъ, като в ъгъл.";
    expect(prepareForTts(text, "plain")).toBe(text);
    expect(prepareForTts(text, "lower")).toBe("бъ. бъ като балон. Напиши буквата ъ, като в ъгъл.");
    expect(prepareForTts(text, "double")).toBe("бъъ. бъъ като балон. Напиши буквата ъъ, като в ъгъл.");
    expect(prepareForTts("Жъ.", "accent")).toBe("жъ̀.");
    expect(prepareForTts("чадър, гъба, лъв", "double")).toBe("чадър, гъба, лъв");
  });
});
