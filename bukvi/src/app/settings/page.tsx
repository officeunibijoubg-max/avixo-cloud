"use client";

import { useEffect, useState } from "react";
import type { Difficulty } from "@/lib/types";
import { useGameStore } from "@/store/gameStore";
import { hasBulgarianVoice, speakPhrase } from "@/services/speech";
import { playSound } from "@/services/sounds";
import { ui } from "@/content/phrases";
import { cn } from "@/lib/cn";
import { PageShell } from "@/components/ui/PageShell";
import { Toggle } from "@/components/ui/Toggle";
import { ParentGate } from "@/components/layout/ParentGate";

const DIFFICULTIES: { id: Difficulty; icon: string; title: string; text: string }[] = [
  { id: "easy", icon: "🌟", title: "Лесно", text: "Видима буква, стрелки, голям толеранс" },
  { id: "normal", icon: "✏️", title: "Нормално", text: "Пунктир, по-точна проверка" },
  { id: "hard", icon: "🚀", title: "Трудно", text: "Празно поле, само формата" },
];

export default function SettingsPage() {
  return (
    <PageShell back="/" title={ui.menu.settings} showScore={false}>
      <ParentGate>
        <SettingsForm />
      </ParentGate>
    </PageShell>
  );
}

function SettingsForm() {
  const settings = useGameStore((s) => s.settings);
  const update = useGameStore((s) => s.updateSettings);
  const [voice, setVoice] = useState<boolean | null>(null);

  // Гласовете се зареждат асинхронно — проверяваме малко по-късно.
  useEffect(() => {
    const t = setTimeout(() => setVoice(hasBulgarianVoice()), 600);
    return () => clearTimeout(t);
  }, []);

  return (
    <div className="flex max-w-2xl flex-col gap-3">
      <h2 className="mt-2 text-xl font-black">Трудност на писането</h2>
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
        {DIFFICULTIES.map((d) => (
          <button
            key={d.id}
            type="button"
            onClick={() => update({ difficulty: d.id })}
            className={cn(
              "card-soft flex flex-col items-center gap-1 rounded-2xl bg-white p-4 text-center shadow-sm",
              settings.difficulty === d.id && "ring-4 ring-grape",
            )}
          >
            <span className="text-4xl">{d.icon}</span>
            <span className="text-lg font-black">{d.title}</span>
            <span className="text-muted text-sm text-slate-500">{d.text}</span>
          </button>
        ))}
      </div>

      <h2 className="mt-4 text-xl font-black">Звук</h2>
      <Toggle icon="🔔" label="Звукови ефекти" checked={settings.sound} onChange={(v) => update({ sound: v })} />
      <Toggle icon="🗣️" label="Говор" checked={settings.speech} onChange={(v) => update({ speech: v })} />
      {voice === false && (
        <p className="rounded-2xl bg-amber-100 p-3 text-sm font-bold">
          На това устройство няма български глас за синтез на говор. Приложението работи и без него — текстовете се показват
          на екрана. Български глас може да се добави от настройките на устройството (Език и говор).
        </p>
      )}
      <label className="card-soft flex min-h-16 items-center gap-4 rounded-2xl bg-white px-5 py-3 text-lg font-bold shadow-sm">
        <span className="text-3xl" aria-hidden>
          🔊
        </span>
        <span>Сила</span>
        <input
          type="range"
          min={0}
          max={1}
          step={0.1}
          value={settings.volume}
          onChange={(e) => update({ volume: Number(e.target.value) })}
          onPointerUp={() => {
            playSound("correct");
            void speakPhrase("Браво!");
          }}
          className="h-3 flex-1 accent-grape"
        />
      </label>

      <h2 className="mt-4 text-xl font-black">Достъпност</h2>
      <Toggle icon="🌓" label="Висок контраст" checked={settings.highContrast} onChange={(v) => update({ highContrast: v })} />
      <Toggle icon="🔍" label="По-големи елементи" checked={settings.largeUI} onChange={(v) => update({ largeUI: v })} />
      <Toggle icon="🐢" label="Без анимации" checked={settings.reduceMotion} onChange={(v) => update({ reduceMotion: v })} />
    </div>
  );
}
