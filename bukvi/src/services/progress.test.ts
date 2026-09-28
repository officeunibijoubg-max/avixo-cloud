import { describe, expect, it } from "vitest";
import {
  buyItem,
  completeAdventure,
  emptyProgress,
  levelOf,
  migrateProgress,
  pointsForAttempt,
  recordGameAnswer,
  recordWriting,
  starsFor,
  totalStars,
} from "./progress";
import { isCharacterUnlocked, isWorldUnlocked, pickAdventureLetter } from "./adventure";
import { WORLDS } from "@/data/adventure";
import { POINTS } from "@/config/points";

const write = (p = emptyProgress(), c: string, score = 90, ok = true) => recordWriting(p, c, score, ok, 10).progress;

describe("монети", () => {
  it("според опита", () => {
    expect(pointsForAttempt(1, false)).toBe(POINTS.firstTry);
    expect(pointsForAttempt(2, false)).toBe(POINTS.secondTry);
    expect(pointsForAttempt(3, true)).toBe(POINTS.afterHint);
  });

  it("грешка не отнема монети, но нулира поредицата", () => {
    let p = write(undefined, "А");
    p = recordWriting(p, "А", 30, false, 0).progress;
    expect(p.coins).toBe(10);
    expect(p.streak).toBe(0);
    expect(p.characters["А"]).toMatchObject({ attempts: 2, correct: 1, bestScore: 90, lastScore: 30 });
  });

  it("минигра: +5 при верен избор", () => {
    expect(recordGameAnswer(emptyProgress(), true).progress.coins).toBe(POINTS.miniGameCorrect);
    expect(recordGameAnswer(emptyProgress(), false).progress.coins).toBe(0);
  });
});

describe("звезди = колко добре е усвоен урокът", () => {
  it("1⭐ от първото вярно, 3⭐ след три отлични", () => {
    let p = write(undefined, "О", 72);
    expect(starsFor(p, "О")).toBe(1);
    p = write(p, "О", 80);
    expect(starsFor(p, "О")).toBe(2);
    const r = recordWriting(p, "О", 95, true, 10);
    expect(starsFor(r.progress, "О")).toBe(3);
    expect(r.delta.starsGained).toBe(1);
    expect(totalStars(r.progress)).toBe(3);
  });
});

describe("ниво и отключване", () => {
  it("ниво расте, когато цяла група има звезди", () => {
    let p = emptyProgress();
    expect(levelOf(p)).toBe(1);
    for (const c of ["0", "1", "2"]) p = write(p, c);
    expect(levelOf(p)).toBe(1);
    const r = recordWriting(p, "3", 90, true, 10);
    expect(levelOf(r.progress)).toBe(2);
    expect(r.delta.levelUp).toBe(2);
  });

  it("буквите се отключват подред, планината — след гората", () => {
    let p = emptyProgress();
    expect(isCharacterUnlocked(p, "А")).toBe(true);
    expect(isCharacterUnlocked(p, "Б")).toBe(false);
    p = write(p, "А");
    expect(isCharacterUnlocked(p, "Б")).toBe(true);
    const mountain = WORLDS.find((w) => w.id === "mountain")!;
    expect(isWorldUnlocked(p, mountain)).toBe(false);
    for (const c of WORLDS.find((w) => w.id === "forest")!.characters) p = write(p, c);
    expect(isWorldUnlocked(p, mountain)).toBe(true);
    expect(isCharacterUnlocked(emptyProgress(), "Я", true)).toBe(true);
  });

  it("Днешното приключение взима следващата нова буква", () => {
    let p = emptyProgress();
    expect(pickAdventureLetter(p)).toBe("А");
    p = write(p, "А");
    expect(pickAdventureLetter(p)).toBe("Б");
  });
});

describe("магазин и стикери", () => {
  it("купуване: само с достатъчно монети, веднъж, и веднага се слага", () => {
    let p = emptyProgress();
    expect(buyItem(p, "acc-glasses")).toEqual({ ok: false, reason: "coins" });
    p = { ...p, coins: 50 };
    const r = buyItem(p, "acc-glasses");
    expect(r.ok).toBe(true);
    if (!r.ok) return;
    expect(r.progress.coins).toBe(30);
    expect(r.progress.equipped.accessory).toBe("acc-glasses");
    expect(buyItem(r.progress, "acc-glasses")).toEqual({ ok: false, reason: "owned" });
  });

  it("приключението дава нов стикер и бонус", () => {
    const a = completeAdventure(emptyProgress(), "2026-09-28");
    const b = completeAdventure(a.progress, "2026-09-29");
    expect(a.delta.sticker).toBeTruthy();
    expect(b.delta.sticker).not.toBe(a.delta.sticker);
    expect(b.progress.coins).toBe(POINTS.adventureBonus * 2);
    expect(b.progress.adventuresDone).toEqual(["2026-09-28", "2026-09-29"]);
  });

  it("старият прогрес (точки) става монети", () => {
    const p = migrateProgress({ totalPoints: 120, stars: 2, level: 2, unlockedRewards: [], characters: {} });
    expect(p.coins).toBe(120);
    expect("totalPoints" in p).toBe(false);
  });
});
