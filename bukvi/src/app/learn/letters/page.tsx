"use client";

import { LEVELS, getLessonByChar } from "@/data/lessons";
import { phrases, ui } from "@/content/phrases";
import { tileColor } from "@/lib/colors";
import { PageShell } from "@/components/ui/PageShell";
import { CharacterCard } from "@/components/game/CharacterCard";
import { Mascot } from "@/components/game/Mascot";

export default function LettersPage() {
  const letterLevels = LEVELS.filter((l) => getLessonByChar(l.characters[0])?.type === "letter");
  return (
    <PageShell back="/" title={ui.menu.letters}>
      <Mascot compact message={phrases.pickLetter} className="mb-4" />
      <div className="flex flex-col gap-6">
        {letterLevels.map((lvl) => (
          <section key={lvl.level}>
            <h2 className="text-muted mb-2 text-lg font-extrabold text-slate-500">
              {ui.level} {lvl.level} · {lvl.title}
            </h2>
            <div className="grid grid-cols-3 gap-3 sm:grid-cols-5 lg:grid-cols-6">
              {lvl.characters.map((c, i) => {
                const lesson = getLessonByChar(c);
                return lesson ? <CharacterCard key={c} lesson={lesson} color={tileColor(i + lvl.level)} /> : null;
              })}
            </div>
          </section>
        ))}
      </div>
    </PageShell>
  );
}
