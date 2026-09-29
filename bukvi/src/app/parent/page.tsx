"use client";

import Link from "next/link";
import { ALPHABET } from "@/data/alphabet";
import { DIGITS } from "@/data/numbers";
import { letterWords } from "@/data/words";
import { useGameStore } from "@/store/gameStore";
import { accuracy, levelOf, MAX_LEVEL, lessonStars, todayKey, totalStars } from "@/services/progress";
import { hardCharacters } from "@/services/adventure";
import { weeklyReport } from "@/services/report";
import type { CharacterProgress } from "@/lib/types";
import { cn } from "@/lib/cn";
import { PageShell } from "@/components/ui/PageShell";
import { ParentGate } from "@/components/layout/ParentGate";

export default function ParentPage() {
  return (
    <PageShell back="/" title="За родители" showScore={false}>
      <ParentGate>
        <Dashboard />
      </ParentGate>
    </PageShell>
  );
}

const minutes = (sec: number) => Math.round(sec / 60);

/** Последните 7 дни (включително днес) като ключове "ГГГГ-ММ-ДД". */
function lastDays(n: number): string[] {
  const out: string[] = [];
  for (let i = n - 1; i >= 0; i--) {
    const d = new Date();
    d.setDate(d.getDate() - i);
    out.push(todayKey(d));
  }
  return out;
}

const WEEKDAY = ["Нд", "Пн", "Вт", "Ср", "Чт", "Пт", "Сб"];

