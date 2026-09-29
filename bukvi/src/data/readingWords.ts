// Думи за сричане и първо четене: сричките, от които се сглобява думата, и картинка.

export type ReadingWord = { word: string; syllables: string[]; image: string };

export const READING_WORDS: ReadingWord[] = [
  { word: "МАМА", syllables: ["МА", "МА"], image: "mom" },
  { word: "БАБА", syllables: ["БА", "БА"], image: "grandma" },
  { word: "ВОДА", syllables: ["ВО", "ДА"], image: "water" },
  { word: "ЖАБА", syllables: ["ЖА", "БА"], image: "frog" },
  { word: "КОТЕ", syllables: ["КО", "ТЕ"], image: "kitten" },
  { word: "ДИНЯ", syllables: ["ДИ", "НЯ"], image: "watermelon" },
  { word: "ГЪБА", syllables: ["ГЪ", "БА"], image: "mushroom" },
  { word: "ПАТЕ", syllables: ["ПА", "ТЕ"], image: "duckling" },
  { word: "МЕЧЕ", syllables: ["МЕ", "ЧЕ"], image: "teddy" },
  { word: "ЗАЙЧЕ", syllables: ["ЗАЙ", "ЧЕ"], image: "bunny" },
  { word: "ТОПКА", syllables: ["ТОП", "КА"], image: "ball" },
  { word: "ШАПКА", syllables: ["ШАП", "КА"], image: "hat" },
  { word: "ЦВЕТЕ", syllables: ["ЦВЕ", "ТЕ"], image: "flower" },
  { word: "ЧАДЪР", syllables: ["ЧА", "ДЪР"], image: "umbrella" },
  { word: "БАЛОН", syllables: ["БА", "ЛОН"], image: "balloon" },
  { word: "ОБЛАК", syllables: ["ОБ", "ЛАК"], image: "cloud" },
  { word: "ЕЛЕН", syllables: ["Е", "ЛЕН"], image: "deer" },
  { word: "ИГЛА", syllables: ["ИГ", "ЛА"], image: "needle" },
  { word: "РАКЕТА", syllables: ["РА", "КЕ", "ТА"], image: "rocket" },
  { word: "АВТОБУС", syllables: ["АВ", "ТО", "БУС"], image: "bus" },
  { word: "ЯБЪЛКА", syllables: ["Я", "БЪЛ", "КА"], image: "apple" },
];
