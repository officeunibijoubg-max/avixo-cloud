"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { PROFILE_AVATARS } from "@/services/profiles";
import { emptyProgress, totalStars } from "@/services/progress";
import { useGameStore } from "@/store/gameStore";
import { playSound } from "@/services/sounds";
import { speakPhrase } from "@/services/speech";
import { phrases } from "@/content/phrases";
import { cn } from "@/lib/cn";
import { PageShell } from "@/components/ui/PageShell";
import { Mascot } from "@/components/game/Mascot";
import { ParentGate } from "@/components/layout/ParentGate";

/** „Кой играе?“ — детето избира себе си; добавянето и махането на деца е за родителя. */
export default function ProfilesPage() {
  const router = useRouter();
  const profiles = useGameStore((s) => s.profiles);
  const activeId = useGameStore((s) => s.activeId);
  const progress = useGameStore((s) => s.progress);
  const stored = useGameStore((s) => s.stored);
  const switchProfile = useGameStore((s) => s.switchProfile);
  const [manage, setManage] = useState(false);

  const pick = (id: string, name: string) => {
    playSound("pop");
    switchProfile(id);
    void speakPhrase(phrases.helloChild(name));
    router.push("/");
  };

  return (
    <PageShell back="/" title={phrases.whoPlays} showScore={false}>
      <Mascot message={phrases.whoPlays} mood="wave" className="mb-6" />
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
        {profiles.map((p) => {
          const stars = totalStars(p.id === activeId ? progress : { ...emptyProgress(), ...stored[p.id] });
          return (
            <button
              key={p.id}
              type="button"
              onClick={() => pick(p.id, p.name)}
              className={cn(
                "card-soft flex aspect-square flex-col items-center justify-center gap-2 rounded-[2rem] bg-white shadow-[0_8px_0_rgb(0_0_0/0.1)] transition active:translate-y-1",
                p.id === activeId && "ring-4 ring-grape",
              )}
            >
              <span className="text-8xl">{p.avatar}</span>
              <span className="text-2xl font-black">{p.name}</span>
              <span className="font-bold text-slate-500">⭐ {stars}</span>
            </button>
          );
        })}
      </div>

      <div className="mt-8">
        {manage ? (
          <ParentGate>
            <ManageProfiles />
          </ParentGate>
        ) : (
          <button type="button" onClick={() => setManage(true)} className="rounded-2xl bg-white/70 px-6 py-3 text-lg font-bold shadow-sm">
            👨‍👩‍👧 Добави или промени дете
          </button>
        )}
      </div>
    </PageShell>
  );
}

/** За родителя: ново дете, ново име/лице и махане на профил. */
function ManageProfiles() {
  const profiles = useGameStore((s) => s.profiles);
  const activeId = useGameStore((s) => s.activeId);
  const addProfile = useGameStore((s) => s.addProfile);
  const removeProfile = useGameStore((s) => s.removeProfile);
  const renameProfile = useGameStore((s) => s.renameProfile);
  const [name, setName] = useState("");
  const [avatar, setAvatar] = useState<string>(PROFILE_AVATARS[1]);
  const [confirmId, setConfirmId] = useState<string | null>(null);

  return (
    <div className="flex max-w-2xl flex-col gap-6">
      <section className="card-soft flex flex-col gap-3 rounded-3xl bg-white p-5 shadow-sm">
        <h2 className="text-xl font-black">Ново дете</h2>
        <input
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="Име"
          maxLength={20}
          className="rounded-2xl border-4 border-slate-200 p-3 text-2xl font-bold focus:border-grape focus:outline-none"
        />
        <AvatarPicker value={avatar} onChange={setAvatar} />
        <button
          type="button"
          onClick={() => {
            addProfile(name, avatar);
            setName("");
          }}
          className="self-start rounded-2xl bg-grape px-6 py-3 text-lg font-black text-white"
        >
          ➕ Добави
        </button>
      </section>

      <section className="card-soft flex flex-col gap-3 rounded-3xl bg-white p-5 shadow-sm">
        <h2 className="text-xl font-black">Деца на това устройство</h2>
        {profiles.map((p) => (
          <div key={p.id} className="flex flex-wrap items-center gap-3 border-b border-slate-100 pb-3 last:border-0">
            <span className="text-4xl">{p.avatar}</span>
            <input
              defaultValue={p.name}
              onBlur={(e) => renameProfile(p.id, e.target.value)}
              maxLength={20}
              className="w-40 rounded-xl border-2 border-slate-200 p-2 text-lg font-bold"
            />
            <AvatarPicker value={p.avatar} onChange={(a) => renameProfile(p.id, p.name, a)} small />
            {p.id !== activeId && profiles.length > 1 && (
              confirmId === p.id ? (
                <button type="button" onClick={() => removeProfile(p.id)} className="rounded-xl bg-rose-600 px-4 py-2 font-black text-white">
                  Да, изтрий {p.name}
                </button>
              ) : (
                <button type="button" onClick={() => setConfirmId(p.id)} className="rounded-xl bg-slate-200 px-4 py-2 font-bold">
                  🗑️
                </button>
              )
            )}
          </div>
        ))}
        <p className="text-sm text-slate-500">Играещото в момента дете не може да се изтрие — първо изберете друго.</p>
      </section>
    </div>
  );
}

function AvatarPicker({ value, onChange, small }: { value: string; onChange: (a: string) => void; small?: boolean }) {
  return (
    <div className="flex flex-wrap gap-1">
      {PROFILE_AVATARS.map((a) => (
        <button
          key={a}
          type="button"
          onClick={() => onChange(a)}
          className={cn("rounded-xl", small ? "size-9 text-2xl" : "size-12 text-3xl", value === a ? "bg-violet-200 ring-2 ring-grape" : "bg-slate-50")}
        >
          {a}
        </button>
      ))}
    </div>
  );
}
