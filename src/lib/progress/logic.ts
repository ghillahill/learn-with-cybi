import { LAB_XP, PERFECT_QUIZ_BONUS } from "@/lib/gamification/levels";
import { recordActivity } from "@/lib/gamification/streak";
import type { ChecklistStatus, LessonProgress, Progress } from "./schema";

const notStarted: LessonProgress = { status: "not_started", bestQuizScore: 0, quizAttempts: 0 };

// Ogni lezione, quiz o laboratorio conta per la serie di giorni (§8.4).
function active(p: Progress, now: Date): Progress {
  const streak = recordActivity(p.streak, now);
  return streak === p.streak ? p : { ...p, streak };
}

export function lessonProgress(p: Progress, key: string): LessonProgress {
  return p.lessons[key] ?? notStarted;
}

export function isCompleted(p: Progress, key: string): boolean {
  return lessonProgress(p, key).status === "completed";
}

export function startLesson(p: Progress, key: string): Progress {
  if (p.lessons[key]) return p;
  return {
    ...p,
    lessons: { ...p.lessons, [key]: { ...notStarted, status: "in_progress" } },
  };
}

// I punti XP si guadagnano una sola volta, al primo completamento.
export function completeLesson(
  p: Progress,
  key: string,
  xp: number,
  now: Date = new Date(),
): Progress {
  const current = lessonProgress(p, key);
  if (current.status === "completed") return p;
  return active(
    {
      ...p,
      xp: p.xp + xp,
      lessons: {
        ...p.lessons,
        [key]: { ...current, status: "completed", completedAt: now.toISOString() },
      },
    },
    now,
  );
}

// Salva il punteggio migliore; la lezione è completata se il quiz è
// superato (soglia predefinita 70%, §5.4). Un quiz tutto giusto al primo
// tentativo vale un bonus di XP (§8.4).
export function recordQuiz(
  p: Progress,
  key: string,
  score: number,
  passingScore: number,
  xp: number,
  now: Date = new Date(),
): Progress {
  const current = lessonProgress(p, key);
  // Le lezioni completate prima della fase 4 hanno 0 tentativi: niente bonus.
  const perfectFirstTry =
    current.quizAttempts === 0 && score === 1 && current.status !== "completed";
  const updated: Progress = active(
    {
      ...p,
      xp: p.xp + (perfectFirstTry ? PERFECT_QUIZ_BONUS : 0),
      lessons: {
        ...p.lessons,
        [key]: {
          ...current,
          status: current.status === "not_started" ? "in_progress" : current.status,
          bestQuizScore: Math.max(current.bestQuizScore, score),
          quizAttempts: current.quizAttempts + 1,
        },
      },
    },
    now,
  );
  return score >= passingScore ? completeLesson(updated, key, xp, now) : updated;
}

export function isLabCompleted(p: Progress, labId: string): boolean {
  return labId in p.labs;
}

// Un laboratorio si completa una volta sola; rifarlo non cambia la data
// e non dà altri XP.
export function completeLab(p: Progress, labId: string, now: Date = new Date()): Progress {
  if (isLabCompleted(p, labId)) return p;
  return active(
    { ...p, xp: p.xp + LAB_XP, labs: { ...p.labs, [labId]: { completedAt: now.toISOString() } } },
    now,
  );
}

export function markMythSeen(p: Progress, id: string): Progress {
  if (p.mythsSeen.includes(id)) return p;
  return { ...p, mythsSeen: [...p.mythsSeen, id] };
}

export function awardBadges(p: Progress, ids: string[]): Progress {
  const fresh = ids.filter((id) => !p.badges.includes(id));
  return fresh.length === 0 ? p : { ...p, badges: [...p.badges, ...fresh] };
}

// Segna una voce della checklist personale; null la riporta a "non scelta".
export function setChecklistItem(p: Progress, itemId: string, status: ChecklistStatus | null): Progress {
  const checklist = { ...p.checklist };
  if (status === null) delete checklist[itemId];
  else checklist[itemId] = status;
  return { ...p, checklist };
}

export function isModuleComplete(p: Progress, lessonKeys: string[]): boolean {
  return lessonKeys.length > 0 && lessonKeys.every((key) => isCompleted(p, key));
}

// Un modulo si sblocca quando tutti i moduli richiesti sono completati,
// oppure sempre in modalità libera.
export function isModuleUnlocked(
  p: Progress,
  requiredLessonKeys: string[][],
): boolean {
  if (p.settings.freeMode) return true;
  return requiredLessonKeys.every((keys) => isModuleComplete(p, keys));
}
