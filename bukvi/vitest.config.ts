import { defineConfig } from "vitest/config";
import path from "node:path";

export default defineConfig({
  resolve: { alias: { "@": path.resolve(__dirname, "src") } },
  // `npm run voice-script` пуска само генератора на сценария за записан глас.
  test: { include: process.env.VOICE_SCRIPT ? ["scripts/*.test.ts"] : ["src/**/*.test.ts"] },
});
