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
    if (delta.levelUp || delta.sticker) {
      setTimeout(() => {
        playSound(delta.levelUp ? "levelUp" : "reward");
        void speakPhrase(delta.sticker ? phrases.stickerEarned : phrases.levelUp(delta.levelUp as number));
      }, 1600);
    }
  }, []);

  const closeReward = useCallback(
    () => setCelebration((c) => (c ? { ...c, levelUp: undefined, sticker: undefined } : c)),
    [],
  );

  return { celebration, celebrate, closeReward };
}
