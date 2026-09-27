"use client";

import Link from "next/link";
import { cn } from "@/lib/cn";
import { playSound } from "@/services/sounds";

type Props = {
  href?: string;
  onClick?: () => void;
  icon: string;
  label?: string;
  color?: string;
  className?: string;
  size?: "md" | "lg";
  disabled?: boolean;
  pulse?: boolean;
  ariaLabel?: string;
};

/** Голям, лесен за натискане бутон с икона — основният елемент на детския интерфейс. */
export function BigButton({ href, onClick, icon, label, color = "bg-white", className, size = "md", disabled, pulse, ariaLabel }: Props) {
  const classes = cn(
    "card-soft flex select-none items-center justify-center gap-3 rounded-[1.75rem] font-extrabold text-ink shadow-[0_6px_0_rgb(0_0_0/0.12)] transition active:translate-y-1 active:shadow-[0_2px_0_rgb(0_0_0/0.12)]",
    size === "lg" ? "min-h-32 flex-col p-5 text-2xl sm:text-3xl" : "min-h-16 px-5 py-3 text-xl",
    color,
    disabled && "pointer-events-none opacity-40",
    pulse && "animate-pulse-soft",
    className,
  );
  const content = (
    <>
      <span aria-hidden className={size === "lg" ? "text-6xl sm:text-7xl" : "text-3xl"}>
        {icon}
      </span>
      {label && <span>{label}</span>}
    </>
  );
  const click = () => {
    playSound("click");
    onClick?.();
  };
  if (href)
    return (
      <Link href={href} onClick={click} className={classes} aria-label={ariaLabel ?? label}>
        {content}
      </Link>
    );
  return (
    <button type="button" onClick={click} className={classes} disabled={disabled} aria-label={ariaLabel ?? label}>
      {content}
    </button>
  );
}
