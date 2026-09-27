"use client";

import { cn } from "@/lib/cn";
import { ui } from "@/content/phrases";

type Props = { onPlay: () => void; className?: string; size?: "md" | "lg" };

/** Голямото 🔊 — изговаря отново символа или задачата. */
export function SoundButton({ onPlay, className, size = "md" }: Props) {
  return (
    <button
      type="button"
      onClick={onPlay}
      aria-label={ui.listen}
      className={cn(
        "card-soft flex shrink-0 items-center justify-center rounded-full bg-sky text-white shadow-[0_5px_0_rgb(2_132_199)] active:translate-y-1 active:shadow-none",
        size === "lg" ? "size-20 text-4xl" : "size-16 text-3xl",
        className,
      )}
    >
      🔊
    </button>
  );
}
