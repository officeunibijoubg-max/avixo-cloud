// Примерните думи и картинки за всяка буква. Сменят се само тук.
// Картинките са емоджи, за да работят офлайн без допълнителни файлове;
// по-късно могат да станат пътища към илюстрации (напр. "/img/avtobus.webp").

export type LetterWord = {
  word?: string;
  image?: string;
  /**
   * Звукът на буквата, както се учи в детската градина („Бъ“, „Въ“).
   * Как точно да се подаде на синтезатора решава services/speech.ts (виж ttsSpelling).
   */
  spokenName: string;
  /** За букви без подходяща дума. */
  note?: string;
};

export const letterWords: Record<string, LetterWord> = {
  А: { word: "автобус", image: "🚌", spokenName: "А" },
  Б: { word: "балон", image: "🎈", spokenName: "Бъ" },
  В: { word: "влак", image: "🚂", spokenName: "Въ" },
  Г: { word: "гъба", image: "🍄", spokenName: "Гъ" },
  Д: { word: "диня", image: "🍉", spokenName: "Дъ" },
  Е: { word: "елен", image: "🦌", spokenName: "Е" },
  Ж: { word: "жаба", image: "🐸", spokenName: "Жъ" },
  З: { word: "зайче", image: "🐰", spokenName: "Зъ" },
  И: { word: "игла", image: "🪡", spokenName: "И" },
  Й: { word: "йо-йо", image: "🪀", spokenName: "И кратко" },
  К: { word: "коте", image: "🐱", spokenName: "Къ" },
  Л: { word: "лъв", image: "🦁", spokenName: "Лъ" },
  М: { word: "мече", image: "🧸", spokenName: "Мъ" },
  Н: { word: "нос", image: "👃", spokenName: "Нъ" },
  О: { word: "облак", image: "☁️", spokenName: "О" },
  П: { word: "пате", image: "🐥", spokenName: "Пъ" },
  Р: { word: "ракета", image: "🚀", spokenName: "Ръ" },
  С: { word: "слон", image: "🐘", spokenName: "Съ" },
  Т: { word: "топка", image: "⚽", spokenName: "Тъ" },
  У: { word: "ухо", image: "👂", spokenName: "У" },
  Ф: { word: "фея", image: "🧚", spokenName: "Фъ" },
  Х: { word: "хляб", image: "🍞", spokenName: "Хъ" },
  Ц: { word: "цвете", image: "🌸", spokenName: "Цъ" },
  Ч: { word: "чадър", image: "☂️", spokenName: "Чъ" },
  Ш: { word: "шапка", image: "👒", spokenName: "Шъ" },
  Щ: { word: "щъркел", image: "🐦", spokenName: "Щъ" },
  Ъ: { word: "ъгъл", image: "📐", spokenName: "Ъ" },
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
