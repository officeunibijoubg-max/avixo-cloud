"use client";

import { ui } from "@/content/phrases";
import { PageShell } from "@/components/ui/PageShell";
import { BigButton } from "@/components/ui/BigButton";

export default function LearnPage() {
  return (
    <PageShell back="/">
      <div className="grid flex-1 grid-cols-1 gap-6 sm:grid-cols-2">
        <BigButton href="/learn/letters/" icon="🔤" label={ui.menu.letters} size="lg" color="bg-violet-200" />
        <BigButton href="/learn/numbers/" icon="🔢" label={ui.menu.numbers} size="lg" color="bg-amber-200" />
      </div>
    </PageShell>
  );
}
