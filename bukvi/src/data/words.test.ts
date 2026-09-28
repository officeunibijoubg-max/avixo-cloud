import { describe, expect, it } from "vitest";
import { letterLessons } from "./alphabet";
import { numberLessons } from "./numbers";
import { prepareForTts } from "@/services/speech";
import { hasIllustration } from "@/components/illustrations/Illustration";

describe("илюстрациите", () => {
  it("всяка буква и цифра има собствена илюстрация (не системно емоджи)", () => {
    for (const l of [...letterLessons, ...numberLessons])
      expect(hasIllustration(l.exampleImage) || l.exampleImage === "lion", `${l.character}: ${l.exampleImage}`).toBe(true);
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
