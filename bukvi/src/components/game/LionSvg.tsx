"use client";

import { cn } from "@/lib/cn";

// Лъвчо — собствен 2D герой (SVG), без системни емоджи.
// Всяка поза сменя очите, устата и лапите; движението е с кратки CSS анимации.

export type LionPose = "happy" | "wave" | "think" | "point" | "cheer" | "dance" | "clap" | "encourage" | "sleep";

const MANE = "#f59e0b";
const MANE_DARK = "#d97706";
const FUR = "#fcd34d";
const FUR_LIGHT = "#fef3c7";
const INK = "#3f2a14";
const CHEEK = "#fb7185";

// Лапите за всяка поза: [ляво, дясно] като път от рамото надолу/нагоре.
const ARMS: Record<LionPose, [string, string]> = {
  happy: ["M34 96 Q26 104 30 112", "M86 96 Q94 104 90 112"],
  wave: ["M34 96 Q26 104 30 112", "M86 94 Q100 84 102 66"],
  think: ["M34 96 Q26 104 30 112", "M86 96 Q84 84 72 80"],
  point: ["M34 96 Q26 104 30 112", "M86 94 Q102 92 112 84"],
  cheer: ["M34 94 Q20 82 18 64", "M86 94 Q100 82 102 64"],
  dance: ["M34 94 Q20 86 16 74", "M86 96 Q98 106 106 104"],
  clap: ["M34 96 Q44 90 56 88", "M86 96 Q76 90 64 88"],
  encourage: ["M34 96 Q26 104 30 112", "M86 94 Q100 90 104 78"],
  sleep: ["M34 98 Q44 104 56 104", "M86 98 Q76 104 64 104"],
};

function Eyes({ pose }: { pose: LionPose }) {
  if (pose === "sleep")
    return (
      <g stroke={INK} strokeWidth="2.5" fill="none" strokeLinecap="round">
        <path d="M44 56 Q49 60 54 56" />
        <path d="M66 56 Q71 60 76 56" />
      </g>
    );
  if (pose === "cheer" || pose === "dance" || pose === "clap")
    return (
      <g stroke={INK} strokeWidth="3" fill="none" strokeLinecap="round">
        <path d="M44 57 Q49 51 54 57" />
        <path d="M66 57 Q71 51 76 57" />
      </g>
    );
  // Мисли — гледа нагоре встрани.
  const dx = pose === "think" ? 1.5 : pose === "point" ? 2 : 0;
  const dy = pose === "think" ? -2 : 0;
  return (
    <g>
      <ellipse cx="49" cy="55" rx="4.2" ry="5" fill={INK} />
      <ellipse cx="71" cy="55" rx="4.2" ry="5" fill={INK} />
      <circle cx={50.3 + dx} cy={53 + dy} r="1.6" fill="#fff" />
      <circle cx={72.3 + dx} cy={53 + dy} r="1.6" fill="#fff" />
    </g>
  );
}

function Mouth({ pose }: { pose: LionPose }) {
  switch (pose) {
    case "cheer":
    case "dance":
    case "clap":
      return <path d="M52 70 Q60 82 68 70 Z" fill="#9f1239" stroke={INK} strokeWidth="2" strokeLinejoin="round" />;
    case "think":
      return <path d="M55 73 Q60 71 65 73" stroke={INK} strokeWidth="2.5" fill="none" strokeLinecap="round" />;
    case "sleep":
      return <ellipse cx="60" cy="73" rx="2.5" ry="2" fill={INK} />;
    case "encourage":
      return <path d="M53 71 Q60 77 67 71" stroke={INK} strokeWidth="2.5" fill="none" strokeLinecap="round" />;
    default:
      return <path d="M52 70 Q60 79 68 70" stroke={INK} strokeWidth="2.5" fill="none" strokeLinecap="round" />;
  }
}

