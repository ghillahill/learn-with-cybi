import { z } from "zod";

// Formato dei progressi salvati (§6.3). Cambiare il formato vuol dire
// incrementare `version` e scrivere una migrazione.
export const lessonProgressSchema = z.object({
  status: z.enum(["not_started", "in_progress", "completed"]),
  bestQuizScore: z.number().min(0).max(1),
  completedAt: z.iso.datetime().optional(),
});

export const labProgressSchema = z.object({
  completedAt: z.iso.datetime(),
});

// Stato di una voce della checklist personale di sicurezza (lezione 8.5).
export const checklistStatusSchema = z.enum(["fatto", "da-fare"]);

export const progressSchema = z.object({
  version: z.literal(1),
  lessons: z.record(z.string(), lessonProgressSchema),
  // Aggiunto con i laboratori (fase 3): il default mantiene validi i salvataggi precedenti.
  labs: z.record(z.string(), labProgressSchema).default({}),
  // Aggiunto con il Modulo 8: le scelte della checklist personale.
  checklist: z.record(z.string(), checklistStatusSchema).default({}),
  xp: z.number().int().nonnegative(),
  badges: z.array(z.string()),
  streak: z.object({
    current: z.number().int().nonnegative(),
    lastActiveDate: z.string(),
  }),
  settings: z.object({ freeMode: z.boolean() }).default({ freeMode: false }),
});

export type LessonProgress = z.infer<typeof lessonProgressSchema>;
export type LabProgress = z.infer<typeof labProgressSchema>;
export type ChecklistStatus = z.infer<typeof checklistStatusSchema>;
export type Progress = z.infer<typeof progressSchema>;

export function emptyProgress(): Progress {
  return {
    version: 1,
    lessons: {},
    labs: {},
    checklist: {},
    xp: 0,
    badges: [],
    streak: { current: 0, lastActiveDate: "" },
    settings: { freeMode: false },
  };
}
