import { describe, expect, it } from "vitest";
import {
  buyItem,
  challengeCount,
  challengeFor,
  completeAdventure,
  dayStreak,
  emptyProgress,
  levelOf,
  migrateProgress,
  pointsForAttempt,
  recordGameAnswer,
  recordWriting,
  starsFor,
  totalStars,
} from "./progress";
import { isCharacterUnlocked, isWorldUnlocked, pickAdventureLetter, reviewDue } from "./adventure";
import { WORLDS } from "@/data/adventure";
import { POINTS } from "@/config/points";
import { CHALLENGE_BONUS } from "@/config/challenges";

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

  it("буквите се отварят в реда на буквара; урокът взима текущата", () => {
    let p = emptyProgress();
    for (const id of ["rain", "road", "circle"]) p = write(p, `фигура-${id}`);
    expect(isCharacterUnlocked(p, "А")).toBe(true);
    expect(isCharacterUnlocked(p, "О")).toBe(false);
    expect(isCharacterUnlocked(p, "Б")).toBe(false);
    expect(pickAdventureLetter(p)).toBe("А");
    p = write(p, "А");
    expect(isCharacterUnlocked(p, "О")).toBe(true);
    expect(pickAdventureLetter(p)).toBe("О");
    expect(isCharacterUnlocked(emptyProgress(), "Я", true)).toBe(true);
  });
});

describe("предизвикателство на деня", () => {
  // Намираме ден, в който предизвикателството е „напиши N букви“.
  const letterDay = (() => {
    for (let i = 0; i < 14; i++) {
      const d = `2026-10-${String(1 + i).padStart(2, "0")}`;
      if (challengeFor(d).metric === "letters") return d;
    }
    throw new Error("няма ден с букви");
  })();

  it("брои верните букви и дава бонуса веднъж", () => {
    const goal = challengeFor(letterDay).goal;
    let p = emptyProgress();
    let done = 0;
    for (let i = 0; i < goal + 2; i++) {
      const r = recordWriting(p, "А", 90, true, 10, letterDay);
      p = r.progress;
      if (r.delta.challengeDone) done += 1;
    }
    expect(done).toBe(1);
    expect(challengeCount(p, letterDay)).toBe(goal + 2);
    expect(p.coins).toBe((goal + 2) * 10 + CHALLENGE_BONUS);
    expect(p.challengeDays).toEqual([letterDay]);
  });

  it("грешки и цифри не се броят за букви", () => {
    let p = recordWriting(emptyProgress(), "А", 20, false, 0, letterDay).progress;
    p = recordWriting(p, "3", 90, true, 10, letterDay).progress;
    expect(challengeCount(p, letterDay)).toBe(0);
  });

  it("поредицата от дни се прекъсва при пропуснат ден", () => {
    const p = { ...emptyProgress(), challengeDays: ["2026-10-01", "2026-10-02", "2026-10-03", "2026-10-05"] };
    expect(dayStreak(p, "2026-10-03")).toBe(3);
    expect(dayStreak(p, "2026-10-04")).toBe(3); // днес още не е изпълнено — броим до вчера
    expect(dayStreak(p, "2026-10-05")).toBe(1);
    expect(dayStreak(p, "2026-10-07")).toBe(0);
  });
});

describe("пътят на обучение", () => {
  it("отваря само една нова стъпка наведнъж, по ред", async () => {
    const { isFeatureUnlocked } = await import("./unlocks");
    const { currentStep, isReached } = await import("./path");
    const numbers = WORLDS.find((w) => w.id === "numbers")!;
    let p = emptyProgress();
    // Начало: първата чертичка; нищо друго не е отворено.
    expect(currentStep(p)).toEqual({ kind: "shape", id: "rain" });
    expect(isReached(p, "char:А")).toBe(false);
    expect(isFeatureUnlocked(p, "shapes")).toBe(false);
    for (const id of ["rain", "road", "circle"]) p = write(p, `фигура-${id}`);
    expect(currentStep(p)).toEqual({ kind: "char", char: "А" });
    p = write(p, "А");
    expect(currentStep(p)).toEqual({ kind: "char", char: "О" });
    p = write(p, "О");
    // След О идва игра „Форми“ — отворена е, а следващата буква още не.
    expect(currentStep(p)).toEqual({ kind: "game", id: "shapes" });
    expect(isFeatureUnlocked(p, "shapes")).toBe(true);
    expect(isReached(p, "char:У")).toBe(false);
    expect(isWorldUnlocked(p, numbers)).toBe(false);
    p = { ...p, played: { shapes: 1 } };
    p = write(p, "У");
    expect(currentStep(p)).toEqual({ kind: "char", char: "1" });
    expect(isWorldUnlocked(p, numbers)).toBe(true);
    expect(isFeatureUnlocked(p, "find-letter")).toBe(false);
    expect(isFeatureUnlocked(emptyProgress(), "read-word", true)).toBe(true);
  });

  it("думите, приказките и игрите идват след буквите, които им трябват", async () => {
    const { PATH } = await import("@/data/path");
    const { STORIES } = await import("@/content/stories");
    const { FEATURES } = await import("@/data/unlocks");
    const known = new Set<string>();
    for (const s of PATH) {
      if (s.kind === "char") known.add(s.char);
      if (s.kind === "word") for (const c of s.text) expect(known.has(c), `${s.text}: ${c}`).toBe(true);
      if (s.kind === "story") expect(known.has(STORIES.find((x) => x.id === s.id)!.letter), s.id).toBe(true);
    }
    // Всяка игра и приказка е на пътя точно веднъж.
    const keys = PATH.map((s) => (s.kind === "game" || s.kind === "story" ? `${s.kind}:${s.id}` : ""));
    for (const f of FEATURES.filter((x) => x.id !== "stories")) expect(keys.filter((k) => k === `game:${f.id}`).length, f.id).toBe(1);
    for (const st of STORIES) expect(keys.filter((k) => k === `story:${st.id}`).length, st.id).toBe(1);
    // Всички 30 главни, 30 малки букви и 10 цифри са на пътя.
    expect(PATH.filter((s) => s.kind === "char").length).toBe(70);
  });

  it("предизвикателството на деня не дава задача за заключени неща", () => {
    const p = emptyProgress();
    for (let i = 1; i <= 14; i++) {
      const c = challengeFor(`2026-10-${String(i).padStart(2, "0")}`, p);
      expect(["letters", "adventure"]).toContain(c.metric);
    }
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
    expect(r.progress.equipped.face).toBe("acc-glasses");
    expect(buyItem(r.progress, "acc-glasses")).toEqual({ ok: false, reason: "owned" });
  });

  it("приключението дава нов стикер и бонус", () => {
    const a = completeAdventure(emptyProgress(), "2026-09-28");
    const b = completeAdventure(a.progress, "2026-09-29");
    expect(a.delta.sticker).toBeTruthy();
    expect(b.delta.sticker).not.toBe(a.delta.sticker);
    // Ако в някой от дните предизвикателството е „мини приключението“, идва и неговият бонус.
    const challengeBonus = [a, b].filter((r) => r.delta.challengeDone).length * CHALLENGE_BONUS;
    expect(b.progress.coins).toBe(POINTS.adventureBonus * 2 + challengeBonus);
    expect(b.progress.adventuresDone).toEqual(["2026-09-28", "2026-09-29"]);
  });

  it("старият прогрес (точки) става монети", () => {
    const p = migrateProgress({ totalPoints: 120, stars: 2, level: 2, unlockedRewards: [], characters: {} });
    expect(p.coins).toBe(120);
    expect("totalPoints" in p).toBe(false);
  });
});

