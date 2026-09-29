import type { CharacterLesson, VoiceSource } from "@/lib/types";
import { APP_CONFIG } from "@/config/app";
import { phrases } from "@/content/phrases";
import { DEFAULT_TTS_SPELLING, type TtsSpelling } from "@/config/speech";
import { voiceLines } from "@/content/voiceScript";

// Слой за говор. Екраните викат само speakCharacter / speakWord / speakPhrase.
// Днес говори Web Speech API; утре — записани .mp3 файлове, без промяна в екраните.

export interface SpeechEngine {
  /** Дали може да изговори дадения текст (напр. има запис или български глас). */
  canSpeak(text: string): boolean;
  speak(text: string, volume: number): Promise<void>;
  cancel(): void;
}

/**
 * Записан глас. Файловете са в `public/audio/` с имена от сценария
 * (content/voiceScript.ts, напр. `letter-a-intro.mp3`); при build
 * `scripts/audio-manifest.mjs` ги описва в `audio/manifest.json`.
 * Записаните на ръка (напр. гласът на мама) са с предимство пред генерираните
 * (scripts/generate-voice.py), а генерираните — пред синтезатора на устройството,
 * защото на много Android таблети той няма български и мълчи.
 */
class RecordedAudioEngine implements SpeechEngine {
  private current: HTMLAudioElement | null = null;
  /** текст → URL на файла; пълни се, когато manifest.json се зареди. */
  private files: Record<string, string> = {};
  readonly ready: Promise<void>;

  constructor(private readonly kind: "human" | "generated") {
    if (typeof window === "undefined" || typeof fetch === "undefined") {
      this.ready = Promise.resolve();
      return;
    }
    this.ready = loadManifest().then((m) => {
      const idByText = new Map(voiceLines().map((l) => [l.text, l.id]));
      const generated = new Set(m.generated);
      for (const [text, id] of idByText) {
        const file = m.files[id];
        if (file && generated.has(id) === (this.kind === "generated")) this.files[text] = `/audio/${file}`;
      }
    });
  }

  canSpeak(text: string) {
    return typeof Audio !== "undefined" && text in this.files;
  }
  get count() {
    return Object.keys(this.files).length;
  }
  speak(text: string, volume: number) {
    this.cancel();
    return new Promise<void>((resolve) => {
      const audio = new Audio(this.files[text]);
      audio.volume = volume;
      audio.onended = audio.onerror = () => resolve();
      this.current = audio;
      audio.play().catch(() => resolve());
    });
  }
  cancel() {
    this.current?.pause();
    this.current = null;
  }
}

type Manifest = { files: Record<string, string>; generated: string[] };
let manifest: Promise<Manifest> | null = null;
function loadManifest(): Promise<Manifest> {
  manifest ??= fetch("/audio/manifest.json")
    .then((r): Promise<Partial<Manifest>> | Partial<Manifest> => (r.ok ? r.json() : {}))
    .then((m) => ({ files: m.files ?? {}, generated: m.generated ?? [] }))
    .catch(() => ({ files: {}, generated: [] }));
  return manifest;
}

class WebSpeechEngine implements SpeechEngine {
  voice: SpeechSynthesisVoice | null = null;
  voiceCount = 0;
  /** Chrome губи изречението, ако обектът бъде изчистен от паметта преди края. */
  private current: SpeechSynthesisUtterance | null = null;
  private timers: ReturnType<typeof setTimeout>[] = [];

  constructor() {
    if (!this.supported()) return;
    const pickVoice = () => {
      const voices = window.speechSynthesis.getVoices();
      this.voiceCount = voices.length;
      this.voice = voices.find((v) => v.lang.toLowerCase().replace("_", "-").startsWith("bg")) ?? null;
    };
    pickVoice();
    window.speechSynthesis.addEventListener?.("voiceschanged", pickVoice);
  }

  supported() {
    return typeof window !== "undefined" && "speechSynthesis" in window;
  }

