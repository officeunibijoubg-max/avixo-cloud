"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import type { Stroke, StrokeTemplate } from "@/lib/types";
import { measure, toPathD } from "@/lib/polyline";

export type GuideMode = "solid" | "dashed" | "none";
export type GuideAnimation = "none" | "star" | "demo";

type Props = {
  template: StrokeTemplate;
  mode: GuideMode;
  showArrows?: boolean;
  showStart?: boolean;
  animation?: GuideAnimation;
  /** Смяна на ключа рестартира анимацията. */
  animationKey?: number;
  reduceMotion?: boolean;
  onAnimationDone?: () => void;
  /** Вярно изписване: цялата буква светва зелено. */
  celebrate?: boolean;
  /** Частите от буквата, през които детето не е минало (показват се при грешка). */
  missed?: Stroke[];
};

const SPEED = { star: 55, demo: 45 }; // единици в секунда
const PAUSE_BETWEEN = 0.35; // секунди между движенията

/**
 * SVG слой под мастилото: тетрадни линии, светлият шаблон, стрелки,
 * начални точки с номера и анимирана звездичка/молив, които показват как се пише.
 */
export function StrokeGuide({
  template,
  mode,
  showArrows,
  showStart,
  animation = "none",
  animationKey = 0,
  reduceMotion,
  onAnimationDone,
  celebrate,
  missed,
}: Props) {
  const measured = useMemo(() => template.strokes.map(measure), [template]);
  // Центърът на буквата — номерата на движенията се слагат навън от него, за да не се застъпват.
  const center = useMemo(() => {
    const pts = template.strokes.flat();
    return { x: pts.reduce((a, p) => a + p.x, 0) / pts.length, y: pts.reduce((a, p) => a + p.y, 0) / pts.length };
  }, [template]);
  const [anim, setAnim] = useState<{ stroke: number; dist: number } | null>(null);
  const doneRef = useRef(onAnimationDone);
  doneRef.current = onAnimationDone;

  useEffect(() => {
    if (animation === "none") {
      setAnim(null);
      return;
    }
    if (reduceMotion) {
      // Без движение: показваме направо целия път.
      setAnim({ stroke: measured.length, dist: 0 });
      const t = setTimeout(() => {
        setAnim(null);
        doneRef.current?.();
      }, 2000);
      return () => clearTimeout(t);
    }
    const speed = SPEED[animation];
    let raf = 0;
    let start = 0;
    // Времева линия: всяко движение + кратка пауза след него.
    const spans = measured.map((m) => m.length / speed);
    const tick = (now: number) => {
      if (!start) start = now;
      let t = (now - start) / 1000;
      for (let i = 0; i < spans.length; i++) {
        if (t <= spans[i]) {
          setAnim({ stroke: i, dist: t * speed });
          raf = requestAnimationFrame(tick);
          return;
        }
        t -= spans[i];
        if (t <= PAUSE_BETWEEN) {
          setAnim({ stroke: i, dist: measured[i].length });
          raf = requestAnimationFrame(tick);
          return;
        }
        t -= PAUSE_BETWEEN;
      }
      // Следата изчезва, за да не се бърка с мастилото на детето.
      setAnim(null);
      doneRef.current?.();
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [animation, animationKey, measured, reduceMotion]);

  const tip = anim && anim.stroke < measured.length ? measured[anim.stroke].at(anim.dist).pt : null;
  const trailColor = animation === "demo" ? "#8b5cf6" : "#fbbf24";

  return (
    <svg viewBox="0 0 100 100" className="pointer-events-none absolute inset-0 size-full" aria-hidden>
      {/* Тетрадни линии: горна, средна, основа. */}
      <line x1="4" x2="96" y1="10" y2="10" stroke="#bfdbfe" strokeWidth="0.6" />
      <line x1="4" x2="96" y1="50" y2="50" stroke="#e0e7ff" strokeWidth="0.5" strokeDasharray="2 2" />
      <line x1="4" x2="96" y1="90" y2="90" stroke="#93c5fd" strokeWidth="0.8" />

      {mode !== "none" &&
        template.strokes.map((s, i) => (
          <path
            key={`g${i}`}
            d={toPathD(s)}
            fill="none"
            stroke={celebrate ? "#86efac" : mode === "solid" ? "#e2e8f0" : "#cbd5e1"}
            strokeWidth={mode === "solid" ? (celebrate ? 11 : 9) : 1.4}
            strokeDasharray={mode === "dashed" ? "3 3" : undefined}
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        ))}

      {mode === "solid" &&
        template.strokes.map((s, i) => (
          <path key={`c${i}`} d={toPathD(s)} fill="none" stroke="#cbd5e1" strokeWidth="0.7" strokeDasharray="1.5 2" strokeLinecap="round" />
        ))}

      {/* Липсващите части: оранжев пунктир, който пулсира. */}
      {missed && missed.length > 0 && (
        <g className={reduceMotion ? undefined : "animate-pulse"}>
          {missed.map((s, i) => (
            <path
              key={`m${i}`}
              d={toPathD(s)}
              fill="none"
              stroke="#f97316"
              strokeWidth="5"
              strokeOpacity="0.85"
              strokeLinecap="round"
            />
          ))}
        </g>
      )}

      {showArrows &&
        measured.map((m, i) => {
          if (m.length < 12) return null;
          const { pt, angle } = m.at(m.length * 0.55);
          return (
            <g key={`a${i}`} transform={`translate(${pt.x} ${pt.y}) rotate(${angle})`}>
              <path d="M-2.2 -2.6 L1.6 0 L-2.2 2.6" fill="none" stroke="#60a5fa" strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round" />
            </g>
          );
        })}

      {/* Следите на анимацията. */}
      {anim &&
        measured.map((m, i) => {
          if (i > anim.stroke) return null;
          const shown = i < anim.stroke ? m.length : anim.dist;
          return (
            <path
              key={`t${i}`}
              d={toPathD(template.strokes[i])}
              fill="none"
              stroke={trailColor}
              strokeOpacity={animation === "demo" ? 0.9 : 0.6}
              strokeWidth={animation === "demo" ? 5 : 3}
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeDasharray={`${shown} 9999`}
            />
          );
        })}

      {showStart &&
        measured.map((m, i) => {
          const start = template.strokes[i][0];
          const along = m.at(Math.min(10, m.length / 2));
          const rad = (along.angle * Math.PI) / 180;
          let nx = -Math.sin(rad);
          let ny = Math.cos(rad);
          if ((along.pt.x - center.x) * nx + (along.pt.y - center.y) * ny < 0) {
            nx = -nx;
            ny = -ny;
          }
          const label = { x: along.pt.x + nx * 6.5, y: along.pt.y + ny * 6.5 };
          return (
            <g key={`s${i}`}>
              <circle cx={start.x} cy={start.y} r="2.6" fill="#22c55e" />
              {template.strokes.length > 1 && (
                <>
                  <circle cx={label.x} cy={label.y} r="3.2" fill="#fff" stroke="#22c55e" strokeWidth="0.6" />
                  <text x={label.x} y={label.y + 1.1} fontSize="4.2" fontWeight="900" textAnchor="middle" fill="#15803d">
                    {i + 1}
                  </text>
                </>
              )}
            </g>
          );
        })}

      {tip && (
        <text x={tip.x} y={tip.y} fontSize="10" textAnchor="middle" dominantBaseline="central">
          {animation === "demo" ? "✏️" : "⭐"}
        </text>
      )}
    </svg>
  );
}
