// Рисуваните дрехи и аксесоари. Всяко нещо се рисува спрямо общите точки на героя:
// `top` — горният ръб на главата (шапки), очите са на y=55, вратът — на y≈86,
// а `hand` — краят на дясната лапа за текущата поза.

import type { ReactNode } from "react";

export type WearAnchors = { top: number; hand: { x: number; y: number } };
type Draw = (a: WearAnchors) => ReactNode;
/** `behind` — зад тялото (пелерина, крила); `front` — отпред; `hand` — в дясната лапа. */
export type WearArt = { behind?: Draw; front?: Draw; hand?: Draw };

const star = (cx: number, cy: number, r: number) => {
  const pts: string[] = [];
  for (let i = 0; i < 10; i++) {
    const a = -Math.PI / 2 + (i * Math.PI) / 5;
    const rr = i % 2 ? r * 0.45 : r;
    pts.push(`${(cx + Math.cos(a) * rr).toFixed(1)},${(cy + Math.sin(a) * rr).toFixed(1)}`);
  }
  return pts.join(" ");
};

const heart = (cx: number, cy: number, s: number) =>
  `M${cx} ${cy + s * 0.8} C${cx - s * 1.4} ${cy - s * 0.1} ${cx - s * 0.6} ${cy - s * 1.1} ${cx} ${cy - s * 0.35} C${cx + s * 0.6} ${cy - s * 1.1} ${cx + s * 1.4} ${cy - s * 0.1} ${cx} ${cy + s * 0.8} Z`;

const FLOWER_COLORS = ["#f472b6", "#facc15", "#60a5fa", "#fb923c", "#a78bfa", "#f472b6", "#34d399"];

