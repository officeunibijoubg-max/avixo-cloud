import type { TtsSpelling } from "@/config/speech";
import type { ChallengeMetric } from "@/config/challenges";

// Общи типове за уроците, шаблоните, оценяването и прогреса.

/** Точка в координатите на шаблона: квадрат 0..100 × 0..100, y расте надолу. */
export type Point = { x: number; y: number };

export type Stroke = Point[];

export type StrokeTemplate = {
  /** Движенията в правилния ред и посока. */
  strokes: Stroke[];
};

export type CharacterType = "letter" | "number" | "shape";

export type CharacterLesson = {
  /** Латински slug за URL адреса, напр. "zh" за Ж, "3" за 3. */
  id: string;
  character: string;
  type: CharacterType;
  /** Как да прозвучи самият символ, напр. "Бъ" или "Три". */
  spokenName: string;
  /** Пълната фраза в урока, напр. „Б. Б като балон.“ */
  spokenText: string;
  exampleWord?: string;
  /** Емоджи или път към картинка. */
  exampleImage?: string;
  /** За цифрите — колко предмета да покажем. */
  count?: number;
  /** Кратка дума, в която се вижда буквата (за Ь, с която не започва дума). */
  inWord?: string;
  /** Малка буква (а, б, в…). */
  lowercase?: boolean;
  templates: StrokeTemplate[];
};

export type Difficulty = "easy" | "normal" | "hard";

export type ScoreGrade = "excellent" | "correct" | "almost" | "retry";

export type WritingResult = {
  score: number;
  isCorrect: boolean;
  grade: ScoreGrade;
  attempt: number;
  strokeCount: number;
};

export type CharacterProgress = {
  character: string;
  attempts: number;
  correct: number;
  bestScore: number;
  lastScore: number;
  mastered: boolean;
  /** Денят на последното вярно изписване — за повторението през дни. */
  lastDay?: string;
  /** Денят на първото вярно изписване — „ново тази седмица“ в отчета. */
  firstDay?: string;
};

/** Какво е облечено на героя (по едно на място) и избраният фон. `accessory` е от старата версия. */
export type Equipped = {
  head?: string;
  face?: string;
  neck?: string;
  back?: string;
  hand?: string;
  background?: string;
  accessory?: string;
};

export type PlayerProgress = {
  /** Монети за харчене в магазина (печелят се от писане и игри). */
  coins: number;
  /** Всички спечелени монети досега — не намалява при покупка. */
  coinsEarned: number;
  streak: number;
  bestStreak: number;
  characters: Record<string, CharacterProgress>;
  /** Броим упражненията и минигрите за родителския екран. */
  exercises: number;
  gamesPlayed: number;
  /** Колко пъти е изиграна всяка игра/приказка (ид → брой) — за стъпките от пътя. */
  played: Record<string, number>;
  /** Купени предмети от магазина (ид-та от data/shop.ts). */
  owned: string[];
  /** Какво е облечено/сложено в момента. */
  equipped: Equipped;
  /** Спечелени стикери (от Днешно приключение). */
  stickers: string[];
  /** Секунди активна игра за деня: "2026-09-28" → секунди. */
  playSeconds: Record<string, number>;
  /** Дни, в които е завършено Днешното приключение. */
  adventuresDone: string[];
  /** Броячите за Предизвикателството на деня (нулират се всеки ден). */
  daily: { day: string; challengeId?: string; counts: Partial<Record<ChallengeMetric, number>> };
  /** Дни с изпълнено предизвикателство — от тях се смята поредицата 🔥. */
  challengeDays: string[];
  /** Отключени игри, за които детето вече е видяло картата „Отключи нова игра!“. */
  seenUnlocks: string[];
};

export type Settings = {
  sound: boolean;
  speech: boolean;
  music: boolean;
  volume: number;
  highContrast: boolean;
  largeUI: boolean;
  reduceMotion: boolean;
  difficulty: Difficulty;
  /** Светлият шаблон на буквата в лесен/нормален режим. */
  showGuide: boolean;
  /** Родителят може да отключи всички точки от картата. */
  unlockAll: boolean;
  /** Ключ от config/mascot.ts. */
  mascot: string;
  /** Как звуците на буквите („Бъ“) се подават на синтезатора — зависи от устройството. */
  ttsSpelling: TtsSpelling;
};
