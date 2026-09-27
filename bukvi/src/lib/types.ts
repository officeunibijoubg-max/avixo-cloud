// Общи типове за уроците, шаблоните, оценяването и прогреса.

/** Точка в координатите на шаблона: квадрат 0..100 × 0..100, y расте надолу. */
export type Point = { x: number; y: number };

export type Stroke = Point[];

export type StrokeTemplate = {
  /** Движенията в правилния ред и посока. */
  strokes: Stroke[];
};

export type CharacterType = "letter" | "number";

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
  /** Кратко обяснение за символи без подходяща дума (Ь). */
  note?: string;
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
};

export type PlayerProgress = {
  totalPoints: number;
  stars: number;
  level: number;
  streak: number;
  bestStreak: number;
  unlockedRewards: string[];
  characters: Record<string, CharacterProgress>;
  /** Броим упражненията и минигрите за родителския екран. */
  exercises: number;
  gamesPlayed: number;
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
  /** Ключ от config/mascot.ts. */
  mascot: string;
};
