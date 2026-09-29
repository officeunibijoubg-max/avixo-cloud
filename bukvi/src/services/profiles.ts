import type { PlayerProgress } from "@/lib/types";
import { DEFAULT_MASCOT } from "@/config/mascot";
import { emptyProgress } from "./progress";

// Профили за няколко деца на едно устройство. Всяко дете има свой прогрес
// (звезди, монети, покупки, стикери) и свой приятел-герой; настройките са общи.
// Активният прогрес стои в `progress`, а неактивните — в `stored`.

export type Profile = { id: string; name: string; avatar: string; mascot: string };

export type ProfilesSlice = {
  progress: PlayerProgress;
  mascot: string;
  profiles: Profile[];
  activeId: string;
  stored: Record<string, PlayerProgress>;
};

export const PROFILE_AVATARS = ["🦁", "🐻", "🦊", "🐰", "🐼", "🐸", "🦄", "🐯", "🐨", "🐧"] as const;

export const defaultProfile = (): Profile => ({ id: "p1", name: "Дете", avatar: "🦁", mascot: DEFAULT_MASCOT });

/** Сменя активното дете: запазва текущия прогрес и зарежда този на другото дете. */
export function switchProfile(s: ProfilesSlice, targetId: string): ProfilesSlice {
  if (targetId === s.activeId || !s.profiles.some((p) => p.id === targetId)) return s;
  const target = s.profiles.find((p) => p.id === targetId) as Profile;
  const stored = { ...s.stored, [s.activeId]: s.progress };
  // Празните полета от по-нови версии се допълват със стойности по подразбиране.
  const progress = { ...emptyProgress(), ...stored[targetId] };
  delete stored[targetId];
  return {
    progress,
    mascot: target.mascot,
    profiles: s.profiles.map((p) => (p.id === s.activeId ? { ...p, mascot: s.mascot } : p)),
    activeId: targetId,
    stored,
  };
}

/** Ново дете с празен прогрес — и веднага става активно. */
export function addProfile(s: ProfilesSlice, name: string, avatar: string): ProfilesSlice {
  const n = s.profiles.reduce((m, p) => Math.max(m, Number(p.id.slice(1)) || 0), 0) + 1;
  const profile: Profile = { id: `p${n}`, name: name.trim() || `Дете ${n}`, avatar, mascot: DEFAULT_MASCOT };
  return switchProfile({ ...s, profiles: [...s.profiles, profile] }, profile.id);
}

/** Изтрива дете (не може активното и не може последното). */
export function removeProfile(s: ProfilesSlice, id: string): ProfilesSlice {
  if (id === s.activeId || s.profiles.length <= 1) return s;
  const stored = { ...s.stored };
  delete stored[id];
  return { ...s, profiles: s.profiles.filter((p) => p.id !== id), stored };
}

export function renameProfile(s: ProfilesSlice, id: string, name: string, avatar?: string): ProfilesSlice {
  return {
    ...s,
    profiles: s.profiles.map((p) => (p.id === id ? { ...p, name: name.trim() || p.name, avatar: avatar ?? p.avatar } : p)),
  };
}
