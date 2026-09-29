// Игрите и частите извън уроците. Кога се отварят решава пътят на обучение (data/path.ts):
// всяка игра е стъпка в него и се отваря, щом детето стигне до нея.

export type Feature = { id: string; title: string; icon: string; href: string };

export const FEATURES: Feature[] = [
  { id: "shapes", title: "Форми", icon: "🔺", href: "/games/shapes/" },
  { id: "find-letter", title: "Коя е буквата?", icon: "🔍", href: "/games/find-letter/" },
  { id: "count-write", title: "Преброй и напиши", icon: "🐞", href: "/games/count-write/" },
  { id: "compare", title: "Къде има повече?", icon: "⚖️", href: "/games/compare/" },
  { id: "colors", title: "Цветове", icon: "🎨", href: "/games/colors/" },
  { id: "first-letter", title: "С коя буква започва?", icon: "🍎", href: "/games/first-letter/" },
  { id: "memory", title: "Мемори", icon: "🃏", href: "/games/memory/" },
  { id: "balloons", title: "Балони", icon: "🎈", href: "/games/balloons/" },
  { id: "stories", title: "Приказки", icon: "📚", href: "/stories/" },
  { id: "sounds", title: "Звуците в думата", icon: "🗣️", href: "/games/sounds/" },
  { id: "listen-write", title: "Чуй и напиши", icon: "👂", href: "/games/listen-write/" },
  { id: "my-name", title: "Моето име", icon: "✍️", href: "/games/my-name/" },
  { id: "add", title: "Колко станаха?", icon: "➕", href: "/games/add/" },
  { id: "subtract", title: "Колко останаха?", icon: "➖", href: "/games/subtract/" },
  { id: "build-word", title: "Сглоби думата", icon: "🧩", href: "/games/build-word/" },
  { id: "read-word", title: "Прочети и избери", icon: "📖", href: "/games/read-word/" },
];

export const getFeature = (id: string) => FEATURES.find((f) => f.id === id);
