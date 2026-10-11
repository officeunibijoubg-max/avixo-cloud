"use client";

import type { CertificateDef } from "@/data/certificates";
import { APP_CONFIG } from "@/config/app";
import { formatDay } from "@/services/certificates";
import { CurrentHero } from "@/components/game/Mascot";

/**
 * Сертификатът: рамка, името на детето, какво е научило и датата.
 * Пропорции A4 (легнал лист), за да се разпечата на цяла страница.
 */
export function Certificate({ def, name, day }: { def: CertificateDef; name: string; day: string }) {
  return (
    <div className="certificate-sheet relative mx-auto aspect-[1.414] w-full max-w-4xl overflow-hidden rounded-[1.5rem] bg-[#fffdf5] p-[3%] text-center text-[#3f2a14] shadow-xl print:rounded-none print:shadow-none">
      {/* Двойна златна рамка */}
      <div className="absolute inset-[2%] rounded-[1rem] border-[6px] border-double border-[#d4a017]" />
      <div className="absolute inset-[4%] rounded-[0.75rem] border-2 border-[#f2c94c]" />
      {["left-[5%] top-[5%]", "right-[5%] top-[5%]", "bottom-[5%] left-[5%]", "bottom-[5%] right-[5%]"].map((pos) => (
        <span key={pos} className={`absolute ${pos} text-[clamp(1rem,4vw,2.5rem)]`} aria-hidden>
          ⭐
        </span>
      ))}

      <div className="relative flex h-full flex-col items-center justify-between py-[3%]">
        <div className="flex flex-col items-center">
          <span className="text-[clamp(1.5rem,5vw,3.5rem)] leading-none" aria-hidden>
            {def.icon}
          </span>
          <h2 className="bg-gradient-to-r from-grape via-berry to-sun bg-clip-text text-[clamp(1.6rem,6vw,4rem)] font-black uppercase tracking-[0.15em] text-transparent">
            Сертификат
          </h2>
          <p className="text-[clamp(0.8rem,2vw,1.25rem)] font-bold text-slate-500">Това удостоверява, че</p>
        </div>

        <div className="flex w-full items-center justify-center gap-[3%]">
          <div className="hidden w-[14%] sm:block print:block" aria-hidden>
            <CurrentHero pose="cheer" size={120} className="h-auto w-full" />
          </div>
          <div className="flex flex-col items-center">
            <p className="border-b-4 border-[#f2c94c] px-[4%] text-[clamp(2rem,8vw,5.5rem)] font-black leading-tight text-grape">{name}</p>
            <p className="mt-[2%] max-w-[90%] text-[clamp(0.9rem,2.6vw,1.75rem)] font-extrabold">{def.achievement}!</p>
          </div>
          <div className="hidden w-[14%] text-[clamp(2rem,6vw,4rem)] sm:block print:block" aria-hidden>
            🏅
          </div>
        </div>

        <div className="flex w-[80%] items-end justify-between text-[clamp(0.7rem,1.8vw,1.1rem)] font-bold">
          <div className="flex flex-col items-center">
            <span>{formatDay(day)}</span>
            <span className="w-full border-t-2 border-slate-300 pt-1 text-slate-500">Дата</span>
          </div>
          <span className="text-slate-400">{APP_CONFIG.name}</span>
          <div className="flex flex-col items-center">
            <span>Лъвчо 🐾</span>
            <span className="w-full border-t-2 border-slate-300 pt-1 text-slate-500">Подпис</span>
          </div>
        </div>
      </div>
    </div>
  );
}
