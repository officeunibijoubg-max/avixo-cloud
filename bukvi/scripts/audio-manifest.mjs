// Преди build: описва записите на ръка (public/audio/<id>.mp3 — напр. гласът на мама)
// в manifest.json: { files: id → файл }. Те са с предимство пред генерираните гласове
// в папките public/audio/<глас>/ (виж scripts/generate-voice.py), които не се описват —
// приложението ги търси направо по id.
import { readdir, writeFile, mkdir } from "node:fs/promises";
import path from "node:path";

const DIR = path.resolve("public/audio");
await mkdir(DIR, { recursive: true });
const entries = await readdir(DIR, { withFileTypes: true });
const names = entries.filter((e) => e.isFile() && /\.(mp3|m4a|aac|ogg|wav)$/i.test(e.name)).map((e) => e.name).sort();
const files = Object.fromEntries(names.map((f) => [f.replace(/\.[^.]+$/, ""), f]));
const voices = [];
for (const e of entries.filter((x) => x.isDirectory())) {
  const n = (await readdir(path.join(DIR, e.name))).filter((f) => f.endsWith(".mp3")).length;
  voices.push(`${e.name}: ${n}`);
}
await writeFile(path.join(DIR, "manifest.json"), JSON.stringify({ files }) + "\n");
console.log(`audio/manifest.json: ${names.length} записа на ръка; гласове — ${voices.join(", ") || "няма"}`);
