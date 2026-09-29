"use client";

import { createContext, useContext } from "react";
import { useRouter } from "next/navigation";

// „Продължи“ след стъпка: в екрана на пътя минава към следващата стъпка на място,
// а навсякъде другаде (игра, приказка) отваря екрана на пътя.

export const StepNavContext = createContext<{ next: () => void } | null>(null);

export function useContinue(): () => void {
  const ctx = useContext(StepNavContext);
  const router = useRouter();
  return ctx?.next ?? (() => router.push("/step/"));
}
