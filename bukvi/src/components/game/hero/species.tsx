// Героите: всички имат един и същ „скелет“ (глава в центъра (60,60) с радиус 26, тяло, лапи),
// затова шапките, очилата и другите неща стоят на едни и същи места върху всеки от тях.
// Тук е само това, по което се различават: цветове, уши, грива, опашка, муцунка.

import type { ReactNode } from "react";

export const INK = "#3f2a14";
export const CHEEK = "#fb7185";

export type Species = {
  fur: string;
  light: string;
  dark: string;
  /** Контур за светлите герои (зайче, панда), за да не се губят на белия фон. */
  outline?: string;
  /** Цвят на лапите (пандата е с черни). */
  limb?: string;
  /** Къде стъпва шапката: горният ръб на главата (при лъва — над гривата). */
  headTop: number;
  square?: boolean;
  /** Зад главата: грива, уши, шипове. */
  behindHead: ReactNode;
  /** Зад тялото: опашка. */
  tail: ReactNode;
  /** Над лицето, преди очите: петна, мустачки… */
  face?: ReactNode;
  /** След устата: зъбки, мустачки. */
  extras?: ReactNode;
  nose: ReactNode;
};

const roundEars = (fur: string, inner: string) => (
  <>
    <circle cx="38" cy="38" r="9" fill={fur} />
    <circle cx="82" cy="38" r="9" fill={fur} />
    <circle cx="38" cy="38" r="4.5" fill={inner} />
    <circle cx="82" cy="38" r="4.5" fill={inner} />
  </>
);

const pointyEars = (fur: string, inner: string, h = 0) => (
  <>
    <path d={`M35 48 L33 ${20 + h} L54 37 Z`} fill={fur} strokeLinejoin="round" />
    <path d={`M85 48 L87 ${20 + h} L66 37 Z`} fill={fur} strokeLinejoin="round" />
    <path d={`M38 44 L37 ${27 + h} L50 38 Z`} fill={inner} />
    <path d={`M82 44 L83 ${27 + h} L70 38 Z`} fill={inner} />
  </>
);

const heartNose = (color: string) => <path d="M55 64 Q60 60 65 64 Q60 69 55 64 Z" fill={color} />;

