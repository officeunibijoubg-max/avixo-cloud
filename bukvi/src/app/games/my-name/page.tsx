"use client";

import { useEffect } from "react";
import { FeatureGate } from "@/components/layout/FeatureGate";
import { phrases } from "@/content/phrases";
import { useGameStore } from "@/store/gameStore";
import { nameMissing, nameToWrite } from "@/services/name";
import { speakPhrase } from "@/services/speech";
import { PageShell } from "@/components/ui/PageShell";
import { BigButton } from "@/components/ui/BigButton";
import { Mascot } from "@/components/game/Mascot";
import { WordScreen } from "@/components/lessons/WordScreen";

/** „Моето име“: детето пише името си, щом знае всичките му букви. */
function MyName() {
  const profile = useGameStore((s) => s.profiles.find((p) => p.id === s.activeId));
  const progress = useGameStore((s) => s.progress);
  const unlockAll = useGameStore((s) => s.settings.unlockAll);
  const hydrated = useGameStore((s) => s.hydrated);
  const name = profile?.name ?? "";
  // „Дете“ / „Дете 2“ — името не е попълнено.
  const text = /^Дете( \d+)?$/.test(name) ? "" : nameToWrite(name, progress);
  const missing = unlockAll ? [] : nameMissing(name, progress);
  const message = !text ? phrases.nameNotSet : missing.length ? phrases.nameNeedLetters(missing.join(", ")) : "";

  useEffect(() => {
    if (hydrated && message) void speakPhrase(message);
  }, [hydrated, message]);

  if (!hydrated) return null;

  if (message)
    return (
      <PageShell back="/games/" title="✍️ Моето име">
        <div className="flex flex-1 flex-col items-center justify-center gap-6 text-center">
          {text && (
            <div className="flex gap-2">
              {text.split("").map((c, i) => (
                <span
                  key={i}
                  className={
                    missing.includes(c.toUpperCase())
                      ? "flex h-20 w-14 items-center justify-center rounded-2xl bg-slate-100 text-5xl font-black text-slate-300"
                      : "flex h-20 w-14 items-center justify-center rounded-2xl bg-leaf text-5xl font-black text-white"
                  }
                >
                  {missing.includes(c.toUpperCase()) ? "?" : c}
                </span>
              ))}
            </div>
          )}
          <Mascot message={message} mood="encourage" />
          <BigButton
            href={text ? "/adventure/" : "/games/"}
            icon={text ? "🌟" : "↩️"}
            label={text ? "Към приключението" : "Назад"}
            color="bg-leaf text-white"
            size="lg"
          />
        </div>
      </PageShell>
    );

  return (
    <WordScreen
      word={{ id: "my-name", text, kind: "word", spoken: name }}
      back="/games/"
      nextHref="/games/"
      task={phrases.nameTask}
    />
  );
}

export default function Page() {
  return (
    <FeatureGate id="my-name">
      <MyName />
    </FeatureGate>
  );
}
