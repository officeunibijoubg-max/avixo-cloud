"use client";

import { numberLessons } from "@/data/lessons";
import { phrases, ui } from "@/content/phrases";
import { tileColor } from "@/lib/colors";
import { PageShell } from "@/components/ui/PageShell";
import { CharacterCard } from "@/components/game/CharacterCard";
import { Mascot } from "@/components/game/Mascot";

export default function NumbersPage() {
  return (
    <PageShell back="/" title={ui.menu.numbers}>
      <Mascot compact message={phrases.pickNumber} className="mb-4" />
      <div className="grid grid-cols-3 gap-3 sm:grid-cols-5">
        {numberLessons.map((lesson, i) => (
          <CharacterCard key={lesson.id} lesson={lesson} color={tileColor(i + 2)} />
        ))}
      </div>
    </PageShell>
  );
}
