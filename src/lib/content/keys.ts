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
  "Lab",
] as const;

// Laboratori simulati disponibili per <Lab id> (§8.3).
export const LAB_IDS = [
  "convertitore-numeri",
  "base64",
  "terminale",
  "ip-privati",
  "viaggio-pacchetto",
  "triade-rid",
] as const;
export type LabId = (typeof LAB_IDS)[number];
