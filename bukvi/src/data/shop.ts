// Магазинът: какво може да се купи с монети. Цените и предметите се сменят само тук.

export type ShopCategory = "accessory" | "background" | "toy" | "friend";

/** Къде се слага дрехата/аксесоарът. Всеки герой има едни и същи точки — затова стои еднакво на всички. */
export type WearSlot = "head" | "face" | "neck" | "back" | "hand";

export type ShopItem = {
  id: string;
  name: string;
  icon: string;
  price: number;
  category: ShopCategory;
  /** За фоновете: CSS фон на страницата. */
  background?: string;
  /** За приятелите: ключ от config/mascot.ts. */
  mascot?: string;
  /** За аксесоарите: мястото на героя (едно нещо на място, но всички места наведнъж). */
  slot?: WearSlot;
};

export const SHOP_CATEGORIES: { id: ShopCategory; title: string; icon: string }[] = [
  { id: "accessory", title: "Облечи героя", icon: "👑" },
  { id: "friend", title: "Нови приятели", icon: "🐼" },
  { id: "background", title: "Фонове", icon: "🖼️" },
  { id: "toy", title: "Играчки за стаята", icon: "🧸" },
];

export const WEAR_SLOTS: { id: WearSlot; title: string }[] = [
  { id: "head", title: "🎩 На главата" },
  { id: "face", title: "🕶️ На лицето" },
  { id: "neck", title: "🎀 На врата" },
  { id: "back", title: "🦸 На гърба" },
  { id: "hand", title: "🎈 В ръката" },
];

const wear = (id: string, name: string, icon: string, price: number, slot: WearSlot): ShopItem => ({
  id,
  name,
  icon,
  price,
  category: "accessory",
  slot,
});

