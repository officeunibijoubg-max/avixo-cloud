import type { NextConfig } from "next";

// Статичен export: приложението е изцяло клиентско (прогресът е локален),
// така че може да се хоства навсякъде и да работи офлайн през service worker.
const nextConfig: NextConfig = {
  output: "export",
  trailingSlash: true,
  images: { unoptimized: true },
};

export default nextConfig;
