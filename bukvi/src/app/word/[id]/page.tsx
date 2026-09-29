import { notFound } from "next/navigation";
import { WORD_ITEMS, getWordById } from "@/data/wordsIsland";
import { WordScreen } from "@/components/lessons/WordScreen";

export const dynamicParams = false;

export function generateStaticParams() {
  return WORD_ITEMS.map((w) => ({ id: w.id }));
}

export default async function WordPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const word = getWordById(id);
  if (!word) notFound();
  return <WordScreen word={word} />;
}
