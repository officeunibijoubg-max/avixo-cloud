// Преди build: описва гласовите файлове от public/audio/ в manifest.json:
// { files: id → име на файл, generated: ид-тата, генерирани от scripts/generate-voice.py }.
// Достатъчно е файлът да се казва като id-то от сценария (напр. letter-a-intro.mp3);
// запис на ръка със същото име заменя генерирания.
import { readdir, readFile, writeFile, mkdir } from "node:fs/promises";
import path from "node:path";

const DIR = path.resolve("public/audio");
await mkdir(DIR, { recursive: true });
const names = (await readdir(DIR)).filter((f) => /\.(mp3|m4a|aac|ogg|wav)$/i.test(f)).sort();
const files = Object.fromEntries(names.map((f) => [f.replace(/\.[^.]+$/, ""), f]));
let state = {};
try {
  state = JSON.parse(await readFile(path.join(DIR, "generated.json"), "utf8"));
} catch {}
const generated = Object.keys(state).filter((id) => files[id]);
await writeFile(path.join(DIR, "manifest.json"), JSON.stringify({ files, generated }) + "\n");
console.log(`audio/manifest.json: ${names.length} записа (${generated.length} генерирани)`);