describe("повторение през дни", () => {
  it("връща се към буква след 1 ден при 1⭐ и не пита за днешни", () => {
    let p = recordWriting(emptyProgress(), "А", 90, true, 1, "2026-10-01").progress;
    expect(p.characters["А"].lastDay).toBe("2026-10-01");
    expect(reviewDue(p, "2026-10-01")).toBeNull();
    expect(reviewDue(p, "2026-10-02")).toBe("А");
    expect(reviewDue(p, "2026-10-02", "А")).toBeNull();
    // По-просроченият е пръв.
    p = recordWriting(p, "Б", 90, true, 1, "2026-10-05").progress;
    expect(reviewDue(p, "2026-10-06")).toBe("А");
  });

  it("формите не се броят в предизвикателството", () => {
    const p = recordWriting(emptyProgress(), "фигура-circle", 90, true, 1, "2026-10-01").progress;
    expect(p.daily.counts.words ?? 0).toBe(0);
  });
});

describe("седмичен отчет", () => {
  it("брои новите и упражняваните символи за 7 дни и дава идея без екран", async () => {
    const { weeklyReport } = await import("./report");
    let p = recordWriting(emptyProgress(), "А", 90, true, 1, "2026-09-01").progress;
    p = recordWriting(p, "А", 90, true, 1, "2026-10-06").progress;
    p = recordWriting(p, "Б", 90, true, 1, "2026-10-07").progress;
    const r = weeklyReport(p, "2026-10-08");
    expect(r.learned).toEqual(["Б"]);
    expect(r.practiced.sort()).toEqual(["А", "Б"]);
    expect(r.idea).toMatch(/Б|балон/);
  });
});

describe("облекло на героя", () => {
  it("всяко нещо отива на своето място и няколко се носят наведнъж", async () => {
    const { toggleEquip, migrateEquipped } = await import("./progress");
    let p = { ...emptyProgress(), coins: 500 };
    for (const id of ["acc-crown", "acc-glasses", "acc-balloon"]) {
      const r = buyItem(p, id);
      if (r.ok) p = r.progress;
    }
    expect(p.equipped).toMatchObject({ head: "acc-crown", face: "acc-glasses", hand: "acc-balloon" });
    p = toggleEquip(p, "acc-crown");
    expect(p.equipped.head).toBeUndefined();
    expect(p.equipped.face).toBe("acc-glasses");
    // Старият запис с един „accessory“ се пренася на мястото му.
    const old = { ...emptyProgress(), owned: ["acc-crown"], equipped: { accessory: "acc-crown" } };
    expect(migrateEquipped(old).equipped).toEqual({ head: "acc-crown", accessory: undefined });
  });

  it("всеки аксесоар има място и рисунка, всеки приятел — герой", async () => {
    const { SHOP_ITEMS } = await import("@/data/shop");
    const { WEAR_ART } = await import("@/components/game/hero/wearables");
    const { SPECIES } = await import("@/components/game/hero/species");
    for (const i of SHOP_ITEMS.filter((x) => x.category === "accessory")) {
      expect(i.slot, i.id).toBeTruthy();
      expect(WEAR_ART[i.id], i.id).toBeTruthy();
    }
    for (const i of SHOP_ITEMS.filter((x) => x.category === "friend")) expect(SPECIES[i.mascot!], i.id).toBeTruthy();
  });
});
