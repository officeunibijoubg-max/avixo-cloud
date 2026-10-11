"use client";

import { useSyncExternalStore } from "react";
import { usePathname } from "next/navigation";
import { isSpeaking, subscribeSpeaking } from "@/services/speech";

// Страници за родителя — там гласът не заключва нищо.
const FREE = ["/parent", "/settings", "/profiles"];

/**
 * Докато гласът казва условието или въпроса, невидим слой поема всички докосвания —
 * детето първо чува цялата задача, а играта се „събужда“ щом гласът спре. Без надписи
 * и бутони: малкото дете не знае какво да прави с тях.
 */
export function SpeechLock() {
  const speaking = useSyncExternalStore(subscribeSpeaking, isSpeaking, () => false);
  const path = usePathname() ?? "/";
  if (!speaking || FREE.some((p) => path.startsWith(p))) return null;
  const stop = (e: React.SyntheticEvent) => {
    e.preventDefault();
    e.stopPropagation();
  };
  return (
    <div
      className="fixed inset-0 z-[100] touch-none select-none"
      onPointerDown={stop}
      onPointerUp={stop}
      onClick={stop}
      onTouchStart={stop}
      onTouchEnd={stop}
      aria-hidden
    />
  );
}
