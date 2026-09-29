"use client";

import { useEffect, useState } from "react";
import type { Difficulty, VoiceSource } from "@/lib/types";
import { useGameStore } from "@/store/gameStore";
import { configureSpeech, hasBulgarianVoice, speakPhrase, speechInfo } from "@/services/speech";
import { playSound, soundState } from "@/services/sounds";
import { ui } from "@/content/phrases";
import { cn } from "@/lib/cn";
import { PageShell } from "@/components/ui/PageShell";
import { Toggle } from "@/components/ui/Toggle";
import { ParentGate } from "@/components/layout/ParentGate";
import { TTS_SPELLINGS } from "@/config/speech";
import { getLessonByChar } from "@/data/lessons";
import { phrases } from "@/content/phrases";

// Пробният текст: сричка, дума и задача — за да се чуе как звучат буквите.
const SAMPLE = [getLessonByChar("Б")?.spokenText, phrases.writeLetter(getLessonByChar("Ж")?.spokenName ?? "")].join(" ");

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

const RECORDED_STATUS = {
  playing: "✅ свири",
  blocked: "⚠️ браузърът спря звука — докоснете екрана и натиснете пак",
  missing: "⚠️ записът не се зареди — проверете интернета",
  none: "… още не е пуснат — натиснете пак",
} as const;

/** Вграденият браузър на Messenger/Facebook/Instagram често спира звука — по-добре Chrome. */
const IN_APP_BROWSER = /FBAN|FBAV|FB_IAB|FBIOS|Messenger|Instagram/i;

/** „Провери звука“: пуска ефект и глас и показва какво вижда устройството — за бърза диагностика. */
function SoundCheck() {
  const [info, setInfo] = useState<string | null>(null);
  const [inApp, setInApp] = useState(false);
  useEffect(() => setInApp(IN_APP_BROWSER.test(navigator.userAgent)), []);
  const run = () => {
    playSound("correct");
    void speakPhrase(phrases.soundWorks);
    // Малко по-късно — гласът и звукът се включват асинхронно (записът се тегли от мрежата).
    setTimeout(() => {
      const s = speechInfo();
      setInfo(
        [
          `Ефекти: ${soundState() === "running" ? "✅ работят" : `⚠️ ${soundState()}`}`,
          `Записан глас: ${RECORDED_STATUS[s.recordedLast]}`,
          `Говор в браузъра: ${s.supported ? "✅ има" : "❌ няма"}`,
          `Гласове: ${s.voices}`,
          `Български глас: ${s.bulgarianVoice ?? (s.voices === 0 ? "списъкът е празен — опитваме по подразбиране" : "❌ няма")}`,
        ].join("\n"),
      );
    }, 2000);
  };
  return (
    <div className="card-soft flex flex-col gap-2 rounded-2xl bg-white p-4 shadow-sm">
      <button type="button" onClick={run} className="self-start rounded-2xl bg-sky px-6 py-3 text-lg font-black text-white">
        🔊 Провери звука
      </button>
      {info && <pre className="whitespace-pre-wrap font-sans text-base font-bold">{info}</pre>}
      {inApp && (
        <p className="rounded-2xl bg-amber-100 p-3 text-sm font-bold">
          Отворено е в браузъра на Messenger/Facebook. За сигурен звук и работа без интернет отворете сайта в Chrome
          (⋮ горе вдясно → „Отваряне в Chrome“) и изберете „Добавяне към началния екран“.
        </p>
      )}
    </div>
  );
}

const VOICES: { id: VoiceSource; label: string; text: string }[] = [
  { id: "recorded", label: "🎙️ Записан глас (препоръчан)", text: "Работи на всяко устройство, и на Android без български синтезатор." },
  { id: "device", label: "📱 Гласът на устройството", text: "Ако таблетът има хубав български глас. Без него се ползва записаният." },
];

