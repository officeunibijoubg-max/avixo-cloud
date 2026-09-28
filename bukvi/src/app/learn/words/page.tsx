"use client";

import { useState } from "react";
import { getWorld } from "@/data/adventure";
import { phrases } from "@/content/phrases";
import { useGameStore } from "@/store/gameStore";
import { isWorldUnlocked } from "@/services/adventure";
import { PageShell } from "@/components/ui/PageShell";
import { Mascot } from "@/components/game/Mascot";
import { WorldMap } from "@/components/map/WorldMap";

/** Островът на думите: срички и кратки думи. */
export default function WordsMapPage() {
  const world = getWorld("words")!;
  const open = useGameStore((s) => isWorldUnlocked(s.progress, world, s.settings.unlockAll));
  const [message, setMessage] = useState<string>(phrases.mapHello);
  return (
    <PageShell back="/learn/" title="🏝️ Островът на думите">
      <Mascot compact message={open ? message : phrases.lockedWorld} mood={open ? "happy" : "think"} className="sticky top-2 z-10 mb-4" />
      <WorldMap world={world} onMessage={setMessage} />
    </PageShell>
  );
}
