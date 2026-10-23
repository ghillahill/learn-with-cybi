"use client";

import { MinusIcon, PlusIcon } from "lucide-react";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  alphabetSize,
  averageSeconds,
  charsets,
  combinations,
  formatCount,
  formatDuration,
  MAX_LENGTH,
  MIN_LENGTH,
  passwordChallenges,
  speeds,
  type Charset,
  type Speed,
} from "@/lib/labs/password";
import { LabFeedback, LabFrame } from "./lab-frame";

const charsetKeys = Object.keys(charsets) as Charset[];
const speedKeys = Object.keys(speeds) as Speed[];

// Lab della lezione 6.5: quanto tempo serve, in media, per provare tutte
// le password possibili? Nessun campo per scrivere una password vera.
export function PasswordLab() {
  const [selected, setSelected] = useState<Charset[]>(["minuscole"]);
  const [length, setLength] = useState(8);
  const [speed, setSpeed] = useState<Speed>("veloce");
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [checked, setChecked] = useState(false);

  const total = combinations(selected, length);
  const right = (id: string, answer: number) => Number(answers[id]) === answer;
  const solved = checked && passwordChallenges.every((c) => right(c.id, c.answer));

  function toggle(c: Charset) {
    setSelected((prev) => (prev.includes(c) ? prev.filter((x) => x !== c) : [...prev, c]));
  }

  return (
    <LabFrame
      id="forza-password"
      title="Forza delle password"
      objective="capire quanto contano lunghezza e tipi di carattere contro un attacco a forza bruta."
      intro="Scegli i tipi di carattere e la lunghezza: ti dico quante password possibili ci sono e quanto servirebbe, in media, per provarle tutte. Poi risolvi le due sfide."
      conclusion="Visto? Con solo minuscole bastano 4 caratteri in più per pareggiare tutti i simboli del mondo. La lunghezza è l'arma migliore, purché la password sia casuale."
      solved={solved}
    >
      <div className="space-y-4 rounded-lg border p-3">
        <div role="group" aria-label="Tipi di carattere" className="flex flex-wrap gap-2">
          {charsetKeys.map((c) => (
            <Button
              key={c}
              size="sm"
              variant={selected.includes(c) ? "default" : "outline"}
              aria-pressed={selected.includes(c)}
              onClick={() => toggle(c)}
            >
              {charsets[c].label}
            </Button>
          ))}
        </div>

        <div className="flex items-center gap-2">
          <span id="password-length" className="text-muted-foreground">
            Lunghezza:
          </span>
          <Button
            size="icon-sm"
            variant="outline"
            aria-label="Un carattere in meno"
            disabled={length <= MIN_LENGTH}
            onClick={() => setLength(length - 1)}
          >
            <MinusIcon />
          </Button>
          <output aria-labelledby="password-length" className="w-8 text-center font-mono text-base">
            {length}
          </output>
          <Button
            size="icon-sm"
            variant="outline"
            aria-label="Un carattere in più"
            disabled={length >= MAX_LENGTH}
            onClick={() => setLength(length + 1)}
          >
            <PlusIcon />
          </Button>
        </div>

        <div role="group" aria-label="Velocità dell'attaccante (ipotesi)" className="flex flex-wrap items-center gap-2">
          <span className="text-muted-foreground">Velocità (ipotesi):</span>
          {speedKeys.map((s) => (
            <Button
              key={s}
              size="sm"
              variant={speed === s ? "default" : "outline"}
              aria-pressed={speed === s}
              onClick={() => setSpeed(s)}
            >
              {speeds[s].label}
            </Button>
          ))}
        </div>

        <dl aria-live="polite" className="bg-muted/40 grid gap-1 rounded-lg p-3 sm:grid-cols-[auto_1fr] sm:gap-x-4">
          <dt className="text-muted-foreground">Caratteri possibili</dt>
          <dd className="font-mono">{alphabetSize(selected)}</dd>
          <dt className="text-muted-foreground">Password possibili</dt>
          <dd className="font-mono">
            {selected.length === 0 ? "—" : formatCount(total)}
          </dd>
          <dt className="text-muted-foreground">Tempo medio per trovarla</dt>
          <dd data-testid="tempo-medio" className="font-medium">
            {selected.length === 0 ? "scegli almeno un tipo di carattere" : formatDuration(averageSeconds(selected, length, speed))}
          </dd>
        </dl>
      </div>

      <div className="space-y-3">
        <p className="font-medium">Le sfide (con la velocità più alta)</p>
        {passwordChallenges.map((c, i) => {
          const isRight = right(c.id, c.answer);
          return (
            <div key={c.id} className="space-y-1">
              <label htmlFor={`sfida-${c.id}`} className="block">
                {i + 1}. {c.text}
              </label>
              <div className="flex items-center gap-2">
                <Input
                  id={`sfida-${c.id}`}
                  inputMode="numeric"
                  className="w-24 font-mono"
                  value={answers[c.id] ?? ""}
                  disabled={solved}
                  aria-invalid={checked && !isRight ? true : undefined}
                  onChange={(e) => {
                    setAnswers((prev) => ({ ...prev, [c.id]: e.target.value }));
                    setChecked(false);
                  }}
                />
                <span className="text-muted-foreground">caratteri</span>
              </div>
            </div>
          );
        })}
        <div className="flex flex-wrap items-center gap-3">
          <Button
            variant="outline"
            onClick={() => setChecked(true)}
            disabled={solved || passwordChallenges.some((c) => !answers[c.id])}
          >
            Verifica
          </Button>
          {checked && !solved && (
            <LabFeedback ok={false}>
              Non ancora: imposta i caratteri della sfida, scegli la velocità più alta e allunga la password finché il
              tempo supera 100 anni.
            </LabFeedback>
          )}
        </div>
      </div>
    </LabFrame>
  );
}
