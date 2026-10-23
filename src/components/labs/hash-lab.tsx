"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { bitDifference, differsByOneChar, HASH_BITS, hashStartText, sha256Hex } from "@/lib/labs/hash";
import { cn } from "@/lib/utils";
import { LabFeedback, LabFrame } from "./lab-frame";

function useSha256(text: string): string | null {
  const [result, setResult] = useState<{ text: string; hash: string } | null>(null);
  useEffect(() => {
    let current = true;
    sha256Hex(text).then((hash) => {
      if (current) setResult({ text, hash });
    });
    return () => {
      current = false;
    };
  }, [text]);
  return result?.text === text ? result.hash : null;
}

// Un hash in esadecimale, con evidenziate le cifre diverse dall'altro hash.
function HashOutput({ label, hash, other }: { label: string; hash: string | null; other: string | null }) {
  return (
    <output aria-label={label} className="bg-muted block min-h-9 rounded-lg px-3 py-2 font-mono text-xs break-all">
      {hash === null
        ? "…"
        : [...hash].map((ch, i) => (
            <span key={i} className={cn(other && other[i] !== ch && "text-cybi font-bold")}>
              {ch}
            </span>
          ))}
    </output>
  );
}

const questionOptions = [
  { id: "si", text: "Sì, basta fare il calcolo al contrario.", correct: false },
  { id: "no", text: "No, un hash non si “decifra”: si può solo provare un testo e confrontare il risultato.", correct: true },
];

// Lab della lezione 7.3: SHA-256 nel browser ed effetto valanga.
export function HashLab() {
  const [a, setA] = useState(hashStartText);
  const [b, setB] = useState(hashStartText);
  const [oneCharSeen, setOneCharSeen] = useState(false);
  const [choice, setChoice] = useState<string | null>(null);
  const hashA = useSha256(a);
  const hashB = useSha256(b);

  const bits = hashA && hashB ? bitDifference(hashA, hashB) : null;
  const oneChar = differsByOneChar(a, b);
  if (oneChar && hashA && hashB && !oneCharSeen) setOneCharSeen(true);
  const answered = questionOptions.find((o) => o.id === choice);
  const solved = oneCharSeen && answered?.correct === true;

  return (
    <LabFrame
      id="hash"
      title="Laboratorio hash"
      objective="osservare che SHA-256 è deterministica e che basta un carattere per cambiare tutto il risultato."
      intro="Qui sotto il tuo browser calcola l'hash SHA-256 di due testi, senza mandarli da nessuna parte. Per ora sono uguali: cambia un solo carattere nel secondo e guarda cosa succede. Non scrivere password vere!"
      conclusion="Hai visto l'effetto valanga: basta un carattere diverso e l'impronta diventa irriconoscibile. E dall'impronta non si torna indietro al testo."
      solved={solved}
    >
      <div className="space-y-2">
        <label htmlFor="hash-a" className="font-medium">
          Testo 1
        </label>
        <Input id="hash-a" value={a} autoComplete="off" onChange={(e) => setA(e.target.value)} />
        <HashOutput label="SHA-256 del testo 1" hash={hashA} other={hashB} />
      </div>
      <div className="space-y-2">
        <label htmlFor="hash-b" className="font-medium">
          Testo 2
        </label>
        <Input id="hash-b" value={b} autoComplete="off" onChange={(e) => setB(e.target.value)} />
        <HashOutput label="SHA-256 del testo 2" hash={hashB} other={hashA} />
      </div>

      <p aria-live="polite" data-testid="bit-diversi" className="bg-muted/40 rounded-lg p-3">
        {bits === null
          ? "Calcolo in corso…"
          : bits === 0
            ? "Stesso testo, stesso hash: SHA-256 è deterministica."
            : `Bit diversi: ${bits} su ${HASH_BITS}.${oneChar ? " Ed è cambiato un solo carattere!" : ""}`}
      </p>
      {!oneCharSeen && (
        <p className="text-muted-foreground text-xs">
          Missione 1: fai in modo che i due testi abbiano la stessa lunghezza e differiscano in un solo carattere.
        </p>
      )}

      <div className="space-y-2">
        <p id="hash-question" className="font-medium">
          Missione 2: hai solo l&apos;hash di un testo. Puoi ricavare il testo originale?
        </p>
        <div role="group" aria-labelledby="hash-question" className="flex flex-col gap-2">
          {questionOptions.map((o) => (
            <Button
              key={o.id}
              variant={choice === o.id ? "default" : "outline"}
              aria-pressed={choice === o.id}
              disabled={solved}
              className="h-auto justify-start py-2 text-left whitespace-normal"
              onClick={() => setChoice(o.id)}
            >
              {o.text}
            </Button>
          ))}
        </div>
        {answered && !answered.correct && (
          <LabFeedback ok={false}>No: le funzioni di hash sono fatte apposta per essere a senso unico.</LabFeedback>
        )}
        {answered?.correct && !oneCharSeen && (
          <LabFeedback ok={false}>Giusto! Manca la missione 1: cambia un solo carattere del testo 2.</LabFeedback>
        )}
      </div>
    </LabFrame>
  );
}
