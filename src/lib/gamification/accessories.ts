// Accessori di Cybi: solo estetici, si sbloccano con i livelli (§8.4).

import type { CybiAccessory } from "@/lib/progress/schema";
import { LEVELS } from "./levels";

export const ACCESSORIES: { id: CybiAccessory; name: string; levelIndex: number }[] = [
  { id: "nessuno", name: "Nessuno", levelIndex: 0 },
  { id: "papillon", name: "Papillon", levelIndex: 1 },
  { id: "occhiali", name: "Occhiali", levelIndex: 2 },
  { id: "cuffie", name: "Cuffie", levelIndex: 4 },
  { id: "corona", name: "Corona", levelIndex: 5 },
];

export function isAccessoryUnlocked(id: CybiAccessory, levelIndex: number): boolean {
  const accessory = ACCESSORIES.find((a) => a.id === id);
  return accessory !== undefined && levelIndex >= accessory.levelIndex;
}

export function unlockLevelName(id: CybiAccessory): string {
  const accessory = ACCESSORIES.find((a) => a.id === id);
  return LEVELS[accessory?.levelIndex ?? 0].name;
}

// Gli accessori sbloccati esattamente a questo livello (per l'avviso di livello nuovo).
export function accessoriesUnlockedAt(levelIndex: number) {
  return ACCESSORIES.filter((a) => a.levelIndex === levelIndex && a.id !== "nessuno");
}
