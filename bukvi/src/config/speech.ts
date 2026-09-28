// Как да се подават звуковете на буквите („Бъ“, „Въ“, „Ъ“) на синтезатора на говор.
// Гласовете на различните устройства ги четат различно — някои спелуват „Бъ“ като
// „бе, ер малък“. Родителят избира в Настройки варианта, който звучи правилно
// на неговото устройство; изборът се пази само там.

export type TtsSpelling = "plain" | "lower" | "double" | "accent";

export const TTS_SPELLINGS: { id: TtsSpelling; label: string; example: string }[] = [
  { id: "lower", label: "Вариант 1", example: "бъ" },
  { id: "double", label: "Вариант 2", example: "бъъ" },
  { id: "accent", label: "Вариант 3", example: "бъ̀" },
  { id: "plain", label: "Вариант 4", example: "Бъ" },
];

export const DEFAULT_TTS_SPELLING: TtsSpelling = "lower";
