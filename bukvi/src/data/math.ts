import { randomInt, shuffle } from "@/lib/random";

// Задачите с числа до 10: сравняване, събиране, изваждане. Чисти функции — лесни за тест.

/** Какво броим — илюстрации в стила на Лъвчо. */
export const COUNT_ITEMS = ["ladybug", "duckling", "frog", "bunny", "kitten", "elephant", "teddy", "deer"];

const NAMES = ["нула", "едно", "две", "три", "четири", "пет", "шест", "седем", "осем", "девет", "десет"];

/** Числото с думи — за говора („три“). */
export const numberName = (n: number) => NAMES[n] ?? String(n);

/** Две групи с различен брой (1..max), за „Къде има повече/по-малко?“. */
export function compareRound(max = 9) {
  const a = 1 + randomInt(max);
  let b = 1 + randomInt(max);
  while (b === a) b = 1 + randomInt(max);
  return { a, b, askMore: Math.random() < 0.5 };
}

/** a + b ≤ max, и двете поне 1. */
export function addRound(max = 10) {
  const sum = 2 + randomInt(max - 1);
  const a = 1 + randomInt(sum - 1);
  return { a, b: sum - a, answer: sum };
}

/** a − b ≥ 0, a до max, b поне 1. */
export function subRound(max = 10) {
  const a = 2 + randomInt(max - 1);
  const b = 1 + randomInt(a - 1);
  return { a, b, answer: a - b };
}

/** Три различни числа от 0..10: верният отговор и два близки. */
export function numberOptions(answer: number, max = 10): number[] {
  const near = shuffle([-2, -1, 1, 2].map((d) => answer + d).filter((n) => n >= 0 && n <= max)).slice(0, 2);
  return shuffle([answer, ...near]);
}
