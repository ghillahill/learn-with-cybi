"use client";

import { CheckIcon, XIcon } from "lucide-react";
import { NativeSelect, NativeSelectOption } from "@/components/ui/native-select";
import type { MatchQuestion } from "@/lib/content/schema";
import { cn } from "@/lib/utils";

// Abbinamenti: per ogni voce di sinistra si sceglie una voce di destra.
// `answer[i]` è l'indice della coppia scelta per la voce i (-1 = nessuna);
// `rightOrder` è l'ordine mescolato in cui mostrare le voci di destra.
export function MatchList({
  question,
  answer,
  rightOrder,
  onChange,
  checked,
}: {
  question: MatchQuestion;
  answer: number[];
  rightOrder: number[];
  onChange: (answer: number[]) => void;
  checked: boolean;
}) {
  return (
    <ul className="space-y-2">
      {question.pairs.map((pair, i) => {
        const chosen = answer[i] ?? -1;
        const right = chosen === i;
        const selectId = `${question.id}-match-${i}`;
        return (
          <li
            key={i}
            className={cn(
              "rounded-lg border px-4 py-3 text-sm",
              checked &&
                (right ? "border-success/60 bg-success/5" : "border-destructive/60 bg-destructive/5"),
            )}
          >
            <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
              <label htmlFor={selectId} className="font-medium">
                {pair.left}
              </label>
              <span className="flex items-center gap-2">
                <NativeSelect
                  id={selectId}
                  className="w-full sm:w-64"
                  value={String(chosen)}
                  disabled={checked}
                  aria-invalid={checked && !right ? true : undefined}
                  onChange={(event) => {
                    const next = [...answer];
                    next[i] = Number(event.target.value);
                    onChange(next);
                  }}
                >
                  <NativeSelectOption value="-1" disabled>
                    Scegli…
                  </NativeSelectOption>
                  {rightOrder.map((pairIndex) => (
                    <NativeSelectOption key={pairIndex} value={String(pairIndex)}>
                      {question.pairs[pairIndex].right}
                    </NativeSelectOption>
                  ))}
                </NativeSelect>
                {checked &&
                  (right ? (
                    <CheckIcon className="text-success size-4 shrink-0" aria-label="Abbinamento corretto" />
                  ) : (
                    <XIcon className="text-destructive size-4 shrink-0" aria-label="Abbinamento sbagliato" />
                  ))}
              </span>
            </div>
            {checked && (
              <p className="text-muted-foreground mt-2">
                {!right && `Abbinamento corretto: ${pair.right}. `}
                {pair.explain}
              </p>
            )}
          </li>
        );
      })}
    </ul>
  );
}
