"use client";

import { create } from "zustand";
import * as logic from "./logic";
import { emptyProgress, type Progress } from "./schema";

type ProgressState = {
  progress: Progress;
  hydrated: boolean;
  hydrate: (progress: Progress) => void;
  startLesson: (key: string) => void;
  completeLesson: (key: string, xp: number) => void;
  recordQuiz: (key: string, score: number, passingScore: number, xp: number) => void;
  setFreeMode: (freeMode: boolean) => void;
  replace: (progress: Progress) => void;
  reset: () => void;
};

export const useProgressStore = create<ProgressState>()((set) => ({
  progress: emptyProgress(),
  hydrated: false,
  hydrate: (progress) => set({ progress, hydrated: true }),
  startLesson: (key) =>
    set((s) => ({ progress: logic.startLesson(s.progress, key) })),
  completeLesson: (key, xp) =>
    set((s) => ({ progress: logic.completeLesson(s.progress, key, xp) })),
  recordQuiz: (key, score, passingScore, xp) =>
    set((s) => ({
      progress: logic.recordQuiz(s.progress, key, score, passingScore, xp),
    })),
  setFreeMode: (freeMode) =>
    set((s) => ({
      progress: { ...s.progress, settings: { ...s.progress.settings, freeMode } },
    })),
  replace: (progress) => set({ progress }),
  reset: () => set({ progress: emptyProgress() }),
}));
