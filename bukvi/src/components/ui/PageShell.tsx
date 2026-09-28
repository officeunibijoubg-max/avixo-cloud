"use client";

import Link from "next/link";
import { CoinCounter } from "@/components/game/CoinCounter";
import { StarCounter } from "@/components/game/StarCounter";
import { ui } from "@/content/phrases";
import { playSound } from "@/services/sounds";

type Props = {
  children: React.ReactNode;
  back?: string;
  title?: string;
  showScore?: boolean;
};

/** Обща рамка на екраните: голям бутон „назад“, заглавие и брояч на точки/звезди. */
export function PageShell({ children, back, title, showScore = true }: Props) {
  return (
    <div className="mx-auto flex min-h-dvh w-full max-w-6xl flex-col px-4 pb-6 pt-[max(1rem,env(safe-area-inset-top))] sm:px-6">
      <header className="mb-4 flex items-center gap-3">
        {back && (
          <Link
            href={back}
            onClick={() => playSound("click")}
            aria-label={ui.back}
            className="card-soft flex size-16 shrink-0 items-center justify-center rounded-2xl bg-white text-3xl shadow-[0_5px_0_rgb(0_0_0/0.12)] active:translate-y-1"
          >
            ⬅️
          </Link>
        )}
        {title && <h1 className="truncate text-2xl font-black sm:text-4xl">{title}</h1>}
        {showScore && (
          <div className="ml-auto flex items-center gap-2">
            <StarCounter />
            <CoinCounter />
          </div>
        )}
      </header>
      <main className="flex flex-1 flex-col">{children}</main>
    </div>
  );
}
