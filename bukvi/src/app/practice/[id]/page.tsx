import { notFound } from "next/navigation";
import { allLessons, getLessonById } from "@/data/lessons";
import { PracticeScreen } from "@/components/lessons/PracticeScreen";

export const dynamicParams = false;

export function generateStaticParams() {
  return allLessons.map((l) => ({ id: l.id }));
}

export default async function PracticePage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const lesson = getLessonById(id);
  if (!lesson) notFound();
  return <PracticeScreen lesson={lesson} />;
}
