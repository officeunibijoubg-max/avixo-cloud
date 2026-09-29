// Генерира docs/voice-script.csv — сценария за записан глас (id, група, текст).
// Пуска се с `npm run voice-script` (vitest изпълнява TypeScript без допълнителни пакети).
import { it } from "vitest";
import { writeFileSync, mkdirSync } from "node:fs";
import path from "node:path";
import { voiceLines } from "@/content/voiceScript";

it("пише docs/voice-script.csv", () => {
  const csv = (s: string) => `"${s.replace(/"/g, '""')}"`;
  const rows = voiceLines().map((l) => [l.id, l.group, l.text].map(csv).join(","));
  const out = path.resolve(__dirname, "../docs/voice-script.csv");
  mkdirSync(path.dirname(out), { recursive: true });
  writeFileSync(out, "﻿" + ["id,група,текст", ...rows].join("\n") + "\n");
});
