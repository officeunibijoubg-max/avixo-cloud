"use client";

import { useCallback, useEffect, useImperativeHandle, useMemo, useRef, useState } from "react";
import type { Difficulty, Point, StrokeTemplate, WritingResult } from "@/lib/types";
import { gradeFor, isPassing, pathLength, scoreDrawing } from "@/services/scoring";
import { StrokeGuide, type GuideAnimation, type GuideMode } from "./StrokeGuide";
import { useGameStore } from "@/store/gameStore";
import { cn } from "@/lib/cn";

export type WritingFeedback = "correct" | "wrong" | null;

export type WritingCanvasHandle = {
  clear: () => void;
  check: () => void;
};

export type WritingCanvasProps = {
  character: string;
  templates: StrokeTemplate[];
  difficulty: Difficulty;
  showGuide: boolean;
  onComplete: (result: WritingResult) => void;
  attempt?: number;
  feedback?: WritingFeedback;
  hint?: GuideAnimation;
  hintKey?: number;
  /** Докато се показва резултат, не се пише. */
  locked?: boolean;
  ref?: React.Ref<WritingCanvasHandle>;
};

type InkPoint = Point & { w: number };

const INK = { drawing: "#6d28d9", correct: "#16a34a", wrong: "#e11d48" } as const;
const LINE_WIDTH = 5.5; // в единици на шаблона
/** При пауза толкова време — проверяваме тихо; ако е вярно, приключваме сами. */
const AUTO_CHECK_MS = 1100;
/** При по-дълга пауза проверяваме, дори да не е вярно (детето явно е готово). */
const IDLE_CHECK_MS = 4500;

/**
 * Полето за писане. Мастилото е в <canvas> (бързо при touch), шаблонът е SVG отдолу.
 * Координатите се пазят в единиците на шаблона (0..100), така че оценяването
 * не зависи от размера на екрана.
 */
