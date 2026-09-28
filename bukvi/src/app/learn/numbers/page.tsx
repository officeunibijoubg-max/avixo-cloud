"use client";

import { useState } from "react";
import { getWorld } from "@/data/adventure";
import { phrases } from "@/content/phrases";
import { PageShell } from "@/components/ui/PageShell";
import { Mascot } from "@/components/game/Mascot";
import { WorldMap } from "@/components/map/WorldMap";

/** Градът на цифрите (0–9). */
export default function NumbersMapPage() {
  const [message, setMessage] = useState<string>(phrases.mapHello);
  return (
    <PageShell back="/learn/" title="🏙️ Градът на цифрите">
      <Mascot compact message={message} className="sticky top-2 z-10 mb-4" />
      <WorldMap world={getWorld("numbers")!} onMessage={setMessage} />
    </PageShell>
  );
}
