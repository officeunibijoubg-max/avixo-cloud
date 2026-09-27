import type { CharacterLesson } from "@/lib/types";
import { APP_CONFIG } from "@/config/app";
import { phrases } from "@/content/phrases";

// Слой за говор. Екраните викат само speakCharacter / speakWord / speakPhrase.
// Днес говори Web Speech API; утре — записани .mp3 файлове, без промяна в екраните.

export interface SpeechEngine {
  /** Дали може да изговори дадения текст (напр. има запис или български глас). */
  canSpeak(text: string): boolean;
  speak(text: string, volume: number): Promise<void>;
  cancel(): void;
}

/** Предварително записани файлове: текст → URL. Празно, докато няма записи. */
export const RECORDED_AUDIO: Record<string, string> = {
  // "А. А като автобус.": "/audio/letters/a.mp3",
};

class RecordedAudioEngine implements SpeechEngine {
  private current: HTMLAudioElement | null = null;
  constructor(private files: Record<string, string>) {}
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

const state = { enabled: true, volume: 0.8 };
let engines: SpeechEngine[] | null = null;

function getEngines(): SpeechEngine[] {
  if (!engines) engines = [new RecordedAudioEngine(RECORDED_AUDIO), new WebSpeechEngine()];
  return engines;
}

export function configureSpeech(opts: { enabled: boolean; volume: number }) {
  state.enabled = opts.enabled;
  state.volume = opts.volume;
  if (!opts.enabled) cancelSpeech();
}

/** Има ли изобщо как да говорим (за подсказка в настройките). */
export function hasBulgarianVoice(): boolean {
  if (typeof window === "undefined") return false;
  return getEngines().some((e) => e instanceof WebSpeechEngine && e.canSpeak());
}

export function speakPhrase(text: string): Promise<void> {
  if (!state.enabled || typeof window === "undefined") return Promise.resolve();
  const engine = getEngines().find((e) => e.canSpeak(text));
  return engine ? engine.speak(text, state.volume) : Promise.resolve();
}

export function cancelSpeech() {
  if (typeof window === "undefined") return;
  getEngines().forEach((e) => e.cancel());
}

/** „А. А като автобус.“ или „Три.“ */
export const speakCharacter = (lesson: CharacterLesson) => speakPhrase(lesson.spokenText);

export const speakWord = (word: string) => speakPhrase(word);

export const speakWriteTask = (lesson: CharacterLesson) =>
  speakPhrase(lesson.type === "letter" ? phrases.writeLetter(lesson.spokenName) : phrases.writeNumber(lesson.spokenName));
