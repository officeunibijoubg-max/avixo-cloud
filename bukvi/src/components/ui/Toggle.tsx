"use client";

import { cn } from "@/lib/cn";

type Props = { label: string; icon: string; checked: boolean; onChange: (v: boolean) => void };

export function Toggle({ label, icon, checked, onChange }: Props) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      onClick={() => onChange(!checked)}
      className="card-soft flex min-h-16 w-full items-center gap-4 rounded-2xl bg-white px-5 py-3 text-left text-lg font-bold shadow-sm"
    >
      <span className="text-3xl" aria-hidden>
        {icon}
      </span>
      <span className="flex-1">{label}</span>
      <span className={cn("relative h-9 w-16 rounded-full transition", checked ? "bg-leaf" : "bg-slate-300")}>
        <span className={cn("absolute top-1 size-7 rounded-full bg-white shadow transition-all", checked ? "left-8" : "left-1")} />
      </span>
    </button>
  );
}
