// Букви, които децата често бъркат (по форма или по звук). Ползват се като
// „примамки“ в упражненията за слушане и разпознаване: М между Н и Ш, а не между М и Я.

export const SIMILAR: Record<string, string[]> = {
  А: ["Л", "Д", "Я"],
  Б: ["В", "Ь", "Р"],
  В: ["Б", "Ъ", "З"],
  Г: ["Т", "П", "Е"],
  Д: ["Л", "А", "Ц"],
  Е: ["З", "Г", "Ъ"],
  Ж: ["Х", "К", "Ш"],
  З: ["Е", "В", "С"],
  И: ["Й", "Н", "Ц"],
  Й: ["И", "Ц", "Н"],
  К: ["Х", "Ж", "Н"],
  Л: ["Д", "А", "П"],
  М: ["Н", "Ш", "Л"],
  Н: ["И", "П", "М"],
  О: ["С", "Ю", "У"],
  П: ["Н", "Л", "Г"],
  Р: ["Ь", "Я", "В"],
  С: ["О", "З", "Е"],
  Т: ["Г", "П", "Ш"],
  У: ["Ч", "Ц", "Ю"],
  Ф: ["Ю", "О", "Х"],
  Х: ["Ж", "К", "У"],
  Ц: ["Щ", "И", "Д"],
  Ч: ["У", "Ц", "Ш"],
  Ш: ["Щ", "Ц", "М"],
  Щ: ["Ш", "Ц", "Ч"],
  Ъ: ["Ь", "Б", "В"],
  Ь: ["Ъ", "Б", "Р"],
  Ю: ["О", "Я", "Ф"],
  Я: ["Р", "Ю", "А"],
  "0": ["8", "6", "9"],
  "1": ["7", "4", "2"],
  "2": ["5", "7", "3"],
  "3": ["8", "5", "2"],
  "4": ["1", "9", "7"],
  "5": ["2", "3", "6"],
  "6": ["9", "0", "5"],
  "7": ["1", "2", "4"],
  "8": ["3", "0", "6"],
  "9": ["6", "0", "4"],
};

/** `count` различни варианта: целта + приличащи ѝ, при нужда допълнени от `pool`. */
export function similarOptions(target: string, count: number, pool: readonly string[]): string[] {
  // Малките букви: избираме като за главните и после ги смаляваме.
  if (target !== target.toUpperCase())
    return similarOptions(target.toUpperCase(), count, pool.map((c) => c.toUpperCase())).map((c) => c.toLowerCase());
  const near = (SIMILAR[target] ?? []).filter((c) => c !== target);
  const extra = pool.filter((c) => c !== target && !near.includes(c));
  const picked = [...near.slice(0, count - 1)];
  while (picked.length < count - 1 && extra.length) picked.push(extra.splice(Math.floor(Math.random() * extra.length), 1)[0]);
  const all = [target, ...picked];
  for (let i = all.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [all[i], all[j]] = [all[j], all[i]];
  }
  return all;
}
