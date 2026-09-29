"use client";

import { useEffect, useState } from "react";
import type { CharacterLesson, Stroke } from "@/lib/types";
import { letterLessons, lowercaseLessons } from "@/data/alphabet";
import { numberLessons } from "@/data/numbers";
import { useGameStore } from "@/store/gameStore";
import { starsFor } from "@/services/progress";
import { cn } from "@/lib/cn";
import { PageShell } from "@/components/ui/PageShell";
import { ParentGate } from "@/components/layout/ParentGate";
import { Illustration } from "@/components/illustrations/Illustration";

// Листове за писане на хартия (A4): голям образец с номерирани движения,
// редове с пунктирани букви за проследяване и празни редове за самостоятелно писане.

const SETS = [
  { id: "upper", title: "Главни", lessons: letterLessons },
  { id: "lower", title: "Малки", lessons: lowercaseLessons },
  { id: "digits", title: "Цифри", lessons: numberLessons },
] as const;

export default function PrintPage() {
  return (
    <PageShell back="/parent/" title="🖨️ Листове за писане" showScore={false}>
      <style>{"@media print{header{display:none!important}body{background:#fff!important}@page{size:A4;margin:12mm}}"}</style>
      <ParentGate>
        <Sheets />
      </ParentGate>
    </PageShell>
  );
}

function Sheets() {
  const progress = useGameStore((s) => s.progress);
  const hydrated = useGameStore((s) => s.hydrated);
  const [set, setSet] = useState<(typeof SETS)[number]["id"]>("upper");
  const [picked, setPicked] = useState<string[]>([]);

  // По подразбиране — последните научени главни букви (или първите три).
  useEffect(() => {
    if (!hydrated) return;
    const p = useGameStore.getState().progress;
    const learned = letterLessons.filter((l) => starsFor(p, l.character) > 0).map((l) => l.id);
    setPicked(learned.length ? learned.slice(-4) : letterLessons.slice(0, 3).map((l) => l.id));
  }, [hydrated]);

  const all = SETS.flatMap((s) => [...s.lessons]);
  const chosen = picked.map((id) => all.find((l) => l.id === id)).filter((l): l is CharacterLesson => !!l);
  const toggle = (id: string) => setPicked((p) => (p.includes(id) ? p.filter((x) => x !== id) : [...p, id]));

  return (
    <div className="flex flex-col gap-6">
      <div className="card-soft flex flex-col gap-4 rounded-2xl bg-white p-4 shadow-sm print:hidden">
        <p className="text-slate-600">Изберете символи — за всеки се прави отделен лист A4. После натиснете „Печат“ (или „Запази като PDF“).</p>
        <div className="flex gap-2">
          {SETS.map((s) => (
            <button
              key={s.id}
              type="button"
              onClick={() => setSet(s.id)}
              className={cn("rounded-2xl px-4 py-2 font-black", set === s.id ? "bg-grape text-white" : "bg-slate-100")}
            >
              {s.title}
            </button>
          ))}
        </div>
        <div className="flex flex-wrap gap-2">
          {SETS.find((s) => s.id === set)!.lessons.map((l) => (
            <button
              key={l.id}
              type="button"
              onClick={() => toggle(l.id)}
              className={cn(
                "size-12 rounded-xl text-2xl font-black",
                picked.includes(l.id) ? "bg-leaf text-white" : starsFor(progress, l.character) > 0 ? "bg-lime-100" : "bg-slate-100",
              )}
            >
              {l.character}
            </button>
          ))}
        </div>
        <button
          type="button"
          onClick={() => window.print()}
          disabled={!chosen.length}
          className="min-h-14 self-start rounded-2xl bg-leaf px-6 py-3 text-xl font-black text-white disabled:opacity-40"
        >
          🖨️ Печат ({chosen.length})
        </button>
      </div>
      {chosen.map((l) => (
        <Sheet key={l.id} lesson={l} />
      ))}
    </div>
  );
}

const COLORS = ["#e11d48", "#2563eb", "#16a34a", "#9333ea"];
const pts = (s: Stroke) => s.map((p) => `${p.x},${p.y}`).join(" ");

/** Един лист: заглавие, голям образец и 6 реда. */
function Sheet({ lesson }: { lesson: CharacterLesson }) {
  const strokes = lesson.templates[0].strokes;
  return (
    <section className="mx-auto flex w-full max-w-[190mm] flex-col gap-3 bg-white p-4 text-black shadow-sm [break-after:page] print:p-0 print:shadow-none">
      <div className="flex items-center gap-4">
        {lesson.exampleImage && <Illustration name={lesson.exampleImage} size={80} />}
        <div>
          <div className="text-4xl font-black">{lesson.character}</div>
          {lesson.exampleWord && <div className="text-xl font-bold">{lesson.exampleWord}</div>}
        </div>
        <div className="ml-auto text-sm text-slate-500">Име: ____________________</div>
      </div>
      {/* Образец: цветни движения с номер и точка в началото. */}
      <svg viewBox="0 0 100 100" className="mx-auto h-48 w-48">
        <Lines width={100} />
        {strokes.map((s, i) => (
          <g key={i}>
            <polyline points={pts(s)} fill="none" stroke={COLORS[i % 4]} strokeWidth={3} strokeLinecap="round" strokeLinejoin="round" />
            <circle cx={s[0].x} cy={s[0].y} r={4} fill={COLORS[i % 4]} />
            <text x={s[0].x} y={s[0].y + 2.2} fontSize={6} textAnchor="middle" fill="#fff" fontWeight="bold">
              {i + 1}
            </text>
          </g>
        ))}
      </svg>
      {[0, 1, 2, 3, 4, 5].map((row) => (
        <Row key={row} strokes={strokes} dotted={row < 3 ? 6 : row < 5 ? 1 : 0} />
      ))}
    </section>
  );
}

/** Ред от 6 клетки: първите `dotted` са пунктирани за проследяване, останалите — празни. */
function Row({ strokes, dotted }: { strokes: Stroke[]; dotted: number }) {
  return (
    <svg viewBox="0 0 600 100" className="w-full">
      <Lines width={600} />
      {Array.from({ length: dotted }, (_, i) => (
        <g key={i} transform={`translate(${i * 100},0)`}>
          {strokes.map((s, k) => (
            <polyline key={k} points={pts(s)} fill="none" stroke="#9ca3af" strokeWidth={2.5} strokeDasharray="1 4" strokeLinecap="round" />
          ))}
        </g>
      ))}
    </svg>
  );
}

/** Линиите на тетрадката: горна, средна (пунктир) и основа. */
function Lines({ width }: { width: number }) {
  return (
    <g stroke="#cbd5e1" strokeWidth={0.8}>
      <line x1={0} x2={width} y1={10} y2={10} />
      <line x1={0} x2={width} y1={50} y2={50} strokeDasharray="3 3" />
      <line x1={0} x2={width} y1={90} y2={90} stroke="#94a3b8" />
    </g>
  );
}
