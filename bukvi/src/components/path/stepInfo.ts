import type { PathStep } from "@/data/path";
import { getLessonByChar } from "@/data/lessons";
import { shapeLessons } from "@/data/shapes";
import { getFeature } from "@/data/unlocks";
import { STORIES } from "@/content/stories";
import { phrases } from "@/content/phrases";

// Как изглежда една стъпка от пътя: иконка, кратко заглавие и (за игри и приказки) къде води.

export type StepInfo = { icon: string; label: string; title: string; href?: string };

export function stepInfo(s: PathStep): StepInfo {
  switch (s.kind) {
    case "char": {
      const l = getLessonByChar(s.char);
      if (l?.type === "number") return { icon: s.char, title: s.char, label: phrases.stepNumber(s.char) };
      return { icon: s.char, title: s.char, label: l?.lowercase ? phrases.stepSmall(s.char) : phrases.stepLetter(s.char) };
    }
    case "shape": {
      const l = shapeLessons.find((x) => x.id === `shape-${s.id}`);
      const name = l?.spokenName ?? "";
      return { icon: l?.exampleImage ?? "✏️", title: name, label: phrases.stepShape(name) };
    }
    case "word":
      return { icon: s.text.length > 2 ? "📝" : s.text, title: s.text, label: phrases.stepWord(s.text) };
    case "game": {
      const f = getFeature(s.id);
      const title = f?.title ?? "";
      return { icon: f?.icon ?? "🎮", title, label: phrases.stepGame(title), href: f?.href };
    }
    case "story": {
      const st = STORIES.find((x) => x.id === s.id);
      const title = st?.title ?? "";
      return { icon: st?.icon ?? "📚", title, label: phrases.stepStory(title), href: `/stories/?id=${s.id}` };
    }
  }
}
