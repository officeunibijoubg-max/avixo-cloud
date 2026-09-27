// Весели, но меки цветове за плочките — повтарят се по ред.
export const TILE_COLORS = [
  "bg-sky-200",
  "bg-violet-200",
  "bg-amber-200",
  "bg-pink-200",
  "bg-lime-200",
  "bg-orange-200",
  "bg-teal-200",
  "bg-rose-200",
] as const;

export const tileColor = (i: number) => TILE_COLORS[i % TILE_COLORS.length];
