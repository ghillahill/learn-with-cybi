// Badge (§8.4): uno per ogni modulo completato, più alcuni badge speciali.
// Il catalogo viene dai contenuti visibili, calcolato sul server.

import { isModuleComplete } from "@/lib/progress/logic";
import type { Progress } from "@/lib/progress/schema";

export type BadgeCatalog = {
  modules: { id: string; title: string; badge: { id: string; name: string }; lessonKeys: string[] }[];
  // Id dei blocchi Mito vs Realtà delle lezioni visibili (vedi mythId).
  mythIds: string[];
  // Laboratori presenti nelle lezioni visibili.
  labIds: string[];
};

export type Badge = { id: string; name: string; description: string };

export const SPECIAL_BADGES = {
  mythHunter: {
    id: "cacciatore-di-miti",
    name: "Cacciatore di miti",
    description: "Hai letto tutti i blocchi Mito vs Realtà.",
  },
  labRat: {
    id: "mani-in-pasta",
    name: "Mani in pasta",
    description: "Hai completato tutti i laboratori simulati.",
  },
} as const satisfies Record<string, Badge>;

// Tutti i badge ottenibili, nell'ordine in cui si mostrano.
export function allBadges(catalog: BadgeCatalog): Badge[] {
  return [
    ...catalog.modules.map((m) => ({
      id: m.badge.id,
      name: m.badge.name,
      description: `Hai completato il modulo "${m.title}".`,
    })),
    SPECIAL_BADGES.mythHunter,
    SPECIAL_BADGES.labRat,
  ];
}

export function earnedBadgeIds(p: Progress, catalog: BadgeCatalog): string[] {
  const earned = catalog.modules
    .filter((m) => isModuleComplete(p, m.lessonKeys))
    .map((m) => m.badge.id);
  const seen = new Set(p.mythsSeen);
  if (catalog.mythIds.length > 0 && catalog.mythIds.every((id) => seen.has(id))) {
    earned.push(SPECIAL_BADGES.mythHunter.id);
  }
  if (catalog.labIds.length > 0 && catalog.labIds.every((id) => id in p.labs)) {
    earned.push(SPECIAL_BADGES.labRat.id);
  }
  return earned;
}

// Badge appena guadagnati e non ancora registrati nei progressi.
export function newBadgeIds(p: Progress, catalog: BadgeCatalog): string[] {
  const owned = new Set(p.badges);
  return earnedBadgeIds(p, catalog).filter((id) => !owned.has(id));
}

// Id stabile di un blocco Mito vs Realtà: lezione + impronta del testo del mito.
export function mythId(lessonKey: string, myth: string): string {
  let hash = 5381;
  for (let i = 0; i < myth.length; i++) hash = ((hash * 33) ^ myth.charCodeAt(i)) >>> 0;
  return `${lessonKey}#${hash.toString(36)}`;
}

// Estrae dal corpo MDX i testi dei miti, nell'ordine della lezione.
export function mythsInBody(body: string): string[] {
  return [...body.matchAll(/<MythVsFact\b[^>]*?\bmyth="([^"]*)"/g)].map((m) => m[1]);
}

export function labsInBody(body: string): string[] {
  return [...body.matchAll(/<Lab\s+id="([^"]+)"/g)].map((m) => m[1]);
}
