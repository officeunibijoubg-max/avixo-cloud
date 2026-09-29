import type { PlayerProgress } from "@/lib/types";
import { ALPHABET } from "@/data/alphabet";
import { getLessonByChar } from "@/data/lessons";
import { phrases } from "@/content/phrases";

// Седмичният отчет в родителския екран: какво е ново, какво е упражнявано и идея без екран.

const WEEK_MS = 7 * 86_400_000;
const inWeek = (day: string | undefined, today: string) =>
  !!day && Date.parse(`${today}T00:00:00Z`) - Date.parse(`${day}T00:00:00Z`) < WEEK_MS;

export type WeeklyReport = {
  seconds: number;
  adventures: number;
  challengeDays: number;
  /** Символи, научени (първа ⭐) през последните 7 дни. */
  learned: string[];
  /** Символи, написани вярно през последните 7 дни. */
  practiced: string[];
  idea: string;
};

export function weeklyReport(p: PlayerProgress, today: string): WeeklyReport {
  const chars = Object.values(p.characters).filter((c) => c.character.length === 1);
  const learned = chars.filter((c) => inWeek(c.firstDay, today)).map((c) => c.character);
  const practiced = chars.filter((c) => inWeek(c.lastDay, today)).map((c) => c.character);
  const seconds = Object.entries(p.playSeconds)
    .filter(([d]) => inWeek(d, today))
    .reduce((a, [, s]) => a + s, 0);

  // Идеята е за последната нова главна буква (или А), сменя се всяка седмица.
  const letters = learned.filter((c) => (ALPHABET as readonly string[]).includes(c));
  const letter = letters[letters.length - 1] ?? "А";
  const lesson = getLessonByChar(letter);
  const week = Math.floor(Date.parse(`${today}T00:00:00Z`) / WEEK_MS);
  const idea = phrases.offlineIdeas[week % phrases.offlineIdeas.length](letter, (lesson?.inWord ?? lesson?.exampleWord ?? "").toLowerCase());

  return {
    seconds,
    adventures: p.adventuresDone.filter((d) => inWeek(d, today)).length,
    challengeDays: (p.challengeDays ?? []).filter((d) => inWeek(d, today)).length,
    learned,
    practiced,
    idea,
  };
}
