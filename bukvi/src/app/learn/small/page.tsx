"use client";

import { useState } from "react";
import { getWorld } from "@/data/adventure";
import { phrases } from "@/content/phrases";
import { useGameStore } from "@/store/gameStore";
import { isWorldUnlocked } from "@/services/adventure";
import { PageShell } from "@/components/ui/PageShell";
import { Mascot } from "@/components/game/Mascot";
import { WorldMap } from "@/components/map/WorldMap";

/** Долината на малките букви (а–я) — отваря се след Планината. */
export default function SmallLettersPage() {
  const world = getWorld("lowercase")!;
  const open = useGameStore((s) => isWorldUnlocked(s.progress, world, s.settings.unlockAll));
  const [message, setMessage] = useState<string>(phrases.smallHello);
  return (
    <PageShell back="/learn/" title="🌈 Малките букви">
      <Mascot compact message={open ? message : phrases.lockedWorld} mood={open ? "happy" : "think"} className="sticky top-2 z-10 mb-4" />
      <WorldMap world={world} onMessage={setMessage} />
    </PageShell>
  );
}
