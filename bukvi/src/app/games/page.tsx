"use client";

import { GAMES } from "@/data/games";
import { phrases, ui } from "@/content/phrases";
import { PageShell } from "@/components/ui/PageShell";
import { BigButton } from "@/components/ui/BigButton";
import { Mascot } from "@/components/game/Mascot";

export default function GamesPage() {
  return (
    <PageShell back="/" title={ui.menu.play}>
      <Mascot compact message={phrases.pickGame} className="mb-4" />
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {GAMES.map((g) => (
          <BigButton key={g.id} href={g.href} icon={g.icon} label={g.title} size="lg" color={g.color} />
        ))}
      </div>
    </PageShell>
  );
}
