"use client";

import { useCallback, useRef, useState } from "react";
import type { ProgressDelta } from "@/services/progress";
import { playSound } from "@/services/sounds";
import { speakPhrase } from "@/services/speech";
import { phrases } from "@/content/phrases";
import type { Celebration } from "./RewardAnimation";

/** Показва награда след верен отговор: конфети, точки, звезда, нова награда — със звуци. */
export function useCelebration() {
  const [celebration, setCelebration] = useState<Celebration | null>(null);
  const seq = useRef(0);

  const celebrate = useCallback((delta: ProgressDelta) => {
    seq.current += 1;
    setCelebration({ id: seq.current, ...delta });
    playSound("confetti");
    if (delta.starsGained > 0) setTimeout(() => playSound("star"), 500);
    if (delta.newRewards.length > 0) {
      setTimeout(() => {
        playSound("reward");
        void speakPhrase(phrases.rewardUnlocked(delta.newRewards[0].name));
      }, 1600);
    }
  }, []);

  const closeReward = useCallback(() => setCelebration((c) => (c ? { ...c, newRewards: [] } : c)), []);

  return { celebration, celebrate, closeReward };
}
