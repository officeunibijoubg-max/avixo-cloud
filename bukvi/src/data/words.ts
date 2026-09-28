// Примерните думи и картинки за всяка буква. Сменят се само тук.
// `image` е ключ към илюстрация от components/illustrations/Illustration.tsx
// (всички в един стил с Лъвчо, работят офлайн). Непознат ключ се показва като текст,
// така че временно може да се сложи и емоджи.

export type LetterWord = {
  word?: string;
  image?: string;
  /**
   * Звукът на буквата, както се учи в детската градина („Бъ“, „Въ“).
   * Как точно да се подаде на синтезатора решава services/speech.ts (виж ttsSpelling).
   */
  spokenName: string;
  /** За букви, с които не започва дума (Ь): кратка дума, в която се вижда буквата. */
  inWord?: string;
  /** Подробното правило — за родителя, не за детето. */
  parentNote?: string;
};

export const letterWords: Record<string, LetterWord> = {
  А: { word: "автобус", image: "bus", spokenName: "А" },
  Б: { word: "балон", image: "balloon", spokenName: "Бъ" },
  В: { word: "влак", image: "train", spokenName: "Въ" },
  Г: { word: "гъба", image: "mushroom", spokenName: "Гъ" },
  Д: { word: "диня", image: "watermelon", spokenName: "Дъ" },
  Е: { word: "елен", image: "deer", spokenName: "Е" },
  Ж: { word: "жаба", image: "frog", spokenName: "Жъ" },
  З: { word: "зайче", image: "bunny", spokenName: "Зъ" },
  И: { word: "игла", image: "needle", spokenName: "И" },
  Й: { word: "йо-йо", image: "yoyo", spokenName: "И кратко" },
  К: { word: "коте", image: "kitten", spokenName: "Къ" },
  Л: { word: "лъв", image: "lion", spokenName: "Лъ" },
  М: { word: "мече", image: "teddy", spokenName: "Мъ" },
  Н: { word: "нос", image: "nose", spokenName: "Нъ" },
  О: { word: "облак", image: "cloud", spokenName: "О" },
  П: { word: "пате", image: "duckling", spokenName: "Пъ" },
  Р: { word: "ракета", image: "rocket", spokenName: "Ръ" },
  С: { word: "слон", image: "elephant", spokenName: "Съ" },
  Т: { word: "топка", image: "ball", spokenName: "Тъ" },
  У: { word: "ухо", image: "ear", spokenName: "У" },
  Ф: { word: "фея", image: "fairy", spokenName: "Фъ" },
  Х: { word: "хляб", image: "bread", spokenName: "Хъ" },
  Ц: { word: "цвете", image: "flower", spokenName: "Цъ" },
  Ч: { word: "чадър", image: "umbrella", spokenName: "Чъ" },
  Ш: { word: "шапка", image: "hat", spokenName: "Шъ" },
  Щ: { word: "щъркел", image: "stork", spokenName: "Щъ" },
  Ъ: { word: "ъгъл", image: "angle", spokenName: "Ъ" },
  Ь: {
    spokenName: "Ер малък",
    inWord: "синьо",
    image: "blue",
    parentNote: "Ь не започва дума. Пише се само след съгласна и пред О: „шофьор“, „синьо“.",
  },
  Ю: { word: "юла", image: "top", spokenName: "Ю" },
  Я: { word: "ябълка", image: "apple", spokenName: "Я" },
};

// Цифрите: как се казват и какво броим.
export const numberWords: Record<string, { name: string; image: string }> = {
  "0": { name: "Нула", image: "basket" },
  "1": { name: "Едно", image: "apple" },
  "2": { name: "Две", image: "pear" },
  "3": { name: "Три", image: "apple" },
  "4": { name: "Четири", image: "strawberry" },
  "5": { name: "Пет", image: "duckling" },
  "6": { name: "Шест", image: "flower" },
  "7": { name: "Седем", image: "ladybug" },
  "8": { name: "Осем", image: "star" },
  "9": { name: "Девет", image: "balloon" },
};
