"use client";

import { useState } from "react";
import { SHOP_CATEGORIES, SHOP_ITEMS, type ShopCategory, type ShopItem } from "@/data/shop";
import { phrases } from "@/content/phrases";
import { useGameStore } from "@/store/gameStore";
import { playSound } from "@/services/sounds";
import { speakPhrase } from "@/services/speech";
import { cn } from "@/lib/cn";
import { PageShell } from "@/components/ui/PageShell";
import { Mascot } from "@/components/game/Mascot";

/** Магазинът: тук монетите се превръщат в неща за Лъвчо и за стаята. */
export default function ShopPage() {
  const progress = useGameStore((s) => s.progress);
  const buy = useGameStore((s) => s.buy);
  const equip = useGameStore((s) => s.equip);
  const updateSettings = useGameStore((s) => s.updateSettings);
  const mascot = useGameStore((s) => s.settings.mascot);
  const [tab, setTab] = useState<ShopCategory>("accessory");
  const [message, setMessage] = useState<string>("Какво ще купим днес?");

  const tap = (item: ShopItem) => {
    const owned = progress.owned.includes(item.id);
    if (owned) {
      // Вече купено: слагаме/сваляме или избираме приятеля.
      playSound("pop");
      if (item.category === "friend" && item.mascot) updateSettings({ mascot: item.mascot });
      else if (item.category === "accessory" || item.category === "background") {
        const slot = item.category;
        equip(progress.equipped[slot] === item.id ? null : item.id, slot);
      }
      return;
    }
    const res = buy(item.id);
    if (res.ok) {
      playSound("reward");
      if (item.category === "friend" && item.mascot) updateSettings({ mascot: item.mascot });
      const text = phrases.bought(item.name);
      setMessage(text);
      void speakPhrase(text);
    } else if (res.reason === "coins") {
      playSound("wrong");
      const text = phrases.needCoins(item.price - progress.coins);
      setMessage(text);
      void speakPhrase(text);
    }
  };

  const items = SHOP_ITEMS.filter((i) => i.category === tab);

  return (
    <PageShell back="/" title="Магазин">
      <Mascot message={message} className="mb-4" />
      <div className="mb-4 flex flex-wrap gap-2">
        {SHOP_CATEGORIES.map((c) => (
          <button
            key={c.id}
            type="button"
            onClick={() => setTab(c.id)}
            className={cn(
              "card-soft flex min-h-14 items-center gap-2 rounded-2xl px-4 py-2 text-lg font-extrabold shadow-sm",
              tab === c.id ? "bg-grape text-white" : "bg-white",
            )}
          >
            <span className="text-2xl">{c.icon}</span>
            {c.title}
          </button>
        ))}
      </div>
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
        {items.map((item) => {
          const owned = progress.owned.includes(item.id);
          const inUse =
            (item.category === "accessory" && progress.equipped.accessory === item.id) ||
            (item.category === "background" && progress.equipped.background === item.id) ||
            (item.category === "friend" && item.mascot === mascot);
          const affordable = progress.coins >= item.price;
          return (
            <button
              key={item.id}
              type="button"
              onClick={() => tap(item)}
              className={cn(
                "card-soft relative flex flex-col items-center gap-2 rounded-3xl bg-white p-4 shadow-[0_6px_0_rgb(0_0_0/0.1)] transition active:translate-y-1",
                inUse && "ring-4 ring-leaf",
              )}
            >
              <span
                className={cn("flex size-24 items-center justify-center rounded-2xl text-6xl", !owned && !affordable && "opacity-50")}
                style={item.background ? { background: item.background } : undefined}
              >
                {item.icon}
              </span>
              <span className="text-center text-base font-bold leading-tight">{item.name}</span>
              {owned ? (
                <span className={cn("rounded-full px-3 py-1 text-sm font-black", inUse ? "bg-leaf text-white" : "bg-slate-100")}>
                  {inUse ? "✓ Използва се" : item.category === "toy" ? "✓ В стаята" : "Сложи"}
                </span>
              ) : (
                <span className={cn("rounded-full px-4 py-1 text-lg font-black", affordable ? "bg-sun text-white" : "bg-slate-100 text-slate-500")}>
                  🪙 {item.price}
                </span>
              )}
            </button>
          );
        })}
      </div>
    </PageShell>
  );
}
