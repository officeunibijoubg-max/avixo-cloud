// Факти за продукт + библиотеката с ъгли → конфиг на сета.
//
// Тук няма копирайтинг: куките идват от hooks.json. Този модул само ги попълва
// с данните на продукта и раздава палитрите.

import { eur } from './scrape.mjs';

/** Тъмен ли е продуктът? Решава коя половина от палитрите му отива.
 *  Контрастът продукт↔фон е това, което кара шишето да се вижда — не светло/тъмно. */
export function isDarkProduct(stats) {
  return stats.meanLuma < 118;
}

function fill(str, v) {
  return String(str)
    .replaceAll('{{brand}}', v.brand)
    .replaceAll('{{category}}', v.category)
    .replaceAll('{{ml}}', String(v.ml))
    .replaceAll('{{bottles}}', String(v.bottles))
    .replaceAll('{{price}}', v.priceLabel)
    .replaceAll('{{unit}}', v.unitLabel);
}

/**
 * @param {object} p      факти от readProduct
 * @param {object} lib    hooks.json
 * @param {boolean} dark  тъмен ли е продуктът (от анализа на снимката)
 * @param {number} count  колко варианта
 */
export function compose(p, lib, dark, count = 12) {
  const isSet = p.bottles > 1;
  const priceLabel = eur(p.priceNum);
  const unitLabel = eur(p.priceNum / p.bottles).replace(/,00$/, '');

  const vars = { ...p, priceLabel, unitLabel };

  const angles = lib.angles.filter(
    (a) => a.for === 'any' || (a.for === 'set' && isSet) || (a.for === 'single' && !isSet)
  );
  if (!angles.length) throw new Error('Няма приложими ъгли за този продукт.');

  // Тъмен продукт → предимно светли палитри, и обратно. Малцинството остава
  // застъпено, за да има какво да се сравнява в теста.
  const primary = dark ? lib.themes.light : lib.themes.dark;
  const secondary = dark ? lib.themes.dark : lib.themes.light;

  const variants = [];
  for (let i = 0; i < count; i++) {
    const a = angles[i % angles.length];
    // всеки четвърти взима палитра от слабата половина
    const pool = i % 4 === 3 ? secondary : primary;
    const theme = pool[Math.floor(i / 4) % pool.length] ?? pool[0];

    const n = String(i + 1).padStart(2, '0');
    variants.push({
      id: `v${n}-${a.id}`,
      _angle: a.angle,
      theme,
      kicker: fill(a.kicker, vars),
      hook: fill(a.hook, vars),
      ribbon: fill(a.ribbon, vars),
      ...(a.price_note ? { price_note: fill(a.price_note, vars) } : {}),
    });
  }

  const priceNote = isSet
    ? `по ${unitLabel} € за флакон`
    : `${p.ml} мл · оригинален`;

  return {
    _source: p.url,
    _facts: { title: p.title, brand: p.brand, category: p.category, ml: p.ml, bottles: p.bottles, darkProduct: dark },
    product: { photo: `products/${p.ref}-${p.slug}.webp`, height: 520 },
    shared: {
      subline: `${p.brand} · ${p.category} · ${p.ml} мл`,
      price_was: p.priceWas,
      price_now: priceLabel,
      price_note: priceNote,
      proof: lib.proof,
      cta: lib.cta,
      foot: ['avixo.eu', 'Наложен платеж', `${p.category} · ${p.ml} мл`],
    },
    variants,
  };
}

/** Кой продукт е ред днес. Без състояние — датата определя индекса. */
export function pickForDate(catalog, date = new Date()) {
  if (!catalog.length) throw new Error('Каталогът е празен.');
  const days = Math.floor(Date.UTC(date.getUTCFullYear(), date.getUTCMonth(), date.getUTCDate()) / 86400000);
  return catalog[days % catalog.length];
}
