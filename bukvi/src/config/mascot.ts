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
};

export const DEFAULT_MASCOT = "lion";
