import type { Difficulty } from "@/lib/types";

// Всички прагове на оценяването — сменят се тук, без да се пипа алгоритъмът.
// Разстоянията са в единици на шаблона (квадратът е 100×100).

export const GRADE_THRESHOLDS = {
  excellent: 85,
  correct: 70,
  almost: 55,
} as const;

export type ToleranceConfig = {
  /** До това разстояние точката се брои за напълно попаднала. */
  near: number;
  /** След това разстояние — изобщо не. Между двете кредитът намалява линейно. */
  far: number;
  /** Колко тежи правилната посока на движенията (0..1 от общата оценка). */
  directionWeight: number;
  /** Под колко точки опитът не е верен. */
  passScore: number;
  /**
   * Оценява ли се спрямо мястото на шаблона на екрана. При "hard" детето
   * пише без помощ, затова се сравнява само формата.
   */
  usePosition: boolean;
};

export const TOLERANCE: Record<Difficulty, ToleranceConfig> = {
  easy: { near: 7, far: 16, directionWeight: 0.06, passScore: 65, usePosition: true },
  normal: { near: 6, far: 13, directionWeight: 0.1, passScore: 70, usePosition: true },
  hard: { near: 6, far: 13, directionWeight: 0.12, passScore: 70, usePosition: false },
};

export const SCORING = {
  /** Разстояние между точките след resample. */
  sampleStep: 2,
  /** Близки точки под това разстояние се премахват. */
  minPointGap: 0.8,
  /** Дължина на парчетата, на които се проверява покритието на шаблона. */
  partLength: 10,
  /** Ако някое парче от шаблона е покрито под този дял, оценката пада рязко. */
  strokeCoverageKnee: 0.5,
  /** Същото за дела на мастилото, попаднал в шаблона (драскане извън буквата). */
  precisionKnee: 0.8,
  /** Ако някое парче от мастилото е толкова далеч от шаблона, има излишно движение. */
  inkPartKnee: 0.35,
  /** Минимум мастило спрямо дължината на шаблона. */
  minInkRatio: 0.35,
  /** Над толкова пъти дължината на шаблона вече е драскане. */
  maxInkRatio: 2.5,
  /** Минимален размер на рисунката (в единици), за да не се оценяват точки. */
  minDrawingSize: 18,
} as const;