export const SHOP_ITEMS: ShopItem[] = [
  wear("acc-cap", "Шапка с козирка", "🧢", 30, "head"),
  wear("acc-bow", "Панделка", "🎀", 25, "head"),
  wear("acc-party", "Парти шапка", "🥳", 35, "head"),
  wear("acc-hat", "Цилиндър", "🎩", 40, "head"),
  wear("acc-flower", "Венец от цветя", "🌼", 45, "head"),
  wear("acc-chef", "Готварска шапка", "👨‍🍳", 50, "head"),
  wear("acc-headphones", "Слушалки", "🎧", 60, "head"),
  wear("acc-pirate", "Пиратска шапка", "🏴‍☠️", 70, "head"),
  wear("acc-wizard", "Магьосническа шапка", "🧙", 90, "head"),
  wear("acc-crown", "Корона", "👑", 120, "head"),

  wear("acc-glasses", "Слънчеви очила", "🕶️", 20, "face"),
  wear("acc-round", "Кръгли очила", "👓", 25, "face"),
  wear("acc-mustache", "Мустаци", "🥸", 30, "face"),
  wear("acc-patch", "Пиратска превръзка", "🏴‍☠️", 35, "face"),
  wear("acc-hearts", "Очила сърца", "😍", 45, "face"),
  wear("acc-stars", "Очила звезди", "🤩", 50, "face"),

  wear("acc-bowtie", "Папийонка", "🎀", 20, "neck"),
  wear("acc-scarf", "Шалче", "🧣", 35, "neck"),
  wear("acc-medal", "Златен медал", "🥇", 80, "neck"),

  wear("acc-backpack", "Раничка", "🎒", 40, "back"),
  wear("acc-cape", "Супер пелерина", "🦸", 90, "back"),
  wear("acc-jetpack", "Реактивна раница", "🚀", 110, "back"),
  wear("acc-wings", "Крилца на фея", "🧚", 130, "back"),

  wear("acc-lollipop", "Близалка", "🍭", 20, "hand"),
  wear("acc-balloon", "Балон", "🎈", 25, "hand"),
  wear("acc-icecream", "Сладолед", "🍦", 30, "hand"),
  wear("acc-flag", "Българско знаме", "🇧🇬", 40, "hand"),
  wear("acc-sunflower", "Слънчоглед", "🌻", 45, "hand"),
  wear("acc-wand", "Вълшебна пръчица", "🪄", 70, "hand"),

  { id: "bg-meadow", name: "Поляна", icon: "🌷", price: 30, category: "background", background: "linear-gradient(180deg,#e0f7ff 0%,#fff7e0 55%,#d9f99d 100%)" },
  { id: "bg-sea", name: "Море", icon: "🌊", price: 40, category: "background", background: "linear-gradient(180deg,#e0f2fe 0%,#bae6fd 60%,#7dd3fc 100%)" },
  { id: "bg-candy", name: "Бонбонена страна", icon: "🍭", price: 50, category: "background", background: "linear-gradient(135deg,#fce7f3 0%,#ede9fe 50%,#e0f2fe 100%)" },
  { id: "bg-sunset", name: "Залез", icon: "🌅", price: 60, category: "background", background: "linear-gradient(180deg,#fde68a 0%,#fdba74 50%,#f9a8d4 100%)" },
  { id: "bg-space", name: "Космос", icon: "🌌", price: 80, category: "background", background: "radial-gradient(circle at 15% 12%,#fff 0 2px,transparent 3px),radial-gradient(circle at 70% 25%,#fff 0 2px,transparent 3px),radial-gradient(circle at 40% 60%,#fff 0 1.5px,transparent 2.5px),linear-gradient(180deg,#a5b4fc 0%,#e0e7ff 100%)" },
  { id: "bg-rainbow", name: "Дъга", icon: "🌈", price: 100, category: "background", background: "linear-gradient(180deg,#fecaca 0%,#fed7aa 17%,#fef08a 34%,#bbf7d0 51%,#bfdbfe 68%,#ddd6fe 85%,#fbcfe8 100%)" },

  { id: "toy-ball", name: "Топка", icon: "⚽", price: 15, category: "toy" },
  { id: "toy-blocks", name: "Кубчета", icon: "🧱", price: 20, category: "toy" },
  { id: "toy-bear", name: "Мече", icon: "🧸", price: 25, category: "toy" },
  { id: "toy-duck", name: "Гумено пате", icon: "🐤", price: 25, category: "toy" },
  { id: "toy-train", name: "Влакче", icon: "🚂", price: 35, category: "toy" },
  { id: "toy-kite", name: "Хвърчило", icon: "🪁", price: 35, category: "toy" },
  { id: "toy-guitar", name: "Китара", icon: "🎸", price: 45, category: "toy" },
  { id: "toy-rocket", name: "Ракета", icon: "🚀", price: 60, category: "toy" },
  { id: "toy-dino", name: "Динозавър играчка", icon: "🦕", price: 70, category: "toy" },
  { id: "toy-castle", name: "Замък", icon: "🏰", price: 100, category: "toy" },

  { id: "friend-bunny", name: "Зайко", icon: "🐰", price: 50, category: "friend", mascot: "bunny" },
  { id: "friend-bear", name: "Мечо", icon: "🐻", price: 60, category: "friend", mascot: "bear" },
  { id: "friend-cat", name: "Мачи", icon: "🐱", price: 70, category: "friend", mascot: "cat" },
  { id: "friend-fox", name: "Лиси", icon: "🦊", price: 80, category: "friend", mascot: "fox" },
  { id: "friend-panda", name: "Панди", icon: "🐼", price: 100, category: "friend", mascot: "panda" },
  { id: "friend-robot", name: "Роби", icon: "🤖", price: 120, category: "friend", mascot: "robot" },
  { id: "friend-dino", name: "Дино", icon: "🦖", price: 150, category: "friend", mascot: "dino" },
];

export const getShopItem = (id: string) => SHOP_ITEMS.find((i) => i.id === id);

// Стикерите се печелят (не се купуват) — по един за всяко завършено Днешно приключение.
export const STICKERS = [
  "🦄", "🐬", "🦋", "🌈", "🍦", "🎈", "🐞", "🌻", "🐢", "🍓", "🚁", "🐙",
  "🦖", "🍩", "⛵", "🐝", "🎠", "🦉", "🍉", "🐧", "🌟", "🐳", "🎡", "🦔",
] as const;
