// Livelli e punti esperienza (§8.4). Le soglie sono pensate sul totale del
// percorso base: circa 3.300 XP dalle lezioni, più laboratori e bonus.

// XP per ogni laboratorio completato.
export const LAB_XP = 20;
// Bonus per un quiz tutto giusto al primo tentativo.
export const PERFECT_QUIZ_BONUS = 20;

export const LEVELS = [
  { id: "curioso", name: "Curioso", minXp: 0 },
  { id: "apprendista", name: "Apprendista", minXp: 250 },
  { id: "esploratore", name: "Esploratore", minXp: 750 },
  { id: "analista", name: "Analista", minXp: 1500 },
  { id: "difensore", name: "Difensore", minXp: 2500 },
  { id: "guardiano", name: "Guardiano", minXp: 3500 },
] as const;

export type Level = (typeof LEVELS)[number];

export type LevelInfo = {
  level: Level;
  index: number;
  next: Level | null;
  // Avanzamento verso il livello successivo, da 0 a 1 (1 all'ultimo livello).
  progress: number;
};

export function levelFor(xp: number): LevelInfo {
  let index = 0;
  for (let i = 0; i < LEVELS.length; i++) {
    if (xp >= LEVELS[i].minXp) index = i;
  }
  const level = LEVELS[index];
  const next = LEVELS[index + 1] ?? null;
  const progress = next ? (xp - level.minXp) / (next.minXp - level.minXp) : 1;
  return { level, index, next, progress };
}
