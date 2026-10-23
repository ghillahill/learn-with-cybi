"use client";

import { CheckCircle2Icon, FlaskConicalIcon } from "lucide-react";
import { useEffect } from "react";
import { toast } from "sonner";
import { CybiBubble } from "@/components/cybi/cybi-bubble";
import { Badge } from "@/components/ui/badge";
import { LAB_XP } from "@/lib/gamification/levels";
import { isLabCompleted } from "@/lib/progress/logic";
import { useProgressStore } from "@/lib/progress/store";

// Cornice comune dei laboratori (§8.3): obiettivo, istruzioni di Cybi,
// verifica automatica del completamento, spiegazione finale.
export function LabFrame({
  id,
  title,
  objective,
  intro,
  conclusion,
  solved,
  children,
}: {
  id: string;
  title: string;
  objective: string;
  intro: React.ReactNode;
  conclusion: React.ReactNode;
  solved: boolean;
  children: React.ReactNode;
}) {
  const hydrated = useProgressStore((s) => s.hydrated);
  const completed = useProgressStore((s) => s.hydrated && isLabCompleted(s.progress, id));
  const completeLab = useProgressStore((s) => s.completeLab);

  useEffect(() => {
    if (!hydrated || !solved) return;
    if (isLabCompleted(useProgressStore.getState().progress, id)) return;
    completeLab(id);
    toast.success(`Laboratorio completato: ${title}`, { description: `+${LAB_XP} XP` });
  }, [hydrated, solved, id, title, completeLab]);

  const headingId = `lab-${id}`;
  return (
    <section
      aria-labelledby={headingId}
      data-lab={id}
      className="not-prose bg-card my-8 rounded-xl border p-5"
    >
      <div className="flex flex-wrap items-center justify-between gap-2">
        <p className="text-cybi flex items-center gap-2 text-xs font-semibold tracking-wide uppercase">
          <FlaskConicalIcon className="size-4" /> Laboratorio simulato
        </p>
        {completed && (
          <Badge variant="outline" className="text-success">
            <CheckCircle2Icon /> Completato
          </Badge>
        )}
      </div>
      <h2 id={headingId} className="mt-2 text-lg font-semibold">
        {title}
      </h2>
      <p className="text-muted-foreground mt-1 text-sm">
        <span className="text-foreground font-medium">Obiettivo:</span> {objective}
      </p>
      <CybiBubble mood="detective">{intro}</CybiBubble>
      <div className="space-y-6 text-sm">{children}</div>
      {solved && (
        <CybiBubble mood="fiero" className="mb-0">
          {conclusion}
        </CybiBubble>
      )}
    </section>
  );
}

// Esito di una singola verifica dentro un laboratorio.
export function LabFeedback({ ok, children }: { ok: boolean; children: React.ReactNode }) {
  return (
    <p role="status" className={ok ? "text-success text-sm" : "text-destructive text-sm"}>
      {children}
    </p>
  );
}
