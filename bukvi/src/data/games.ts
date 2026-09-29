// Каталогът на минигрите за екрана „Играй“, групирани по умение.
export type GameDef = { id: string; href: string; icon: string; title: string; color: string; group: GameGroup };

export type GameGroup = "letters" | "reading" | "math" | "more";

export const GAME_GROUPS: { id: GameGroup; title: string }[] = [
  { id: "letters", title: "🔤 Букви" },
  { id: "reading", title: "📖 Звуци и четене" },
  { id: "math", title: "🔢 Числа" },
  { id: "more", title: "🌈 Още игри" },
];

export const GAMES: GameDef[] = [
  { id: "find-letter", href: "/games/find-letter/", icon: "🔍", title: "Коя е буквата?", color: "bg-sky-200", group: "letters" },
  { id: "first-letter", href: "/games/first-letter/", icon: "🍎", title: "С коя буква започва?", color: "bg-pink-200", group: "letters" },
  { id: "balloons", href: "/games/balloons/", icon: "🎈", title: "Балони", color: "bg-amber-200", group: "letters" },
  { id: "listen-write", href: "/games/listen-write/", icon: "👂", title: "Чуй и напиши", color: "bg-violet-200", group: "letters" },
  { id: "my-name", href: "/games/my-name/", icon: "✍️", title: "Моето име", color: "bg-yellow-200", group: "letters" },
  { id: "sounds", href: "/games/sounds/", icon: "🗣️", title: "Звуците в думата", color: "bg-teal-200", group: "reading" },
  { id: "build-word", href: "/games/build-word/", icon: "🧩", title: "Сглоби думата", color: "bg-orange-200", group: "reading" },
  { id: "read-word", href: "/games/read-word/", icon: "📖", title: "Прочети и избери", color: "bg-rose-200", group: "reading" },
  { id: "count-write", href: "/games/count-write/", icon: "🐞", title: "Преброй и напиши", color: "bg-lime-200", group: "math" },
  { id: "compare", href: "/games/compare/", icon: "⚖️", title: "Къде има повече?", color: "bg-cyan-200", group: "math" },
  { id: "add", href: "/games/add/", icon: "➕", title: "Колко станаха?", color: "bg-emerald-200", group: "math" },
  { id: "subtract", href: "/games/subtract/", icon: "➖", title: "Колко останаха?", color: "bg-fuchsia-200", group: "math" },
];

export const gameTitle = (id: string) => GAMES.find((g) => g.id === id)?.title ?? "";
