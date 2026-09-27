"use client";

import { useEffect, useRef, useState } from "react";
import { randomInt } from "@/lib/random";

const SESSION_KEY = "bukvi-parent-ok";
const HOLD_MS = 3000;

/** Проста задача за възрастен (или задържане 3 секунди), за да не влиза детето случайно. */
export function ParentGate({ children }: { children: React.ReactNode }) {
  const [ok, setOk] = useState<boolean | null>(null);
  const [q, setQ] = useState<{ a: number; b: number } | null>(null);
  const [answer, setAnswer] = useState("");
  const [error, setError] = useState(false);
  const [holding, setHolding] = useState(false);
  const holdTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    let unlocked = false;
    try {
      unlocked = sessionStorage.getItem(SESSION_KEY) === "1";
    } catch {}
    setOk(unlocked);
    setQ({ a: 6 + randomInt(4), b: 4 + randomInt(5) });
  }, []);

  const unlock = () => {
    try {
      sessionStorage.setItem(SESSION_KEY, "1");
    } catch {}
    setOk(true);
  };

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    if (q && Number(answer) === q.a + q.b) unlock();
    else {
      setError(true);
      setAnswer("");
    }
  };

  const startHold = () => {
    setHolding(true);
    holdTimer.current = setTimeout(unlock, HOLD_MS);
  };
  const stopHold = () => {
    setHolding(false);
    if (holdTimer.current) clearTimeout(holdTimer.current);
  };

  if (ok === null) return null;
  if (ok) return <>{children}</>;

  return (
    <div className="flex flex-1 flex-col items-center justify-center gap-6 text-center">
      <span className="text-7xl" aria-hidden>
        🔐
      </span>
      <p className="text-xl font-bold">Само за възрастни</p>
      {q && (
        <form onSubmit={submit} className="card-soft flex flex-col items-center gap-4 rounded-3xl bg-white p-6 shadow-md">
          <label htmlFor="gate" className="text-3xl font-black">
            Колко е {q.a} + {q.b}?
          </label>
          <input
            id="gate"
            inputMode="numeric"
            pattern="[0-9]*"
            autoComplete="off"
            value={answer}
            onChange={(e) => {
              setAnswer(e.target.value.replace(/\D/g, ""));
              setError(false);
            }}
            className="w-32 rounded-2xl border-4 border-slate-200 p-3 text-center text-3xl font-black focus:border-grape focus:outline-none"
          />
          {error && <p className="font-bold text-rose-600">Опитайте отново.</p>}
          <button type="submit" className="rounded-2xl bg-grape px-8 py-3 text-xl font-black text-white">
            Влез
          </button>
        </form>
      )}
      <button
        type="button"
        onPointerDown={startHold}
        onPointerUp={stopHold}
        onPointerLeave={stopHold}
        onPointerCancel={stopHold}
        className="relative overflow-hidden rounded-2xl bg-slate-200 px-6 py-3 font-bold text-slate-700"
      >
        <span
          className="absolute inset-y-0 left-0 bg-grape/30"
          style={{ width: holding ? "100%" : "0%", transition: holding ? `width ${HOLD_MS}ms linear` : "none" }}
        />
        <span className="relative">…или задръжте 3 секунди</span>
      </button>
    </div>
  );
}