export function WritingCanvas({
  character,
  templates,
  difficulty,
  showGuide,
  onComplete,
  attempt = 1,
  feedback = null,
  hint = "none",
  hintKey = 0,
  locked = false,
  ref,
}: WritingCanvasProps) {
  const reduceMotion = useGameStore((s) => s.settings.reduceMotion);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const strokesRef = useRef<InkPoint[][]>([]);
  const activePointer = useRef<number | null>(null);
  const timers = useRef<ReturnType<typeof setTimeout>[]>([]);
  const [hasInk, setHasInk] = useState(false);

  const template = templates[0];
  const templateLength = useMemo(() => template.strokes.reduce((a, s) => a + pathLength(s), 0), [template]);
  const minStrokes = useMemo(() => Math.min(...templates.map((t) => t.strokes.length)), [templates]);

  const inkColor = feedback === "correct" ? INK.correct : feedback === "wrong" ? INK.wrong : INK.drawing;

  // ─── рисуване ───
  const setupContext = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return null;
    const ctx = canvas.getContext("2d");
    if (!ctx) return null;
    const scale = canvas.width / 100;
    ctx.setTransform(scale, 0, 0, scale, 0, 0);
    ctx.lineCap = "round";
    ctx.lineJoin = "round";
    return ctx;
  }, []);

  const redraw = useCallback(
    (color: string) => {
      const canvas = canvasRef.current;
      const ctx = setupContext();
      if (!canvas || !ctx) return;
      ctx.clearRect(0, 0, 100, 100);
      ctx.strokeStyle = color;
      ctx.fillStyle = color;
      for (const s of strokesRef.current) {
        if (s.length === 1) {
          ctx.beginPath();
          ctx.arc(s[0].x, s[0].y, s[0].w / 2, 0, Math.PI * 2);
          ctx.fill();
          continue;
        }
        for (let i = 1; i < s.length; i++) {
          ctx.lineWidth = (s[i - 1].w + s[i].w) / 2;
          ctx.beginPath();
          ctx.moveTo(s[i - 1].x, s[i - 1].y);
          ctx.lineTo(s[i].x, s[i].y);
          ctx.stroke();
        }
      }
    },
    [setupContext],
  );

  // Размерът на canvas следва контейнера (и devicePixelRatio за остри линии).
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const resize = () => {
      const rect = canvas.getBoundingClientRect();
      const dpr = Math.min(window.devicePixelRatio || 1, 3);
      const size = Math.round(rect.width * dpr);
      if (canvas.width !== size) {
        canvas.width = size;
        canvas.height = size;
        redraw(inkColor);
      }
    };
    resize();
    const ro = new ResizeObserver(resize);
    ro.observe(canvas);
    return () => ro.disconnect();
  }, [redraw, inkColor]);

  useEffect(() => redraw(inkColor), [inkColor, redraw]);

  const clearTimers = () => {
    timers.current.forEach(clearTimeout);
    timers.current = [];
  };

  const clear = useCallback(() => {
    clearTimers();
    strokesRef.current = [];
    activePointer.current = null;
    setHasInk(false);
    redraw(INK.drawing);
  }, [redraw]);

  // ─── оценяване ───
  const evaluate = useCallback(() => scoreDrawing(strokesRef.current, templates, difficulty), [templates, difficulty]);

  const finish = useCallback(
    (score: number) => {
      clearTimers();
      onComplete({
        score,
        isCorrect: isPassing(score, difficulty),
        grade: gradeFor(score),
        attempt,
        strokeCount: strokesRef.current.length,
      });
    },
    [onComplete, difficulty, attempt],
  );

  const check = useCallback(() => {
    if (strokesRef.current.length === 0 || locked) return;
    finish(evaluate().score);
  }, [evaluate, finish, locked]);

  useImperativeHandle(ref, () => ({ clear, check }), [clear, check]);

  // Нов символ → чисто поле.
  useEffect(() => clear(), [character, clear]);
  useEffect(() => () => clearTimers(), []);

  const scheduleAutoCheck = () => {
    clearTimers();
    const ink = strokesRef.current.reduce((a, s) => a + pathLength(s), 0);
    if (strokesRef.current.length < minStrokes || ink < templateLength * 0.6) {
      timers.current.push(setTimeout(check, IDLE_CHECK_MS));
      return;
    }
    timers.current.push(
      setTimeout(() => {
        const { score } = evaluate();
        if (isPassing(score, difficulty)) finish(score);
        else timers.current.push(setTimeout(check, IDLE_CHECK_MS - AUTO_CHECK_MS));
      }, AUTO_CHECK_MS),
    );
  };

  // ─── pointer events (пръст, стилус, мишка) ───
  const toUnits = (e: { clientX: number; clientY: number; pressure: number; pointerType: string }): InkPoint => {
    const rect = canvasRef.current!.getBoundingClientRect();
    // Натискът се ползва само ако стилусът го подава; не е задължителен.
    const w = e.pointerType === "pen" && e.pressure > 0 ? LINE_WIDTH * (0.7 + 0.6 * e.pressure) : LINE_WIDTH;
    return { x: ((e.clientX - rect.left) / rect.width) * 100, y: ((e.clientY - rect.top) / rect.height) * 100, w };
  };

  const drawSegment = (a: InkPoint, b: InkPoint) => {
    const ctx = setupContext();
    if (!ctx) return;
    ctx.strokeStyle = INK.drawing;
    ctx.lineWidth = (a.w + b.w) / 2;
    ctx.beginPath();
    ctx.moveTo(a.x, a.y);
    ctx.lineTo(b.x, b.y);
    ctx.stroke();
  };

  const onPointerDown = (e: React.PointerEvent<HTMLCanvasElement>) => {
    if (locked || activePointer.current !== null) return;
    if (e.pointerType === "mouse" && e.button !== 0) return;
    e.preventDefault();
    e.currentTarget.setPointerCapture(e.pointerId);
    activePointer.current = e.pointerId;
    clearTimers();
    const pt = toUnits(e);
    strokesRef.current.push([pt]);
    drawSegment(pt, { ...pt, x: pt.x + 0.01 });
    setHasInk(true);
  };

  const onPointerMove = (e: React.PointerEvent<HTMLCanvasElement>) => {
    if (e.pointerId !== activePointer.current) return;
    const stroke = strokesRef.current[strokesRef.current.length - 1];
    const events = e.nativeEvent.getCoalescedEvents?.() ?? [];
    for (const ev of events.length ? events : [e.nativeEvent]) {
      const pt = toUnits(ev);
      const last = stroke[stroke.length - 1];
      // Ограничено sampling: пропускаме почти съвпадащи точки.
      if (Math.hypot(pt.x - last.x, pt.y - last.y) < 0.4) continue;
      stroke.push(pt);
      drawSegment(last, pt);
    }
  };

  const onPointerUp = (e: React.PointerEvent<HTMLCanvasElement>) => {
    if (e.pointerId !== activePointer.current) return;
    activePointer.current = null;
    scheduleAutoCheck();
  };

  const guideMode: GuideMode =
    hint !== "none" ? "solid" : !showGuide || difficulty === "hard" ? "none" : difficulty === "easy" ? "solid" : "dashed";

  return (
    <div
      className={cn(
        "card-soft relative aspect-square w-full touch-none overflow-hidden rounded-[2rem] border-4 shadow-lg transition-colors duration-300",
        feedback === "correct" && "border-leaf bg-green-50 shadow-[0_0_40px_rgb(34_197_94/0.45)]",
        feedback === "wrong" && "border-coral bg-rose-50 shadow-[0_0_30px_rgb(251_113_133/0.35)]",
        !feedback && "border-white bg-white",
      )}
    >
      <StrokeGuide
        template={template}
        mode={guideMode}
        showArrows={guideMode === "solid" && (difficulty === "easy" || hint !== "none")}
        showStart={guideMode !== "none" && !feedback}
        animation={hint}
        animationKey={hintKey}
        reduceMotion={reduceMotion}
      />
      <canvas
        ref={canvasRef}
        className={cn("absolute inset-0 size-full touch-none", locked ? "cursor-default" : "cursor-crosshair")}
        style={{ touchAction: "none" }}
        onPointerDown={onPointerDown}
        onPointerMove={onPointerMove}
        onPointerUp={onPointerUp}
        onPointerCancel={onPointerUp}
        onContextMenu={(e) => e.preventDefault()}
        aria-label={character}
        role="img"
        data-has-ink={hasInk}
      />
      {feedback === "correct" && (
        <div className="pointer-events-none absolute inset-0 flex items-center justify-center" aria-hidden>
          <span className="flex size-32 animate-pop items-center justify-center rounded-full bg-leaf text-7xl text-white shadow-xl">✓</span>
        </div>
      )}
    </div>
  );
}
