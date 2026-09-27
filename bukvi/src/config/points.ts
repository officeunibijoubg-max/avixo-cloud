// Точкова система. Никога не отнемаме точки.
export const POINTS = {
  firstTry: 10,
  secondTry: 8,
  afterHint: 5,
  miniGameCorrect: 5,
  /** На толкова точки — една звезда. */
  pointsPerStar: 50,
  /** На толкова звезди — нова награда. */
  starsPerReward: 5,
  /** Кога се показва подсказка със звездичка и кога — пълна анимация. */
  hintAfterFails: 2,
  demoAfterFails: 3,
  /** Нивото расте на толкова точки. */
  pointsPerLevel: 100,
} as const;
