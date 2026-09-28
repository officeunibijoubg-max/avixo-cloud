"use client";

import { useState } from "react";
import { getWorld } from "@/data/adventure";
import { phrases } from "@/content/phrases";
import { PageShell } from "@/components/ui/PageShell";
import { Mascot } from "@/components/game/Mascot";
import { WorldMap } from "@/components/map/WorldMap";

/** Гората на буквите (А–П) и Планината на буквите (Р–Я). */
export default function LettersMapPage() {
  const [message, setMessage] = useState<string>(phrases.mapHello);
  return (
    <PageShell back="/learn/" title="🌳 Гората на буквите">
      <Mascot compact message={message} className="sticky top-2 z-10 mb-4" />
      <WorldMap world={getWorld("forest")!} onMessage={setMessage} />
      <h2 id="mountain" className="mb-4 mt-8 text-2xl font-black sm:text-4xl">
        ⛰️ Планината на буквите
      </h2>
      <WorldMap world={getWorld("mountain")!} onMessage={setMessage} />
    </PageShell>
  );
}
