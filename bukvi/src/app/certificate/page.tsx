"use client";

import { Suspense, useEffect } from "react";
import { useSearchParams } from "next/navigation";
import { getCertificate } from "@/data/certificates";
import { phrases } from "@/content/phrases";
import { useGameStore } from "@/store/gameStore";
import { speakPhrase } from "@/services/speech";
import { PageShell } from "@/components/ui/PageShell";
import { BigButton } from "@/components/ui/BigButton";
import { Mascot } from "@/components/game/Mascot";
import { Certificate } from "@/components/certificate/Certificate";

/** Един сертификат (?id=…) с името на детето — за разглеждане и разпечатване. */
export default function CertificatePage() {
  return (
    <Suspense fallback={null}>
      <CertificateView />
    </Suspense>
  );
}

const DEFAULT_NAME = /^Дете( \d+)?$/;

function CertificateView() {
  const id = useSearchParams().get("id") ?? "";
  const def = getCertificate(id);
  const hydrated = useGameStore((s) => s.hydrated);
  const day = useGameStore((s) => s.progress.certificates?.[id]);
  const name = useGameStore((s) => s.profiles.find((p) => p.id === s.activeId)?.name ?? "");

  useEffect(() => {
    if (hydrated && !day) void speakPhrase(phrases.certificateLocked);
  }, [hydrated, day]);

  if (!hydrated || !def) return null;
  return (
    <PageShell back="/rewards/" title={`${def.icon} ${def.title}`}>
      {/* При печат се вижда само листът (виж .certificate-print в globals.css). */}
      <style>{"@media print{@page{size:A4 landscape;margin:8mm}html,body{background:#fff!important}body *{visibility:hidden}.certificate-print,.certificate-print *{visibility:visible}.certificate-print{position:fixed;inset:0}}"}</style>
      {day ? (
        <div className="flex flex-col items-center gap-5">
          <div className="certificate-print w-full">
            <Certificate def={def} name={name} day={day} />
          </div>
          {DEFAULT_NAME.test(name) && <p className="rounded-2xl bg-amber-100 p-3 text-center text-sm font-bold">{phrases.certificateNameHint}</p>}
          <BigButton icon="🖨️" label="Разпечатай" onClick={() => window.print()} color="bg-sky-200" size="lg" />
        </div>
      ) : (
        <div className="flex flex-1 flex-col items-center justify-center gap-6 text-center">
          <span className="text-9xl">🔒</span>
          <Mascot message={phrases.certificateLocked} mood="encourage" />
          <BigButton href="/step/" icon="➡️" label={phrases.continuePath} color="bg-leaf text-white" size="lg" pulse />
        </div>
      )}
    </PageShell>
  );
}