function Dashboard() {
  const progress = useGameStore((s) => s.progress);
  const profile = useGameStore((s) => s.profiles.find((p) => p.id === s.activeId));
  const hasMany = useGameStore((s) => s.profiles.length > 1);

  const chars = Object.values(progress.characters).filter((c) => c.attempts > 0);
  const inSet = (set: readonly string[]) => chars.filter((c) => set.includes(c.character));
  const letters = inSet(ALPHABET);
  const digits = inSet(DIGITS);
  const totalAttempts = chars.reduce((a, c) => a + c.attempts, 0);
  const totalCorrect = chars.reduce((a, c) => a + c.correct, 0);
  const avg = totalAttempts ? Math.round((totalCorrect / totalAttempts) * 100) : 0;
  const hard = hardCharacters(progress);
  const days = lastDays(7);
  const week = days.map((d) => progress.playSeconds[d] ?? 0);
  const maxDay = Math.max(60, ...week);
  const report = weeklyReport(progress, todayKey());

  const cards = [
    { label: "Минути днес", value: minutes(progress.playSeconds[todayKey()] ?? 0) },
    { label: "Минути за 7 дни", value: minutes(week.reduce((a, b) => a + b, 0)) },
    { label: "Усвоени букви", value: `${letters.filter((c) => c.mastered).length} / ${ALPHABET.length}` },
    { label: "Усвоени цифри", value: `${digits.filter((c) => c.mastered).length} / ${DIGITS.length}` },
    { label: "Средна точност", value: `${avg}%` },
    { label: "Опити / грешки", value: `${totalAttempts} / ${totalAttempts - totalCorrect}` },
    { label: "Ниво", value: `${levelOf(progress)} / ${MAX_LEVEL}` },
    { label: "Звезди · приключения", value: `${totalStars(progress)} · ${progress.adventuresDone.length}` },
  ];

  const byChar = (set: readonly string[]) => set.map((c) => progress.characters[c]).filter((c): c is CharacterProgress => !!c && c.attempts > 0);

  return (
    <div className="flex flex-col gap-6 text-base">
      {/* Таблото е за детето, което играе в момента; другото се избира от „Кой играе?“. */}
      <div className="flex flex-wrap items-center gap-3">
        <span className="text-5xl">{profile?.avatar}</span>
        <span className="text-2xl font-black">{profile?.name}</span>
        <Link href="/profiles/" className="rounded-2xl bg-white px-4 py-2 font-bold shadow-sm">
          {hasMany ? "Смени детето" : "Добави дете"}
        </Link>
      </div>
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        {cards.map((c) => (
          <div key={c.label} className="card-soft rounded-2xl bg-white p-4 shadow-sm">
            <div className="text-muted text-sm font-bold text-slate-500">{c.label}</div>
            <div className="text-3xl font-black tabular-nums">{c.value}</div>
          </div>
        ))}
      </div>

      <Section title="📅 Тази седмица">
        <ul className="flex flex-col gap-1 text-slate-700">
          <li>
            ⏱️ <b>{minutes(report.seconds)} мин.</b> игра · 🌟 <b>{report.adventures}</b> приключения · 🔥 <b>{report.challengeDays}</b> предизвикателства
          </li>
          <li>
            🆕 Ново: <b className="text-lg">{report.learned.length ? report.learned.join(" ") : "—"}</b>
          </li>
          <li>
            ✏️ Упражнявано: <b className="text-lg">{report.practiced.length ? report.practiced.join(" ") : "—"}</b>
          </li>
        </ul>
        <div className="mt-3 rounded-2xl bg-amber-50 p-3 text-slate-800">
          <b>💡 Идея без екран:</b> {report.idea}
        </div>
        <Link href="/parent/print/" className="mt-3 inline-flex min-h-12 items-center gap-2 rounded-2xl bg-sky-200 px-5 py-2 font-black">
          🖨️ Листове за писане на хартия
        </Link>
      </Section>

      <Section title="⏱️ Време за игра (минути)">
        <div className="flex h-32 items-end gap-3">
          {days.map((d, i) => (
            <div key={d} className="flex flex-1 flex-col items-center gap-1">
              <span className="text-sm font-bold tabular-nums">{minutes(week[i])}</span>
              <span className="w-full rounded-t-lg bg-sky" style={{ height: `${Math.max(4, (week[i] / maxDay) * 80)}px` }} />
              <span className="text-muted text-xs font-bold text-slate-500">{WEEKDAY[new Date(`${d}T12:00`).getDay()]}</span>
            </div>
          ))}
        </div>
      </Section>

      <Section title="🌱 Трудни символи">
        {hard.length ? (
          <>
            <p className="text-muted mb-2 text-slate-600">Препоръчваме още упражнения:</p>
            {hard.slice(0, 6).map((c) => (
              <Row key={c} c={progress.characters[c]} />
            ))}
            <Link
              href="/review/"
              className="mt-3 inline-flex min-h-14 items-center gap-2 rounded-2xl bg-grape px-6 py-3 text-lg font-black text-white"
            >
              ✏️ Упражнявай трудните букви
            </Link>
          </>
        ) : (
          <Empty text="Няма трудни символи засега. 👍" />
        )}
      </Section>

      <div className="grid gap-4 md:grid-cols-2">
        <Section title="🔤 Букви">{byChar(ALPHABET).length ? byChar(ALPHABET).map((c) => <Row key={c.character} c={c} />) : <Empty />}</Section>
        <Section title="🔢 Цифри">{byChar(DIGITS).length ? byChar(DIGITS).map((c) => <Row key={c.character} c={c} />) : <Empty />}</Section>
      </div>

      <Section title="ℹ️ За буквата Ь">
        <p className="text-slate-700">{letterWords["Ь"].parentNote}</p>
      </Section>

      <div className="flex flex-wrap gap-3">
        <Link href="/settings/" className="rounded-2xl bg-grape px-6 py-3 text-lg font-black text-white">
          ⚙️ Настройки и нулиране
        </Link>
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

/** „А — 94% · 12 опита · 1 грешка · ⭐⭐⭐“ */
function Row({ c }: { c: CharacterProgress }) {
  const pct = accuracy(c);
  const mistakes = c.attempts - c.correct;
  return (
    <div className="flex items-center gap-3 border-b border-slate-100 py-2 last:border-0">
      <span className="w-10 text-3xl font-black">{c.character}</span>
      <div className="flex-1">
        <div className="h-3 overflow-hidden rounded-full bg-slate-100">
          <div className={cn("h-full rounded-full", pct >= 80 ? "bg-leaf" : pct >= 60 ? "bg-sun" : "bg-coral")} style={{ width: `${pct}%` }} />
        </div>
        <div className="text-muted mt-1 text-xs font-bold text-slate-500">
          {c.attempts} опита · {mistakes} {mistakes === 1 ? "грешка" : "грешки"} · {"⭐".repeat(lessonStars(c)) || "—"}
          {c.mastered && " · усвоена ✓"}
        </div>
      </div>
      <span className="w-12 text-right text-lg font-black tabular-nums">{pct}%</span>
    </div>
  );
}

const Empty = ({ text = "Още няма упражнения." }: { text?: string }) => <p className="text-muted text-slate-500">{text}</p>;