export const WEAR_ART: Record<string, WearArt> = {
  // ───── на главата ─────
  "acc-crown": {
    front: ({ top: t }) => (
      <g>
        <path d={`M40 ${t} L37 ${t - 18} L49 ${t - 9} L60 ${t - 22} L71 ${t - 9} L83 ${t - 18} L80 ${t} Z`} fill="#facc15" stroke="#b45309" strokeWidth="1.5" strokeLinejoin="round" />
        <rect x="40" y={t - 5} width="40" height="5" fill="#f59e0b" />
        <circle cx="60" cy={t - 22} r="3" fill="#ef4444" />
        <circle cx="37" cy={t - 18} r="2.5" fill="#3b82f6" />
        <circle cx="83" cy={t - 18} r="2.5" fill="#3b82f6" />
        <circle cx="60" cy={t - 2.5} r="2" fill="#22c55e" />
      </g>
    ),
  },
  "acc-hat": {
    front: ({ top: t }) => (
      <g>
        <rect x="44" y={t - 26} width="32" height="26" rx="2" fill="#1f2937" />
        <rect x="44" y={t - 9} width="32" height="5" fill="#ef4444" />
        <ellipse cx="60" cy={t} rx="25" ry="4.5" fill="#111827" />
      </g>
    ),
  },
  "acc-cap": {
    front: ({ top: t }) => (
      <g>
        <path d={`M36 ${t + 1} Q36 ${t - 22} 60 ${t - 22} Q84 ${t - 22} 84 ${t + 1} Z`} fill="#3b82f6" />
        <path d={`M62 ${t} Q86 ${t - 5} 99 ${t + 2} Q86 ${t + 5} 62 ${t + 2} Z`} fill="#1d4ed8" />
        <circle cx="60" cy={t - 22} r="2.5" fill="#1d4ed8" />
        <path d={`M48 ${t - 18} Q52 ${t - 8} 50 ${t}`} stroke="#60a5fa" strokeWidth="1.5" fill="none" />
      </g>
    ),
  },
  "acc-bow": {
    front: ({ top: t }) => (
      <g transform={`translate(74 ${t + 4}) rotate(-15)`}>
        <path d="M0 0 L-12 -8 L-12 8 Z" fill="#ec4899" strokeLinejoin="round" />
        <path d="M0 0 L12 -8 L12 8 Z" fill="#ec4899" strokeLinejoin="round" />
        <circle r="3.5" fill="#be185d" />
      </g>
    ),
  },
  "acc-party": {
    front: ({ top: t }) => (
      <g>
        <path d={`M46 ${t + 1} L60 ${t - 30} L74 ${t + 1} Z`} fill="#a78bfa" />
        <path d={`M50 ${t - 8} L70 ${t - 8} M54 ${t - 17} L66 ${t - 17}`} stroke="#fde047" strokeWidth="3" />
        <circle cx="60" cy={t - 31} r="4.5" fill="#f472b6" />
      </g>
    ),
  },
  "acc-flower": {
    front: ({ top: t }) => (
      <g>
        {FLOWER_COLORS.map((c, i) => {
          const x = 36 + i * 8;
          const y = t + 6 - 7 * Math.sin((Math.PI * (x - 36)) / 48);
          return (
            <g key={i}>
              {[0, 72, 144, 216, 288].map((a) => (
                <circle key={a} cx={x + Math.cos((a * Math.PI) / 180) * 3} cy={y + Math.sin((a * Math.PI) / 180) * 3} r="2.6" fill={c} />
              ))}
              <circle cx={x} cy={y} r="1.8" fill="#fde047" />
            </g>
          );
        })}
      </g>
    ),
  },
  "acc-chef": {
    front: ({ top: t }) => (
      <g fill="#fff" stroke="#cbd5e1" strokeWidth="1.5">
        <circle cx="48" cy={t - 14} r="9" />
        <circle cx="72" cy={t - 14} r="9" />
        <circle cx="60" cy={t - 20} r="11" />
        <rect x="42" y={t - 9} width="36" height="10" rx="2" />
      </g>
    ),
  },
  "acc-headphones": {
    front: ({ top: t }) => (
      <g>
        <path d={`M33 58 Q33 ${t - 6} 60 ${t - 6} Q87 ${t - 6} 87 58`} stroke="#334155" strokeWidth="5" fill="none" strokeLinecap="round" />
        <rect x="26" y="49" width="11" height="19" rx="5" fill="#ef4444" />
        <rect x="83" y="49" width="11" height="19" rx="5" fill="#ef4444" />
      </g>
    ),
  },
  "acc-pirate": {
    front: ({ top: t }) => (
      <g>
        <path d={`M30 ${t + 3} Q60 ${t - 32} 90 ${t + 3} Q60 ${t - 6} 30 ${t + 3} Z`} fill="#1f2937" />
        <circle cx="60" cy={t - 11} r="4.5" fill="#fff" />
        <path d={`M53 ${t - 3} L67 ${t - 9} M53 ${t - 9} L67 ${t - 3}`} stroke="#fff" strokeWidth="2" strokeLinecap="round" />
      </g>
    ),
  },
  "acc-wizard": {
    front: ({ top: t }) => (
      <g>
        <path d={`M43 ${t} L70 ${t - 36} L77 ${t} Z`} fill="#7c3aed" strokeLinejoin="round" />
        <ellipse cx="60" cy={t} rx="27" ry="4.5" fill="#6d28d9" />
        <polygon points={star(58, t - 14, 4)} fill="#fde047" />
        <polygon points={star(68, t - 24, 3)} fill="#fde047" />
        <polygon points={star(70, t - 37, 4)} fill="#fde047" className="wear-twinkle" />
      </g>
    ),
  },

  // ───── на лицето (очите са на y=55, x=49 и 71) ─────
  "acc-glasses": {
    front: () => (
      <g>
        <rect x="39" y="49" width="19" height="12" rx="5" fill="#111827" />
        <rect x="62" y="49" width="19" height="12" rx="5" fill="#111827" />
        <path d="M58 53 L62 53" stroke="#111827" strokeWidth="2.5" />
        <path d="M42 52 L47 52 M65 52 L70 52" stroke="#fff" strokeWidth="1.5" strokeLinecap="round" opacity="0.7" />
      </g>
    ),
  },
  "acc-round": {
    front: () => (
      <g fill="#e0f2fe" fillOpacity="0.35" stroke="#92400e" strokeWidth="2">
        <circle cx="49" cy="55" r="8" />
        <circle cx="71" cy="55" r="8" />
        <path d="M57 54 Q60 51 63 54" fill="none" />
      </g>
    ),
  },
  "acc-hearts": {
    front: () => (
      <g fill="#ec4899" stroke="#be185d" strokeWidth="1">
        <path d={heart(49, 55, 9)} />
        <path d={heart(71, 55, 9)} />
        <path d="M57 53 L63 53" stroke="#be185d" strokeWidth="2" />
      </g>
    ),
  },
  "acc-stars": {
    front: () => (
      <g fill="#facc15" stroke="#ca8a04" strokeWidth="1">
        <polygon points={star(49, 55, 10)} />
        <polygon points={star(71, 55, 10)} />
        <path d="M57 54 L63 54" stroke="#ca8a04" strokeWidth="2" />
      </g>
    ),
  },
  "acc-mustache": {
    front: () => <path d="M60 67 Q52 61 42 67 Q46 73 60 69 Q74 73 78 67 Q68 61 60 67 Z" fill="#3f2a14" />,
  },
  "acc-patch": {
    front: () => (
      <g>
        <path d="M36 44 L84 50" stroke="#111827" strokeWidth="1.8" />
        <circle cx="49" cy="55" r="7.5" fill="#111827" />
      </g>
    ),
  },

  // ───── на врата (главата свършва на y≈86) ─────
  "acc-bowtie": {
    front: () => (
      <g>
        <path d="M60 88 L47 81 L47 95 Z" fill="#ef4444" strokeLinejoin="round" />
        <path d="M60 88 L73 81 L73 95 Z" fill="#ef4444" strokeLinejoin="round" />
        <circle cx="60" cy="88" r="3.5" fill="#b91c1c" />
      </g>
    ),
  },
  "acc-scarf": {
    front: () => (
      <g>
        <rect x="64" y="86" width="9" height="22" rx="3" fill="#ef4444" transform="rotate(8 68 86)" />
        <rect x="37" y="81" width="46" height="10" rx="5" fill="#ef4444" />
        <path d="M46 81 L46 91 M56 81 L56 91 M66 81 L66 91 M76 81 L76 91" stroke="#fff" strokeWidth="2.5" />
      </g>
    ),
  },
  "acc-medal": {
    front: () => (
      <g>
        <path d="M48 83 L55 83 L62 99 L58 101 Z" fill="#3b82f6" />
        <path d="M72 83 L65 83 L58 99 L62 101 Z" fill="#ef4444" />
        <circle cx="60" cy="104" r="7.5" fill="#facc15" stroke="#ca8a04" strokeWidth="1.5" />
        <polygon points={star(60, 104, 4)} fill="#fef08a" />
      </g>
    ),
  },

  // ───── на гърба ─────
  "acc-cape": {
    behind: () => (
      <path d="M40 84 Q28 108 22 128 Q60 136 98 128 Q92 108 80 84 Z" fill="#dc2626" className="wear-sway" style={{ transformOrigin: "60px 84px" }} />
    ),
    front: () => (
      <g>
        <path d="M42 84 Q60 92 78 84" stroke="#b91c1c" strokeWidth="4" fill="none" strokeLinecap="round" />
        <circle cx="60" cy="89" r="3" fill="#facc15" />
      </g>
    ),
  },
  "acc-wings": {
    behind: () => (
      <g fill="#a5f3fc" fillOpacity="0.8" stroke="#22d3ee" strokeWidth="1.5">
        <g className="wear-flap-l" style={{ transformOrigin: "44px 96px" }}>
          <ellipse cx="24" cy="82" rx="18" ry="12" transform="rotate(-25 24 82)" />
          <ellipse cx="28" cy="104" rx="12" ry="8" transform="rotate(20 28 104)" />
        </g>
        <g className="wear-flap-r" style={{ transformOrigin: "76px 96px" }}>
          <ellipse cx="96" cy="82" rx="18" ry="12" transform="rotate(25 96 82)" />
          <ellipse cx="92" cy="104" rx="12" ry="8" transform="rotate(-20 92 104)" />
        </g>
      </g>
    ),
  },
  "acc-jetpack": {
    behind: () => (
      <g>
        <rect x="24" y="82" width="14" height="30" rx="6" fill="#94a3b8" stroke="#475569" strokeWidth="1.5" />
        <rect x="82" y="82" width="14" height="30" rx="6" fill="#94a3b8" stroke="#475569" strokeWidth="1.5" />
        <g className="wear-flame">
          <path d="M26 112 Q31 130 36 112 Z" fill="#f97316" />
          <path d="M84 112 Q89 130 94 112 Z" fill="#f97316" />
          <path d="M28.5 112 Q31 122 33.5 112 Z" fill="#fde047" />
          <path d="M86.5 112 Q89 122 91.5 112 Z" fill="#fde047" />
        </g>
      </g>
    ),
  },
  "acc-backpack": {
    behind: () => <rect x="26" y="84" width="68" height="34" rx="12" fill="#22c55e" stroke="#15803d" strokeWidth="1.5" />,
    front: () => (
      <path d="M44 86 Q42 100 44 114 M76 86 Q78 100 76 114" stroke="#15803d" strokeWidth="4" fill="none" strokeLinecap="round" />
    ),
  },

  // ───── в ръката ─────
  "acc-balloon": {
    hand: ({ hand: { x, y } }) => (
      <g className="wear-bob">
        <path d={`M${x} ${y} Q${x + 5} ${y - 14} ${x + 8} ${y - 26}`} stroke="#64748b" strokeWidth="1.2" fill="none" />
        <ellipse cx={x + 8} cy={y - 37} rx="9" ry="11" fill="#ef4444" />
        <path d={`M${x + 6} ${y - 26} L${x + 10} ${y - 26} L${x + 8} ${y - 28} Z`} fill="#b91c1c" />
        <ellipse cx={x + 5} cy={y - 41} rx="2" ry="3.5" fill="#fff" opacity="0.6" />
      </g>
    ),
  },
  "acc-icecream": {
    hand: ({ hand: { x, y } }) => (
      <g>
        <path d={`M${x - 6} ${y - 4} L${x + 6} ${y - 4} L${x} ${y + 7} Z`} fill="#f59e0b" stroke="#b45309" strokeWidth="1" strokeLinejoin="round" />
        <circle cx={x} cy={y - 9} r="6.5" fill="#f9a8d4" />
        <circle cx={x} cy={y - 17} r="5.5" fill="#a7f3d0" />
        <circle cx={x + 1} cy={y - 24} r="2.5" fill="#ef4444" />
      </g>
    ),
  },
  "acc-lollipop": {
    hand: ({ hand: { x, y } }) => (
      <g>
        <line x1={x} y1={y + 2} x2={x + 2} y2={y - 20} stroke="#fff" strokeWidth="2.5" strokeLinecap="round" />
        <circle cx={x + 2} cy={y - 27} r="8" fill="#f472b6" />
        <path d={`M${x + 2} ${y - 27} m-5 0 a5 5 0 1 0 5 -5 a3 3 0 1 0 3 3`} stroke="#fff" strokeWidth="1.8" fill="none" />
      </g>
    ),
  },
  "acc-flag": {
    hand: ({ hand: { x, y } }) => (
      <g>
        <line x1={x} y1={y + 5} x2={x} y2={y - 36} stroke="#92400e" strokeWidth="2.5" strokeLinecap="round" />
        <g className="wear-sway" style={{ transformOrigin: `${x}px ${y - 30}px` }}>
          <rect x={x} y={y - 36} width="22" height="5" fill="#fff" stroke="#e2e8f0" strokeWidth="0.5" />
          <rect x={x} y={y - 31} width="22" height="5" fill="#16a34a" />
          <rect x={x} y={y - 26} width="22" height="5" fill="#dc2626" />
        </g>
      </g>
    ),
  },
  "acc-sunflower": {
    hand: ({ hand: { x, y } }) => (
      <g>
        <line x1={x} y1={y + 3} x2={x} y2={y - 22} stroke="#16a34a" strokeWidth="2.5" />
        <ellipse cx={x - 5} cy={y - 10} rx="5" ry="2.5" fill="#22c55e" transform={`rotate(-30 ${x - 5} ${y - 10})`} />
        {Array.from({ length: 10 }, (_, i) => {
          const a = (i / 10) * Math.PI * 2;
          return <ellipse key={i} cx={x + Math.cos(a) * 7} cy={y - 29 + Math.sin(a) * 7} rx="3.5" ry="2" fill="#facc15" transform={`rotate(${(a * 180) / Math.PI} ${x + Math.cos(a) * 7} ${y - 29 + Math.sin(a) * 7})`} />;
        })}
        <circle cx={x} cy={y - 29} r="4.5" fill="#92400e" />
      </g>
    ),
  },
  "acc-wand": {
    hand: ({ hand: { x, y } }) => (
      <g>
        <line x1={x - 2} y1={y + 3} x2={x + 10} y2={y - 20} stroke="#1f2937" strokeWidth="2.5" strokeLinecap="round" />
        <polygon points={star(x + 11, y - 24, 7)} fill="#facc15" stroke="#ca8a04" strokeWidth="1" />
        <g fill="#fde047" className="wear-twinkle">
          <circle cx={x + 22} cy={y - 30} r="1.5" />
          <circle cx={x + 3} cy={y - 34} r="1.2" />
          <circle cx={x + 20} cy={y - 16} r="1" />
        </g>
      </g>
    ),
  },
};
