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
  equipItem,
  migrateProgress,
  recordGameAnswer,
  recordWriting,
  type BuyResult,
  type ProgressDelta,
} from "@/services/progress";

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
  countGame: () => void;
  buy: (id: string) => BuyResult;
  equip: (id: string | null, slot?: "accessory" | "background") => void;
  completeAdventure: () => ProgressDelta;
  addPlayTime: (seconds: number) => void;
  updateSettings: (patch: Partial<Settings>) => void;
  resetProgress: () => void;
};

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
      countGame: () => set((s) => ({ progress: { ...s.progress, gamesPlayed: s.progress.gamesPlayed + 1 } })),
      buy: (id) => {
        const res = buyItem(get().progress, id);
        if (res.ok) set({ progress: res.progress });
        return res;
      },
      equip: (id, slot) => set((s) => ({ progress: equipItem(s.progress, id, slot) })),
      completeAdventure: () => {
        const { progress, delta } = completeAdventure(get().progress);
        set({ progress });
        return delta;
      },
      addPlayTime: (seconds) => set((s) => ({ progress: addPlayTime(s.progress, seconds) })),
      updateSettings: (patch) => set((s) => ({ settings: { ...s.settings, ...patch } })),
      resetProgress: () => set({ progress: emptyProgress() }),
    }),
    {
      name: APP_CONFIG.storageKey,
      version: 2,
      storage: createJSONStorage(() => localStorage),
      partialize: (s) => ({ progress: s.progress, settings: s.settings }),
      // Версия 1 имаше точки и звезди на всеки 50 точки — прехвърляме ги в монети.
      migrate: (persisted) => {
        const p = (persisted ?? {}) as { progress?: Record<string, unknown>; settings?: Partial<Settings> };
        return { progress: migrateProgress(p.progress ?? {}), settings: { ...defaultSettings, ...p.settings } };
      },
      // Нови полета от бъдещи версии получават стойности по подразбиране.
      merge: (persisted, current) => {
        const p = (persisted ?? {}) as Partial<Pick<GameState, "progress" | "settings">>;
        return {
          ...current,
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
