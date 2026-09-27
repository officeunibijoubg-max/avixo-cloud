export const randomInt = (n: number) => Math.floor(Math.random() * n);

export const pickOne = <T,>(list: readonly T[]): T => list[randomInt(list.length)];

export function shuffle<T>(list: readonly T[]): T[] {
  const a = list.slice();
  for (let i = a.length - 1; i > 0; i--) {
    const j = randomInt(i + 1);
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

/** `count` различни елемента, сред които задължително е `must`. */
export function optionsWith<T>(pool: readonly T[], must: T, count: number): T[] {
  const others = shuffle(pool.filter((x) => x !== must)).slice(0, count - 1);
  return shuffle([must, ...others]);
}
