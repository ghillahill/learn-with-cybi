import type { ChecklistStatus, LessonProgress, Progress } from "./schema";

const notStarted: LessonProgress = { status: "not_started", bestQuizScore: 0 };

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
    lessons: { ...p.lessons, [key]: { status: "in_progress", bestQuizScore: 0 } },
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
  return {
    ...p,
    xp: p.xp + xp,
    lessons: {
      ...p.lessons,
      [key]: { ...current, status: "completed", completedAt: now.toISOString() },
    },
  };
}

// Salva il punteggio migliore; la lezione è completata se il quiz è
// superato (soglia predefinita 70%, §5.4).
export function recordQuiz(
  p: Progress,
  key: string,
  score: number,
  passingScore: number,
  xp: number,
  now: Date = new Date(),
): Progress {
  const current = lessonProgress(p, key);
  const updated: Progress = {
    ...p,
    lessons: {
      ...p.lessons,
      [key]: {
        ...current,
        status: current.status === "not_started" ? "in_progress" : current.status,
        bestQuizScore: Math.max(current.bestQuizScore, score),
      },
    },
  };
  return score >= passingScore ? completeLesson(updated, key, xp, now) : updated;
}

export function isLabCompleted(p: Progress, labId: string): boolean {
  return labId in p.labs;
}

// Un laboratorio si completa una volta sola; rifarlo non cambia la data.
export function completeLab(p: Progress, labId: string, now: Date = new Date()): Progress {
  if (isLabCompleted(p, labId)) return p;
  return { ...p, labs: { ...p.labs, [labId]: { completedAt: now.toISOString() } } };
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
