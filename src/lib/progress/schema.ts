import { z } from "zod";

// Formato dei progressi salvati (§6.3). Cambiare il formato vuol dire
// incrementare `version` e scrivere una migrazione.
export const lessonProgressSchema = z.object({
  status: z.enum(["not_started", "in_progress", "completed"]),
  bestQuizScore: z.number().min(0).max(1),
  completedAt: z.iso.datetime().optional(),
});

export const progressSchema = z.object({
  version: z.literal(1),
  lessons: z.record(z.string(), lessonProgressSchema),
  xp: z.number().int().nonnegative(),
  badges: z.array(z.string()),
  streak: z.object({
    current: z.number().int().nonnegative(),
    lastActiveDate: z.string(),
  }),
  settings: z.object({ freeMode: z.boolean() }).default({ freeMode: false }),
});

export type LessonProgress = z.infer<typeof lessonProgressSchema>;
export type Progress = z.infer<typeof progressSchema>;

export function emptyProgress(): Progress {
  return {
    version: 1,
    lessons: {},
    xp: 0,
    badges: [],
    streak: { current: 0, lastActiveDate: "" },
    settings: { freeMode: false },
  };
}
