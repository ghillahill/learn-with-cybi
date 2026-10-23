"use client";

import { useEffect } from "react";
import { toast } from "sonner";
import { accessoriesUnlockedAt } from "@/lib/gamification/accessories";
import { allBadges, newBadgeIds, type BadgeCatalog } from "@/lib/gamification/badges";
import { levelFor } from "@/lib/gamification/levels";
import { useProgressStore } from "@/lib/progress/store";

// Assegna i badge appena guadagnati e festeggia badge e nuovi livelli.
// I progressi importati o già salvati non fanno partire le notifiche: solo
// i cambiamenti avvenuti durante la sessione.
export function GamificationSync({ catalog }: { catalog: BadgeCatalog }) {
  useEffect(() => {
    const names = new Map(allBadges(catalog).map((b) => [b.id, b.name]));

    function award(silent: boolean) {
      const { progress, awardBadges } = useProgressStore.getState();
      const fresh = newBadgeIds(progress, catalog);
      if (fresh.length === 0) return;
      awardBadges(fresh);
      if (silent) return;
      for (const id of fresh) toast.success(`Badge sbloccato: ${names.get(id) ?? id}`);
    }

    if (useProgressStore.getState().hydrated) award(true);
    return useProgressStore.subscribe((state, previous) => {
      if (!state.hydrated) return;
      if (state.progress === previous.progress) return;
      // Caricamento, import o azzeramento: badge assegnati senza festeggiamenti.
      if (state.loads !== previous.loads) {
        award(true);
        return;
      }
      const before = levelFor(previous.progress.xp);
      const after = levelFor(state.progress.xp);
      if (after.index > before.index) {
        const unlocked = accessoriesUnlockedAt(after.index).map((a) => a.name.toLowerCase());
        toast.success(`Nuovo livello: ${after.level.name}!`, {
          description: unlocked.length > 0 ? `Hai sbloccato un accessorio per Cybi: ${unlocked.join(", ")}.` : undefined,
        });
      }
      award(false);
    });
  }, [catalog]);
  return null;
}
