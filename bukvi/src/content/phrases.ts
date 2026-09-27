// Всички фрази, които детето вижда или чува, са на едно място.
// Компонентите никога не пишат текст директно — само вземат оттук.

const pick = <T,>(list: readonly T[]): T => list[Math.floor(Math.random() * list.length)];

export const phrases = {
  // Урок
  // Изговаряме името на буквата и в двете части — синтезаторът чете самотна „Б“ като „бе“.
  letterIntro: (spoken: string, word?: string) =>
    word ? `${spoken}. ${spoken} като ${word}.` : `${spoken}.`,
  numberIntro: (name: string) => `${name}.`,
  writeLetter: (spoken: string) => `Напиши буквата ${spoken}.`,
  writeNumber: (char: string) => `Напиши числото ${char}.`,
  /** „А като “ — думата след него се оцветява отделно. */
  asPrefix: (char: string) => `${char} като `,

  // Обратна връзка
  correctFor: (kind: "letter" | "number", spoken: string) =>
    kind === "letter" ? `Браво! Това е буквата ${spoken}!` : `Браво! Това е числото ${spoken}!`,
  praise: () => pick(["Браво!", "Страхотно!", "Супер!", "Много добре!", "Отлично!"] as const),
  almost: "Почти! Опитай още веднъж.",
  encourage: () => pick(["Опитай пак.", "Почти успя!", "Можеш го!"] as const),
  hintFollow: "Следвай звездичката.",
  hintWatch: "Гледай как се пише.",
  tooLittle: "Напиши цялата буква.",
  starEarned: "Спечели звезда!",
  rewardUnlocked: (name: string) => `Нова награда: ${name}!`,

  // Маскот
  greeting: (name: string) => `Здравей! Аз съм ${name}. Хайде да играем!`,
  pickLetter: "Избери буква!",
  pickNumber: "Избери цифра!",
  pickGame: "На какво ще играем?",

  // Игри
  findLetter: (spoken: string) => `Намери буквата ${spoken}.`,
  findNumber: (name: string) => `Намери числото ${name}.`,
  startsWith: (word: string) => `${word}. С коя буква започва ${word}?`,
  startsWithQuestion: (word: string) => `С коя буква започва ${word}?`,
  popBalloon: (spoken: string) => `Спукай балона с буквата ${spoken}.`,
  listenWrite: (spoken: string) => `Напиши буквата ${spoken}.`,
  countThem: "Колко са? Напиши числото.",
  wrongChoice: "Опитай пак!",
  gameOver: "Край на играта! Браво!",
} as const;

/** Кратките надписи под полето за писане (показват се, а не се изговарят). */
export const feedbackLabels = {
  excellent: "Отлично! ⭐",
  correct: "Браво! ⭐",
  almost: "Почти! Опитай пак.",
  retry: "Опитай пак.",
  hint: "Следвай звездичката.",
} as const;

export const ui = {
  menu: {
    letters: "Уча букви",
    numbers: "Уча цифри",
    play: "Играй",
    rewards: "Моите награди",
    parents: "За родители",
    settings: "Настройки",
  },
  clear: "Изчисти",
  check: "Готово",
  next: "Следваща",
  listen: "Чуй",
  back: "Назад",
  home: "Начало",
  again: "Пак",
  points: "точки",
  stars: "звезди",
  level: "Ниво",
  streak: "поредни",
  write: "Напиши",
  showMe: "Покажи ми",
} as const;