export const SPECIES: Record<string, Species> = {
  lion: {
    fur: "#fcd34d",
    light: "#fef3c7",
    dark: "#d97706",
    headTop: 24,
    behindHead: (
      <>
        <g fill="#f59e0b">
          {Array.from({ length: 12 }, (_, i) => {
            const a = (i / 12) * Math.PI * 2;
            return <circle key={i} cx={60 + Math.cos(a) * 30} cy={58 + Math.sin(a) * 30} r="12" />;
          })}
        </g>
        <circle cx="60" cy="58" r="30" fill="#d97706" />
        {roundEars("#fcd34d", CHEEK)}
      </>
    ),
    tail: (
      <>
        <path d="M84 112 Q104 116 106 100" stroke="#d97706" strokeWidth="4" fill="none" strokeLinecap="round" />
        <circle cx="106" cy="98" r="5" fill="#d97706" />
      </>
    ),
    nose: heartNose("#7c2d12"),
  },
  bear: {
    fur: "#b7793f",
    light: "#f5deb3",
    dark: "#7c4a1e",
    headTop: 36,
    behindHead: roundEars("#b7793f", "#f5deb3"),
    tail: <circle cx="86" cy="116" r="6" fill="#7c4a1e" />,
    nose: <ellipse cx="60" cy="64" rx="5.5" ry="4" fill={INK} />,
  },
  fox: {
    fur: "#f97316",
    light: "#fff7ed",
    dark: "#c2410c",
    headTop: 36,
    behindHead: pointyEars("#f97316", "#fed7aa"),
    tail: (
      <>
        <path d="M82 112 Q112 118 112 88 Q100 96 82 104 Z" fill="#f97316" />
        <path d="M112 88 Q110 100 104 104 Q106 94 112 88 Z" fill="#fff7ed" />
      </>
    ),
    face: (
      <>
        <path d="M34 64 Q46 66 52 80 Q40 80 34 64 Z" fill="#fff7ed" />
        <path d="M86 64 Q74 66 68 80 Q80 80 86 64 Z" fill="#fff7ed" />
      </>
    ),
    nose: <ellipse cx="60" cy="64" rx="4" ry="3" fill={INK} />,
  },
  cat: {
    fur: "#94a3b8",
    light: "#f1f5f9",
    dark: "#475569",
    headTop: 36,
    behindHead: pointyEars("#94a3b8", "#fbcfe8", 6),
    tail: <path d="M84 114 Q112 112 104 84" stroke="#94a3b8" strokeWidth="7" fill="none" strokeLinecap="round" />,
    face: (
      <g stroke="#64748b" strokeWidth="2" strokeLinecap="round">
        <path d="M60 36 L60 44 M52 38 L54 45 M68 38 L66 45" />
      </g>
    ),
    extras: (
      <g stroke="#475569" strokeWidth="1.3" strokeLinecap="round">
        <path d="M46 67 L32 64 M46 71 L32 72 M74 67 L88 64 M74 71 L88 72" />
      </g>
    ),
    nose: <path d="M56 63 L64 63 L60 67 Z" fill="#f472b6" />,
  },
  bunny: {
    fur: "#f8fafc",
    light: "#fce7f3",
    dark: "#e2e8f0",
    outline: "#cbd5e1",
    headTop: 36,
    behindHead: (
      <>
        <ellipse cx="47" cy="18" rx="8" ry="22" fill="#f8fafc" stroke="#cbd5e1" strokeWidth="1.5" transform="rotate(-8 47 18)" />
        <ellipse cx="73" cy="18" rx="8" ry="22" fill="#f8fafc" stroke="#cbd5e1" strokeWidth="1.5" transform="rotate(8 73 18)" />
        <ellipse cx="47" cy="20" rx="4" ry="15" fill="#fbcfe8" transform="rotate(-8 47 20)" />
        <ellipse cx="73" cy="20" rx="4" ry="15" fill="#fbcfe8" transform="rotate(8 73 20)" />
      </>
    ),
    tail: <circle cx="86" cy="116" r="8" fill="#fff" stroke="#cbd5e1" strokeWidth="1.5" />,
    extras: (
      <g fill="#fff" stroke="#cbd5e1" strokeWidth="1">
        <rect x="56.5" y="73" width="3.5" height="5" rx="1" />
        <rect x="60" y="73" width="3.5" height="5" rx="1" />
      </g>
    ),
    nose: heartNose("#f472b6"),
  },
  panda: {
    fur: "#f8fafc",
    light: "#ffffff",
    dark: "#1f2937",
    outline: "#cbd5e1",
    limb: "#1f2937",
    headTop: 36,
    behindHead: roundEars("#1f2937", "#374151"),
    tail: <circle cx="86" cy="116" r="6" fill="#1f2937" />,
    face: (
      <>
        <ellipse cx="48" cy="56" rx="8" ry="9.5" fill="#1f2937" transform="rotate(20 48 56)" />
        <ellipse cx="72" cy="56" rx="8" ry="9.5" fill="#1f2937" transform="rotate(-20 72 56)" />
        <circle cx="49" cy="55" r="5.6" fill="#fff" />
        <circle cx="71" cy="55" r="5.6" fill="#fff" />
      </>
    ),
    nose: <ellipse cx="60" cy="64" rx="5" ry="3.5" fill="#1f2937" />,
  },
  dino: {
    fur: "#4ade80",
    light: "#bbf7d0",
    dark: "#16a34a",
    headTop: 36,
    behindHead: (
      <g fill="#16a34a">
        <path d="M40 42 L42 28 L50 38 Z" />
        <path d="M52 36 L60 22 L68 36 Z" />
        <path d="M70 38 L78 28 L80 42 Z" />
      </g>
    ),
    tail: <path d="M80 102 Q106 104 118 124 Q98 122 80 118 Z" fill="#4ade80" />,
    face: (
      <g fill="#16a34a" opacity="0.5">
        <circle cx="42" cy="48" r="2.5" />
        <circle cx="78" cy="46" r="2" />
        <circle cx="74" cy="42" r="1.5" />
      </g>
    ),
    nose: (
      <g fill="#166534">
        <circle cx="56" cy="64" r="1.6" />
        <circle cx="64" cy="64" r="1.6" />
      </g>
    ),
  },
  robot: {
    fur: "#cbd5e1",
    light: "#e0f2fe",
    dark: "#64748b",
    headTop: 36,
    square: true,
    behindHead: (
      <>
        <line x1="60" y1="34" x2="60" y2="20" stroke="#64748b" strokeWidth="3" />
        <circle cx="60" cy="18" r="4.5" fill="#ef4444" className="hero-blink" />
        <rect x="27" y="50" width="8" height="18" rx="3" fill="#64748b" />
        <rect x="85" y="50" width="8" height="18" rx="3" fill="#64748b" />
      </>
    ),
    tail: null,
    extras: (
      <g>
        <rect x="52" y="100" width="16" height="12" rx="3" fill="#e0f2fe" stroke="#64748b" strokeWidth="1.5" />
        <circle cx="56.5" cy="106" r="2" fill="#22c55e" />
        <circle cx="63.5" cy="106" r="2" fill="#f59e0b" />
      </g>
    ),
    nose: <rect x="57" y="62" width="6" height="4" rx="1.5" fill="#64748b" />,
  },
};
