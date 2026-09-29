"use client";

import { GAME_GROUPS, GAMES } from "@/data/games";
import { phrases, ui } from "@/content/phrases";
import { PageShell } from "@/components/ui/PageShell";
import { BigButton } from "@/components/ui/BigButton";
import { Mascot } from "@/components/game/Mascot";

export default function GamesPage() {
  return (
    <PageShell back="/" title={ui.menu.play}>
      <Mascot compact message={phrases.pickGame} className="mb-4" />
      <div className="flex flex-col gap-6">
        {GAME_GROUPS.map((group) => {
          const games = GAMES.filter((g) => g.group === group.id);
          if (!games.length) return null;
          return (
            <section key={group.id}>
              <h2 className="mb-3 text-2xl font-black">{group.title}</h2>
              <div className="grid grid-cols-2 gap-4 lg:grid-cols-3">
                {games.map((g) => (
                  <BigButton key={g.id} href={g.href} icon={g.icon} label={g.title} size="lg" color={g.color} />
                ))}
              </div>
            </section>
          );
        })}
      </div>
    </PageShell>
  );
}
