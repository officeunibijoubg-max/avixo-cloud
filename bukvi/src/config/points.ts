// Монети за писане и игри. Никога не отнемаме монети за грешка.
export const POINTS = {
  firstTry: 10,
  secondTry: 8,
  afterHint: 5,
  miniGameCorrect: 5,
  /** Бонус за цяла сричка/дума (отделно от монетите за всяка буква). */
  wordComplete: 15,
  /** Бонус за завършено Днешно приключение (заедно със стикер). */
  adventureBonus: 20,
  /** Кога се показва подсказка със звездичка и кога — пълна анимация. */
  hintAfterFails: 2,
  demoAfterFails: 3,
} as const;
