// Името и основните настройки на продукта. Смени името тук.
export const APP_CONFIG = {
  name: "Буквено приключение",
  shortName: "Букви",
  description: "Играя, а междувременно се уча да пиша.",
  locale: "bg-BG",
  storageKey: "bukvi-progress-v1",
  /** Колко пъти трябва да е изписан верно символ, за да се брои за научен. */
  masteryCorrect: 3,
  masteryScore: 80,
} as const;
