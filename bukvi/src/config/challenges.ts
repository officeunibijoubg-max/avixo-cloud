// Предизвикателствата на деня — сменят се всеки ден по ред. Добавяй/сменяй само тук.

export type ChallengeMetric = "letters" | "numbers" | "words" | "games" | "adventure";

export type Challenge = {
  id: string;
  icon: string;
  /** Какво се брои. */
  metric: ChallengeMetric;
  goal: number;
  /** Текстът за детето (показва се и се изговаря). */
  text: string;
};

export const CHALLENGES: Challenge[] = [
  { id: "letters-5", icon: "✏️", metric: "letters", goal: 5, text: "Напиши 5 букви правилно" },
  { id: "games-6", icon: "🎮", metric: "games", goal: 6, text: "Познай 6 пъти в игрите" },
  { id: "adventure", icon: "🌟", metric: "adventure", goal: 1, text: "Мини Днешното приключение" },
  { id: "numbers-4", icon: "🔢", metric: "numbers", goal: 4, text: "Напиши 4 цифри правилно" },
  { id: "letters-8", icon: "✍️", metric: "letters", goal: 8, text: "Напиши 8 букви правилно" },
  { id: "words-2", icon: "🏝️", metric: "words", goal: 2, text: "Напиши 2 срички или думи" },
  { id: "games-10", icon: "🎈", metric: "games", goal: 10, text: "Познай 10 пъти в игрите" },
];

export const CHALLENGE_BONUS = 25;
