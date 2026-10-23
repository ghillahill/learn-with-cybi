"use client";

import { AwardIcon, FlameIcon, LockIcon } from "lucide-react";
import { CybiAvatar } from "@/components/cybi/cybi-avatar";
import { Progress } from "@/components/ui/progress";
import { ACCESSORIES, isAccessoryUnlocked, unlockLevelName } from "@/lib/gamification/accessories";
import { allBadges, type BadgeCatalog } from "@/lib/gamification/badges";
import { LAB_XP, levelFor, PERFECT_QUIZ_BONUS } from "@/lib/gamification/levels";
import { currentStreak } from "@/lib/gamification/streak";
import { useProgressStore } from "@/lib/progress/store";
import { cn } from "@/lib/utils";

// Livello, serie di giorni, badge e accessori di Cybi (§8.4).
export function GamificationOverview({ catalog }: { catalog: BadgeCatalog }) {
  const hydrated = useProgressStore((s) => s.hydrated);
  const progress = useProgressStore((s) => s.progress);
  const setAccessory = useProgressStore((s) => s.setAccessory);
  if (!hydrated) return null;

  const { level, index, next, progress: toNext } = levelFor(progress.xp);
  const streak = currentStreak(progress.streak, new Date());
  const owned = new Set(progress.badges);
  const badges = allBadges(catalog);
  const myths = new Set(progress.mythsSeen);
  const mythsRead = catalog.mythIds.filter((id) => myths.has(id)).length;

  return (
    <div className="space-y-8">
      <section aria-labelledby="livello" className="flex flex-col gap-4 rounded-xl border p-4 sm:flex-row sm:items-center">
        <CybiAvatar mood={index >= 4 ? "fiero" : "felice"} idle className="size-20" />
        <div className="flex-1 space-y-2">
          <h2 id="livello" className="text-xl font-semibold">
            Livello: {level.name}
          </h2>
          <Progress value={toNext * 100} aria-label="Avanzamento verso il livello successivo" />
          <p className="text-muted-foreground text-sm">
            {next
              ? `${progress.xp} XP: mancano ${next.minXp - progress.xp} XP per diventare ${next.name}.`
              : `${progress.xp} XP: hai raggiunto il livello più alto!`}
          </p>
          <p className="text-muted-foreground text-xs">
            XP: quelli della lezione quando superi il quiz, +{PERFECT_QUIZ_BONUS} se è tutto giusto al primo
            tentativo, +{LAB_XP} per ogni laboratorio.
          </p>
        </div>
        <div className="flex items-center gap-2 rounded-lg border px-3 py-2" aria-label={`Serie: ${streak} giorni di fila`}>
          <FlameIcon className={cn("size-6", streak > 0 ? "text-warning" : "text-muted-foreground")} />
          <div>
            <p className="text-2xl font-semibold tabular-nums">{streak}</p>
            <p className="text-muted-foreground text-xs">giorni di fila</p>
          </div>
        </div>
      </section>

      <section aria-labelledby="badge" className="space-y-3">
        <h2 id="badge" className="text-lg font-semibold">
          Badge <span className="text-muted-foreground text-sm font-normal">({badges.filter((b) => owned.has(b.id)).length}/{badges.length})</span>
        </h2>
        <ul className="grid gap-3 sm:grid-cols-2">
          {badges.map((badge) => {
            const earned = owned.has(badge.id);
            return (
              <li
                key={badge.id}
                data-badge={badge.id}
                data-earned={earned}
                className={cn("flex items-start gap-3 rounded-xl border p-3", earned ? "border-cybi/50 bg-cybi/5" : "opacity-60")}
              >
                {earned ? (
                  <AwardIcon className="text-cybi mt-0.5 size-5 shrink-0" aria-label="Sbloccato" />
                ) : (
                  <LockIcon className="text-muted-foreground mt-0.5 size-5 shrink-0" aria-label="Bloccato" />
                )}
                <div>
                  <p className="font-medium">{badge.name}</p>
                  <p className="text-muted-foreground text-sm">
                    {badge.description}
                    {badge.id === "cacciatore-di-miti" && !earned && ` Finora: ${mythsRead}/${catalog.mythIds.length}.`}
                  </p>
                </div>
              </li>
            );
          })}
        </ul>
      </section>

      <section aria-labelledby="accessori" className="space-y-3">
        <h2 id="accessori" className="text-lg font-semibold">
          Accessori di Cybi
        </h2>
        <p className="text-muted-foreground text-sm">Solo estetici: si sbloccano salendo di livello.</p>
        <div role="radiogroup" aria-labelledby="accessori" className="flex flex-wrap gap-3">
          {ACCESSORIES.map((a) => {
            const unlocked = isAccessoryUnlocked(a.id, index);
            const selected = progress.settings.accessory === a.id;
            return (
              <button
                key={a.id}
                type="button"
                role="radio"
                aria-checked={selected}
                disabled={!unlocked}
                onClick={() => setAccessory(a.id)}
                className={cn(
                  "flex w-28 flex-col items-center gap-1 rounded-xl border p-2 text-sm transition-colors disabled:cursor-not-allowed disabled:opacity-50",
                  selected ? "border-cybi bg-cybi/10" : "hover:bg-muted",
                )}
              >
                <CybiAvatar accessory={a.id} className="size-14" />
                <span>{a.name}</span>
                {!unlocked && (
                  <span className="text-muted-foreground flex items-center gap-1 text-xs">
                    <LockIcon className="size-3" /> {unlockLevelName(a.id)}
                  </span>
                )}
              </button>
            );
          })}
        </div>
      </section>
    </div>
  );
}
