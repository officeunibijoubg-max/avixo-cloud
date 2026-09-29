"use client";

import { useState } from "react";
import { SHOP_CATEGORIES, SHOP_ITEMS, WEAR_SLOTS, getShopItem, type ShopCategory, type ShopItem } from "@/data/shop";
import { MASCOTS } from "@/config/mascot";
import { phrases } from "@/content/phrases";
import type { Equipped } from "@/lib/types";
import { useGameStore } from "@/store/gameStore";
import { playSound } from "@/services/sounds";
import { speakPhrase } from "@/services/speech";
import { cn } from "@/lib/cn";
import { PageShell } from "@/components/ui/PageShell";
import { BigButton } from "@/components/ui/BigButton";
import { useHeroLook, wornItems } from "@/components/game/Mascot";
import { HeroSvg, type HeroPose } from "@/components/game/hero/HeroSvg";

/**
 * Магазинът с „пробна“: докосваш нещо — героят го пробва веднага.
 * Купува се с големия бутон, затова случайно докосване не харчи монети.
 */
export default function ShopPage() {
  const progress = useGameStore((s) => s.progress);
  const buy = useGameStore((s) => s.buy);
  const toggleEquip = useGameStore((s) => s.toggleEquip);
  const unequip = useGameStore((s) => s.unequip);
  const updateSettings = useGameStore((s) => s.updateSettings);
  const { hero } = useHeroLook();
  const [tab, setTab] = useState<ShopCategory>("accessory");
  const [selected, setSelected] = useState<ShopItem | null>(null);
  const [pose, setPose] = useState<HeroPose>("wave");
  const [message, setMessage] = useState<string>(phrases.shopHello);

  const say = (text: string, p: HeroPose) => {
    setMessage(text);
    setPose(p);
    void speakPhrase(text);
  };

  // Какво показва пробната: облеченото + избраното (ако е дреха), избрания приятел, избрания фон.
  const previewEquipped: Equipped =
    selected?.category === "accessory" && selected.slot ? { ...progress.equipped, [selected.slot]: selected.id } : progress.equipped;
  const previewHero = selected?.category === "friend" && selected.mascot ? selected.mascot : hero;
  const previewBg =
    getShopItem(selected?.category === "background" ? selected.id : (progress.equipped.background ?? ""))?.background;

  const owned = (item: ShopItem) => progress.owned.includes(item.id);
  const inUse = (item: ShopItem) =>
    item.category === "friend"
      ? item.mascot === hero
      : item.category === "background"
        ? progress.equipped.background === item.id
        : !!item.slot && progress.equipped[item.slot] === item.id;

  const pickItem = (item: ShopItem) => {
    playSound("pop");
    setSelected(item);
    if (owned(item)) {
      // Вече е мое: слагам/свалям веднага.
      if (item.category === "friend" && item.mascot) {
        updateSettings({ mascot: item.mascot });
        say(phrases.tryFriend(item.name), "wave");
      } else if (item.category === "accessory" || item.category === "background") {
        const wasOn = inUse(item);
        toggleEquip(item.id);
        if (wasOn) {
          setSelected(null);
          say(phrases.takeOff, "happy");
        } else say(phrases.wearFun(), "dance");
      }
      return;
    }
    if (item.category === "friend") say(phrases.tryFriend(item.name), "wave");
    else say(phrases.tryOn(item.name), item.category === "accessory" ? "dance" : "happy");
  };

  const buySelected = () => {
    if (!selected) return;
    const res = buy(selected.id);
    if (res.ok) {
      playSound("reward");
      if (selected.category === "friend" && selected.mascot) updateSettings({ mascot: selected.mascot });
      say(phrases.bought(selected.name), "cheer");
    } else if (res.reason === "coins") {
      playSound("wrong");
      say(phrases.needCoins(selected.price - progress.coins), "encourage");
    }
  };

  const takeOffAll = () => {
    playSound("pop");
    WEAR_SLOTS.forEach((s) => unequip(s.id));
    setSelected(null);
    say(phrases.takeOffAll, "happy");
  };

  const items = SHOP_ITEMS.filter((i) => i.category === tab);
  const groups =
    tab === "accessory" ? WEAR_SLOTS.map((s) => ({ title: s.title, items: items.filter((i) => i.slot === s.id) })) : [{ title: "", items }];
  const toBuy = selected && !owned(selected) ? selected : null;
  const wearingSomething = wornItems(progress.equipped).some(Boolean);

  return (
    <PageShell back="/" title="🛍️ Магазин">
      {/* Пробната */}
      <div className="card-soft mb-4 flex flex-col items-center gap-3 rounded-[2rem] p-4 shadow-md sm:flex-row sm:gap-6" style={{ background: previewBg ?? "linear-gradient(180deg,#fff7ed,#fef3c7)" }}>
        <div className="shrink-0">
          <HeroSvg key={`${previewHero}-${selected?.id ?? ""}`} hero={previewHero} pose={pose} wearing={wornItems(previewEquipped)} size={170} />
        </div>
        <div className="flex w-full flex-1 flex-col items-center gap-3 sm:items-start">
          <div key={message} className="card-soft animate-pop rounded-3xl bg-white px-5 py-3 text-xl font-extrabold shadow-md" role="status">
            {message}
          </div>
          {toBuy && (
            <BigButton
              icon={toBuy.icon}
              label={`Купи за 🪙 ${toBuy.price}`}
              onClick={buySelected}
              color={progress.coins >= toBuy.price ? "bg-sun text-white" : "bg-slate-200 text-slate-600"}
              pulse={progress.coins >= toBuy.price}
            />
          )}
          {!toBuy && tab === "accessory" && wearingSomething && (
            <button type="button" onClick={takeOffAll} className="rounded-2xl bg-white/80 px-4 py-2 font-bold shadow-sm">
              🧺 Свали всичко
            </button>
          )}
        </div>
      </div>

      <div className="mb-4 flex flex-wrap gap-2">
        {SHOP_CATEGORIES.map((c) => (
          <button
            key={c.id}
            type="button"
            onClick={() => {
              playSound("click");
              setTab(c.id);
              setSelected(null);
            }}
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

      <div className="flex flex-col gap-5">
        {groups.map((g) => (
          <section key={g.title}>
            {g.title && <h2 className="mb-2 text-xl font-black">{g.title}</h2>}
            <div className="grid grid-cols-3 gap-3 sm:grid-cols-4 lg:grid-cols-6">
              {g.items.map((item) => {
                const isOwned = owned(item);
                const using = inUse(item);
                return (
                  <button
                    key={item.id}
                    type="button"
                    onClick={() => pickItem(item)}
                    aria-label={item.name}
                    className={cn(
                      "card-soft relative flex flex-col items-center gap-1 rounded-3xl bg-white p-2 shadow-[0_5px_0_rgb(0_0_0/0.1)] transition active:translate-y-1",
                      using && "ring-4 ring-leaf",
                      selected?.id === item.id && !using && "ring-4 ring-sun",
                    )}
                  >
                    <ItemPicture item={item} hero={hero} />
                    <span className="text-center text-sm font-bold leading-tight">{item.name}</span>
                    {isOwned ? (
                      <span className={cn("rounded-full px-2 py-0.5 text-xs font-black", using ? "bg-leaf text-white" : "bg-slate-100")}>
                        {using ? "✓ Носи го" : item.category === "toy" ? "✓ В стаята" : "Мое"}
                      </span>
                    ) : (
                      <span className={cn("rounded-full px-3 py-0.5 text-base font-black", progress.coins >= item.price ? "bg-sun text-white" : "bg-slate-100 text-slate-500")}>
                        🪙 {item.price}
                      </span>
                    )}
                  </button>
                );
              })}
            </div>
          </section>
        ))}
      </div>
    </PageShell>
  );
}

/** Картинката на картата: дрехата върху героя, самият приятел, цветът на фона или играчката. */
function ItemPicture({ item, hero }: { item: ShopItem; hero: string }) {
  if (item.category === "accessory") return <HeroSvg hero={hero} wearing={[item.id]} size={76} />;
  if (item.category === "friend" && item.mascot && MASCOTS[item.mascot]) return <HeroSvg hero={item.mascot} size={76} />;
  return (
    <span className="flex size-20 items-center justify-center rounded-2xl text-5xl" style={item.background ? { background: item.background } : undefined}>
      {item.icon}
    </span>
  );
}
