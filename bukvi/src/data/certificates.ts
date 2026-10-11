import { CHAPTERS, type PathStep } from "./path";
import { DIGITS } from "./numbers";

// Сертификатите: по един за всяка глава от пътя на обучение и един за цифрите.
// Печелят се, когато всички стъпки от тях са минати; носят името на детето от профила.

export type CertificateDef = {
  id: string;
  icon: string;
  /** Кратко име за списъка с награди. */
  title: string;
  /** „… научи гласните А, О, У, Е, И“ — продължение на „Това удостоверява, че <име>“. */
  achievement: string;
  steps: PathStep[];
};

const ACHIEVEMENTS = [
  "нарисува първите чертички и научи гласните А, О, У, Е и И",
  "научи буквите М, Л, Н, Р и С и написа първите срички",
  "научи буквите Т, В, К, П и Д и написа първите думи",
  "научи буквите Б, З, Г и Ж и написа още думи",
  "научи всички главни букви от българската азбука",
  "научи всички малки букви",
];

export const CERTIFICATES: CertificateDef[] = [
  ...CHAPTERS.map((c, i) => ({
    id: `chapter-${i + 1}`,
    icon: c.icon,
    title: c.title,
    achievement: ACHIEVEMENTS[i] ?? `мина глава „${c.title}“`,
    steps: c.steps,
  })),
  {
    id: "digits",
    icon: "🔢",
    title: "Цифрите от 0 до 9",
    achievement: "научи да пише цифрите от 0 до 9",
    steps: DIGITS.map((d) => ({ kind: "char" as const, char: d })),
  },
];

export const getCertificate = (id: string) => CERTIFICATES.find((c) => c.id === id);
