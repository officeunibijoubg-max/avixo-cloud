import { describe, expect, it } from "vitest";
import { LOWERCASE } from "@/data/alphabet";
import { emptyProgress, recordWriting } from "./progress";
import { nameLetters, nameMissing, nameToWrite } from "./name";

const learn = (chars: string[]) => chars.reduce((p, c) => recordWriting(p, c, 90, true, 1).progress, emptyProgress());

describe("Моето име", () => {
  it("взима само българските букви, главни", () => {
    expect(nameLetters("Мария")).toBe("МАРИЯ");
    expect(nameLetters("Ани-Мари 2")).toBe("АНИМАРИ");
    expect(nameLetters("Maria")).toBe("");
  });

  it("казва кои букви от името още липсват", () => {
    expect(nameMissing("Мария", learn(["М", "А"]))).toEqual(["Р", "И", "Я"]);
    expect(nameMissing("Мария", learn(["М", "А", "Р", "И", "Я"]))).toEqual([]);
  });

  it("след малките букви пише „Мария“, преди това „МАРИЯ“", () => {
    expect(nameToWrite("мария", emptyProgress())).toBe("МАРИЯ");
    expect(nameToWrite("мария", learn([...LOWERCASE]))).toBe("Мария");
  });
});
