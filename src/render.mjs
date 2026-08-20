// Шаблон + конфиг → PNG-та, през истински Chrome.
//
// Шаблонът прави сам изрязването на фона, измерването на границите и свиването
// на куката — вътре в страницата. Затова тук не се пипат пиксели: чака се
// страницата да обяви, че е готова, и се снима.

import { readFile, writeFile, mkdir } from 'node:fs/promises';
import { join, extname } from 'node:path';

const MIME = { '.png': 'image/png', '.webp': 'image/webp', '.jpg': 'image/jpeg', '.jpeg': 'image/jpeg', '.svg': 'image/svg+xml' };

const DARK_THEMES = new Set(['oud-gold', 'noir-champagne', 'plum-gold']);

async function inlineAssets(html, roots) {
  const tokens = [...html.matchAll(/__B64:(.+?)__/g)].map((m) => m[1]);
  for (const rel of [...new Set(tokens)]) {
    let buf = null, used = null;
    for (const root of roots) {
      try { buf = await readFile(join(root, rel)); used = join(root, rel); break; } catch {}
    }
    if (!buf) throw new Error(`Липсва асет '${rel}' — търсих в ${roots.join(', ')}`);
    const mime = MIME[extname(used).toLowerCase()];
    if (!mime) throw new Error(`Непознат тип асет: ${used}`);
    html = html.replaceAll(`__B64:${rel}__`, `data:${mime};base64,${buf.toString('base64')}`);
  }
  return html;
}

/**
 * @param {import('puppeteer-core').Browser} browser
 * @param {object} cfg      конфиг от compose()
 * @param {object} opts     { templatePath, assetRoots, outDir, name, size }
 * @returns {Promise<{files: string[], sheet: string}>}
 */
export async function renderSet(browser, cfg, opts) {
  const { templatePath, assetRoots, outDir, name, size = 1080 } = opts;
  await mkdir(outDir, { recursive: true });
  const tpl = await readFile(templatePath, 'utf8');
  const p = cfg.product, s = cfg.shared;
  const files = [];

  for (const v of cfg.variants) {
    const theme = v.theme || 'oud-gold';
    const map = {
      __THEME__: theme,
      __KICKER__: v.kicker,
      __HOOK__: v.hook,
      __RIBBON__: v.ribbon,
      __HOOKSIZE__: v.hookSize || '108px',
      __SUBLINE__: v.subline ?? s.subline,
      __PRICE_WAS__: v.price_was ?? s.price_was ?? '',
      __PRICE_NOW__: v.price_now ?? s.price_now,
      __PRICE_NOTE__: v.price_note ?? s.price_note,
      __PROOF1T__: s.proof[0].t, __PROOF1B__: s.proof[0].b,
      __PROOF2T__: s.proof[1].t, __PROOF2B__: s.proof[1].b,
      __PROOF3T__: s.proof[2].t, __PROOF3B__: s.proof[2].b,
      __CTA__: v.cta ?? s.cta,
      __FOOT1__: s.foot[0], __FOOT2__: s.foot[1], __FOOT3__: s.foot[2],
      __PRODUCT__: `__B64:${p.photo}__`,
      __PRODUCT_H__: String(p.height ?? 520),
      __KNOCKOUT__: typeof p.knockout === 'string' ? p.knockout : 'auto',
    };

    let html = tpl;
    for (const [k, val] of Object.entries(map)) html = html.replaceAll(k, String(val));
    html = await inlineAssets(html, assetRoots);

    const page = await browser.newPage();
    try {
      await page.setViewport({ width: size, height: size, deviceScaleFactor: 1 });
      await page.setContent(html, { waitUntil: 'networkidle0', timeout: 60000 });

      // Готовност: шаблонът записва тези две неща, когато е приключил с продукта
      // и с побирането на куката. По-надеждно е от фиксирано изчакване.
      await page.waitForFunction(
        () => document.documentElement.dataset.productBbox && document.documentElement.dataset.hookSize,
        { timeout: 45000 }
      );

      const err = await page.evaluate(() => document.documentElement.dataset.productError || '');
      if (err) throw new Error(`Обработката на продукта се провали: ${err}`);

      const file = join(outDir, `${name}-${v.id}.png`);
      await page.screenshot({ path: file, type: 'png', clip: { x: 0, y: 0, width: size, height: size } });
      files.push(file);
      console.log(`  ${v.id.padEnd(28)} ${theme.padEnd(16)} PNG`);
    } finally {
      await page.close();
    }
  }

  const sheet = join(outDir, `_${name}.html`);
  await writeFile(sheet, contactSheet(cfg, name, size), 'utf8');
  return { files, sheet };
}

