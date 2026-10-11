"use client";

import { useEffect } from "react";
import { usePathname, useRouter } from "next/navigation";
import { phrases } from "@/content/phrases";
import { useGameStore } from "@/store/gameStore";
import { unseenCertificates } from "@/services/certificates";
import { playSound } from "@/services/sounds";
import { speakPhrase } from "@/services/speech";
import { BigButton } from "@/components/ui/BigButton";
import { Certificate } from "./Certificate";

// Не прекъсваме писането и родителската зона — показваме на спокойните екрани.
const SHOW_ON = ["/", "/learn/", "/rewards/", "/games/"];

/** „Получи сертификат!“ — веднъж за всеки новоспечелен сертификат. */
export function CertificatePopup() {
  const router = useRouter();
  const path = usePathname() ?? "/";
  const progress = useGameStore((s) => s.progress);
  const hydrated = useGameStore((s) => s.hydrated);
  const name = useGameStore((s) => s.profiles.find((p) => p.id === s.activeId)?.name ?? "");
  const markSeen = useGameStore((s) => s.markCertificatesSeen);
  const next = hydrated && SHOW_ON.includes(path) ? unseenCertificates(progress)[0] : undefined;
  const day = next ? progress.certificates?.[next.id] : undefined;

  useEffect(() => {
    if (!next) return;
    playSound("levelUp");
    void speakPhrase(phrases.certificateEarned);
  }, [next]);

  if (!next || !day) return null;
  const close = (open: boolean) => {
    markSeen([next.id]);
    if (open) router.push(`/certificate/?id=${next.id}`);
  };
  return (
    <div className="fixed inset-0 z-[90] flex items-center justify-center overflow-y-auto bg-black/40 p-4">
      <div className="flex w-full max-w-3xl animate-pop flex-col items-center gap-4">
        <p className="rounded-full bg-white px-6 py-2 text-2xl font-black shadow-md">🏅 {phrases.certificateEarned}</p>
        <Certificate def={next} name={name} day={day} />
        <div className="flex w-full max-w-md gap-3">
          <BigButton icon="➡️" ariaLabel={phrases.continuePath} onClick={() => close(false)} color="bg-white" />
          <BigButton icon="🖨️" label="Виж и разпечатай" onClick={() => close(true)} color="bg-leaf text-white" className="flex-1" pulse />
        </div>
      </div>
    </div>
  );
}
