"use client";

import { useEffect, useState, useSyncExternalStore } from "react";
import { usePathname, useRouter } from "next/navigation";
import { phrases } from "@/content/phrases";
import { useGameStore } from "@/store/gameStore";
import { unseenCertificates } from "@/services/certificates";
import { playSound } from "@/services/sounds";
import { isSpeaking, speakPhrase, subscribeSpeaking } from "@/services/speech";
import { BigButton } from "@/components/ui/BigButton";
import { Certificate } from "./Certificate";

// Родителската зона и самият сертификат — без изскачане.
const QUIET = ["/parent", "/settings", "/profiles", "/certificate"];
/** Пауза след последната фраза (напр. „Браво!“), преди да излезе сертификатът. */
const DELAY_MS = 900;

/**
 * „Получи сертификат!“ — излиза веднага в играта, щом е спечелен (след като гласът
 * доизрече похвалата), веднъж за всеки сертификат.
 */
export function CertificatePopup() {
  const router = useRouter();
  const path = usePathname() ?? "/";
  const progress = useGameStore((s) => s.progress);
  const hydrated = useGameStore((s) => s.hydrated);
  const name = useGameStore((s) => s.profiles.find((p) => p.id === s.activeId)?.name ?? "");
  const markSeen = useGameStore((s) => s.markCertificatesSeen);
  const speaking = useSyncExternalStore(subscribeSpeaking, isSpeaking, () => false);
  const candidate = hydrated && !QUIET.some((p) => path.startsWith(p)) ? unseenCertificates(progress)[0] : undefined;
  // Чакаме гласът да замлъкне и още малко, за да не прекъсваме похвалата.
  const [ready, setReady] = useState<string | null>(null);
  useEffect(() => {
    if (!candidate) return setReady(null);
    // Веднъж показан, остава до затваряне (и докато сам казва „Получи сертификат!“).
    if (ready === candidate.id || speaking) return;
    const t = setTimeout(() => setReady(candidate.id), DELAY_MS);
    return () => clearTimeout(t);
  }, [candidate, speaking, ready]);
  const next = candidate && ready === candidate.id ? candidate : undefined;
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
