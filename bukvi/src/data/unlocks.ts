// Какво отключва детето с напредъка. Всичко освен първите уроци, Днешното приключение
// и магазина се отваря постепенно — за да има стимул да учи последователно.
// Изискванията се сменят само тук.

export type Unlock = {
  /** Главни букви с поне една ⭐. */
  letters?: number;
  /** Цифри с поне една ⭐. */
  digits?: number;
  /** Думи от Острова с поне една ⭐. */
  words?: number;
  /** Свят от картата, който трябва да е минат целият. */
  world?: string;
};

export type Feature = { id: string; title: string; icon: string; href: string; unlock: Unlock };

/** Игрите и частите извън картата. Реда на списъка е и редът, в който обикновено се отключват. */
export const FEATURES: Feature[] = [
  { id: "find-letter", title: "Коя е буквата?", icon: "🔍", href: "/games/find-letter/", unlock: { letters: 3 } },
  { id: "count-write", title: "Преброй и напиши", icon: "🐞", href: "/games/count-write/", unlock: { digits: 4 } },
  { id: "first-letter", title: "С коя буква започва?", icon: "🍎", href: "/games/first-letter/", unlock: { letters: 6 } },
  { id: "balloons", title: "Балони", icon: "🎈", href: "/games/balloons/", unlock: { letters: 8 } },
  { id: "sounds", title: "Звуците в думата", icon: "🗣️", href: "/games/sounds/", unlock: { letters: 10 } },
  { id: "listen-write", title: "Чуй и напиши", icon: "👂", href: "/games/listen-write/", unlock: { letters: 12 } },
  { id: "my-name", title: "Моето име", icon: "✍️", href: "/games/my-name/", unlock: { letters: 14 } },
  { id: "build-word", title: "Сглоби думата", icon: "🧩", href: "/games/build-word/", unlock: { world: "forest" } },
  { id: "read-word", title: "Прочети и избери", icon: "📖", href: "/games/read-word/", unlock: { words: 3 } },
];

export const getFeature = (id: string) => FEATURES.find((f) => f.id === id);
