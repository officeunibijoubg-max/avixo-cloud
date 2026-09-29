import type { CharacterLesson, VoiceSource } from "@/lib/types";
import { APP_CONFIG } from "@/config/app";
import { phrases } from "@/content/phrases";
import { DEFAULT_TTS_SPELLING, type TtsSpelling } from "@/config/speech";
import { voiceLines } from "@/content/voiceScript";
import { DEFAULT_VOICE, VOICES, VOICE_SAMPLE_ID } from "@/config/voices";

// Слой за говор. Екраните викат само speakCharacter / speakWord / speakPhrase.
// Днес говори Web Speech API; утре — записани .mp3 файлове, без промяна в екраните.

export interface SpeechEngine {
  /** Дали може да изговори дадения текст (напр. има запис или български глас). */
  canSpeak(text: string): boolean;
  speak(text: string, volume: number): Promise<void>;
  cancel(): void;
}

/**
 * Записан глас. Всяка фраза от сценария (content/voiceScript.ts) има файл
 * `public/audio/<глас>/<id>.mp3` за всеки глас от config/voices.ts (женски/мъжки,
 * генерирани от scripts/generate-voice.py). Файлът се търси направо по id-то, без да
 * чакаме списък, защото на много Android таблети синтезаторът няма български и
 * записът е единственият глас. Запис на ръка `public/audio/<id>.mp3` е с предимство;
 * `audio/manifest.json` (ако се зареди) казва кои са те.
 */
class RecordedAudioEngine implements SpeechEngine {
  private current: HTMLAudioElement | null = null;
  private idByText: Map<string, string> | null = null;
  /** Файлове, които не са се заредили (няма ги или няма връзка) — за тях говори синтезаторът. */
  private failed = new Set<string>();
  private manifest: Manifest | null = null;
  /** Какво стана с последното пускане — за „Провери звука“. */
  last: "none" | "playing" | "blocked" | "missing" = "none";

  constructor() {
    if (typeof window === "undefined" || typeof fetch === "undefined") return;
    fetch("/audio/manifest.json", { cache: "no-cache" })
      .then((r): Promise<Partial<Manifest>> | Partial<Manifest> => (r.ok ? r.json() : {}))
      .then((m) => (this.manifest = { files: m.files ?? {} }))
      .catch(() => {});
  }

  private idOf(text: string) {
    this.idByText ??= new Map(voiceLines().map((l) => [l.text, l.id]));
    return this.idByText.get(text);
  }

  canSpeak(text: string) {
    const id = this.idOf(text);
    return typeof Audio !== "undefined" && !!id && !this.failed.has(id);
  }

  /** Записано на ръка (не генерирано) — има предимство и пред гласа на устройството. */
  isHuman(text: string) {
    const id = this.idOf(text);
    return !!id && !!this.manifest?.files[id];
  }

  get count() {
    return this.idByText?.size ?? voiceLines().length;
  }

  speak(text: string, volume: number) {
    return this.play(text, volume).then(() => {});
  }

  /** Пуска записа; `false`, ако файлът не можа да се зареди (тогава говори синтезаторът). */
  play(text: string, volume: number): Promise<boolean> {
    this.cancel();
    const id = this.idOf(text)!;
    const human = this.manifest?.files[id];
    const src = human ? `/audio/${human}` : `/audio/${state.voiceName}/${id}.mp3`;
    return new Promise<boolean>((resolve) => {
      const audio = new Audio(src);
      audio.volume = volume;
      audio.onplaying = () => (this.last = "playing");
      audio.onended = () => resolve(true);
      audio.onerror = () => {
        this.failed.add(id);
        this.last = "missing";
        resolve(false);
      };
      this.current = audio;
      audio.play().catch((e: unknown) => {
        // NotAllowedError: браузърът още не разрешава звук (преди първо докосване).
        if (e instanceof DOMException && e.name === "NotAllowedError") this.last = "blocked";
        resolve(true);
      });
    });
  }

  cancel() {
    this.current?.pause();
    this.current = null;
  }
}

/** Записите на ръка: id → файл в public/audio/. */
type Manifest = { files: Record<string, string> };

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

const state: { enabled: boolean; volume: number; spelling: TtsSpelling; voice: VoiceSource; voiceName: string } = {
  enabled: true,
  volume: 0.8,
  spelling: DEFAULT_TTS_SPELLING,
  voice: "recorded",
  voiceName: DEFAULT_VOICE,
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
type Engines = { recorded: RecordedAudioEngine; web: WebSpeechEngine };
let engines: Engines | null = null;

function getEngines(): Engines {
  engines ??= { recorded: new RecordedAudioEngine(), web: new WebSpeechEngine() };
  return engines;
}

export function configureSpeech(opts: {
  enabled: boolean;
  volume: number;
  spelling?: TtsSpelling;
  voice?: VoiceSource;
  voiceName?: string;
}) {
  state.enabled = opts.enabled;
  state.volume = opts.volume;
  if (opts.spelling) state.spelling = opts.spelling;
  if (opts.voice) state.voice = opts.voice;
  if (opts.voiceName && VOICES.some((v) => v.id === opts.voiceName)) state.voiceName = opts.voiceName;
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
  const { web, recorded } = getEngines();
  return {
    recorded: recorded.count,
    recordedLast: recorded.last,
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
  const { recorded, web } = getEngines();
  cancelSpeech();
  const token = speakToken;
  const synth = () => (web.canSpeak() ? web.speak(prepareForTts(text, spelling), state.volume) : Promise.resolve());
  // Гласът на устройството — само ако е избран, има български и няма запис на ръка.
  if (state.voice === "device" && web.hasVoice() && !recorded.isHuman(text)) return synth();
  if (!recorded.canSpeak(text)) return synth();
  return recorded.play(text, state.volume).then((ok) => {
    if (!ok && token === speakToken) return synth(); // файлът липсва/няма връзка
  });
}

let speakToken = 0;

export function cancelSpeech() {
  if (typeof window === "undefined") return;
  speakToken++;
  const { recorded, web } = getEngines();
  recorded.cancel();
  web.cancel();
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

/** Прослушване на записан глас в настройките (без значение кой е избран). */
export function previewVoice(voiceId: string): Promise<void> {
  if (typeof window === "undefined" || typeof Audio === "undefined") return Promise.resolve();
  cancelSpeech();
  return new Promise<void>((resolve) => {
    const audio = new Audio(`/audio/${voiceId}/${VOICE_SAMPLE_ID}.mp3`);
    audio.volume = state.volume;
    audio.onended = audio.onerror = () => resolve();
    audio.play().catch(() => resolve());
  });
}
