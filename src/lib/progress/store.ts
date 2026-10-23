"use client";

import { create } from "zustand";
import * as logic from "./logic";
import { emptyProgress, type ChecklistStatus, type CybiAccessory, type Progress } from "./schema";

type ProgressState = {
  progress: Progress;
  hydrated: boolean;
  // Cresce quando i progressi arrivano da fuori (caricamento, import, azzeramento)
  // invece che da un'azione dello studente: serve a non festeggiare quei cambi.
  loads: number;
  hydrate: (progress: Progress) => void;
  startLesson: (key: string) => void;
  completeLesson: (key: string, xp: number) => void;
  recordQuiz: (key: string, score: number, passingScore: number, xp: number) => void;
  completeLab: (labId: string) => void;
  setChecklistItem: (itemId: string, status: ChecklistStatus | null) => void;
  markMythSeen: (id: string) => void;
  awardBadges: (ids: string[]) => void;
  setFreeMode: (freeMode: boolean) => void;
  setAccessory: (accessory: CybiAccessory) => void;
  replace: (progress: Progress) => void;
  reset: () => void;
};

export const useProgressStore = create<ProgressState>()((set) => ({
  progress: emptyProgress(),
  hydrated: false,
  loads: 0,
  hydrate: (progress) => set((s) => ({ progress, hydrated: true, loads: s.loads + 1 })),
  startLesson: (key) =>
    set((s) => ({ progress: logic.startLesson(s.progress, key) })),
  completeLesson: (key, xp) =>
    set((s) => ({ progress: logic.completeLesson(s.progress, key, xp) })),
  recordQuiz: (key, score, passingScore, xp) =>
    set((s) => ({
      progress: logic.recordQuiz(s.progress, key, score, passingScore, xp),
    })),
  completeLab: (labId) =>
    set((s) => ({ progress: logic.completeLab(s.progress, labId) })),
  setChecklistItem: (itemId, status) =>
    set((s) => ({ progress: logic.setChecklistItem(s.progress, itemId, status) })),
  markMythSeen: (id) => set((s) => ({ progress: logic.markMythSeen(s.progress, id) })),
  awardBadges: (ids) => set((s) => ({ progress: logic.awardBadges(s.progress, ids) })),
  setAccessory: (accessory) =>
    set((s) => ({
      progress: { ...s.progress, settings: { ...s.progress.settings, accessory } },
    })),
  setFreeMode: (freeMode) =>
    set((s) => ({
      progress: { ...s.progress, settings: { ...s.progress.settings, freeMode } },
    })),
  replace: (progress) => set((s) => ({ progress, loads: s.loads + 1 })),
  reset: () => set((s) => ({ progress: emptyProgress(), loads: s.loads + 1 })),
}));
