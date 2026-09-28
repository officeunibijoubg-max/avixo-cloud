"use client";

import type { ReactElement } from "react";
import { LionSvg } from "@/components/game/LionSvg";

// Илюстрациите на думите — всички в един стил с Лъвчо: плоски цветове,
// заоблени форми и еднакъв тъмнокафяв контур. Координатите са 0..100.
// Ключът се пише в data/words.ts; непознат ключ се показва като текст (напр. емоджи).

const O = "#3f2a14"; // контур
const SW = 3; // дебелина на контура
const line = { stroke: O, strokeWidth: SW, strokeLinecap: "round", strokeLinejoin: "round" } as const;

const Eye = ({ x, y, r = 3 }: { x: number; y: number; r?: number }) => (
  <>
    <circle cx={x} cy={y} r={r} fill={O} />
    <circle cx={x + r * 0.35} cy={y - r * 0.35} r={r * 0.35} fill="#fff" />
  </>
);

const ART: Record<string, () => ReactElement> = {
  bus: () => (
    <>
      <rect x="10" y="28" width="80" height="44" rx="10" fill="#fbbf24" {...line} />
      <rect x="18" y="36" width="16" height="14" rx="3" fill="#bae6fd" {...line} />
      <rect x="40" y="36" width="16" height="14" rx="3" fill="#bae6fd" {...line} />
      <rect x="62" y="36" width="20" height="14" rx="3" fill="#bae6fd" {...line} />
      <path d="M10 58 H90" {...line} />
      <circle cx="28" cy="74" r="8" fill="#475569" {...line} />
      <circle cx="72" cy="74" r="8" fill="#475569" {...line} />
    </>
  ),
  balloon: () => (
    <>
      <path d="M50 74 Q46 84 52 94" fill="none" {...line} />
      <ellipse cx="50" cy="40" rx="24" ry="30" fill="#f43f5e" {...line} />
      <path d="M46 70 L54 70 L50 76 Z" fill="#f43f5e" {...line} />
      <ellipse cx="41" cy="30" rx="5" ry="9" fill="#fff" opacity="0.6" />
    </>
  ),
  train: () => (
    <>
      <rect x="44" y="24" width="38" height="44" rx="6" fill="#ef4444" {...line} />
      <rect x="52" y="32" width="22" height="14" rx="3" fill="#bae6fd" {...line} />
      <rect x="14" y="44" width="34" height="24" rx="5" fill="#3b82f6" {...line} />
      <rect x="20" y="30" width="10" height="14" fill="#475569" {...line} />
      <circle cx="25" cy="22" r="5" fill="#e2e8f0" {...line} />
      <circle cx="26" cy="74" r="8" fill="#475569" {...line} />
      <circle cx="54" cy="74" r="8" fill="#475569" {...line} />
      <circle cx="74" cy="74" r="8" fill="#475569" {...line} />
    </>
  ),
  mushroom: () => (
    <>
      <path d="M40 56 Q38 80 42 86 H58 Q62 80 60 56 Z" fill="#fef3c7" {...line} />
      <path d="M14 56 Q16 18 50 16 Q84 18 86 56 Z" fill="#dc2626" {...line} />
      <circle cx="34" cy="38" r="6" fill="#fff" />
      <circle cx="58" cy="30" r="5" fill="#fff" />
      <circle cx="68" cy="46" r="5" fill="#fff" />
      <circle cx="46" cy="50" r="3.5" fill="#fff" />
    </>
  ),
  watermelon: () => (
    <>
      <path d="M8 40 A42 42 0 0 0 92 40 Z" fill="#22c55e" {...line} />
      <path d="M16 40 A34 34 0 0 0 84 40 Z" fill="#f43f5e" />
      <path d="M8 40 H92" {...line} />
      {[30, 42, 56, 68, 48].map((x, i) => (
        <ellipse key={i} cx={x} cy={i === 4 ? 60 : 50} rx="2.5" ry="4" fill={O} />
      ))}
    </>
  ),
  deer: () => (
    <>
      <path d="M36 22 L30 8 M30 14 L22 10 M64 22 L70 8 M70 14 L78 10" fill="none" {...line} />
      <ellipse cx="50" cy="44" rx="20" ry="22" fill="#b45309" {...line} />
      <ellipse cx="28" cy="34" rx="8" ry="5" fill="#b45309" {...line} />
      <ellipse cx="72" cy="34" rx="8" ry="5" fill="#b45309" {...line} />
      <ellipse cx="50" cy="56" rx="10" ry="8" fill="#fde68a" {...line} />
      <circle cx="50" cy="52" r="3.5" fill={O} />
      <Eye x={42} y={40} />
      <Eye x={58} y={40} />
      <path d="M36 66 Q34 86 40 92 H60 Q66 86 64 66" fill="#b45309" {...line} />
    </>
  ),
  frog: () => (
    <>
      <ellipse cx="50" cy="60" rx="36" ry="26" fill="#4ade80" {...line} />
      <circle cx="34" cy="34" r="12" fill="#4ade80" {...line} />
      <circle cx="66" cy="34" r="12" fill="#4ade80" {...line} />
      <circle cx="34" cy="34" r="6" fill="#fff" />
      <circle cx="66" cy="34" r="6" fill="#fff" />
      <Eye x={34} y={35} r={3} />
      <Eye x={66} y={35} r={3} />
      <path d="M30 62 Q50 76 70 62" fill="none" {...line} />
      <circle cx="26" cy="58" r="4" fill="#fb7185" opacity="0.5" />
      <circle cx="74" cy="58" r="4" fill="#fb7185" opacity="0.5" />
    </>
  ),
  bunny: () => (
    <>
      <ellipse cx="38" cy="24" rx="7" ry="20" fill="#f1f5f9" {...line} />
      <ellipse cx="62" cy="24" rx="7" ry="20" fill="#f1f5f9" {...line} />
      <ellipse cx="38" cy="26" rx="3" ry="12" fill="#fda4af" />
      <ellipse cx="62" cy="26" rx="3" ry="12" fill="#fda4af" />
      <circle cx="50" cy="60" r="26" fill="#f1f5f9" {...line} />
      <Eye x={41} y={56} />
      <Eye x={59} y={56} />
      <path d="M46 66 L50 70 L54 66 Z" fill="#fb7185" />
      <path d="M50 70 V74 M44 76 Q50 80 56 76" fill="none" {...line} strokeWidth={2} />
    </>
  ),
  needle: () => (
    <>
      <path d="M22 82 L80 16" stroke="#94a3b8" strokeWidth="7" strokeLinecap="round" />
      <path d="M22 82 L80 16" fill="none" {...line} strokeWidth={2} />
      <ellipse cx="74" cy="23" rx="2" ry="5" transform="rotate(41 74 23)" fill="#fff" {...line} strokeWidth={1.5} />
      <path d="M74 23 Q88 40 70 52 Q52 64 64 82 Q72 92 86 86" fill="none" stroke="#ef4444" strokeWidth="3" strokeLinecap="round" />
    </>
  ),
  yoyo: () => (
    <>
      <path d="M50 8 V36" fill="none" {...line} />
      <circle cx="50" cy="60" r="28" fill="#8b5cf6" {...line} />
      <circle cx="50" cy="60" r="16" fill="#c4b5fd" {...line} />
      <circle cx="50" cy="60" r="5" fill="#fbbf24" {...line} />
      <circle cx="50" cy="8" r="4" fill="#fbbf24" {...line} />
    </>
  ),
  kitten: () => (
    <>
      <path d="M26 40 L24 14 L44 28 Z M74 40 L76 14 L56 28 Z" fill="#fb923c" {...line} />
      <circle cx="50" cy="52" r="30" fill="#fb923c" {...line} />
      <ellipse cx="50" cy="62" rx="14" ry="10" fill="#fed7aa" />
      <Eye x={39} y={48} r={4} />
      <Eye x={61} y={48} r={4} />
      <path d="M47 58 L53 58 L50 62 Z" fill="#f43f5e" />
      <path d="M50 62 Q46 68 42 66 M50 62 Q54 68 58 66" fill="none" {...line} strokeWidth={2} />
      <path d="M20 58 H34 M20 64 L34 62 M80 58 H66 M80 64 L66 62" {...line} strokeWidth={1.5} />
    </>
  ),
  lion: () => <></>,
  teddy: () => (
    <>
      <circle cx="28" cy="26" r="11" fill="#a16207" {...line} />
      <circle cx="72" cy="26" r="11" fill="#a16207" {...line} />
      <circle cx="50" cy="44" r="26" fill="#a16207" {...line} />
      <ellipse cx="50" cy="54" rx="12" ry="9" fill="#fde68a" {...line} />
      <Eye x={40} y={40} />
      <Eye x={60} y={40} />
      <ellipse cx="50" cy="50" rx="4" ry="3" fill={O} />
      <path d="M46 57 Q50 60 54 57" fill="none" {...line} strokeWidth={2} />
      <ellipse cx="50" cy="84" rx="22" ry="14" fill="#a16207" {...line} />
      <ellipse cx="50" cy="86" rx="10" ry="7" fill="#fde68a" />
    </>
  ),
  nose: () => (
    <>
      <path d="M50 12 Q44 40 30 64 Q26 78 40 80 Q46 86 50 80 Q54 86 60 80 Q74 78 70 64 Q56 40 50 12 Z" fill="#fcd34d" {...line} />
      <ellipse cx="42" cy="72" rx="4" ry="3" fill={O} />
      <ellipse cx="58" cy="72" rx="4" ry="3" fill={O} />
    </>
  ),
  cloud: () => (
    <>
      <path
        d="M24 72 Q8 72 10 58 Q12 44 28 46 Q30 26 50 28 Q66 22 74 40 Q92 40 90 58 Q88 72 72 72 Z"
        fill="#e0f2fe"
        {...line}
      />
      <Eye x={42} y={54} r={2.5} />
      <Eye x={60} y={54} r={2.5} />
      <path d="M46 62 Q51 66 56 62" fill="none" {...line} strokeWidth={2} />
    </>
  ),
  duckling: () => (
    <>
      <ellipse cx="52" cy="66" rx="32" ry="22" fill="#fde047" {...line} />
      <circle cx="38" cy="36" r="18" fill="#fde047" {...line} />
      <path d="M18 38 L6 42 L18 46 Z" fill="#fb923c" {...line} />
      <Eye x={34} y={32} />
      <path d="M52 62 Q66 54 74 66" fill="none" {...line} />
      <path d="M40 18 Q44 10 48 18" fill="none" {...line} strokeWidth={2} />
    </>
  ),
  rocket: () => (
    <>
      <path d="M50 8 Q70 26 68 62 H32 Q30 26 50 8 Z" fill="#e2e8f0" {...line} />
      <circle cx="50" cy="36" r="8" fill="#38bdf8" {...line} />
      <path d="M32 50 L18 70 L32 66 Z M68 50 L82 70 L68 66 Z" fill="#ef4444" {...line} />
      <path d="M38 62 Q50 96 62 62 Z" fill="#fb923c" {...line} />
      <path d="M44 62 Q50 82 56 62 Z" fill="#fde047" />
    </>
  ),
  elephant: () => (
    <>
      <ellipse cx="22" cy="44" rx="16" ry="20" fill="#94a3b8" {...line} />
      <ellipse cx="78" cy="44" rx="16" ry="20" fill="#94a3b8" {...line} />
      <circle cx="50" cy="44" r="26" fill="#cbd5e1" {...line} />
      <path d="M44 60 Q42 80 50 88 Q56 92 60 86" fill="none" stroke={O} strokeWidth="12" strokeLinecap="round" />
      <path d="M44 60 Q42 80 50 88 Q56 92 60 86" fill="none" stroke="#cbd5e1" strokeWidth="6" strokeLinecap="round" />
      <Eye x={40} y={40} />
      <Eye x={60} y={40} />
      <circle cx="34" cy="52" r="4" fill="#fb7185" opacity="0.5" />
      <circle cx="66" cy="52" r="4" fill="#fb7185" opacity="0.5" />
    </>
  ),
  ball: () => (
    <>
      <circle cx="50" cy="50" r="38" fill="#fff" {...line} />
      <path d="M50 12 A38 38 0 0 1 88 50 H50 Z" fill="#ef4444" />
      <path d="M50 88 A38 38 0 0 1 12 50 H50 Z" fill="#3b82f6" />
      <circle cx="50" cy="50" r="38" fill="none" {...line} />
      <path d="M12 50 H88 M50 12 V88" fill="none" {...line} strokeWidth={2} />
      <circle cx="50" cy="50" r="8" fill="#fde047" {...line} />
    </>
  ),
  ear: () => (
    <>
      <path d="M36 20 Q64 4 74 32 Q82 56 60 70 Q54 74 54 84 Q52 94 40 90 Q30 86 36 74" fill="#fcd34d" {...line} />
      <path d="M46 34 Q60 26 64 40 Q66 52 54 56 Q48 58 50 66" fill="none" {...line} />
    </>
  ),
  fairy: () => (
    <>
      <ellipse cx="30" cy="46" rx="18" ry="12" transform="rotate(-25 30 46)" fill="#c4b5fd" opacity="0.8" {...line} />
      <ellipse cx="70" cy="46" rx="18" ry="12" transform="rotate(25 70 46)" fill="#c4b5fd" opacity="0.8" {...line} />
      <path d="M50 44 L34 88 H66 Z" fill="#f472b6" {...line} />
      <circle cx="50" cy="32" r="14" fill="#fed7aa" {...line} />
      <path d="M36 28 Q50 10 64 28" fill="#fbbf24" {...line} />
      <Eye x={45} y={33} r={2} />
      <Eye x={55} y={33} r={2} />
      <path d="M66 58 L84 30" fill="none" {...line} />
      <path d="M84 22 L86 28 L92 30 L86 32 L84 38 L82 32 L76 30 L82 28 Z" fill="#fde047" {...line} strokeWidth={1.5} />
    </>
  ),
  bread: () => (
    <>
      <path d="M12 70 Q8 34 50 28 Q92 34 88 70 Q88 80 78 80 H22 Q12 80 12 70 Z" fill="#d97706" {...line} />
      <path d="M30 46 L38 38 M46 44 L54 36 M62 46 L70 38" fill="none" {...line} stroke="#fde68a" />
    </>
  ),
  flower: () => (
    <>
      <path d="M50 56 V92" fill="none" stroke="#16a34a" strokeWidth="5" strokeLinecap="round" />
      <path d="M50 78 Q66 66 74 74 Q64 86 50 80" fill="#4ade80" {...line} />
      {Array.from({ length: 6 }, (_, i) => {
        const a = (i / 6) * Math.PI * 2;
        return <circle key={i} cx={50 + Math.cos(a) * 16} cy={36 + Math.sin(a) * 16} r="11" fill="#f472b6" {...line} />;
      })}
      <circle cx="50" cy="36" r="10" fill="#fde047" {...line} />
    </>
  ),
  umbrella: () => (
    <>
      <path d="M50 44 V80 Q50 90 42 90 Q34 90 34 82" fill="none" {...line} />
      <path d="M8 46 Q10 12 50 10 Q90 12 92 46 Q84 38 76 46 Q68 38 58 46 Q50 38 42 46 Q32 38 24 46 Q16 38 8 46 Z" fill="#8b5cf6" {...line} />
      <path d="M50 10 Q40 26 42 46 M50 10 Q60 26 58 46" fill="none" {...line} strokeWidth={2} />
    </>
  ),
  hat: () => (
    <>
      <ellipse cx="50" cy="66" rx="42" ry="14" fill="#f9a8d4" {...line} />
      <path d="M26 64 Q26 26 50 26 Q74 26 74 64 Z" fill="#f9a8d4" {...line} />
      <path d="M26 56 Q50 64 74 56 V64 Q50 72 26 64 Z" fill="#8b5cf6" {...line} />
      <circle cx="70" cy="56" r="6" fill="#fde047" {...line} />
    </>
  ),
  stork: () => (
    <>
      <path d="M44 70 L40 94 M56 70 L60 94" fill="none" stroke="#f97316" strokeWidth="3" strokeLinecap="round" />
      <ellipse cx="52" cy="58" rx="24" ry="16" fill="#fff" {...line} />
      <path d="M62 64 Q80 62 84 50 Q72 56 62 54 Z" fill={O} />
      <path d="M36 52 Q30 34 34 20" fill="none" stroke={O} strokeWidth="9" strokeLinecap="round" />
      <path d="M36 52 Q30 34 34 20" fill="none" stroke="#fff" strokeWidth="4" strokeLinecap="round" />
      <circle cx="36" cy="18" r="8" fill="#fff" {...line} />
      <path d="M40 16 L64 22 L40 22 Z" fill="#f97316" {...line} strokeWidth={2} />
      <Eye x={35} y={16} r={1.8} />
    </>
  ),
  angle: () => (
    <>
      <path d="M16 84 V16 L84 84 Z" fill="#fde047" {...line} />
      <path d="M28 72 V52 L48 72 Z" fill="#fff" {...line} strokeWidth={2} />
      <path d="M16 70 H22 M16 56 H22 M16 42 H22 M16 28 H22" {...line} strokeWidth={2} />
    </>
  ),
  blue: () => (
    <>
      <path d="M50 12 Q26 44 26 60 A24 24 0 0 0 74 60 Q74 44 50 12 Z" fill="#3b82f6" {...line} />
      <ellipse cx="40" cy="58" rx="5" ry="9" fill="#fff" opacity="0.5" />
    </>
  ),
  top: () => (
    <>
      <path d="M50 10 V24" {...line} />
      <path d="M20 36 Q50 20 80 36 L54 88 Q50 94 46 88 Z" fill="#14b8a6" {...line} />
      <path d="M24 44 Q50 32 76 44" fill="none" stroke="#fde047" strokeWidth="6" />
      <path d="M32 60 Q50 52 68 60" fill="none" stroke="#f472b6" strokeWidth="6" />
      <path d="M20 36 Q50 20 80 36 L54 88 Q50 94 46 88 Z" fill="none" {...line} />
      <path d="M86 70 Q94 60 88 50 M12 70 Q6 60 12 50" fill="none" {...line} strokeWidth={2} opacity="0.5" />
    </>
  ),
  apple: () => (
    <>
      <path d="M50 30 Q34 18 22 32 Q10 50 22 72 Q32 90 50 82 Q68 90 78 72 Q90 50 78 32 Q66 18 50 30 Z" fill="#ef4444" {...line} />
      <path d="M50 30 Q50 18 56 10" fill="none" {...line} />
      <path d="M54 18 Q66 8 74 16 Q64 24 54 18 Z" fill="#4ade80" {...line} strokeWidth={2} />
      <ellipse cx="34" cy="44" rx="5" ry="9" fill="#fff" opacity="0.5" />
    </>
  ),
  pear: () => (
    <>
      <path d="M50 14 Q60 14 60 34 Q80 50 76 72 Q72 90 50 90 Q28 90 24 72 Q20 50 40 34 Q40 14 50 14 Z" fill="#a3e635" {...line} />
      <path d="M50 14 V6" {...line} />
      <path d="M52 10 Q62 2 70 8 Q62 14 52 10 Z" fill="#16a34a" {...line} strokeWidth={2} />
    </>
  ),
  strawberry: () => (
    <>
      <path d="M50 88 Q18 64 20 36 Q34 26 50 32 Q66 26 80 36 Q82 64 50 88 Z" fill="#ef4444" {...line} />
      <path d="M30 30 L40 20 L50 28 L60 20 L70 30 Q50 40 30 30 Z" fill="#22c55e" {...line} />
      {[
        [38, 46],
        [56, 44],
        [46, 58],
        [62, 60],
        [40, 68],
        [52, 74],
      ].map(([x, y], i) => (
        <ellipse key={i} cx={x} cy={y} rx="1.8" ry="2.8" fill="#fde047" />
      ))}
    </>
  ),
  ladybug: () => (
    <>
      <circle cx="50" cy="26" r="12" fill={O} />
      <circle cx="50" cy="58" r="30" fill="#ef4444" {...line} />
      <path d="M50 28 V88" {...line} />
      {[
        [36, 48],
        [64, 48],
        [34, 68],
        [66, 68],
      ].map(([x, y], i) => (
        <circle key={i} cx={x} cy={y} r="5" fill={O} />
      ))}
      <circle cx="45" cy="24" r="2" fill="#fff" />
      <circle cx="55" cy="24" r="2" fill="#fff" />
    </>
  ),
  star: () => (
    <path
      d="M50 8 L61 36 L91 38 L68 57 L76 88 L50 71 L24 88 L32 57 L9 38 L39 36 Z"
      fill="#fde047"
      {...line}
    />
  ),
  basket: () => (
    <>
      <path d="M20 44 Q50 4 80 44" fill="none" stroke="#b45309" strokeWidth="5" strokeLinecap="round" />
      <path d="M12 44 H88 L78 86 H22 Z" fill="#d97706" {...line} />
      <path d="M16 58 H84 M19 72 H81 M36 44 L38 86 M50 44 V86 M64 44 L62 86" fill="none" {...line} strokeWidth={2} opacity="0.6" />
    </>
  ),
  mom: () => (
    <>
      <path d="M22 60 Q16 22 50 16 Q84 22 78 60 Q80 80 68 86 H32 Q20 80 22 60 Z" fill="#92400e" {...line} />
      <circle cx="50" cy="50" r="24" fill="#fed7aa" {...line} />
      <path d="M28 44 Q34 24 50 26 Q66 24 72 44 Q60 34 50 38 Q40 34 28 44 Z" fill="#92400e" />
      <Eye x={41} y={50} />
      <Eye x={59} y={50} />
      <circle cx="35" cy="58" r="4" fill="#fb7185" opacity="0.5" />
      <circle cx="65" cy="58" r="4" fill="#fb7185" opacity="0.5" />
      <path d="M43 62 Q50 69 57 62" fill="#e11d48" {...line} strokeWidth={2} />
      <path d="M30 90 Q50 76 70 90" fill="#f472b6" {...line} />
    </>
  ),
  grandma: () => (
    <>
      <circle cx="50" cy="20" r="11" fill="#e5e7eb" {...line} />
      <circle cx="50" cy="52" r="26" fill="#fed7aa" {...line} />
      <path d="M24 50 Q24 26 50 26 Q76 26 76 50 Q64 38 50 40 Q36 38 24 50 Z" fill="#e5e7eb" {...line} />
      <circle cx="41" cy="52" r="6" fill="#fff" opacity="0.6" {...line} strokeWidth={2} />
      <circle cx="59" cy="52" r="6" fill="#fff" opacity="0.6" {...line} strokeWidth={2} />
      <path d="M47 52 H53" {...line} strokeWidth={2} />
      <circle cx="41" cy="52" r="2.2" fill={O} />
      <circle cx="59" cy="52" r="2.2" fill={O} />
      <path d="M43 65 Q50 71 57 65" fill="none" {...line} strokeWidth={2} />
      <path d="M28 92 Q50 76 72 92" fill="#8b5cf6" {...line} />
    </>
  ),
  eye: () => (
    <>
      <path d="M8 50 Q50 10 92 50 Q50 90 8 50 Z" fill="#fff" {...line} />
      <circle cx="50" cy="50" r="17" fill="#38bdf8" {...line} />
      <circle cx="50" cy="50" r="8" fill={O} />
      <circle cx="55" cy="44" r="4" fill="#fff" />
      <path d="M22 30 L18 22 M36 22 L34 13 M50 19 V10 M64 22 L66 13 M78 30 L82 22" {...line} strokeWidth={2.5} />
    </>
  ),
  house: () => (
    <>
      <path d="M18 48 V88 H82 V48" fill="#fde68a" {...line} />
      <path d="M8 52 L50 16 L92 52 Z" fill="#ef4444" {...line} />
      <rect x="42" y="62" width="16" height="26" rx="3" fill="#b45309" {...line} />
      <rect x="24" y="58" width="12" height="12" rx="2" fill="#bae6fd" {...line} />
      <rect x="64" y="58" width="12" height="12" rx="2" fill="#bae6fd" {...line} />
      <rect x="66" y="22" width="8" height="14" fill="#94a3b8" {...line} />
    </>
  ),
  horse: () => (
    <>
      <path d="M30 88 L32 64 M44 88 L42 66 M62 88 L62 66 M76 88 L74 64" {...line} strokeWidth={7} stroke="#92400e" />
      <ellipse cx="54" cy="58" rx="28" ry="15" fill="#b45309" {...line} />
      <path d="M30 52 Q22 30 26 18 L40 16 Q44 34 40 52 Z" fill="#b45309" {...line} />
      <path d="M24 20 Q12 26 14 36 Q20 40 28 34" fill="#b45309" {...line} />
      <path d="M40 16 Q48 24 44 44 M42 22 Q50 30 46 48" fill="none" stroke="#1f2937" strokeWidth="5" strokeLinecap="round" />
      <path d="M82 54 Q94 58 90 76" fill="none" stroke="#1f2937" strokeWidth="5" strokeLinecap="round" />
      <Eye x={30} y={26} r={2.5} />
    </>
  ),
  water: () => (
    <>
      <path d="M24 20 H76 L70 88 H30 Z" fill="#e0f2fe" {...line} />
      <path d="M27 44 H73 L70 88 H30 Z" fill="#38bdf8" />
      <path d="M24 20 H76 L70 88 H30 Z" fill="none" {...line} />
      <path d="M27 44 Q38 38 50 44 Q62 50 73 44" fill="none" stroke="#fff" strokeWidth="3" strokeLinecap="round" />
      <ellipse cx="38" cy="64" rx="3" ry="8" fill="#fff" opacity="0.6" />
    </>
  ),
  letters: () => (
    <>
      <rect x="10" y="30" width="36" height="36" rx="8" fill="#c4b5fd" {...line} />
      <rect x="54" y="30" width="36" height="36" rx="8" fill="#fde047" {...line} />
      <text x="28" y="58" fontSize="26" fontWeight="900" textAnchor="middle" fill={O}>
        А
      </text>
      <text x="72" y="58" fontSize="26" fontWeight="900" textAnchor="middle" fill={O}>
        Б
      </text>
    </>
  ),
};

export const hasIllustration = (name?: string) => !!name && name in ART;

/** Илюстрация по ключ; ако ключът е непознат (напр. емоджи), го показва като текст. */
export function Illustration({ name, size = 96, className }: { name?: string; size?: number; className?: string }) {
  if (!name) return null;
  if (name === "lion") return <LionSvg pose="happy" size={size} className={className} />;
  const Art = ART[name];
  if (!Art)
    return (
      <span className={className} style={{ fontSize: size * 0.8, lineHeight: 1 }}>
        {name}
      </span>
    );
  return (
    <svg viewBox="0 0 100 100" width={size} height={size} className={className} aria-hidden>
      <Art />
    </svg>
  );
}
