"use client";

import { CheckCircle2Icon, CircleDashedIcon, CircleIcon, FlameIcon, LockIcon } from "lucide-react";
import { useEffect } from "react";
import { toast } from "sonner";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { levelFor } from "@/lib/gamification/levels";
import { currentStreak } from "@/lib/gamification/streak";
import { isModuleUnlocked, lessonProgress } from "@/lib/progress/logic";
import { useProgressStore } from "@/lib/progress/store";

// Segna la lezione come iniziata all'apertura.
export function LessonStarter({ lessonKey }: { lessonKey: string }) {
  const hydrated = useProgressStore((s) => s.hydrated);
  const startLesson = useProgressStore((s) => s.startLesson);
  useEffect(() => {
    if (hydrated) startLesson(lessonKey);
  }, [hydrated, lessonKey, startLesson]);
  return null;
}

// Per le lezioni senza quiz: completamento manuale.
export function CompleteLessonButton({ lessonKey, xp }: { lessonKey: string; xp: number }) {
  const hydrated = useProgressStore((s) => s.hydrated);
  const status = useProgressStore((s) => lessonProgress(s.progress, lessonKey).status);
  const completeLesson = useProgressStore((s) => s.completeLesson);
  if (!hydrated) return null;
  if (status === "completed") {
    return (
      <p className="text-success flex items-center gap-2 text-sm font-medium">
        <CheckCircle2Icon className="size-4" /> Lezione completata
      </p>
    );
  }
  return (
    <Button
      onClick={() => {
        completeLesson(lessonKey, xp);
        toast.success(`Lezione completata: +${xp} XP`);
      }}
    >
      Segna come completata
    </Button>
  );
}

export function LessonStatusIcon({ lessonKey }: { lessonKey: string }) {
  const status = useProgressStore((s) =>
    s.hydrated ? lessonProgress(s.progress, lessonKey).status : null,
  );
  if (status === "completed")
    return <CheckCircle2Icon className="text-success size-5" aria-label="Completata" />;
  if (status === "in_progress")
    return <CircleDashedIcon className="text-cybi size-5" aria-label="In corso" />;
  return <CircleIcon className="text-muted-foreground size-5" aria-label="Da iniziare" />;
}

export function ModuleProgress({ lessonKeys }: { lessonKeys: string[] }) {
  const done = useProgressStore((s) =>
    s.hydrated
      ? lessonKeys.filter((k) => lessonProgress(s.progress, k).status === "completed").length
      : 0,
  );
  return (
    <div className="flex items-center gap-3">
      <Progress
        value={(done / lessonKeys.length) * 100}
        className="flex-1"
        aria-label="Avanzamento del modulo"
      />
      <span className="text-muted-foreground shrink-0 text-xs tabular-nums">
        {done}/{lessonKeys.length}
      </span>
    </div>
  );
}

// Mostra i figli solo se il modulo è sbloccato; altrimenti un avviso.
export function ModuleGate({
  requiredLessonKeys,
  requiredTitles,
  children,
}: {
  requiredLessonKeys: string[][];
  requiredTitles: string[];
  children: React.ReactNode;
}) {
  const unlocked = useProgressStore((s) =>
    s.hydrated ? isModuleUnlocked(s.progress, requiredLessonKeys) : null,
  );
  if (unlocked === null) return null;
  if (!unlocked) {
    return (
      <p className="text-muted-foreground flex items-center gap-2 text-sm">
        <LockIcon className="size-4" />
        Si sblocca completando: {requiredTitles.join(", ")}.
      </p>
    );
  }
  return <>{children}</>;
}

// Livello, XP e serie di giorni nell'intestazione (§8.4).
export function XpBadge() {
  const xp = useProgressStore((s) => (s.hydrated ? s.progress.xp : null));
  const streak = useProgressStore((s) => (s.hydrated ? currentStreak(s.progress.streak, new Date()) : 0));
  if (xp === null) return null;
  return (
    <span className="flex items-center gap-1.5">
      {streak > 0 && (
        <Badge variant="outline" aria-label={`Serie: ${streak} giorni di fila`} title="Giorni di fila">
          <FlameIcon className="text-warning" /> {streak}
        </Badge>
      )}
      <Badge variant="secondary" title="Livello e punti esperienza">
        {levelFor(xp).level.name} · {xp} XP
      </Badge>
    </span>
  );
}
