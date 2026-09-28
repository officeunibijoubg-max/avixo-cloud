import { ALPHABET } from "./alphabet";
import { DIGITS } from "./numbers";

// Картата на приключението: светове с точки (по един символ на точка).
// Детето минава точките подред; следващата се отключва с поне една ⭐ на предишната.

export type World = {
  id: string;
  title: string;
  icon: string;
  /** Украса по картата. */
  decor: string[];
  /** Цвят на пътеката и фона на картата. */
  theme: { path: string; bg: string; node: string };
  characters: string[];
  /** Свят, който трябва да е минат, за да се отключи този. */
  requires?: string;
  comingSoon?: boolean;
};

export const WORLDS: World[] = [
  {
    id: "numbers",
    title: "Градът на цифрите",
    icon: "🏙️",
    decor: ["🏠", "🏫", "🚌", "🏢", "🚦", "🎡", "🏪", "🚲"],
    theme: { path: "#fbbf24", bg: "linear-gradient(180deg,#fef3c7,#fde68a)", node: "bg-amber-300" },
    characters: [...DIGITS],
  },
  {
    id: "forest",
    title: "Гората на буквите",
    icon: "🌳",
    decor: ["🌲", "🍄", "🦔", "🌳", "🐿️", "🌼", "🦉", "🌲"],
    theme: { path: "#a3e635", bg: "linear-gradient(180deg,#ecfccb,#bbf7d0)", node: "bg-lime-300" },
    characters: ALPHABET.slice(0, 16),
  },
  {
    id: "mountain",
    title: "Планината на буквите",
    icon: "⛰️",
    decor: ["🏔️", "🐐", "🌨️", "⛺", "🦅", "🌲", "❄️", "🏕️"],
    theme: { path: "#93c5fd", bg: "linear-gradient(180deg,#e0f2fe,#e0e7ff)", node: "bg-sky-300" },
    characters: ALPHABET.slice(16),
    requires: "forest",
  },
  {
    id: "words",
    title: "Островът на думите",
    icon: "🏝️",
    decor: ["🌴", "🐚", "🦀", "⛵"],
    theme: { path: "#f9a8d4", bg: "linear-gradient(180deg,#fce7f3,#e0f2fe)", node: "bg-pink-300" },
    characters: [],
    requires: "mountain",
    comingSoon: true,
  },
];

export const getWorld = (id: string) => WORLDS.find((w) => w.id === id);
export const worldOfCharacter = (c: string) => WORLDS.find((w) => w.characters.includes(c));
