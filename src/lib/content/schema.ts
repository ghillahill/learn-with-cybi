import { z } from "zod";

// Livelli di fonte e stati di verifica: LEARNWITHCYBI.md §3.1 e §3.2.
export const sourceLevels = ["A", "B", "C"] as const;
export const lessonStatuses = [
  "bozza",
  "fonti-verificate",
  "revisionata",
  "pubblicata",
] as const;

const slug = z
  .string()
  .regex(/^[a-z0-9]+(-[a-z0-9]+)*$/, "usa solo minuscole, cifre e trattini");

export const sourceSchema = z.object({
  id: slug,
  level: z.enum(sourceLevels),
  title: z.string().min(1),
  author: z.string().optional(),
  publisher: z.string().optional(),
  year: z.number().int().optional(),
  url: z.url().optional(),
  note: z.string().optional(),
});

export const lessonFrontmatterSchema = z.object({
  id: slug,
  title: z.string().min(1),
  minutes: z.number().int().positive(),
  xp: z.number().int().nonnegative(),
  status: z.enum(lessonStatuses),
  lastVerified: z.iso.date().nullable(),
  objectives: z.array(z.string().min(1)).min(1),
  sources: z.array(sourceSchema).default([]),
  quiz: slug.optional(),
});

export const moduleManifestSchema = z.object({
  id: slug,
  order: z.number().int().nonnegative(),
  title: z.string().min(1),
  subtitle: z.string().min(1),
  description: z.string().min(1),
  icon: z.string().min(1),
  color: z.string().min(1),
  requires: z.array(slug).default([]),
  estimatedMinutes: z.number().int().positive(),
  badge: z.object({ id: slug, name: z.string().min(1) }),
  lessons: z.array(z.string().min(1)).min(1),
});

const quizOptionSchema = z.object({
  text: z.string().min(1),
  correct: z.boolean(),
  explain: z.string().min(1),
});

export const quizQuestionSchema = z
  .object({
    id: slug,
    type: z.enum(["single", "multiple", "truefalse"]),
    prompt: z.string().min(1),
    options: z.array(quizOptionSchema).min(2),
  })
  .superRefine((q, ctx) => {
    const correct = q.options.filter((o) => o.correct).length;
    if (q.type !== "multiple" && correct !== 1) {
      ctx.addIssue({
        code: "custom",
        message: `domanda "${q.id}": ${q.type} richiede esattamente una risposta corretta`,
      });
    }
    if (q.type === "multiple" && correct < 1) {
      ctx.addIssue({
        code: "custom",
        message: `domanda "${q.id}": serve almeno una risposta corretta`,
      });
    }
    if (q.type === "truefalse" && q.options.length !== 2) {
      ctx.addIssue({
        code: "custom",
        message: `domanda "${q.id}": truefalse richiede due opzioni (Vero/Falso)`,
      });
    }
  });

export const quizSchema = z.object({
  id: slug,
  passingScore: z.number().min(0).max(1).default(0.7),
  questions: z.array(quizQuestionSchema).min(1),
});

export const glossaryEntrySchema = z.object({
  id: slug,
  term: z.string().min(1),
  definition: z.string().min(1),
  sources: z.array(sourceSchema).min(1),
});

export const glossarySchema = z.object({
  entries: z.array(glossaryEntrySchema),
});

export type Source = z.infer<typeof sourceSchema>;
export type LessonStatus = (typeof lessonStatuses)[number];
export type LessonFrontmatter = z.infer<typeof lessonFrontmatterSchema>;
export type ModuleManifest = z.infer<typeof moduleManifestSchema>;
export type QuizQuestion = z.infer<typeof quizQuestionSchema>;
export type Quiz = z.infer<typeof quizSchema>;
export type GlossaryEntry = z.infer<typeof glossaryEntrySchema>;
