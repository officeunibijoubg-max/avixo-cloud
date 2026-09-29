// Преди build: описва записаните гласови файлове от public/audio/ в manifest.json
// (id → име на файл). Достатъчно е файлът да се казва като id-то от сценария,
// напр. public/audio/letter-a-intro.mp3 — не се пипа код.
import { readdir, writeFile, mkdir } from "node:fs/promises";
import path from "node:path";

const DIR = path.resolve("public/audio");
await mkdir(DIR, { recursive: true });
const files = (await readdir(DIR)).filter((f) => /\.(mp3|m4a|aac|ogg|wav)$/i.test(f)).sort();
const manifest = Object.fromEntries(files.map((f) => [f.replace(/\.[^.]+$/, ""), f]));
await writeFile(path.join(DIR, "manifest.json"), JSON.stringify(manifest, null, 2) + "\n");
console.log(`audio/manifest.json: ${files.length} записа`);
