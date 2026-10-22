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

const choiceQuestionSchema = z
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

// `order`: gli elementi sono scritti nell'ordine corretto; l'app li mescola.
const orderQuestionSchema = z.object({
  id: slug,
  type: z.literal("order"),
  prompt: z.string().min(1),
  items: z
    .array(z.object({ text: z.string().min(1), explain: z.string().min(1) }))
    .min(3)
    .max(6),
});

// `match`: ogni coppia è un abbinamento corretto; l'app mescola la colonna destra.
const matchQuestionSchema = z
  .object({
    id: slug,
    type: z.literal("match"),
    prompt: z.string().min(1),
    pairs: z
      .array(
        z.object({
          left: z.string().min(1),
          right: z.string().min(1),
          explain: z.string().min(1),
        }),
      )
      .min(2)
      .max(6),
  })
  .superRefine((q, ctx) => {
    const rights = q.pairs.map((p) => p.right);
    if (new Set(rights).size !== rights.length) {
      ctx.addIssue({
        code: "custom",
        message: `domanda "${q.id}": le risposte da abbinare devono essere tutte diverse`,
      });
    }
  });

export const quizQuestionSchema = z.discriminatedUnion("type", [
  choiceQuestionSchema,
  orderQuestionSchema,
  matchQuestionSchema,
]);

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

// Timeline (§8.2): categorie fisse, date parziali AAAA, AAAA-MM o AAAA-MM-GG.
export const timelineCategories = [
  "crittografia",
  "malware",
  "attacchi",
  "leggi",
  "difesa",
  "cultura",
] as const;

export const partialDateSchema = z
  .string()
  .regex(
    /^\d{4}(-(0[1-9]|1[0-2])(-(0[1-9]|[12]\d|3[01]))?)?$/,
    "usa AAAA, AAAA-MM o AAAA-MM-GG",
  );

export const timelineEventSchema = z.object({
  id: slug,
  date: partialDateSchema,
  approximate: z.boolean().default(false),
  category: z.enum(timelineCategories),
  title: z.string().min(1),
  description: z.string().min(1),
  note: z.string().min(1).optional(),
  lesson: z.object({ module: slug, lesson: slug }).optional(),
  sources: z.array(slug).min(1),
  status: z.enum(lessonStatuses),
  lastVerified: z.iso.date().nullable(),
});

export const timelineSchema = z.object({
  sources: z.array(sourceSchema),
  events: z.array(timelineEventSchema),
});

export type Source = z.infer<typeof sourceSchema>;
export type LessonStatus = (typeof lessonStatuses)[number];
export type LessonFrontmatter = z.infer<typeof lessonFrontmatterSchema>;
export type ModuleManifest = z.infer<typeof moduleManifestSchema>;
export type QuizQuestion = z.infer<typeof quizQuestionSchema>;
export type ChoiceQuestion = z.infer<typeof choiceQuestionSchema>;
export type OrderQuestion = z.infer<typeof orderQuestionSchema>;
export type MatchQuestion = z.infer<typeof matchQuestionSchema>;
export type Quiz = z.infer<typeof quizSchema>;
export type GlossaryEntry = z.infer<typeof glossaryEntrySchema>;
export type TimelineCategory = (typeof timelineCategories)[number];
export type TimelineEvent = z.infer<typeof timelineEventSchema>;
export type Timeline = z.infer<typeof timelineSchema>;
