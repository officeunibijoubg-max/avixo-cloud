"use client";

import { cn } from "@/lib/cn";
import { CHEEK, INK, SPECIES } from "./species";
import { WEAR_ART, type WearAnchors } from "./wearables";

// Героят-водач като 2D рисунка (SVG). Всички герои споделят един скелет и едни и същи
// пози, затова дрехите от магазина стоят на точното място върху всеки от тях.

export type HeroPose = "happy" | "wave" | "think" | "point" | "cheer" | "dance" | "clap" | "encourage" | "sleep";

// Лапите за всяка поза: [ляво, дясно] като път от рамото надолу/нагоре.
const ARMS: Record<HeroPose, [string, string]> = {
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

/** Краят на дясната лапа — там стои балонът, пръчицата и т.н. */
const handOf = (path: string) => {
  const n = path.match(/-?\d+(\.\d+)?/g)!.map(Number);
  return { x: n[n.length - 2], y: n[n.length - 1] };
};

function Eyes({ pose }: { pose: HeroPose }) {
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

function Mouth({ pose }: { pose: HeroPose }) {
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

type Props = {
  hero?: string;
  pose?: HeroPose;
  /** Ид-та на облечените неща от магазина. */
  wearing?: (string | undefined)[];
  size?: number;
  className?: string;
};

// Място около героя за високи шапки, крила и балон.
const VIEW = { x: -10, y: -24, w: 140, h: 154 };

export function HeroSvg({ hero = "lion", pose = "happy", wearing = [], size = 96, className }: Props) {
  const sp = SPECIES[hero] ?? SPECIES.lion;
  const [left, right] = ARMS[pose];
  const anchors: WearAnchors = { top: sp.headTop, hand: handOf(right) };
  const arts = wearing.map((id) => (id ? WEAR_ART[id] : undefined)).filter((a) => !!a);
  const limb = sp.limb ?? sp.fur;
  const line = sp.outline ? { stroke: sp.outline, strokeWidth: 1.5 } : {};
  const bodyAnim =
    pose === "dance" ? "lion-dance" : pose === "cheer" ? "lion-hop" : pose === "sleep" ? "lion-breathe" : "lion-idle";

  return (
    <svg
      viewBox={`${VIEW.x} ${VIEW.y} ${VIEW.w} ${VIEW.h}`}
      width={size}
      height={(size * VIEW.h) / VIEW.w}
      className={cn("overflow-visible", className)}
      aria-hidden
    >
      <g className={bodyAnim} style={{ transformOrigin: "60px 120px" }}>
        {arts.map((a, i) => a.behind && <g key={`b${i}`}>{a.behind(anchors)}</g>)}
        {sp.tail}
        {/* Тяло и крачета */}
        {sp.square ? (
          <rect x="34" y="86" width="52" height="38" rx="12" fill={sp.fur} {...line} />
        ) : (
          <ellipse cx="60" cy="106" rx="27" ry="20" fill={sp.fur} {...line} />
        )}
        <ellipse cx="60" cy="110" rx="15" ry="12" fill={sp.light} />
        <ellipse cx="46" cy="124" rx="9" ry="5" fill={limb} stroke={sp.dark} strokeWidth="1.5" />
        <ellipse cx="74" cy="124" rx="9" ry="5" fill={limb} stroke={sp.dark} strokeWidth="1.5" />
        {/* Лява лапа */}
        <path d={left} stroke={limb} strokeWidth="10" fill="none" strokeLinecap="round" className={pose === "clap" ? "lion-clap-l" : undefined} />
        {sp.behindHead}
        {/* Глава */}
        {sp.square ? (
          <rect x="33" y="34" width="54" height="52" rx="14" fill={sp.fur} stroke={sp.dark} strokeWidth="1.5" />
        ) : (
          <circle cx="60" cy="60" r="26" fill={sp.fur} {...line} />
        )}
        {sp.face}
        {sp.square ? (
          <rect x="45" y="61" width="30" height="18" rx="7" fill={sp.light} />
        ) : (
          <ellipse cx="60" cy="70" rx="13" ry="10" fill={sp.light} />
        )}
        <circle cx="42" cy="66" r="4.5" fill={CHEEK} opacity="0.45" />
        <circle cx="78" cy="66" r="4.5" fill={CHEEK} opacity="0.45" />
        <Eyes pose={pose} />
        {pose === "think" && <path d="M44 46 L53 48 M67 48 L76 45" stroke={INK} strokeWidth="2" strokeLinecap="round" />}
        {sp.nose}
        <Mouth pose={pose} />
        {sp.extras}
        {arts.map((a, i) => a.front && <g key={`f${i}`}>{a.front(anchors)}</g>)}
        {/* Дясна лапа — отпред, с нещото в нея */}
        <g className={pose === "wave" ? "lion-wave" : pose === "clap" ? "lion-clap-r" : undefined} style={{ transformOrigin: "86px 94px" }}>
          <path d={right} stroke={limb} strokeWidth="10" fill="none" strokeLinecap="round" />
          {arts.map((a, i) => a.hand && <g key={`h${i}`}>{a.hand(anchors)}</g>)}
        </g>
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
