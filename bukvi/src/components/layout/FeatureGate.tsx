"use client";

import { getFeature } from "@/data/unlocks";
import { phrases } from "@/content/phrases";
import { useGameStore } from "@/store/gameStore";
import { missingFor } from "@/services/unlocks";
import { PageShell } from "@/components/ui/PageShell";
import { BigButton } from "@/components/ui/BigButton";
import { Mascot } from "@/components/game/Mascot";

/**
 * Пази игра/част, която още не е отключена (и при отваряне направо по адрес):
 * показва какво липсва, вместо самата игра.
 */
export function FeatureGate({ id, back = "/games/", children }: { id: string; back?: string; children: React.ReactNode }) {
  const feature = getFeature(id);
  // Избираме стабилни стойности от хранилището и смятаме отделно — нов масив в
  // селектора кара Zustand да рисува безкрайно.
  const progress = useGameStore((s) => s.progress);
  const hydrated = useGameStore((s) => s.hydrated);
  const unlockAll = useGameStore((s) => s.settings.unlockAll);
  const missing = hydrated && feature && !unlockAll ? missingFor(progress, feature.unlock) : [];
  if (!feature || missing.length === 0) return <>{children}</>;
  return (
    <PageShell back={back} title={feature.title}>
      <div className="flex flex-1 flex-col items-center justify-center gap-6 text-center">
        <span className="text-9xl">🔒</span>
        <span className="text-7xl opacity-50">{feature.icon}</span>
        <Mascot message={phrases.lockedFeature(missing.join(" и "))} mood="encourage" />
        <BigButton href="/adventure/" icon="🌟" label="Към приключението" color="bg-leaf text-white" size="lg" pulse />
      </div>
    </PageShell>
  );
}
