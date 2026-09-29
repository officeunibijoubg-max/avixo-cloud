// След `next build`: вписва в out/sw.js всички файлове за офлайн кеширане и версия.
import { readdir, readFile, writeFile, stat } from "node:fs/promises";
import { createHash } from "node:crypto";
import path from "node:path";

const OUT = path.resolve("out");

async function walk(dir) {
  const out = [];
  for (const name of await readdir(dir)) {
    const full = path.join(dir, name);
    if ((await stat(full)).isDirectory()) out.push(...(await walk(full)));
    else out.push(full);
  }
  return out;
}

const files = (await walk(OUT))
  .map((f) => "/" + path.relative(OUT, f).split(path.sep).join("/"))
  .filter((f) => f !== "/sw.js" && !f.endsWith(".txt") && !f.endsWith(".map"))
  // Гласовите записи са много — кешират се при първо пускане, не наведнъж.
  .filter((f) => !/^\/audio\/.+\.(mp3|m4a|aac|ogg|wav)$/.test(f) && f !== "/audio/generated.json")
  // Страниците се кешират по адрес с наклонена черта (trailingSlash).
  .map((f) => (f.endsWith("/index.html") ? f.slice(0, -"index.html".length) : f))
  .filter((f) => f !== "/404.html")
  .sort();

const hash = createHash("sha256");
for (const f of files) hash.update(f);
const version = hash.digest("hex").slice(0, 12);

const swPath = path.join(OUT, "sw.js");
const sw = (await readFile(swPath, "utf8"))
  .replace("__VERSION__", version)
  .replace("self.__PRECACHE__ || []", JSON.stringify(files));
await writeFile(swPath, sw);
console.log(`sw.js: ${files.length} файла за офлайн, версия ${version}`);
