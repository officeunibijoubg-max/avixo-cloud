// Островът на думите: срички и кратки думи, които детето пише буква по буква.
// Всички са само от букви от Гората (А–П), защото островът се отключва след нея.

export type WordItem = {
  /** Латински slug за адреса /word/<id>. */
  id: string;
  /** Как се пише — главни букви. */
  text: string;
  kind: "syllable" | "word";
  /** Как да го каже синтезаторът (малки букви четат по-естествено). */
  spoken: string;
  /** Ключ на илюстрация (за думите). */
  image?: string;
};

export const WORD_ITEMS: WordItem[] = [
  { id: "ma", text: "МА", kind: "syllable", spoken: "ма" },
  { id: "ba", text: "БА", kind: "syllable", spoken: "ба" },
  { id: "pa", text: "ПА", kind: "syllable", spoken: "па" },
  { id: "la", text: "ЛА", kind: "syllable", spoken: "ла" },
  { id: "mama", text: "МАМА", kind: "word", spoken: "мама", image: "mom" },
  { id: "baba", text: "БАБА", kind: "word", spoken: "баба", image: "grandma" },
  { id: "oko", text: "ОКО", kind: "word", spoken: "око", image: "eye" },
  { id: "dom", text: "ДОМ", kind: "word", spoken: "дом", image: "house" },
  { id: "kon", text: "КОН", kind: "word", spoken: "кон", image: "horse" },
  { id: "zhaba", text: "ЖАБА", kind: "word", spoken: "жаба", image: "frog" },
  { id: "voda", text: "ВОДА", kind: "word", spoken: "вода", image: "water" },
  { id: "zaek", text: "ЗАЕК", kind: "word", spoken: "заек", image: "bunny" },
];

export const getWordById = (id: string) => WORD_ITEMS.find((w) => w.id === id);
export const getWordByText = (text: string) => WORD_ITEMS.find((w) => w.text === text);
