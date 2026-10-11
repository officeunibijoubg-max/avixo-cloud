"use client";

import { useSyncExternalStore } from "react";
import { usePathname } from "next/navigation";
import { phrases } from "@/content/phrases";
import { isSpeaking, subscribeSpeaking } from "@/services/speech";

// Страници за родителя — там гласът не заключва нищо.
const FREE = ["/parent", "/settings", "/profiles"];

/**
 * Докато гласът казва условието или въпроса, прозрачен слой поема всички докосвания —
 * детето първо чува цялата задача и не може да я прекъсне с натискане.
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
    >
      <span className="absolute bottom-[max(1rem,env(safe-area-inset-bottom))] left-1/2 -translate-x-1/2 animate-pulse-soft rounded-full bg-white/90 px-5 py-2 text-xl font-black shadow-md">
        👂 {phrases.listenNow}
      </span>
    </div>
  );
}
