// Магазинът: какво може да се купи с монети. Цените и предметите се сменят само тук.

export type ShopCategory = "accessory" | "background" | "toy" | "friend";

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
  /** За аксесоарите: на главата или на лицето. */
  placement?: "head" | "face";
};

export const SHOP_CATEGORIES: { id: ShopCategory; title: string; icon: string }[] = [
  { id: "accessory", title: "За Лъвчо", icon: "🎩" },
  { id: "background", title: "Фонове", icon: "🖼️" },
  { id: "toy", title: "Играчки за стаята", icon: "🧸" },
  { id: "friend", title: "Нови приятели", icon: "🐻" },
];

export const SHOP_ITEMS: ShopItem[] = [
  { id: "acc-glasses", name: "Слънчеви очила", icon: "🕶️", price: 20, category: "accessory", placement: "face" },
  { id: "acc-bow", name: "Панделка", icon: "🎀", price: 25, category: "accessory" },
  { id: "acc-cap", name: "Шапка с козирка", icon: "🧢", price: 30, category: "accessory" },
  { id: "acc-hat", name: "Цилиндър", icon: "🎩", price: 40, category: "accessory" },
  { id: "acc-flower", name: "Цвете", icon: "🌼", price: 20, category: "accessory" },
  { id: "acc-crown", name: "Корона", icon: "👑", price: 120, category: "accessory" },

  { id: "bg-meadow", name: "Поляна", icon: "🌷", price: 30, category: "background", background: "linear-gradient(180deg,#e0f7ff 0%,#fff7e0 55%,#d9f99d 100%)" },
  { id: "bg-sea", name: "Море", icon: "🌊", price: 40, category: "background", background: "linear-gradient(180deg,#e0f2fe 0%,#bae6fd 60%,#7dd3fc 100%)" },
  { id: "bg-candy", name: "Бонбонена страна", icon: "🍭", price: 50, category: "background", background: "linear-gradient(135deg,#fce7f3 0%,#ede9fe 50%,#e0f2fe 100%)" },
  { id: "bg-space", name: "Космос", icon: "🌌", price: 80, category: "background", background: "radial-gradient(circle at 15% 12%,#fff 0 2px,transparent 3px),radial-gradient(circle at 70% 25%,#fff 0 2px,transparent 3px),radial-gradient(circle at 40% 60%,#fff 0 1.5px,transparent 2.5px),linear-gradient(180deg,#a5b4fc 0%,#e0e7ff 100%)" },

  { id: "toy-ball", name: "Топка", icon: "⚽", price: 15, category: "toy" },
  { id: "toy-bear", name: "Мече", icon: "🧸", price: 25, category: "toy" },
  { id: "toy-train", name: "Влакче", icon: "🚂", price: 35, category: "toy" },
  { id: "toy-kite", name: "Хвърчило", icon: "🪁", price: 35, category: "toy" },
  { id: "toy-blocks", name: "Кубчета", icon: "🧱", price: 20, category: "toy" },
  { id: "toy-rocket", name: "Ракета", icon: "🚀", price: 60, category: "toy" },
  { id: "toy-castle", name: "Замък", icon: "🏰", price: 100, category: "toy" },

  { id: "friend-bear", name: "Мечо", icon: "🐻", price: 60, category: "friend", mascot: "bear" },
  { id: "friend-fox", name: "Лиси", icon: "🦊", price: 80, category: "friend", mascot: "fox" },
  { id: "friend-robot", name: "Роби", icon: "🤖", price: 120, category: "friend", mascot: "robot" },
];

export const getShopItem = (id: string) => SHOP_ITEMS.find((i) => i.id === id);

// Стикерите се печелят (не се купуват) — по един за всяко завършено Днешно приключение.
export const STICKERS = [
  "🦄", "🐬", "🦋", "🌈", "🍦", "🎈", "🐞", "🌻", "🐢", "🍓", "🚁", "🐙",
  "🦖", "🍩", "⛵", "🐝", "🎠", "🦉", "🍉", "🐧", "🌟", "🐳", "🎡", "🦔",
] as const;
