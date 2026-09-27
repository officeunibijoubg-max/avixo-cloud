"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import type { CharacterLesson, WritingResult } from "@/lib/types";
import { POINTS } from "@/config/points";
import { feedbackLabels, phrases } from "@/content/phrases";
import { pointsForAttempt } from "@/services/progress";
import { playSound } from "@/services/sounds";
import { speakPhrase } from "@/services/speech";
import { useGameStore } from "@/store/gameStore";
import type { GuideAnimation } from "./StrokeGuide";
import type { WritingCanvasHandle, WritingFeedback } from "./WritingCanvas";
import type { MascotMood } from "./Mascot";
import { useCelebration } from "./useCelebration";

const WRONG_PAUSE_MS = 1600;

/**
 * Цялата логика на един опит за изписване: оценка → зелено/червено,
 * точки, говор, нов опит, подсказка след 2 грешки и демонстрация след 3.
 * Ползва се от урока и от игрите с писане, за да не се дублира.
 */
export function useWritingExercise(lesson: CharacterLesson, opts: { onSolved?: (result: WritingResult) => void } = {}) {
  const canvasRef = useRef<WritingCanvasHandle>(null);
  const recordWriting = useGameStore((s) => s.recordWriting);
  const { celebration, celebrate, closeReward } = useCelebration();

  const [attempt, setAttempt] = useState(1);
  const [fails, setFails] = useState(0);
  const [feedback, setFeedback] = useState<WritingFeedback>(null);
  const [hint, setHint] = useState<GuideAnimation>("none");
  const [hintKey, setHintKey] = useState(0);
  const [label, setLabel] = useState<string | null>(null);
  const [mood, setMood] = useState<MascotMood>("happy");
  const [solved, setSolved] = useState(false);
  const pending = useRef<ReturnType<typeof setTimeout> | null>(null);
  const onSolvedRef = useRef(opts.onSolved);
  onSolvedRef.current = opts.onSolved;

  const reset = useCallback(() => {
    if (pending.current) clearTimeout(pending.current);
    canvasRef.current?.clear();
    setAttempt(1);
    setFails(0);
    setFeedback(null);
    setHint("none");
    setLabel(null);
    setMood("happy");
    setSolved(false);
  }, []);

  // Нов символ → нова задача.
  useEffect(() => reset(), [lesson.id, reset]);
  useEffect(() => () => void (pending.current && clearTimeout(pending.current)), []);

  const showHint = useCallback((kind: GuideAnimation) => {
    setHint(kind);
    setHintKey((k) => k + 1);
    setLabel(kind === "demo" ? phrases.hintWatch : feedbackLabels.hint);
    setMood("think");
    void speakPhrase(kind === "demo" ? phrases.hintWatch : phrases.hintFollow);
  }, []);

  const handleResult = useCallback(
    (result: WritingResult) => {
      if (result.isCorrect) {
        const points = pointsForAttempt(attempt, fails >= POINTS.hintAfterFails);
        const delta = recordWriting(lesson.character, result.score, true, points);
        setFeedback("correct");
        setSolved(true);
        setHint("none");
        setMood("cheer");
        setLabel(result.grade === "excellent" ? feedbackLabels.excellent : feedbackLabels.correct);
        playSound("correct");
        celebrate(delta);
        void speakPhrase(phrases.correctFor(lesson.type, lesson.spokenName));
        onSolvedRef.current?.(result);
        return;
      }

      recordWriting(lesson.character, result.score, false, 0);
      setFeedback("wrong");
      setMood("think");
      setLabel(result.grade === "almost" ? feedbackLabels.almost : feedbackLabels.retry);
      playSound("wrong");
      void speakPhrase(result.grade === "almost" ? phrases.almost : phrases.encourage());

      const nextFails = fails + 1;
      pending.current = setTimeout(() => {
        canvasRef.current?.clear();
        setFeedback(null);
        setAttempt((a) => a + 1);
        setFails(nextFails);
        setMood("happy");
        if (nextFails >= POINTS.demoAfterFails) showHint("demo");
        else if (nextFails >= POINTS.hintAfterFails) showHint("star");
        else setLabel(null);
      }, WRONG_PAUSE_MS);
    },
    [attempt, fails, lesson, recordWriting, celebrate, showHint],
  );

  const clear = useCallback(() => {
    if (feedback) return;
    canvasRef.current?.clear();
  }, [feedback]);

  return {
    canvasRef,
    attempt,
    fails,
    feedback,
    hint,
    hintKey,
    label,
    mood,
    solved,
    celebration,
    closeReward,
    handleResult,
    showHint,
    clear,
    check: () => canvasRef.current?.check(),
    reset,
    locked: feedback !== null,
  };
}
