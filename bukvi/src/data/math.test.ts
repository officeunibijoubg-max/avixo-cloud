import { describe, expect, it } from "vitest";
import { addRound, compareRound, numberOptions, subRound } from "./math";

describe("задачите с числа", () => {
  it("са винаги в рамките на 10 и с верен отговор сред вариантите", () => {
    for (let i = 0; i < 300; i++) {
      const add = addRound();
      expect(add.a + add.b).toBe(add.answer);
      expect(add.answer).toBeLessThanOrEqual(10);
      expect(Math.min(add.a, add.b)).toBeGreaterThanOrEqual(1);
      const sub = subRound();
      expect(sub.a - sub.b).toBe(sub.answer);
      expect(sub.answer).toBeGreaterThanOrEqual(0);
      expect(sub.a).toBeLessThanOrEqual(10);
      const c = compareRound();
      expect(c.a).not.toBe(c.b);
      const opts = numberOptions(add.answer);
      expect(opts).toContain(add.answer);
      expect(new Set(opts).size).toBe(opts.length);
      expect(opts.length).toBeGreaterThanOrEqual(2);
    }
  });
});
