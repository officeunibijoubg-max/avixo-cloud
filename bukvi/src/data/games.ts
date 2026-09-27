// Каталогът на минигрите за екрана „Играй“.
export type GameDef = { id: string; href: string; icon: string; title: string; color: string };

export const GAMES: GameDef[] = [
  { id: "find-letter", href: "/games/find-letter/", icon: "🔍", title: "Коя е буквата?", color: "bg-sky-200" },
  { id: "first-letter", href: "/games/first-letter/", icon: "🍎", title: "С коя буква започва?", color: "bg-pink-200" },
  { id: "balloons", href: "/games/balloons/", icon: "🎈", title: "Балони", color: "bg-amber-200" },
  { id: "listen-write", href: "/games/listen-write/", icon: "👂", title: "Чуй и напиши", color: "bg-violet-200" },
  { id: "count-write", href: "/games/count-write/", icon: "🐞", title: "Преброй и напиши", color: "bg-lime-200" },
];