/** Contact sheet върху неутрално сиво: на бяло светлите банери изглеждат
 *  по-добре, отколкото са, на черно — тъмните. Сивото не ласкае никого. */
function contactSheet(cfg, name, size) {
  const esc = (t) => String(t).replace(/[&<>]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;' }[c]));
  const cards = cfg.variants.map((v) => {
    const theme = v.theme || 'oud-gold';
    const dark = DARK_THEMES.has(theme);
    const hook = String(v.hook).replace(/<[^>]+>/g, '');
    return `<figure>
  <img src="${name}-${v.id}.png" alt="${esc(v.id)}" loading="lazy">
  <figcaption>
    <div class="row"><b>${esc(hook)}</b><span class="tag ${dark ? 'dark' : 'light'}">${dark ? 'тъмна' : 'светла'}</span></div>
    <div class="ang">${esc(v._angle || v.id)}</div>
    <div class="meta">${esc(theme)} &middot; ${esc(v.id)}</div>
  </figcaption>
</figure>`;
  }).join('\n');

  const nDark = cfg.variants.filter((v) => DARK_THEMES.has(v.theme || 'oud-gold')).length;
  const nLight = cfg.variants.length - nDark;

  return `<!doctype html><html lang="bg"><head><meta charset="utf-8">
<title>AVIXO · ${esc(name)} · contact sheet</title>
<link href="https://fonts.googleapis.com/css2?family=Manrope:wght@400;600;700;800&display=swap" rel="stylesheet">
<style>
*{box-sizing:border-box;margin:0;padding:0}
body{background:#8E8E8B;color:#14110F;padding:30px 26px 60px;font:15px/1.5 Manrope,"Segoe UI",sans-serif}
header{max-width:1700px;margin:0 auto 24px}
h1{font-size:20px;font-weight:800;letter-spacing:.14em;text-transform:uppercase}
.sub{margin-top:6px;font-size:14px;color:#3B3733;max-width:74ch}
.grid{max-width:1700px;margin:0 auto;display:grid;grid-template-columns:repeat(auto-fill,minmax(330px,1fr));gap:26px}
figure{background:#F4F3F1;border-radius:14px;overflow:hidden;box-shadow:0 8px 24px rgba(0,0,0,.28)}
img{width:100%;display:block;border-bottom:1px solid rgba(0,0,0,.12)}
figcaption{padding:11px 13px 13px}
.row{display:flex;align-items:center;justify-content:space-between;gap:10px}
.row b{font-size:15px;font-weight:800}
.tag{flex:0 0 auto;font-size:11px;font-weight:700;letter-spacing:.09em;text-transform:uppercase;padding:3px 9px;border-radius:999px}
.tag.light{background:#E7DCC4;color:#5C4415}
.tag.dark{background:#26211C;color:#D9C89E}
.ang{margin-top:5px;font-size:13px;color:#4A443E}
.meta{margin-top:3px;font-size:12px;color:#8A837B;font-weight:600}
</style></head><body>
<header>
  <h1>AVIXO &middot; ${esc(name)} &middot; ${size}&times;${size}</h1>
  <div class="sub">${cfg.variants.length} варианта &mdash; ${nLight} светли, ${nDark} тъмни.
  Продукт: ${esc(cfg._facts?.title || '')}. Фонът е неутрално сив нарочно.</div>
</header>
<div class="grid">
${cards}
</div></body></html>`;
}

export { DARK_THEMES };
