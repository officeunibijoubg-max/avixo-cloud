// Примерните думи и картинки за всяка буква. Сменят се само тук.
// Картинките са емоджи, за да работят офлайн без допълнителни файлове;
// по-късно могат да станат пътища към илюстрации (напр. "/img/avtobus.webp").

export type LetterWord = {
  word?: string;
  image?: string;
  /**
   * Как синтезаторът да каже буквата. Ползваме азбучните имена („бе“, „ве“, „ер голям“),
   * защото срички като „Бъ“ гласовете спелуват и четат „ъ“ като „ер малък“.
   * Звуковото „бъ“ ще дойде със записаните аудио файлове.
   */
  spokenName: string;
  /** За букви без подходяща дума. */
  note?: string;
};

export const letterWords: Record<string, LetterWord> = {
  А: { word: "автобус", image: "🚌", spokenName: "А" },
  Б: { word: "балон", image: "🎈", spokenName: "бе" },
  В: { word: "влак", image: "🚂", spokenName: "ве" },
  Г: { word: "гъба", image: "🍄", spokenName: "ге" },
  Д: { word: "диня", image: "🍉", spokenName: "де" },
  Е: { word: "елен", image: "🦌", spokenName: "Е" },
  Ж: { word: "жаба", image: "🐸", spokenName: "же" },
  З: { word: "зайче", image: "🐰", spokenName: "зе" },
  И: { word: "игла", image: "🪡", spokenName: "И" },
  Й: { word: "йо-йо", image: "🪀", spokenName: "И кратко" },
  К: { word: "коте", image: "🐱", spokenName: "ка" },
  Л: { word: "лъв", image: "🦁", spokenName: "ел" },
  М: { word: "мече", image: "🧸", spokenName: "ем" },
  Н: { word: "нос", image: "👃", spokenName: "ен" },
  О: { word: "облак", image: "☁️", spokenName: "О" },
  П: { word: "пате", image: "🐥", spokenName: "пе" },
  Р: { word: "ракета", image: "🚀", spokenName: "ер" },
  С: { word: "слон", image: "🐘", spokenName: "се" },
  Т: { word: "топка", image: "⚽", spokenName: "те" },
  У: { word: "ухо", image: "👂", spokenName: "У" },
  Ф: { word: "фея", image: "🧚", spokenName: "еф" },
  Х: { word: "хляб", image: "🍞", spokenName: "ха" },
  Ц: { word: "цвете", image: "🌸", spokenName: "це" },
  Ч: { word: "чадър", image: "☂️", spokenName: "че" },
  Ш: { word: "шапка", image: "👒", spokenName: "ша" },
  Щ: { word: "щъркел", image: "🐦", spokenName: "ща" },
  Ъ: { word: "ъгъл", image: "📐", spokenName: "ер голям" },
  Ь: {
    spokenName: "Ер малък",
    note: "Ь не започва дума. Пишем я само след съгласна и преди О: както в „шофьор“ и „синьо“.",
    image: "🔤",
  },
  Ю: { word: "юла", image: "🌀", spokenName: "Ю" },
  Я: { word: "ябълка", image: "🍎", spokenName: "Я" },
};

// Цифрите: как се казват и какво броим.
export const numberWords: Record<string, { name: string; image: string }> = {
  "0": { name: "Нула", image: "🧺" },
  "1": { name: "Едно", image: "🍎" },
  "2": { name: "Две", image: "🍐" },
  "3": { name: "Три", image: "🍎" },
  "4": { name: "Четири", image: "🍓" },
  "5": { name: "Пет", image: "🐥" },
  "6": { name: "Шест", image: "🌼" },
  "7": { name: "Седем", image: "🐞" },
  "8": { name: "Осем", image: "⭐" },
  "9": { name: "Девет", image: "🎈" },
};
