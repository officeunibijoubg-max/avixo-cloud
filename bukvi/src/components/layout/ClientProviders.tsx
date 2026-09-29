"use client";

import { useEffect } from "react";
import { useGameStore } from "@/store/gameStore";
import { configureSounds, setMusic, unlockSounds } from "@/services/sounds";
import { configureSpeech, unlockSpeech } from "@/services/speech";
import { getShopItem } from "@/data/shop";

/** Зарежда прогреса, прилага настройките и регистрира service worker-а. */
export function ClientProviders({ children }: { children: React.ReactNode }) {
  const settings = useGameStore((s) => s.settings);
  const backgroundId = useGameStore((s) => s.progress.equipped.background);

  useEffect(() => {
    void useGameStore.persist.rehydrate();
    if ("serviceWorker" in navigator && process.env.NODE_ENV === "production") {
      navigator.serviceWorker.register("/sw.js").catch(() => {});
    }
  }, []);

  useEffect(() => {
    configureSounds({ enabled: settings.sound, volume: settings.volume });
    setMusic(settings.music);
    configureSpeech({ enabled: settings.speech, volume: settings.volume, spelling: settings.ttsSpelling, voice: settings.voice, voiceName: settings.voiceName });
    const root = document.documentElement;
    root.dataset.contrast = String(settings.highContrast);
    root.dataset.large = String(settings.largeUI);
    root.dataset.motion = settings.reduceMotion ? "reduce" : "full";
  }, [settings]);

  // Фонът от магазина се слага на цялата страница.
  useEffect(() => {
    const bg = getShopItem(backgroundId ?? "")?.background;
    if (bg) {
      document.body.dataset.bg = backgroundId;
      document.body.style.setProperty("--app-bg", bg);
    } else {
      delete document.body.dataset.bg;
      document.body.style.removeProperty("--app-bg");
    }
  }, [backgroundId]);

  // Първото докосване отключва звука и гласа (изискване на браузърите, особено на Android).
  // При докосване „активирането“ идва чак при отпускане на пръста (touchend/click),
  // затова слушаме тези събития, а не pointerdown.
  useEffect(() => {
    const events = ["touchend", "click", "keydown"] as const;
    const unlock = () => {
      unlockSounds();
      if (!unlockSpeech()) return; // браузърът още не е разрешил звук — чакаме следващото докосване
      events.forEach((e) => window.removeEventListener(e, unlock, true));
    };
    events.forEach((e) => window.addEventListener(e, unlock, true));
    return () => events.forEach((e) => window.removeEventListener(e, unlock, true));
  }, []);

  // Време за игра (за родителя): броим само когато екранът е видим и детето
  // е докосвало нещо през последната минута.
  useEffect(() => {
    let last = Date.now();
    const touch = () => (last = Date.now());
    window.addEventListener("pointerdown", touch);
    const id = setInterval(() => {
      if (document.visibilityState === "visible" && Date.now() - last < 60_000) useGameStore.getState().addPlayTime(15);
    }, 15_000);
    return () => {
      window.removeEventListener("pointerdown", touch);
      clearInterval(id);
    };
  }, []);

  return <>{children}</>;
}
