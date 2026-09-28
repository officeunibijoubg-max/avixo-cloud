"use client";

import { useEffect } from "react";
import { useGameStore } from "@/store/gameStore";
import { configureSounds } from "@/services/sounds";
import { configureSpeech } from "@/services/speech";

/** Зарежда прогреса, прилага настройките и регистрира service worker-а. */
export function ClientProviders({ children }: { children: React.ReactNode }) {
  const settings = useGameStore((s) => s.settings);

  useEffect(() => {
    void useGameStore.persist.rehydrate();
    if ("serviceWorker" in navigator && process.env.NODE_ENV === "production") {
      navigator.serviceWorker.register("/sw.js").catch(() => {});
    }
  }, []);

  useEffect(() => {
    configureSounds({ enabled: settings.sound, volume: settings.volume });
    configureSpeech({ enabled: settings.speech, volume: settings.volume, spelling: settings.ttsSpelling });
    const root = document.documentElement;
    root.dataset.contrast = String(settings.highContrast);
    root.dataset.large = String(settings.largeUI);
    root.dataset.motion = settings.reduceMotion ? "reduce" : "full";
  }, [settings]);

  return <>{children}</>;
}
