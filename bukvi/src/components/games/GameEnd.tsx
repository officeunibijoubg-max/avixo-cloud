"use client";

import { useEffect } from "react";
import { phrases, ui } from "@/content/phrases";
import { playSound } from "@/services/sounds";
import { speakPhrase } from "@/services/speech";
import { BigButton } from "@/components/ui/BigButton";
import { Mascot } from "@/components/game/Mascot";

/** Финалът на минигра: похвала и два големи бутона. */
export function GameEnd({ correct, onAgain }: { correct: number; onAgain: () => void }) {
  useEffect(() => {
    playSound("levelUp");
    void speakPhrase(phrases.gameOver);
  }, []);
  return (
    <div className="flex flex-1 flex-col items-center justify-center gap-6 text-center">
      <span className="animate-pop text-9xl" aria-hidden>
        🏆
      </span>
      <Mascot message={phrases.gameOver} mood="cheer" />
      <p className="text-4xl font-black">
        {"⭐".repeat(Math.min(5, Math.max(1, Math.round(correct / 2))))}
      </p>
      <div className="flex w-full max-w-md gap-4">
        <BigButton href="/games/" icon="🎮" ariaLabel={ui.back} color="bg-sky-100" />
        <BigButton icon="🔁" label={ui.again} onClick={onAgain} color="bg-leaf text-white" className="flex-1" pulse />
      </div>
    </div>
  );
}
