"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  ciaIncidents,
  ciaProperties,
  isCiaAnswerCorrect,
  isCiaChallengeSolved,
  type CiaAnswers,
  type CiaProperty,
} from "@/lib/labs/cia";
import { cn } from "@/lib/utils";
import { LabFeedback, LabFrame } from "./lab-frame";

const properties = Object.entries(ciaProperties) as [CiaProperty, string][];

// Lab della lezione 5.1: classificare dieci incidenti per proprietà violata.
export function CiaLab() {
  const [answers, setAnswers] = useState<CiaAnswers>({});
  const [checked, setChecked] = useState(false);
  const solved = checked && isCiaChallengeSolved(answers);
  const answered = ciaIncidents.filter((i) => answers[i.id]).length;

  function choose(id: string, property: CiaProperty) {
    setAnswers((prev) => ({ ...prev, [id]: property }));
    setChecked(false);
  }

  return (
    <LabFrame
      id="triade-rid"
      title="Classifica gli incidenti"
      objective="riconoscere quale proprietà della triade RID viene violata in dieci incidenti."
      intro="Per ogni incidente scegli la proprietà colpita: R, I o D. Chiediti: qualcuno ha visto, cambiato o bloccato qualcosa?"
      conclusion="Ottimo lavoro! Ora sai fare la prima domanda di ogni analisi: quale proprietà è stata colpita? Nella realtà la risposta può essere più di una."
      solved={solved}
    >
      <ol aria-label="Incidenti da classificare" className="space-y-3">
        {ciaIncidents.map((incident, index) => {
          const answer = answers[incident.id];
          const right = isCiaAnswerCorrect(incident, answers);
          return (
            <li
              key={incident.id}
              className={cn(
                "rounded-lg border px-3 py-2",
                checked && right && "border-success/60 bg-success/5",
                checked && !right && "border-destructive/60 bg-destructive/5",
              )}
            >
              <p>
                <span className="text-muted-foreground mr-2 font-mono">{index + 1}.</span>
                {incident.text}
              </p>
              <div role="group" aria-label={`Proprietà violata, incidente ${index + 1}`} className="mt-2 flex flex-wrap gap-2">
                {properties.map(([key, name]) => (
                  <Button
                    key={key}
                    size="sm"
                    variant={answer === key ? "default" : "outline"}
                    aria-pressed={answer === key}
                    disabled={solved}
                    onClick={() => choose(incident.id, key)}
                  >
                    {name}
                  </Button>
                ))}
              </div>
              {checked && (
                <p className="text-muted-foreground mt-1 text-xs">
                  {right ? `Giusto: ${ciaProperties[incident.answer]}. ` : "Non ancora. "}
                  {right && incident.explain}
                  {!right && "Rileggi le definizioni di perdita del FIPS 199: divulgazione, modifica o interruzione?"}
                </p>
              )}
            </li>
          );
        })}
      </ol>

      <div className="flex flex-wrap items-center gap-3">
        <Button variant="outline" onClick={() => setChecked(true)} disabled={solved || answered === 0}>
          Verifica
        </Button>
        {checked && !solved && (
          <LabFeedback ok={false}>
            {answered < ciaIncidents.length
              ? `Hai classificato ${answered} incidenti su ${ciaIncidents.length}: completa e riprova.`
              : "Qualche risposta non va: correggi quelle segnate in rosso e riprova."}
          </LabFeedback>
        )}
      </div>
    </LabFrame>
  );
}
