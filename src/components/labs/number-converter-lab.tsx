"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  bases,
  formatInBase,
  isChallengeSolved,
  numberChallenges,
  parseInBase,
  type Base,
} from "@/lib/labs/numbers";
import { LabFeedback, LabFrame } from "./lab-frame";

const baseOrder: Base[] = [10, 2, 16];

// Lab della lezione 3.2: convertitore libero + tre mini-sfide.
export function NumberConverterLab() {
  const [source, setSource] = useState<{ base: Base; text: string }>({ base: 10, text: "42" });
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [checked, setChecked] = useState<Record<string, boolean>>({});

  const value = parseInBase(source.text, source.base);
  const solvedIds = numberChallenges
    .filter((c) => checked[c.id] && isChallengeSolved(c, answers[c.id] ?? ""))
    .map((c) => c.id);

  return (
    <LabFrame
      id="convertitore-numeri"
      title="Convertitore binario, decimale, esadecimale"
      objective="convertire numeri tra le tre basi e risolvere le tre sfide."
      intro="Scrivi un numero in una delle tre caselle: le altre si aggiornano da sole. Poi prova le sfide, senza barare… o quasi!"
      conclusion="Tre su tre! Ora sai perché gli informatici amano l'esadecimale: due cifre bastano per scrivere un byte intero."
      solved={solvedIds.length === numberChallenges.length}
    >
      <div className="grid gap-3 sm:grid-cols-3">
        {baseOrder.map((base) => {
          const isSource = source.base === base;
          const text = isSource ? source.text : value === null ? "" : formatInBase(value, base);
          const inputId = `conv-${base}`;
          return (
            <div key={base} className="space-y-1">
              <label htmlFor={inputId} className="block font-medium first-letter:uppercase">
                {bases[base]} (base {base})
              </label>
              <Input
                id={inputId}
                value={text}
                inputMode={base === 16 ? "text" : "numeric"}
                spellCheck={false}
                autoComplete="off"
                className="font-mono"
                aria-invalid={isSource && text !== "" && value === null}
                onChange={(e) => setSource({ base, text: e.target.value })}
              />
            </div>
          );
        })}
      </div>
      {source.text !== "" && value === null && (
        <LabFeedback ok={false}>
          Questo numero non è valido in base {source.base}. In binario si usano solo 0 e 1; in
          esadecimale le cifre da 0 a 9 e le lettere da A a F.
        </LabFeedback>
      )}

      <ol className="space-y-4">
        {numberChallenges.map((c, i) => {
          const isChecked = checked[c.id];
          const ok = solvedIds.includes(c.id);
          const inputId = `sfida-${c.id}`;
          return (
            <li key={c.id} className="rounded-lg border p-3">
              <label htmlFor={inputId} className="font-medium">
                Sfida {i + 1}. {c.prompt}
              </label>
              <form
                className="mt-2 flex gap-2"
                onSubmit={(e) => {
                  e.preventDefault();
                  setChecked((prev) => ({ ...prev, [c.id]: true }));
                }}
              >
                <Input
                  id={inputId}
                  value={answers[c.id] ?? ""}
                  spellCheck={false}
                  autoComplete="off"
                  className="font-mono"
                  disabled={ok}
                  onChange={(e) => {
                    setAnswers((prev) => ({ ...prev, [c.id]: e.target.value }));
                    setChecked((prev) => ({ ...prev, [c.id]: false }));
                  }}
                />
                <Button type="submit" variant="outline" disabled={ok || !answers[c.id]}>
                  Verifica
                </Button>
              </form>
              {isChecked && (
                <div className="mt-2">
                  <LabFeedback ok={ok}>
                    {ok ? `Giusto! ${c.explain}` : "Non ancora. Usa il convertitore qui sopra per controllare."}
                  </LabFeedback>
                </div>
              )}
            </li>
          );
        })}
      </ol>
    </LabFrame>
  );
}
