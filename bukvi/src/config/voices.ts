// Записаните гласове (виж scripts/generate-voice.py). Файловете на всеки глас са в
// public/audio/<id>/<ид на фразата>.mp3. Смени реда или добави глас само тук.

export type VoiceGender = "female" | "male";
export type VoiceDef = { id: string; name: string; gender: VoiceGender; icon: string };

export const VOICES: VoiceDef[] = [
  { id: "lili", name: "Лили", gender: "female", icon: "👩" },
  { id: "georgi", name: "Георги", gender: "male", icon: "👨" },
  { id: "dimitar", name: "Димитър", gender: "male", icon: "🧔" },
];

export const DEFAULT_VOICE = "lili";

/** Фразата за прослушване на глас в настройките. */
export const VOICE_SAMPLE_ID = "letter-b-intro";
