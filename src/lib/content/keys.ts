// Chiave univoca di una lezione nei progressi salvati.
export function lessonKey(moduleId: string, lessonId: string): string {
  return `${moduleId}/${lessonId}`;
}

// Componenti utilizzabili dentro le lezioni MDX (§7.3).
export const LESSON_COMPONENTS = [
  "Cybi",
  "Cite",
  "Term",
  "MythVsFact",
  "KeyPoints",
  "Callout",
] as const;