/** Самият Лъвчо. `size` е в пиксели; позата сменя изражението и лапите. */
export function LionSvg({ pose = "happy", size = 96, className }: { pose?: LionPose; size?: number; className?: string }) {
  const [left, right] = ARMS[pose];
  const bodyAnim =
    pose === "dance" ? "lion-dance" : pose === "cheer" ? "lion-hop" : pose === "sleep" ? "lion-breathe" : "lion-idle";
  return (
    <svg viewBox="0 0 120 130" width={size} height={(size * 130) / 120} className={cn("overflow-visible", className)} aria-hidden>
      <g className={bodyAnim} style={{ transformOrigin: "60px 120px" }}>
        {/* Опашка */}
        <path d="M84 112 Q104 116 106 100" stroke={MANE_DARK} strokeWidth="4" fill="none" strokeLinecap="round" />
        <circle cx="106" cy="98" r="5" fill={MANE_DARK} />
        {/* Тяло */}
        <ellipse cx="60" cy="106" rx="27" ry="20" fill={FUR} />
        <ellipse cx="60" cy="110" rx="15" ry="12" fill={FUR_LIGHT} />
        {/* Крачета */}
        <ellipse cx="46" cy="124" rx="9" ry="5" fill={FUR} stroke={MANE_DARK} strokeWidth="1.5" />
        <ellipse cx="74" cy="124" rx="9" ry="5" fill={FUR} stroke={MANE_DARK} strokeWidth="1.5" />
        {/* Лапи */}
        <g stroke={FUR} strokeWidth="10" fill="none" strokeLinecap="round">
          <path d={left} className={pose === "clap" ? "lion-clap-l" : undefined} />
          <path d={right} className={pose === "wave" ? "lion-wave" : pose === "clap" ? "lion-clap-r" : undefined} style={{ transformOrigin: "86px 94px" }} />
        </g>
        {/* Грива: кръг от „листенца“ */}
        <g fill={MANE}>
          {Array.from({ length: 12 }, (_, i) => {
            const a = (i / 12) * Math.PI * 2;
            return <circle key={i} cx={60 + Math.cos(a) * 30} cy={58 + Math.sin(a) * 30} r="12" />;
          })}
        </g>
        <circle cx="60" cy="58" r="30" fill={MANE_DARK} />
        {/* Уши */}
        <circle cx="38" cy="36" r="8" fill={FUR} />
        <circle cx="82" cy="36" r="8" fill={FUR} />
        <circle cx="38" cy="36" r="4" fill={CHEEK} opacity="0.6" />
        <circle cx="82" cy="36" r="4" fill={CHEEK} opacity="0.6" />
        {/* Лице */}
        <circle cx="60" cy="60" r="26" fill={FUR} />
        <ellipse cx="60" cy="70" rx="13" ry="10" fill={FUR_LIGHT} />
        <circle cx="42" cy="66" r="4.5" fill={CHEEK} opacity="0.45" />
        <circle cx="78" cy="66" r="4.5" fill={CHEEK} opacity="0.45" />
        <Eyes pose={pose} />
        {pose === "think" && <path d="M44 46 L53 48 M67 48 L76 45" stroke={INK} strokeWidth="2" strokeLinecap="round" />}
        {/* Нос */}
        <path d="M55 64 Q60 60 65 64 Q60 69 55 64 Z" fill="#7c2d12" />
        <Mouth pose={pose} />
      </g>
      {pose === "sleep" && (
        <text x="92" y="30" fontSize="16" fontWeight="900" fill="#6366f1" className="lion-zzz">
          z<tspan dx="2" dy="-8" fontSize="12">z</tspan>
        </text>
      )}
      {pose === "think" && (
        <g fill="#fff" stroke="#cbd5e1" strokeWidth="1.5">
          <circle cx="98" cy="30" r="4" />
          <circle cx="106" cy="18" r="6" />
          <text x="103" y="22" fontSize="9" fontWeight="900" stroke="none" fill="#6366f1">?</text>
        </g>
      )}
    </svg>
  );
}
