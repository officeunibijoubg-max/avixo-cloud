"use client";

import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import type { PlayerProgress, Settings } from "@/lib/types";
import { APP_CONFIG } from "@/config/app";
import { DEFAULT_MASCOT } from "@/config/mascot";
import { DEFAULT_TTS_SPELLING } from "@/config/speech";
import {
  addPlayTime,
  buyItem,
  completeAdventure,
  emptyProgress,
  toggleEquip,
  unequipSlot,
  migrateEquipped,
  type EquipSlot,
  migrateProgress,
  recordGameAnswer,
  recordWriting,
  type BuyResult,
  type ProgressDelta,
} from "@/services/progress";
import {
  addProfile,
  defaultProfile,
  removeProfile,
  renameProfile,
  switchProfile,
  type Profile,
  type ProfilesSlice,
} from "@/services/profiles";

// Едно хранилище за прогреса и настройките, пазено в localStorage.
// При нужда от cloud sync / профили — тук се сменя storage, а не екраните.

export const defaultSettings: Settings = {
  sound: true,
  speech: true,
  music: false,
  volume: 0.8,
  highContrast: false,
  largeUI: false,
  reduceMotion: false,
  difficulty: "easy",
  showGuide: true,
  unlockAll: false,
  mascot: DEFAULT_MASCOT,
  ttsSpelling: DEFAULT_TTS_SPELLING,
};

type GameState = {
  progress: PlayerProgress;
  settings: Settings;
  hydrated: boolean;
  recordWriting: (character: string, score: number, isCorrect: boolean, coins: number) => ProgressDelta;
  recordGameAnswer: (isCorrect: boolean) => ProgressDelta;
  /** Изиграна докрай игра (или прочетена приказка „story-<id>“). */
  countGame: (id: string) => void;
  buy: (id: string) => BuyResult;
  /** Слага/сваля купена вещ на нейното място. */
  toggleEquip: (id: string) => void;
  unequip: (slot: EquipSlot) => void;
  completeAdventure: () => ProgressDelta;
  addPlayTime: (seconds: number) => void;
  markUnlocksSeen: (ids: string[]) => void;
  updateSettings: (patch: Partial<Settings>) => void;
  resetProgress: () => void;
  // Профили (няколко деца на едно устройство).
  profiles: Profile[];
  activeId: string;
  stored: Record<string, PlayerProgress>;
  switchProfile: (id: string) => void;
  addProfile: (name: string, avatar: string) => void;
  removeProfile: (id: string) => void;
  renameProfile: (id: string, name: string, avatar?: string) => void;
};

/** Прилага чиста функция върху профилите; героят (mascot) живее в настройките. */
function applyProfiles(s: GameState, fn: (slice: ProfilesSlice) => ProfilesSlice): Partial<GameState> {
  const next = fn({ progress: s.progress, mascot: s.settings.mascot, profiles: s.profiles, activeId: s.activeId, stored: s.stored });
  return {
    progress: next.progress,
    profiles: next.profiles,
    activeId: next.activeId,
    stored: next.stored,
    settings: { ...s.settings, mascot: next.mascot },
  };
}

export const useGameStore = create<GameState>()(
  persist(
    (set, get) => ({
      progress: emptyProgress(),
      settings: defaultSettings,
      hydrated: false,
      recordWriting: (character, score, isCorrect, coins) => {
        const { progress, delta } = recordWriting(get().progress, character, score, isCorrect, coins);
        set({ progress });
        return delta;
      },
      recordGameAnswer: (isCorrect) => {
        const { progress, delta } = recordGameAnswer(get().progress, isCorrect);
        set({ progress });
        return delta;
      },
      countGame: (id) =>
        set((s) => ({
          progress: {
            ...s.progress,
            gamesPlayed: s.progress.gamesPlayed + 1,
            played: { ...s.progress.played, [id]: (s.progress.played?.[id] ?? 0) + 1 },
          },
        })),
      buy: (id) => {
        const res = buyItem(get().progress, id);
        if (res.ok) set({ progress: res.progress });
        return res;
      },
      toggleEquip: (id) => set((s) => ({ progress: toggleEquip(s.progress, id) })),
      unequip: (slot) => set((s) => ({ progress: unequipSlot(s.progress, slot) })),
      completeAdventure: () => {
        const { progress, delta } = completeAdventure(get().progress);
        set({ progress });
        return delta;
      },
      addPlayTime: (seconds) => set((s) => ({ progress: addPlayTime(s.progress, seconds) })),
      markUnlocksSeen: (ids) =>
        set((s) => ({
          progress: { ...s.progress, seenUnlocks: [...new Set([...(s.progress.seenUnlocks ?? []), ...ids])] },
        })),
      updateSettings: (patch) => set((s) => ({ settings: { ...s.settings, ...patch } })),
      resetProgress: () => set({ progress: emptyProgress() }),
      profiles: [defaultProfile()],
      activeId: defaultProfile().id,
      stored: {},
      switchProfile: (id) => set((s) => applyProfiles(s, (x) => switchProfile(x, id))),
      addProfile: (name, avatar) => set((s) => applyProfiles(s, (x) => addProfile(x, name, avatar))),
      removeProfile: (id) => set((s) => applyProfiles(s, (x) => removeProfile(x, id))),
      renameProfile: (id, name, avatar) => set((s) => applyProfiles(s, (x) => renameProfile(x, id, name, avatar))),
    }),
    {
      name: APP_CONFIG.storageKey,
      version: 4,
      storage: createJSONStorage(() => localStorage),
      partialize: (s) => ({ progress: s.progress, settings: s.settings, profiles: s.profiles, activeId: s.activeId, stored: s.stored }),
      // v1 → v2: точките стават монети. v2 → v3: досегашният прогрес става профил „Дете“.
      // v3 → v4: единственият аксесоар отива на своето място (глава, лице…).
      migrate: (persisted, version) => {
        const p = (persisted ?? {}) as {
          progress?: Record<string, unknown>;
          settings?: Partial<Settings>;
          profiles?: Profile[];
          activeId?: string;
          stored?: Record<string, PlayerProgress>;
        };
        const progress = version < 2 ? migrateProgress(p.progress ?? {}) : (p.progress as PlayerProgress | undefined);
        const stored = Object.fromEntries(Object.entries(p.stored ?? {}).map(([id, sp]) => [id, migrateEquipped(sp)]));
        return {
          progress: migrateEquipped({ ...emptyProgress(), ...progress }),
          settings: { ...defaultSettings, ...p.settings },
          profiles: p.profiles ?? [defaultProfile()],
          activeId: p.activeId ?? defaultProfile().id,
          stored,
        };
      },
      // Нови полета от бъдещи версии получават стойности по подразбиране.
      merge: (persisted, current) => {
        const p = (persisted ?? {}) as Partial<Pick<GameState, "progress" | "settings" | "profiles" | "activeId" | "stored">>;
        return {
          ...current,
          ...p,
          progress: { ...current.progress, ...p.progress },
          settings: { ...current.settings, ...p.settings },
        };
      },
      // Хидратираме ръчно след монтиране, за да съвпадне с HTML-а от сървъра.
      skipHydration: true,
      onRehydrateStorage: () => () => useGameStore.setState({ hydrated: true }),
    },
  ),
);
