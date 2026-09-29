// Всички фрази, които детето вижда или чува, са на едно място.
// Компонентите никога не пишат текст директно — само вземат оттук.

const pick = <T,>(list: readonly T[]): T => list[Math.floor(Math.random() * list.length)];

// Случайните похвали — изнесени, за да влязат в списъка за записан глас.
/** Какво казва героят, когато облече нещо. */
export const WEAR_FUN = [
  "Уау! Изглеждам страхотно!",
  "Ха-ха! Колко съм смешен!",
  "Вижте ме! Супер съм!",
  "Много ми харесва! Благодаря!",
  "Сега съм най-модерният!",
] as const;

export const PRAISE = ["Браво!", "Страхотно!", "Супер!", "Много добре!", "Отлично!"] as const;
export const ENCOURAGE = ["Опитай пак.", "Почти успя!", "Можеш го!"] as const;

export const phrases = {
  // Урок
  // Изговаряме звука на буквата и в двете части — синтезаторът чете самотна „Б“ като „бе“.
  letterIntro: (spoken: string, word?: string) =>
    word ? `Това е ${spoken}. ${spoken} като ${word}.` : `Това е ${spoken}.`,
  /** За букви, с които не започва дума (Ь): „Виждаме го в думата синьо.“ */
  letterInWord: (spoken: string, word: string) => `Това е ${spoken}. Виждаме го в думата ${word}.`,
  numberIntro: (name: string) => `Това е ${name.toLowerCase()}.`,
  writeLetter: (spoken: string) => `Напиши буквата ${spoken}.`,
  writeNumber: (char: string) => `Напиши числото ${char}.`,
  traceLetter: (spoken: string) => `Проследи буквата ${spoken}.`,
  writeSmallLetter: (spoken: string) => `Напиши малката буква ${spoken}.`,
  traceSmallLetter: (spoken: string) => `Проследи малката буква ${spoken}.`,
  traceNumber: (name: string) => `Проследи числото ${name.toLowerCase()}.`,
  /** „А като “ — думата след него се оцветява отделно. */
  asPrefix: (char: string) => `${char} като `,

  // Обратна връзка
  correctFor: (kind: "letter" | "number" | "shape", spoken: string) =>
    kind === "shape" ? `Браво! Нарисува ${spoken}!` : `Браво! Написа ${spoken}!`,
  bravoPoints: (coins: number) => `Браво! +${coins} 🪙`,
  praise: () => pick(PRAISE),
  wearFun: () => pick(WEAR_FUN),
  almost: "Почти! Нека опитаме пак.",
  /** Кратко, видимо обяснение къде е грешката. */
  showWhere: "Виж къде излезе от буквата.",
  encourage: () => pick(ENCOURAGE),
  hintFollow: "Следвай звездичката.",
  hintWatch: "Гледай как се пише.",
  tooLittle: "Напиши цялата буква.",
  starEarned: "Нова звезда!",
  levelUp: (level: number) => `Ниво ${level}! Браво!`,
  stickerEarned: "Нов стикер за албума!",
  bought: (name: string) => `Купи ${name}! Супер!`,
  needCoins: (n: number) => `Трябват още ${n} монети. Поиграй още малко!`,
  shopHello: "Добре дошъл в магазина! Докосни нещо, за да го пробваш.",
  tryOn: (name: string) => `${name}! Харесва ли ти?`,
  tryFriend: (name: string) => `Здравей, аз съм ${name}! Ще играем ли заедно?`,
  takeOff: "Свалих го!",
  takeOffAll: "Свалих всичко!",

  // Маскот
  greeting: (name: string) => `Здравей! Аз съм ${name}. Хайде да играем!`,
  pickLetter: "Избери буква!",
  mapHello: "Натисни точката до мен и продължаваме!",
  smallHello: "Всяка голяма буква си има малко братче. Хайде да ги напишем!",
  lockedNode: "Първо мини предишната точка!",
  lockedWorld: "Този свят се отключва, когато минеш предишния!",
  comingSoon: "Скоро!",
  pickWorld: "Къде ще пътуваме днес?",
  pickNumber: "Избери цифра!",
  pickGame: "На какво ще играем?",

  // Днешно приключение
  adventureToday: (spoken: string) => `Днес ще научим ${spoken}!`,
  adventureTodaySmall: (spoken: string) => `Днес ще научим малката буква ${spoken}!`,
  adventureTodayNumber: (name: string) => `Днес ще научим числото ${name}!`,
  adventureListenNumber: "Чуй числото. Натисни високоговорителя!",
  adventureListen: "Чуй буквата. Натисни високоговорителя!",
  adventureWriteAlone: (spoken: string) => `Сега напиши ${spoken} без помощ!`,
  adventurePicture: (spoken: string) => `Коя картинка започва с ${spoken}?`,
  adventurePictureIn: (spoken: string) => `В коя картинка се крие ${spoken}?`,
  adventureDone: "Мисията е изпълнена! Ето ти стикер!",
  adventureAgain: "Днешното приключение е минато. Можеш да играеш пак!",

  // Профили
  whoPlays: "Кой играе?",
  helloChild: (name: string) => `Здравей, ${name}!`,

  // Предизвикателство на деня
  challengeDone: (streak: number) =>
    streak > 1 ? `Предизвикателството е изпълнено! ${streak} дни подред!` : "Предизвикателството е изпълнено!",
  challengeToday: "Днешното предизвикателство",

  // Островът на думите
  wordIntro: (spoken: string, syllable: boolean) =>
    syllable ? `Това е ${spoken}. Напиши ${spoken} буква по буква.` : `${spoken}. Напиши ${spoken} буква по буква.`,
  wordNextLetter: (letter: string) => `Сега ${letter}.`,
  wordDone: (spoken: string) => `Браво! Написа ${spoken}!`,
  wordTask: (text: string) => `Напиши ${text} буква по буква.`,
  // Форми и цветове
  drawShape: (name: string) => `Нарисувай ${name}.`,
  touchColor: (color: string) => `Докосни ${color}!`,
  // Седмичен отчет за родителя: идея за занимание без екран с буква от седмицата.
  offlineIdeas: [
    (l: string, w: string) => `Потърсете вкъщи предмети, които започват с „${l}“ — например ${w}.`,
    (l: string) => `Напишете „${l}“ с пръст в брашно или пясък, или на гърба на детето — нека познае буквата.`,
    (l: string) => `Направете „${l}“ от пластелин, клечки или макарони.`,
    (l: string) => `На разходка търсете буквата „${l}“ по табели и надписи.`,
    (l: string, w: string) => `Кажете „${w}“ и нека детето каже първия звук. После сменете ролите.`,
    (l: string) => `Нарисувайте голяма „${l}“ с тебешир на тротоара и я минете с подскоци.`,
  ],
  // Пътят на обучение
  continuePath: "Продължи",
  pathHello: "Натисни голямата зелена стрелка и продължаваме по пътя!",
  pathTitle: "Пътят на Лъвчо",
  pathShort: "Пътят",
  pathLocked: "Още не сме стигнали дотук. Първо минем стъпките преди това!",
  pathDone: "Браво! Мина целия път! Можеш да повтаряш всичко, което искаш.",
  pathReplay: "Това вече го можеш. Хайде още веднъж!",
  newGameIntro: (title: string) => `Отключи нова игра: ${title}! Хайде да я изиграем!`,
  newStoryIntro: (title: string) => `Нова приказка: ${title}! Хайде да я чуем!`,
  shapeIntro: (name: string) => `Хайде да нарисуваме ${name}!`,
  stepLetter: (c: string) => `Буквата ${c}`,
  stepSmall: (c: string) => `Малката буква ${c}`,
  stepNumber: (c: string) => `Числото ${c}`,
  stepWord: (w: string) => `Напиши ${w}`,
  stepGame: (t: string) => `Нова игра: ${t}`,
  stepStory: (t: string) => `Приказка: ${t}`,
  stepShape: (n: string) => `Нарисувай ${n}`,
  // Повторение в приключението
  reviewWrite: (spoken: string) => `Спомни си! Напиши ${spoken}.`,
  // Мемори
  memoryStart: "Намери двойките: буквата и картинката, която започва с нея!",
  memoryPair: (spoken: string, word: string) => `${spoken} като ${word}!`,
  memoryNo: "Не си пасват. Запомни ги!",
  // Приказки
  storyPick: "Избери приказка! Нови се отключват, когато научиш още букви.",
  storyQuestion: "Коя буква чу най-много в приказката?",
  storyEnd: (spoken: string) => `Браво! Приказката беше за буквата ${spoken}!`,
  // Числа
  compareMore: "Къде има повече?",
  compareFewer: "Къде има по-малко?",
  addQuestion: (a: string, b: string) => `${a} и още ${b}. Колко станаха?`,
  subQuestion: (a: string, b: string) => `Имаше ${a}. ${b} избягаха. Колко останаха?`,
  // Моето име
  nameTask: "Напиши името си буква по буква.",
  nameNeedLetters: (letters: string) => `Научи и буквите ${letters} и ще напишеш цялото си име!`,
  nameNotSet: "Помоли мама или татко да напишат името ти в „Кой играе?“.",

  // Звуков анализ
  firstSound: (word: string) => `${word}. Кой е първият звук в думата ${word}?`,
  lastSound: (word: string) => `${word}. Кой е последният звук в думата ${word}?`,
  firstSoundQ: (word: string) => `Кой е първият звук в „${word}“?`,
  lastSoundQ: (word: string) => `Кой е последният звук в „${word}“?`,

  // Отключване
  needLetters: (n: number) => (n === 1 ? "научи още 1 буква" : `научи още ${n} букви`),
  needDigits: (n: number) => (n === 1 ? "научи още 1 цифра" : `научи още ${n} цифри`),
  needWords: (n: number) => (n === 1 ? "напиши още 1 дума" : `напиши още ${n} думи`),
  needWorld: (title: string) => `мини „${title}“`,
  stepsAway: (n: number) => (n === 1 ? "още 1 стъпка по пътя" : `още ${n} стъпки по пътя`),
  lockedFeature: (missing: string) => `Заключено! Ще се отвори след ${missing}.`,
  nextUnlock: "Следва да отключиш",
  unlockedNew: (title: string) => `Отключи нова игра: ${title.replace(/[?!]$/, "")}!`,
  unlockedMany: "Отключи нови игри!",

  // Сричане и четене
  buildWord: (word: string) => `${word}. Подреди сричките.`,
  buildWordQ: "Подреди сричките на думата!",
  wordBuilt: (syllables: string, word: string) => `${syllables}. ${word}! Браво!`,
  readWord: "Прочети думата и избери картинката!",

  // Игри
  findLetter: (spoken: string) => `Намери буквата ${spoken}.`,
  findNumber: (name: string) => `Намери числото ${name}.`,
  findHeard: "Слушай и намери буквата! 👂",
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
  coins: "монети",
  stars: "звезди",
  level: "Ниво",
  streak: "поредни",
  write: "Напиши",
  showMe: "Покажи ми",
} as const;