function SettingsForm() {
  const settings = useGameStore((s) => s.settings);
  const update = useGameStore((s) => s.updateSettings);
  const resetProgress = useGameStore((s) => s.resetProgress);
  const [confirmReset, setConfirmReset] = useState(false);
  const [resetDone, setResetDone] = useState(false);
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

      <Toggle icon="✏️" label="Показвай шаблона на буквата" checked={settings.showGuide} onChange={(v) => update({ showGuide: v })} />

      <h2 className="mt-4 text-xl font-black">Звук</h2>
      <Toggle icon="🔔" label="Звукови ефекти" checked={settings.sound} onChange={(v) => update({ sound: v })} />
      <Toggle icon="🎵" label="Тиха музика" checked={settings.music} onChange={(v) => update({ music: v })} />
      <Toggle icon="🗣️" label="Говор" checked={settings.speech} onChange={(v) => update({ speech: v })} />
      <div className="card-soft rounded-2xl bg-white p-4 shadow-sm">
        <p className="text-lg font-bold">🎙️ Чий глас говори</p>
        <div className="mt-3 grid grid-cols-1 gap-3 sm:grid-cols-2">
          {VOICES.map((v) => (
            <button
              key={v.id}
              type="button"
              onClick={() => {
                update({ voice: v.id });
                configureSpeech({ enabled: settings.speech, volume: settings.volume, voice: v.id });
                void speakPhrase("Браво!");
              }}
              className={cn(
                "flex flex-col items-start gap-1 rounded-2xl border-2 border-slate-200 p-3 text-left font-bold",
                settings.voice === v.id && "border-grape bg-violet-50 ring-2 ring-grape",
              )}
            >
              <span>{v.label}</span>
              <span className="text-sm font-normal text-slate-500">{v.text}</span>
            </button>
          ))}
        </div>
        {settings.voice === "device" && voice === false && (
          <p className="mt-3 rounded-2xl bg-amber-100 p-3 text-sm font-bold">
            На това устройство няма български глас, затова се ползва записаният. На Android: Настройки → Система → Езици →
            Преобразуване на текст в говор → машина „Google“ → ⚙️ → Инсталиране на гласови данни → Български.
          </p>
        )}
      </div>
      <SoundCheck />
      <p className="text-muted text-sm text-slate-500">
        Ако няма звук: проверете силата на звука за медии (не на звънене) и дали таблетът не е в режим „Без звук“.
      </p>
      <div className="card-soft rounded-2xl bg-white p-4 shadow-sm">
        <p className="text-lg font-bold">🔤 Как звучат буквите</p>
        <p className="text-muted mb-3 text-sm text-slate-500">
          Натиснете всеки вариант и изберете този, при който таблетът казва „Бъ“, а не „бе“ или „ер малък“.
          Изборът се пази само на това устройство.
        </p>
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
          {TTS_SPELLINGS.map((v) => (
            <button
              key={v.id}
              type="button"
              onClick={() => {
                update({ ttsSpelling: v.id });
                void speakPhrase(SAMPLE, v.id);
              }}
              className={cn(
                "flex flex-col items-center gap-1 rounded-2xl border-2 border-slate-200 p-3 font-bold",
                settings.ttsSpelling === v.id && "border-grape bg-violet-50 ring-2 ring-grape",
              )}
            >
              <span className="text-2xl">🔊</span>
              <span>{v.label}</span>
              {settings.ttsSpelling === v.id && <span className="text-sm text-grape">✓ избран</span>}
            </button>
          ))}
        </div>
      </div>
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

      <h2 className="mt-4 text-xl font-black">Прогрес</h2>
      <Toggle icon="🗺️" label="Отключи всички точки от картата" checked={settings.unlockAll} onChange={(v) => update({ unlockAll: v })} />
      {resetDone ? (
        <p className="rounded-2xl bg-green-100 p-4 font-bold">Прогресът е нулиран.</p>
      ) : confirmReset ? (
        <div className="flex flex-wrap gap-3">
          <button
            type="button"
            onClick={() => {
              resetProgress();
              setConfirmReset(false);
              setResetDone(true);
            }}
            className="rounded-2xl bg-rose-600 px-6 py-3 text-lg font-black text-white"
          >
            Да, изтрий целия прогрес
          </button>
          <button type="button" onClick={() => setConfirmReset(false)} className="rounded-2xl bg-slate-200 px-6 py-3 text-lg font-bold">
            Отказ
          </button>
        </div>
      ) : (
        <button type="button" onClick={() => setConfirmReset(true)} className="self-start rounded-2xl bg-slate-200 px-6 py-3 text-lg font-bold">
          🗑️ Нулирай прогреса
        </button>
      )}
    </div>
  );
}
