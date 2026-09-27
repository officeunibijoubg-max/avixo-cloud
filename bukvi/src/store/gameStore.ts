"use client";

import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import type { PlayerProgress, Settings } from "@/lib/types";
import { APP_CONFIG } from "@/config/app";
import { DEFAULT_MASCOT } from "@/config/mascot";
import { emptyProgress, recordGameAnswer, recordWriting, type ProgressDelta } from "@/services/progress";

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
  mascot: DEFAULT_MASCOT,
};

type GameState = {
  progress: PlayerProgress;
  settings: Settings;
  hydrated: boolean;
  recordWriting: (character: string, score: number, isCorrect: boolean, points: number) => ProgressDelta;
  recordGameAnswer: (isCorrect: boolean) => ProgressDelta;
  countGame: () => void;
  updateSettings: (patch: Partial<Settings>) => void;
  resetProgress: () => void;
};

export const useGameStore = create<GameState>()(
  persist(
    (set, get) => ({
      progress: emptyProgress(),
      settings: defaultSettings,
      hydrated: false,
      recordWriting: (character, score, isCorrect, points) => {
        const { progress, delta } = recordWriting(get().progress, character, score, isCorrect, points);
        set({ progress });
        return delta;
      },
      recordGameAnswer: (isCorrect) => {
        const { progress, delta } = recordGameAnswer(get().progress, isCorrect);
        set({ progress });
        return delta;
      },
      countGame: () => set((s) => ({ progress: { ...s.progress, gamesPlayed: s.progress.gamesPlayed + 1 } })),
      updateSettings: (patch) => set((s) => ({ settings: { ...s.settings, ...patch } })),
      resetProgress: () => set({ progress: emptyProgress() }),
    }),
    {
      name: APP_CONFIG.storageKey,
      version: 1,
      storage: createJSONStorage(() => localStorage),
      partialize: (s) => ({ progress: s.progress, settings: s.settings }),
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
