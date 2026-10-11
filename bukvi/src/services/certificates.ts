import type { PlayerProgress } from "@/lib/types";
import { CERTIFICATES } from "@/data/certificates";
import { isStepDone } from "./path";
import { todayKey } from "./progress";

// Кои сертификати е спечелило детето и кога (датата се записва при спечелване).

export const isCertificateEarned = (p: PlayerProgress, id: string) => !!p.certificates?.[id];

/** След всяка мината стъпка: записва новоспечелените сертификати с днешната дата. */
export function withCertificates(p: PlayerProgress, today = todayKey()): PlayerProgress {
  const fresh = CERTIFICATES.filter((c) => !p.certificates?.[c.id] && c.steps.every((s) => isStepDone(p, s)));
  if (!fresh.length) return p;
  return { ...p, certificates: { ...p.certificates, ...Object.fromEntries(fresh.map((c) => [c.id, today])) } };
}

/** Спечелени, но още непоказани на детето (за картата „Получи сертификат!“). */
export const unseenCertificates = (p: PlayerProgress) =>
  CERTIFICATES.filter((c) => p.certificates?.[c.id] && !(p.seenCertificates ?? []).includes(c.id));

/** „11 октомври 2026 г.“ */
export function formatDay(day: string): string {
  const MONTHS = ["януари", "февруари", "март", "април", "май", "юни", "юли", "август", "септември", "октомври", "ноември", "декември"];
  const [y, m, d] = day.split("-").map(Number);
  return `${d} ${MONTHS[m - 1]} ${y} г.`;
}
