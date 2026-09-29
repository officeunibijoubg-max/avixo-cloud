// Звукови ефекти, синтезирани с Web Audio API — без файлове, работят офлайн.
// Всички са кратки и меки; „грешка“ е нисък, спокоен звук, не бръмчене.

export type SoundName = "correct" | "wrong" | "star" | "reward" | "click" | "pop" | "levelUp" | "confetti";

type Note = { f: number; t: number; d: number; type?: OscillatorType; gain?: number };

const SOUNDS: Record<SoundName, Note[]> = {
  correct: [
    { f: 523.25, t: 0, d: 0.12 },
    { f: 659.25, t: 0.1, d: 0.12 },
    { f: 783.99, t: 0.2, d: 0.25 },
  ],
  wrong: [
    { f: 392, t: 0, d: 0.18, type: "sine", gain: 0.6 },
    { f: 329.63, t: 0.16, d: 0.3, type: "sine", gain: 0.6 },
  ],
  star: [
    { f: 1046.5, t: 0, d: 0.08, type: "triangle" },
    { f: 1318.5, t: 0.07, d: 0.08, type: "triangle" },
    { f: 1568, t: 0.14, d: 0.2, type: "triangle" },
  ],
  reward: [
    { f: 523.25, t: 0, d: 0.1 },
    { f: 659.25, t: 0.1, d: 0.1 },
    { f: 783.99, t: 0.2, d: 0.1 },
    { f: 1046.5, t: 0.3, d: 0.35 },
  ],
  click: [{ f: 880, t: 0, d: 0.05, type: "triangle", gain: 0.4 }],
  pop: [
    { f: 600, t: 0, d: 0.06, type: "triangle" },
    { f: 900, t: 0.03, d: 0.08, type: "sine" },
  ],
  levelUp: [
    { f: 392, t: 0, d: 0.1 },
    { f: 523.25, t: 0.1, d: 0.1 },
    { f: 659.25, t: 0.2, d: 0.1 },
    { f: 783.99, t: 0.3, d: 0.1 },
    { f: 1046.5, t: 0.4, d: 0.4 },
  ],
  confetti: [
    { f: 1568, t: 0, d: 0.05, type: "triangle", gain: 0.3 },
    { f: 1760, t: 0.05, d: 0.05, type: "triangle", gain: 0.3 },
    { f: 2093, t: 0.1, d: 0.08, type: "triangle", gain: 0.3 },
  ],
};

const state = { enabled: true, volume: 0.8 };
let ctx: AudioContext | null = null;

function getContext(): AudioContext | null {
  if (typeof window === "undefined") return null;
  if (!ctx) {
    const Ctor = window.AudioContext ?? (window as unknown as { webkitAudioContext?: typeof AudioContext }).webkitAudioContext;
    if (!Ctor) return null;
    ctx = new Ctor();
  }
  // iOS пуска звука само след докосване — resume() при всяко извикване е безопасен.
  if (ctx.state === "suspended") void ctx.resume();
  return ctx;
}

/**
 * Вика се при първото докосване: създава/събужда звука вътре в жеста на детето
 * и пуска кратка тишина — така Android и iOS „отключват“ Web Audio.
 */
export function unlockSounds() {
  const ac = getContext();
  if (!ac) return;
  try {
    const buffer = ac.createBuffer(1, 1, 22050);
    const src = ac.createBufferSource();
    src.buffer = buffer;
    src.connect(ac.destination);
    src.start(0);
  } catch {}
}

export const soundState = () => ctx?.state ?? "няма";

export function configureSounds(opts: { enabled: boolean; volume: number }) {
  state.enabled = opts.enabled;
  state.volume = opts.volume;
}

export function playSound(name: SoundName) {
  if (!state.enabled) return;
  const ac = getContext();
  if (!ac) return;
  const now = ac.currentTime + 0.01;
  const master = ac.createGain();
  master.gain.value = 0.18 * state.volume;
  master.connect(ac.destination);
  for (const n of SOUNDS[name]) {
    const osc = ac.createOscillator();
    const g = ac.createGain();
    osc.type = n.type ?? "sine";
    osc.frequency.value = n.f;
    const peak = n.gain ?? 1;
    g.gain.setValueAtTime(0, now + n.t);
    g.gain.linearRampToValueAtTime(peak, now + n.t + 0.015);
    g.gain.exponentialRampToValueAtTime(0.001, now + n.t + n.d);
    osc.connect(g).connect(master);
    osc.start(now + n.t);
    osc.stop(now + n.t + n.d + 0.05);
  }
}

// ───────────────────────── фонова музика ─────────────────────────
// Тиха, бавна мелодия от пентатоника — без файлове. Тръгва след първото докосване
// (браузърите не пускат звук преди това) и спира веднага при изключване.

const MELODY = [523.25, 587.33, 659.25, 783.99, 880, 783.99, 659.25, 587.33, 523.25, 440, 523.25, 659.25];
let musicTimer: ReturnType<typeof setInterval> | null = null;
let musicStep = 0;

function musicTick() {
  const ac = getContext();
  if (!ac || ac.state !== "running") return;
  const now = ac.currentTime + 0.02;
  const osc = ac.createOscillator();
  const g = ac.createGain();
  osc.type = "sine";
  osc.frequency.value = MELODY[musicStep % MELODY.length] / 2;
  musicStep += 1;
  const peak = 0.035 * state.volume;
  g.gain.setValueAtTime(0, now);
  g.gain.linearRampToValueAtTime(peak, now + 0.08);
  g.gain.exponentialRampToValueAtTime(0.0005, now + 0.9);
  osc.connect(g).connect(ac.destination);
  osc.start(now);
  osc.stop(now + 1);
}

export function setMusic(enabled: boolean) {
  if (typeof window === "undefined") return;
  if (enabled && !musicTimer) musicTimer = setInterval(musicTick, 700);
  if (!enabled && musicTimer) {
    clearInterval(musicTimer);
    musicTimer = null;
  }
}
