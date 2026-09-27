import { describe, expect, it } from "vitest";
import { emptyProgress, pointsForAttempt, recordGameAnswer, recordWriting } from "./progress";
import { POINTS } from "@/config/points";

describe("точки и награди", () => {
  it("точки според опита", () => {
    expect(pointsForAttempt(1, false)).toBe(POINTS.firstTry);
    expect(pointsForAttempt(2, false)).toBe(POINTS.secondTry);
    expect(pointsForAttempt(3, true)).toBe(POINTS.afterHint);
  });

  it("грешен опит не отнема точки, но нулира поредицата", () => {
    let p = recordWriting(emptyProgress(), "А", 90, true, 10).progress;
    const before = p.totalPoints;
    p = recordWriting(p, "А", 30, false, 0).progress;
    expect(p.totalPoints).toBe(before);
    expect(p.streak).toBe(0);
    expect(p.characters["А"]).toMatchObject({ attempts: 2, correct: 1, bestScore: 90, lastScore: 30 });
  });

  it("звезда на 50 точки и награда на 5 звезди", () => {
    let p = emptyProgress();
    let starsGained = 0;
    let rewards = 0;
    for (let i = 0; i < 25; i++) {
      const r = recordWriting(p, "О", 95, true, 10);
      p = r.progress;
      starsGained += r.delta.starsGained;
      rewards += r.delta.newRewards.length;
    }
    expect(p.totalPoints).toBe(250);
    expect(p.stars).toBe(5);
    expect(starsGained).toBe(5);
    expect(rewards).toBe(1);
    expect(p.unlockedRewards).toHaveLength(1);
    expect(p.characters["О"].mastered).toBe(true);
  });

  it("минигра: +5 при верен избор", () => {
    const r = recordGameAnswer(emptyProgress(), true);
    expect(r.delta.points).toBe(POINTS.miniGameCorrect);
    expect(recordGameAnswer(emptyProgress(), false).delta.points).toBe(0);
  });
});
