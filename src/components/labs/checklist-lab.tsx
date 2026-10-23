"use client";

import { Button } from "@/components/ui/button";
import { checklistItems, checklistSummary, isChecklistReviewed } from "@/lib/labs/checklist";
import type { ChecklistStatus } from "@/lib/progress/schema";
import { useProgressStore } from "@/lib/progress/store";
import { cn } from "@/lib/utils";
import { LabFrame } from "./lab-frame";

const choices: { status: ChecklistStatus; label: string }[] = [
  { status: "fatto", label: "Fatto" },
  { status: "da-fare", label: "Da fare" },
];

// Lab della lezione 8.5: la checklist personale, salvata nei progressi.
// Contiene solo scelte "fatto / da fare", nessun dato personale.
export function ChecklistLab() {
  const hydrated = useProgressStore((s) => s.hydrated);
  const answers = useProgressStore((s) => s.progress.checklist);
  const setItem = useProgressStore((s) => s.setChecklistItem);

  const { done, todo, missing } = checklistSummary(hydrated ? answers : {});
  const solved = hydrated && isChecklistReviewed(answers);
  const todoItems = checklistItems.filter((i) => hydrated && answers[i.id] === "da-fare");

  return (
    <LabFrame
      id="checklist-sicurezza"
      title="La tua checklist di sicurezza"
      objective="controllare, voce per voce, quali difese hai già attivato e quali restano da fare."
      intro="Rispondi con sincerità: nessuno ti giudica, e le risposte restano solo in questo browser. Ogni “da fare” diventa un passo del tuo piano."
      conclusion="Checklist completata! Ora hai un piano concreto. Torna qui quando sistemi una voce: la checklist ricorda le tue scelte."
      solved={solved}
    >
      <ol aria-label="Voci della checklist" className="space-y-2">
        {checklistItems.map((item, index) => {
          const status = hydrated ? answers[item.id] : undefined;
          return (
            <li
              key={item.id}
              className={cn(
                "rounded-lg border px-3 py-2",
                status === "fatto" && "border-success/60 bg-success/5",
                status === "da-fare" && "border-cybi/50 bg-cybi/5",
              )}
            >
              <p>
                <span className="text-muted-foreground mr-2 font-mono">{index + 1}.</span>
                {item.text}
                <span className="text-muted-foreground ml-2 text-xs">(lezione {item.lesson})</span>
              </p>
              <div role="group" aria-label={`Voce ${index + 1}`} className="mt-2 flex flex-wrap gap-2">
                {choices.map((c) => (
                  <Button
                    key={c.status}
                    size="sm"
                    variant={status === c.status ? "default" : "outline"}
                    aria-pressed={status === c.status}
                    disabled={!hydrated}
                    onClick={() => setItem(item.id, status === c.status ? null : c.status)}
                  >
                    {c.label}
                  </Button>
                ))}
              </div>
            </li>
          );
        })}
      </ol>

      <div aria-live="polite" className="bg-muted/40 space-y-2 rounded-lg p-3">
        <p data-testid="riepilogo-checklist">
          Fatti: {done} · Da fare: {todo} · Senza risposta: {missing}
        </p>
        {todoItems.length > 0 && (
          <>
            <p className="font-medium">Il tuo piano</p>
            <ul className="list-disc space-y-1 pl-5">
              {todoItems.map((i) => (
                <li key={i.id}>{i.text}</li>
              ))}
            </ul>
          </>
        )}
      </div>
    </LabFrame>
  );
}
