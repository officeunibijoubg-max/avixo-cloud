"use client";

import Link from "next/link";
import { useState } from "react";
import { ALPHABET } from "@/data/alphabet";
import { DIGITS } from "@/data/numbers";
import { useGameStore } from "@/store/gameStore";
import { accuracy } from "@/services/progress";
import type { CharacterProgress } from "@/lib/types";
import { cn } from "@/lib/cn";
import { PageShell } from "@/components/ui/PageShell";
import { ParentGate } from "@/components/layout/ParentGate";

const MIN_ATTEMPTS_FOR_HARD = 2;

export default function ParentPage() {
  return (
    <PageShell back="/" title="За родители" showScore={false}>
      <ParentGate>
        <Dashboard />
      </ParentGate>
    </PageShell>
  );
}

function Dashboard() {
  const progress = useGameStore((s) => s.progress);
  const resetProgress = useGameStore((s) => s.resetProgress);
  const [confirmReset, setConfirmReset] = useState(false);

  const chars = Object.values(progress.characters).filter((c) => c.attempts > 0);
  const letters = chars.filter((c) => (ALPHABET as readonly string[]).includes(c.character));
  const digits = chars.filter((c) => (DIGITS as readonly string[]).includes(c.character));
  const totalAttempts = chars.reduce((a, c) => a + c.attempts, 0);
  const totalCorrect = chars.reduce((a, c) => a + c.correct, 0);
  const avg = totalAttempts ? Math.round((totalCorrect / totalAttempts) * 100) : 0;
  const byAccuracy = [...chars].sort((a, b) => accuracy(b) - accuracy(a) || b.bestScore - a.bestScore);
  const strongest = byAccuracy.filter((c) => accuracy(c) >= 70).slice(0, 5);
  const hardest = [...chars]
    .filter((c) => c.attempts >= MIN_ATTEMPTS_FOR_HARD && accuracy(c) < 70)
    .sort((a, b) => accuracy(a) - accuracy(b))
    .slice(0, 5);

  const cards = [
    { label: "Научени букви", value: `${letters.filter((c) => c.mastered).length} / ${ALPHABET.length}` },
    { label: "Научени цифри", value: `${digits.filter((c) => c.mastered).length} / ${DIGITS.length}` },
    { label: "Средна точност", value: `${avg}%` },
    { label: "Общо упражнения", value: progress.exercises },
    { label: "Изиграни игри", value: progress.gamesPlayed },
    { label: "Точки", value: progress.totalPoints },
    { label: "Звезди", value: progress.stars },
    { label: "Най-дълга поредица", value: progress.bestStreak },
  ];

  return (
    <div className="flex flex-col gap-6 text-base">
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        {cards.map((c) => (
          <div key={c.label} className="card-soft rounded-2xl bg-white p-4 shadow-sm">
            <div className="text-muted text-sm font-bold text-slate-500">{c.label}</div>
            <div className="text-3xl font-black tabular-nums">{c.value}</div>
          </div>
        ))}
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <Section title="💪 Най-силни">
          {strongest.length ? strongest.map((c) => <Row key={c.character} c={c} />) : <Empty />}
        </Section>
        <Section title="🌱 Най-трудни">
          {hardest.length ? (
            hardest.map((c) => <Row key={c.character} c={c} note="Препоръчваме още упражнения." />)
          ) : (
            <Empty />
          )}
        </Section>
      </div>

      <Section title="📋 Всички упражнявани символи">
        {byAccuracy.length ? (
          <div className="grid grid-cols-2 gap-x-6 sm:grid-cols-3 lg:grid-cols-4">
            {byAccuracy.map((c) => (
              <Row key={c.character} c={c} />
            ))}
          </div>
        ) : (
          <Empty />
        )}
      </Section>

      <div className="flex flex-wrap gap-3">
        <Link href="/settings/" className="rounded-2xl bg-grape px-6 py-3 text-lg font-black text-white">
          ⚙️ Настройки
        </Link>
        {confirmReset ? (
          <button
            type="button"
            onClick={() => {
              resetProgress();
              setConfirmReset(false);
            }}
            className="rounded-2xl bg-rose-600 px-6 py-3 text-lg font-black text-white"
          >
            Да, изтрий целия прогрес
          </button>
        ) : (
          <button type="button" onClick={() => setConfirmReset(true)} className="rounded-2xl bg-slate-200 px-6 py-3 text-lg font-bold">
            Нулирай прогреса
          </button>
        )}
      </div>
      <p className="text-muted text-sm text-slate-500">
        Всички данни се пазят само на това устройство. Приложението не събира лични данни, няма реклами и проследяване.
      </p>
    </div>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="card-soft rounded-2xl bg-white p-4 shadow-sm">
      <h2 className="mb-2 text-xl font-black">{title}</h2>
      {children}
    </section>
  );
}

function Row({ c, note }: { c: CharacterProgress; note?: string }) {
  const pct = accuracy(c);
  return (
    <div className="flex items-center gap-3 border-b border-slate-100 py-2 last:border-0">
      <span className="w-10 text-3xl font-black">{c.character}</span>
      <div className="flex-1">
        <div className="h-3 overflow-hidden rounded-full bg-slate-100">
          <div className={cn("h-full rounded-full", pct >= 80 ? "bg-leaf" : pct >= 60 ? "bg-sun" : "bg-coral")} style={{ width: `${pct}%` }} />
        </div>
        {note && <div className="text-muted mt-1 text-sm text-slate-500">{note}</div>}
      </div>
      <span className="w-12 text-right font-black tabular-nums">{pct}%</span>
    </div>
  );
}

const Empty = () => <p className="text-muted text-slate-500">Още няма достатъчно упражнения.</p>;
