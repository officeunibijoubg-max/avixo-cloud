import type { CharacterLesson } from "@/lib/types";
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
 * Записан глас. Файловете се слагат в `public/audio/` с имена от сценария
 * (content/voiceScript.ts, напр. `letter-a-intro.mp3`); при build
 * `scripts/audio-manifest.mjs` ги описва в `audio/manifest.json`.
 * Фрази без запис продължават с браузърния глас.
 */
class RecordedAudioEngine implements SpeechEngine {
  private current: HTMLAudioElement | null = null;
  /** текст → URL на файла; пълни се, когато manifest.json се зареди. */
  private files: Record<string, string> = {};

  constructor() {
    if (typeof window === "undefined" || typeof fetch === "undefined") return;
    fetch("/audio/manifest.json")
      .then((r): Promise<Record<string, string>> | Record<string, string> => (r.ok ? r.json() : {}))
      .then((manifest) => {
        const idByText = new Map(voiceLines().map((l) => [l.text, l.id]));
        for (const [text, id] of idByText) if (manifest[id]) this.files[text] = `/audio/${manifest[id]}`;
      })
      .catch(() => {});
  }

  canSpeak(text: string) {
    return typeof Audio !== "undefined" && text in this.files;
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

class WebSpeechEngine implements SpeechEngine {
  private voice: SpeechSynthesisVoice | null = null;

  constructor() {
    if (!this.supported()) return;
    const pickVoice = () => {
      const voices = window.speechSynthesis.getVoices();
      this.voice = voices.find((v) => v.lang.toLowerCase().replace("_", "-").startsWith("bg")) ?? null;
    };
    pickVoice();
    window.speechSynthesis.addEventListener?.("voiceschanged", pickVoice);
  }

  private supported() {
    return typeof window !== "undefined" && "speechSynthesis" in window;
  }

  /** Без български глас мълчим: чужд глас, четящ кирилица, само обърква детето. */
  canSpeak() {
    return this.supported() && this.voice !== null;
  }

  speak(text: string, volume: number) {
    if (!this.canSpeak()) return Promise.resolve();
    this.cancel();
    return new Promise<void>((resolve) => {
      try {
        const u = new SpeechSynthesisUtterance(text);
        u.lang = APP_CONFIG.locale;
        if (this.voice) u.voice = this.voice;
        u.rate = 0.85;
        u.pitch = 1.1;
        u.volume = volume;
        u.onend = u.onerror = () => resolve();
        window.speechSynthesis.speak(u);
      } catch {
        resolve();
      }
    });
  }

  cancel() {
    if (this.supported()) window.speechSynthesis.cancel();
  }
}

// ───────────────────────── публичен API ─────────────────────────

const state: { enabled: boolean; volume: number; spelling: TtsSpelling } = {
  enabled: true,
  volume: 0.8,
  spelling: DEFAULT_TTS_SPELLING,
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
let engines: SpeechEngine[] | null = null;

function getEngines(): SpeechEngine[] {
  if (!engines) engines = [new RecordedAudioEngine(), new WebSpeechEngine()];
  return engines;
}

export function configureSpeech(opts: { enabled: boolean; volume: number; spelling?: TtsSpelling }) {
  state.enabled = opts.enabled;
  state.volume = opts.volume;
  if (opts.spelling) state.spelling = opts.spelling;
  if (!opts.enabled) cancelSpeech();
}

/** Има ли изобщо как да говорим (за подсказка в настройките). */
export function hasBulgarianVoice(): boolean {
  if (typeof window === "undefined") return false;
  return getEngines().some((e) => e instanceof WebSpeechEngine && e.canSpeak());
}

export function speakPhrase(text: string, spelling: TtsSpelling = state.spelling): Promise<void> {
  if (!state.enabled || typeof window === "undefined") return Promise.resolve();
  const engine = getEngines().find((e) => e.canSpeak(text));
  if (!engine) return Promise.resolve();
  // Записите се търсят по оригиналния текст; на синтезатора подаваме пренаписания.
  return engine.speak(engine instanceof WebSpeechEngine ? prepareForTts(text, spelling) : text, state.volume);
}

export function cancelSpeech() {
  if (typeof window === "undefined") return;
  getEngines().forEach((e) => e.cancel());
}

/** „А. А като автобус.“ или „Три.“ */
export const speakCharacter = (lesson: CharacterLesson) => speakPhrase(lesson.spokenText);

export const speakWord = (word: string) => speakPhrase(word);

/** „Проследи буквата А.“ (с шаблон) или „Напиши буквата А.“ (без шаблон). */
export const writeTaskText = (lesson: CharacterLesson, trace: boolean) =>
  lesson.type === "letter"
    ? (trace ? phrases.traceLetter : phrases.writeLetter)(lesson.spokenName)
    : (trace ? phrases.traceNumber : phrases.writeNumber)(lesson.spokenName);

export const speakWriteTask = (lesson: CharacterLesson, trace = false) => speakPhrase(writeTaskText(lesson, trace));
