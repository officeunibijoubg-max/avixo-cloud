// Ежедневният пуск: избери продукт по ротация → направи сет → качи в Drive.
//
//   node src/daily.mjs                      обичайният пуск
//   node src/daily.mjs --url <URL>          конкретен продукт (за проверка)
//   node src/daily.mjs --count 6 --no-upload  бърз локален тест
//
// Променливи на средата:
//   GOOGLE_OAUTH_CLIENT_ID        OAuth клиент (Desktop app)
//   GOOGLE_OAUTH_CLIENT_SECRET
//   GOOGLE_OAUTH_REFRESH_TOKEN    еднократно издаден, не изтича
//   DRIVE_PARENT_FOLDER_ID        папката ad-formats в Drive

import { readFile, writeFile, mkdir, rm } from 'node:fs/promises';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import puppeteer from 'puppeteer';
import { readCatalog, readProduct, eur } from './scrape.mjs';
import { compose, pickForDate, isDarkProduct } from './compose.mjs';
import { renderSet, DARK_THEMES } from './render.mjs';
import { driveClient, ensureFolder, uploadAll } from './drive.mjs';

const ROOT = dirname(dirname(fileURLToPath(import.meta.url)));
const WORK = join(ROOT, '.work');

const CATEGORIES = [
  'https://avixo.eu/luksozni-arabski-parfiumi',
  'https://avixo.eu/komplekti',
];

function arg(name, fallback = null) {
  const i = process.argv.indexOf(`--${name}`);
  return i >= 0 && process.argv[i + 1] && !process.argv[i + 1].startsWith('--') ? process.argv[i + 1] : fallback;
}
const flag = (name) => process.argv.includes(`--${name}`);

/** Среден блясък на непрозрачните пиксели — решава коя половина от палитрите
 *  отива на този продукт. Тъмен продукт → светли палитри, и обратно. */
async function productStats(browser, photoUrl) {
  const page = await browser.newPage();
  try {
    await page.goto(photoUrl, { waitUntil: 'networkidle2', timeout: 60000 });
    return await page.evaluate(() => {
      const im = document.querySelector('img');
      const c = document.createElement('canvas');
      c.width = im.naturalWidth; c.height = im.naturalHeight;
      const x = c.getContext('2d');
      x.drawImage(im, 0, 0);
      const d = x.getImageData(0, 0, c.width, c.height).data;
      // Бял фон и прозрачни пиксели не се броят — иначе всяка снимка излиза светла.
      let sum = 0, n = 0;
      for (let i = 0; i < d.length; i += 16) {
        const a = d[i + 3];
        if (a < 200) continue;
        const r = d[i], g = d[i + 1], b = d[i + 2];
        if (r > 240 && g > 240 && b > 240) continue;
        sum += 0.2126 * r + 0.7152 * g + 0.0722 * b;
        n++;
      }
      return { meanLuma: n ? sum / n : 128, sampled: n };
    });
  } finally {
    await page.close();
  }
}

function manifest(cfg, name, date) {
  const L = [`AVIXO · ${name} · 1080x1080`, `Пуск: ${date}`, `Продукт: ${cfg._source}`];
  L.push(`Цена: ${cfg.shared.price_now} EUR${cfg.shared.price_was ? `  (стара: ${cfg.shared.price_was})` : ''}`);
  L.push('-'.repeat(72));
  for (const v of cfg.variants) {
    const theme = v.theme || 'oud-gold';
    L.push('', `${v.id}   [${theme} · ${DARK_THEMES.has(theme) ? 'тъмна' : 'светла'}]`);
    L.push(`  кука   : ${String(v.hook).replace(/<[^>]+>/g, '')}`);
    L.push(`  kicker : ${v.kicker}`);
    L.push(`  лента  : ${v.ribbon}`);
    if (v._angle) L.push(`  ъгъл   : ${v._angle}`);
    L.push(`  файл   : ${name}-${v.id}.png`);
  }
  L.push('', '-'.repeat(72), `Общо: ${cfg.variants.length} варианта`);
  return L.join('\n');
}

async function main() {
  const date = arg('date') || new Date().toISOString().slice(0, 10);
  const count = Number(arg('count', '12'));
  const doUpload = !flag('no-upload');

  await rm(WORK, { recursive: true, force: true });
  await mkdir(join(WORK, 'products'), { recursive: true });

  const browser = await puppeteer.launch({
    headless: 'new',
    args: ['--no-sandbox', '--disable-dev-shm-usage', '--disable-gpu', '--hide-scrollbars'],
  });

  try {
    let url = arg('url');
    if (!url) {
      console.log('Чета каталога…');
      const catalog = await readCatalog(browser, CATEGORIES);
      console.log(`  ${catalog.length} продукта`);
      const pick = pickForDate(catalog, new Date(`${date}T12:00:00Z`));
      url = pick.url;
      console.log(`  днес е ред на: ${pick.title}`);
    }

    console.log(`Чета продукта: ${url}`);
    const p = await readProduct(browser, url);
    console.log(`  ${p.title} — ${eur(p.priceNum)} €${p.priceWas ? ` (стара: ${p.priceWas})` : ''}, ${p.bottles} флакон(а)`);

    const stats = await productStats(browser, p.photoUrl);
    const dark = isDarkProduct(stats);
    console.log(`  средна светлота: ${stats.meanLuma.toFixed(0)} → ${dark ? 'тъмен' : 'блед'} продукт`);

    // снимката се сваля локално, за да я вгради шаблонът като data-URI
    const photoPath = join(WORK, 'products', `${p.ref}-${p.slug}.webp`);
    const res = await fetch(p.photoUrl, { headers: { Referer: 'https://avixo.eu/' } });
    if (!res.ok) throw new Error(`Снимката не се свали: HTTP ${res.status}`);
    await writeFile(photoPath, Buffer.from(await res.arrayBuffer()));

    const lib = JSON.parse(await readFile(join(ROOT, 'src', 'hooks.json'), 'utf8'));
    const cfg = compose(p, lib, dark, count);

    const name = `${p.ref}-${p.slug}`;
    const outDir = join(WORK, 'out');
    console.log(`Рендерирам ${cfg.variants.length} варианта…`);
    const { files, sheet } = await renderSet(browser, cfg, {
      templatePath: join(ROOT, 'assets', 'templates', 'A1-square.html'),
      assetRoots: [WORK, join(ROOT, 'assets')],
      outDir, name,
    });

    const manifestPath = join(outDir, 'manifest.txt');
    await writeFile(manifestPath, manifest(cfg, name, date), 'utf8');

    if (!doUpload) {
      console.log(`\nБез качване. Изходът е в ${outDir}`);
      return;
    }

    const parentId = process.env.DRIVE_PARENT_FOLDER_ID;
    if (!parentId) throw new Error('Липсва DRIVE_PARENT_FOLDER_ID.');

    const drive = driveClient({
      clientId:     process.env.GOOGLE_OAUTH_CLIENT_ID,
      clientSecret: process.env.GOOGLE_OAUTH_CLIENT_SECRET,
      refreshToken: process.env.GOOGLE_OAUTH_REFRESH_TOKEN,
    });
    const folderName = `${date}_${name}`;
    console.log(`Качвам в Drive: ${folderName}`);
    const folderId = await ensureFolder(drive, parentId, folderName);
    await uploadAll(drive, folderId, [...files, sheet, manifestPath]);
    console.log(`\nГотово: https://drive.google.com/drive/folders/${folderId}`);
  } finally {
    await browser.close();
  }
}

main().catch((e) => { console.error('ПРОВАЛ:', e.message); process.exit(1); });
