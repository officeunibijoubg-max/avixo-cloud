// Пътят на обучение: ЕДНА ясна последователност от стъпки. Детето винаги има точно
// една „следваща стъпка“; всичко минато може да се повтаря, а нищо напред не е отворено.
//
// Редът на буквите е като в българския буквар: първо гласните А, О, У, Е, И, после
// М, Л, Н… — така още след М детето пише МА и МАМА. Цифрите, думите, игрите и
// приказките са вмъкнати там, където детето вече знае нужното за тях.

export type PathStep =
  | { kind: "shape"; id: string }
  | { kind: "char"; char: string }
  | { kind: "word"; text: string }
  | { kind: "game"; id: string }
  | { kind: "story"; id: string };

export type Chapter = { title: string; icon: string; steps: PathStep[] };

/** Буквите в реда на буквара. */
export const LETTER_ORDER = "АОУЕИМЛНРСТВКПДБЗГЖШЧЦХФЪЙЩЮЯЬ".split("");

const shape = (id: string): PathStep => ({ kind: "shape", id });
const ch = (char: string): PathStep => ({ kind: "char", char });
const word = (text: string): PathStep => ({ kind: "word", text });
const game = (id: string): PathStep => ({ kind: "game", id });
const story = (id: string): PathStep => ({ kind: "story", id });

/** Какво идва след всяка буква (цифри, срички, думи, нови игри, приказки). */
const AFTER: Record<string, PathStep[]> = {
  О: [game("shapes")],
  У: [ch("1")],
  Е: [game("find-letter")],
  И: [ch("2")],
  М: [word("МА"), word("МАМА"), game("colors")],
  Л: [word("ЛА"), ch("3")],
  Н: [story("mom"), game("count-write")],
  Р: [ch("4")],
  С: [game("memory"), story("fish")],
  Т: [ch("5"), game("compare")],
  В: [game("first-letter")],
  К: [word("ОКО"), word("КОН"), ch("6")],
  П: [word("ПА"), game("balloons")],
  Д: [word("ДОМ"), word("ВОДА"), ch("7")],
  Б: [word("БА"), word("БАБА"), story("balloon"), game("sounds")],
  З: [word("ЗАЕК"), ch("8")],
  Г: [game("listen-write")],
  Ж: [word("ЖАБА"), story("frog"), ch("9")],
  Ш: [game("build-word")],
  Ч: [ch("0"), game("add")],
  Х: [game("read-word")],
  Ф: [game("subtract")],
  Й: [game("my-name")],
  Я: [story("apple")],
};

const lettersWithExtras = (letters: string[]) => letters.flatMap((l) => [ch(l), ...(AFTER[l] ?? [])]);
const slice = (from: string, to: string) => LETTER_ORDER.slice(LETTER_ORDER.indexOf(from), LETTER_ORDER.indexOf(to) + 1);

export const CHAPTERS: Chapter[] = [
  { title: "Първи чертички и гласни", icon: "✏️", steps: [shape("rain"), shape("road"), shape("circle"), ...lettersWithExtras(slice("А", "И"))] },
  { title: "Първите срички: МА, ЛА", icon: "🌱", steps: lettersWithExtras(slice("М", "С")) },
  { title: "Първите думи", icon: "🌳", steps: lettersWithExtras(slice("Т", "Д")) },
  { title: "Още букви и думи", icon: "⛰️", steps: lettersWithExtras(slice("Б", "Ж")) },
  { title: "Последните главни букви", icon: "🏔️", steps: lettersWithExtras(slice("Ш", "Ь")) },
  { title: "Малките букви", icon: "🌈", steps: LETTER_ORDER.map((l) => ch(l.toLowerCase())) },
];

export const PATH: PathStep[] = CHAPTERS.flatMap((c) => c.steps);

/** Ключ на стъпка: „char:А“, „game:find-letter“… — за търсене в пътя. */
export const stepKey = (s: PathStep): string =>
  s.kind === "char" ? `char:${s.char}` : s.kind === "word" ? `word:${s.text}` : `${s.kind}:${s.id}`;

const INDEX = new Map(PATH.map((s, i) => [stepKey(s), i]));

/** Номерът на стъпката в пътя (или -1, ако я няма). */
export const stepIndex = (key: string) => INDEX.get(key) ?? -1;

/** Първата стъпка на всяка глава — за показване на главите. */
export const CHAPTER_START: number[] = CHAPTERS.reduce<number[]>(
  (acc, c, i) => [...acc, i === 0 ? 0 : acc[i - 1] + CHAPTERS[i - 1].steps.length],
  [],
);
