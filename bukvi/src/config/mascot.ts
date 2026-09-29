// Героят, който води детето. Смени го тук — компонентът Mascot чете само това.
export type MascotConfig = {
  name: string;
  emoji: string;
  /** Емоджи за различните настроения. */
  moods: Record<"happy" | "cheer" | "think" | "wave", string>;
  color: string;
};

export const MASCOTS: Record<string, MascotConfig> = {
  lion: { name: "Лъвчо", emoji: "🦁", moods: { happy: "😊", cheer: "🎉", think: "🤔", wave: "👋" }, color: "#f59e0b" },
  bear: { name: "Мечо", emoji: "🐻", moods: { happy: "😊", cheer: "🎉", think: "🤔", wave: "👋" }, color: "#a16207" },
  fox: { name: "Лиси", emoji: "🦊", moods: { happy: "😊", cheer: "🎉", think: "🤔", wave: "👋" }, color: "#ea580c" },
  robot: { name: "Роби", emoji: "🤖", moods: { happy: "😊", cheer: "🎉", think: "🤔", wave: "👋" }, color: "#0ea5e9" },
  bunny: { name: "Зайко", emoji: "🐰", moods: { happy: "😊", cheer: "🎉", think: "🤔", wave: "👋" }, color: "#f472b6" },
  cat: { name: "Мачи", emoji: "🐱", moods: { happy: "😊", cheer: "🎉", think: "🤔", wave: "👋" }, color: "#64748b" },
  panda: { name: "Панди", emoji: "🐼", moods: { happy: "😊", cheer: "🎉", think: "🤔", wave: "👋" }, color: "#1f2937" },
  dino: { name: "Дино", emoji: "🦖", moods: { happy: "😊", cheer: "🎉", think: "🤔", wave: "👋" }, color: "#16a34a" },
};

export const DEFAULT_MASCOT = "lion";
