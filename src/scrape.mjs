// Каталог и продуктови факти от avixo.eu.
//
// Старата цена се смята КЛИЕНТСКИ и я няма в сървърния HTML, затова всичко минава
// през истински браузър вместо през fetch. Същата причина както в локалния скрейпър.

const UA = 'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/128.0 Safari/537.36';

const CATEGORY_LABELS = [
  [/miezki/,   'Мъжки парфюм'],
  [/damski/,   'Дамски парфюм'],
  [/uniseks/,  'Унисекс парфюм'],
  [/komplekt/, 'Комплект'],
  [/detski/,   'Детски парфюм'],
];

/** Всички продуктови URL-и от една или няколко категории, подредени стабилно. */
export async function readCatalog(browser, categoryUrls) {
  const seen = new Map();
  for (const url of categoryUrls) {
    const page = await browser.newPage();
    await page.setUserAgent(UA);
    try {
      await page.goto(url, { waitUntil: 'networkidle2', timeout: 60000 });
      const items = await page.evaluate(() => {
        const out = [];
        document.querySelectorAll('img').forEach((img) => {
          const src = img.getAttribute('src') || '';
          const m = src.match(/\/products\/(\d+)\//);
          const a = img.closest('a');
          if (m && a) out.push({ ref: Number(m[1]), href: a.getAttribute('href'), title: img.alt || '' });
        });
        return out;
      });
      for (const it of items) {
        if (!seen.has(it.ref)) {
          seen.set(it.ref, { ...it, url: new URL(it.href, url).toString() });
        }
      }
    } finally {
      await page.close();
    }
  }
  // Подредбата е по референция: стабилна е и не се мени, когато сайтът пренареди
  // витрината. Ротацията разчита на това — иначе „утре" би върнало вчерашния продукт.
  return [...seen.values()].sort((a, b) => a.ref - b.ref);
}

/** Фактите за един продукт. Хвърля, ако JSON-LD липсва — по-добре от измислени данни. */
export async function readProduct(browser, url) {
  const page = await browser.newPage();
  await page.setUserAgent(UA);
  try {
    await page.goto(url, { waitUntil: 'networkidle2', timeout: 60000 });

    const raw = await page.evaluate(() => {
      const el = document.querySelector('script[type="application/ld+json"]');
      const old = document.querySelector('.old_price');
      return { ld: el ? el.textContent : null, oldPrice: old ? old.textContent : null };
    });
    if (!raw.ld) throw new Error(`Няма JSON-LD: ${url}`);

    const ld = JSON.parse(raw.ld);
    if (ld['@type'] !== 'Product') throw new Error(`JSON-LD не е Product, а ${ld['@type']}: ${url}`);

    const title = ld.name;
    const photoUrl = Array.isArray(ld.image) ? ld.image[0] : ld.image;
    const priceNum = Number(ld.offers?.price);
    if (!Number.isFinite(priceNum)) throw new Error(`Няма валидна цена: ${url}`);
    if (ld.offers?.priceCurrency && ld.offers.priceCurrency !== 'EUR') {
      throw new Error(`Валутата е ${ld.offers.priceCurrency}, а шаблонът пише €: ${url}`);
    }

    let priceWas = '';
    if (raw.oldPrice) {
      const m = raw.oldPrice.replace(/ /g, ' ').match(/([\d\s.,]+)\s*€/);
      if (m) priceWas = m[1].trim() + ' €';
    }

    const seg = new URL(url).pathname.split('/').filter(Boolean)[0] || '';
    const category = (CATEGORY_LABELS.find(([rx]) => rx.test(seg)) || [null, 'Арабски парфюм'])[1];

    const ml = Number((title.match(/(\d{1,4})\s*(?:мл|ml)/i) || [])[1]) || 100;

    let brand = title;
    for (const rx of [/\s*\d{1,4}\s*(мл|ml)\.?/gi, /Парфюмна\s+Вода/gi, /Парфюм/gi, /Perfume/gi,
                      /за\s+Мъже/gi, /за\s+Жени/gi, /Мъжки/gi, /Дамски/gi, /Унисекс/gi,
                      /Unisex/gi, /Детски/gi]) {
      brand = brand.replace(rx, ' ');
    }
    brand = brand.replace(/\s{2,}/g, ' ').replace(/^[\s.,&-]+|[\s.,&-]+$/g, '');

    let bottles = 1;
    if (/komplekt/.test(seg) || /[&+]/.test(title)) {
      const xm = title.match(/[xх]\s*(\d)/i);
      bottles = xm ? Number(xm[1]) : (title.match(/[&+]/g) || []).length + 1;
    }

    const ref = Number((photoUrl.match(/\/products\/(\d+)\//) || [])[1]) || 0;
    const slug = new URL(url).pathname.split('/').filter(Boolean).pop();

    return { url, ref, slug, title, brand, category, ml, bottles, photoUrl, priceNum, priceWas };
  } finally {
    await page.close();
  }
}

/** Форматира инвариантно: локалата на runner-а не бива да мени десетичния знак. */
export function eur(n) {
  return n.toFixed(2).replace('.', ',');
}