  /**
   * С български глас — говорим. Ако списъкът с гласове е празен (често на Android,
   * където гласовете идват късно или изобщо не се изброяват), пак опитваме с
   * lang="bg-BG" — системата сама избира гласа. Мълчим само когато има гласове,
   * но нито един български: чужд глас, четящ кирилица, само обърква детето.
   */
  canSpeak() {
    return this.supported() && (this.voice !== null || this.voiceCount === 0);
  }

  /** Има ли истински български глас в списъка (не само „опитай с bg-BG“). */
  hasVoice() {
    return this.supported() && this.voice !== null;
  }

  speak(text: string, volume: number) {
    if (!this.canSpeak()) return Promise.resolve();
    this.cancel();
    return new Promise<void>((resolve) => {
      let finished = false;
      const done = () => {
        if (finished) return;
        finished = true;
        resolve();
      };
      // Android понякога не вика onend — не бива следващата фраза да чака вечно.
      this.timers.push(setTimeout(done, 2500 + text.length * 120));
      // Chrome на Android изпуска speak(), извикан веднага след cancel().
      this.timers.push(
        setTimeout(() => {
          try {
            const u = new SpeechSynthesisUtterance(text);
            u.lang = this.voice?.lang ?? APP_CONFIG.locale;
            if (this.voice) u.voice = this.voice;
            u.rate = 0.85;
            u.pitch = 1.1;
            u.volume = volume;
            u.onend = u.onerror = done;
            this.current = u;
            window.speechSynthesis.resume?.();
            window.speechSynthesis.speak(u);
          } catch {
            done();
          }
        }, 60),
      );
    });
  }

  cancel() {
    this.timers.forEach(clearTimeout);
    this.timers = [];
    this.current = null;
    if (this.supported()) window.speechSynthesis.cancel();
  }
}

// ───────────────────────── публичен API ─────────────────────────

const state: { enabled: boolean; volume: number; spelling: TtsSpelling; voice: VoiceSource } = {
  enabled: true,
  volume: 0.8,
  spelling: DEFAULT_TTS_SPELLING,
  voice: "recorded",
};

// Самостоятелна сричка „съгласна + ъ“ или самотна „ъ“ (звукът на буква, а не част от дума).
const LETTER_SOUND = /(^|[\s.,!?„“"])([бвгджзклмнпрстфхцчшщ]?ъ)(?=$|[\s.,!?„“"])/giu;

/** Пренаписва звуковете на буквите така, че синтезаторът да ги каже, а не да ги спелува. */
export function prepareForTts(text: string, spelling: TtsSpelling = state.spelling): string {
  if (spelling === "plain") return text;
  return text.replace(LETTER_SOUND, (_, before: string, sound: string) => {
    const s = sound.toLowerCase();
    if (spelling === "double") return before + s + "ъ";
    if (spelling === "accent") return before + s + "\u0300";
    return before + s;
  });
}
type Engines = { human: RecordedAudioEngine; generated: RecordedAudioEngine; web: WebSpeechEngine };
let engines: Engines | null = null;

function getEngines(): Engines {
  engines ??= { human: new RecordedAudioEngine("human"), generated: new RecordedAudioEngine("generated"), web: new WebSpeechEngine() };
  return engines;
}

/** Кой ще каже фразата: запис на ръка → (гласът на устройството, ако е избран и го има) → генериран запис → синтезатор. */
function pickEngine(text: string): SpeechEngine | undefined {
  const { human, generated, web } = getEngines();
  const order: SpeechEngine[] =
    state.voice === "device" && web.hasVoice() ? [human, web, generated] : [human, generated, web];
  return order.find((e) => e.canSpeak(text));
}

export function configureSpeech(opts: { enabled: boolean; volume: number; spelling?: TtsSpelling; voice?: VoiceSource }) {
  state.enabled = opts.enabled;
  state.volume = opts.volume;
  if (opts.spelling) state.spelling = opts.spelling;
  if (opts.voice) state.voice = opts.voice;
  if (!opts.enabled) cancelSpeech();
}

