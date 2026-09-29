"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

/** Старият адрес на „Днешно приключение“ — вече е „Продължи“ по пътя. */
export default function AdventureRedirect() {
  const router = useRouter();
  useEffect(() => router.replace("/step/"), [router]);
  return null;
}
