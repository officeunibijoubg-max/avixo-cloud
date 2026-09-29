"use client";

import { useCallback, useRef, useState } from "react";
import type { ProgressDelta } from "@/services/progress";
import { playSound } from "@/services/sounds";
import { speakPhrase } from "@/services/speech";
import { phrases } from "@/content/phrases";
import type { Celebration } from "./RewardAnimation";

/** Показва награда след верен отговор: конфети, монети, звезда, ниво или стикер — със звуци. */
export function useCelebration() {
  const [celebration, setCelebration] = useState<Celebration | null>(null);
  const seq = useRef(0);

  const celebrate = useCallback((delta: ProgressDelta) => {
    seq.current += 1;
    setCelebration({ id: seq.current, ...delta });
    playSound("confetti");
    if (delta.starsGained > 0) setTimeout(() => playSound("star"), 500);
    if (delta.levelUp || delta.sticker || delta.challengeDone) {
      const text = delta.sticker
        ? phrases.stickerEarned
        : delta.levelUp
          ? phrases.levelUp(delta.levelUp)
          : phrases.challengeDone(delta.challengeDone?.streak ?? 1);
      setTimeout(() => {
        playSound(delta.levelUp ? "levelUp" : "reward");
        void speakPhrase(text);
      }, 1600);
    }
  }, []);

  // Големите карти се показват една по една: стикер → ниво → предизвикателство.
  const closeReward = useCallback(
    () =>
      setCelebration((c) => {
        if (!c) return c;
        if (c.sticker) return { ...c, sticker: undefined };
        if (c.levelUp) return { ...c, levelUp: undefined };
        return { ...c, challengeDone: undefined };
      }),
    [],
  );

  return { celebration, celebrate, closeReward };
}