/** Има ли изобщо как да говорим (за подсказка в настройките). */
export function hasBulgarianVoice(): boolean {
  if (typeof window === "undefined") return false;
  return getEngines().web.canSpeak();
}

// Браузърите (особено Chrome на Android) не пускат звук, преди детето да е докоснало
// екрана. Дотогава помним последната фраза и я казваме при първото докосване.
let pending: { text: string; spelling: TtsSpelling }[] = [];

const audioAllowed = () => {
  const ua = (navigator as Navigator & { userActivation?: { hasBeenActive: boolean } }).userActivation;
  return ua ? ua.hasBeenActive : true; // Safari няма userActivation — там не отлагаме.
};

/**
 * Вика се при докосване: ако браузърът вече разрешава звук, казва отложената фраза.
 * Връща true, когато гласът е отключен (и повече не е нужно да се слуша).
 */
export function unlockSpeech(): boolean {
  if (typeof window === "undefined" || !audioAllowed()) return false;
  const queue = pending;
  pending = [];
  // Една след друга: „Това е А…“, после „Проследи буквата А.“
  void queue.reduce<Promise<void>>((chain, p) => chain.then(() => speakPhrase(p.text, p.spelling)), Promise.resolve());
  return true;
}

/** За бутона „Провери звука“ в настройките. */
export function speechInfo() {
  const { web, human, generated } = getEngines();
  return {
    recorded: human.count + generated.count,
    supported: !!web?.supported(),
    voices: web?.voiceCount ?? 0,
    bulgarianVoice: web?.voice ? `${web.voice.name} (${web.voice.lang})` : null,
  };
}

export function speakPhrase(text: string, spelling: TtsSpelling = state.spelling): Promise<void> {
  if (!state.enabled || typeof window === "undefined") return Promise.resolve();
  if (!audioAllowed()) {
    // Помним последните 2 фрази (представяне + задача), не цялата история.
    pending = [...pending, { text, spelling }].slice(-2);
    return Promise.resolve();
  }
  // Изчакваме списъка със записите (веднъж, в началото), иначе първата фраза би отишла
  // към синтезатора, който на много Android таблети мълчи.
  const { human, generated } = getEngines();
  const token = ++speakToken;
  return Promise.race([Promise.all([human.ready, generated.ready]), new Promise((r) => setTimeout(r, 1500))]).then(() => {
    if (token !== speakToken) return; // междувременно е поискана друга фраза
    const engine = pickEngine(text);
    if (!engine) return;
    const all = getEngines();
    [all.human, all.generated, all.web].forEach((e) => e !== engine && e.cancel());
    // Записите се търсят по оригиналния текст; на синтезатора подаваме пренаписания.
    return engine.speak(engine instanceof WebSpeechEngine ? prepareForTts(text, spelling) : text, state.volume);
  });
}

let speakToken = 0;

export function cancelSpeech() {
  if (typeof window === "undefined") return;
  speakToken++;
  const { human, generated, web } = getEngines();
  [human, generated, web].forEach((e) => e.cancel());
}

/** „А. А като автобус.“ или „Три.“ */
export const speakCharacter = (lesson: CharacterLesson) => speakPhrase(lesson.spokenText);

export const speakWord = (word: string) => speakPhrase(word);

/** „Проследи буквата А.“ (с шаблон) или „Напиши буквата А.“ (без шаблон). */
export const writeTaskText = (lesson: CharacterLesson, trace: boolean) =>
  lesson.type === "shape"
    ? phrases.drawShape(lesson.spokenName)
    : lesson.lowercase
    ? (trace ? phrases.traceSmallLetter : phrases.writeSmallLetter)(lesson.spokenName)
    : lesson.type === "letter"
    ? (trace ? phrases.traceLetter : phrases.writeLetter)(lesson.spokenName)
    : (trace ? phrases.traceNumber : phrases.writeNumber)(lesson.spokenName);

export const speakWriteTask = (lesson: CharacterLesson, trace = false) => speakPhrase(writeTaskText(lesson, trace));
