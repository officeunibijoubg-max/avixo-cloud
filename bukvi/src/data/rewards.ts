// Виртуалните награди — отключват се подред, на всеки POINTS.starsPerReward звезди.
export type Reward = { id: string; name: string; icon: string; kind: "sticker" | "hero" | "background" | "medal" | "pet" | "frame" };

export const REWARDS: Reward[] = [
  { id: "sticker-rainbow", name: "Стикер дъга", icon: "🌈", kind: "sticker" },
  { id: "medal-bronze", name: "Бронзов медал", icon: "🥉", kind: "medal" },
  { id: "hero-bear", name: "Нов приятел: Мечо", icon: "🐻", kind: "hero" },
  { id: "bg-space", name: "Космически фон", icon: "🌌", kind: "background" },
  { id: "pet-puppy", name: "Кученце", icon: "🐶", kind: "pet" },
  { id: "medal-silver", name: "Сребърен медал", icon: "🥈", kind: "medal" },
  { id: "hero-fox", name: "Нов приятел: Лиси", icon: "🦊", kind: "hero" },
  { id: "frame-gold", name: "Златна рамка", icon: "🖼️", kind: "frame" },
  { id: "pet-unicorn", name: "Еднорог", icon: "🦄", kind: "pet" },
  { id: "hero-robot", name: "Нов приятел: Роби", icon: "🤖", kind: "hero" },
  { id: "medal-gold", name: "Златен медал", icon: "🥇", kind: "medal" },
  { id: "crown", name: "Корона", icon: "👑", kind: "medal" },
];
