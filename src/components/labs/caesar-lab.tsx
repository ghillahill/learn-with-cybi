"use client";

import { MinusIcon, PlusIcon } from "lucide-react";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  allDecryptions,
  caesarSecretCiphertext,
  caesarShift,
  isCaesarKeyFound,
  KEY_COUNT,
} from "@/lib/labs/caesar";
import { LabFeedback, LabFrame } from "./lab-frame";

// Lab delle lezioni 1.1 e 7.1: cifrare con Cesare, poi rompere un messaggio
// provando tutte le 25 chiavi.
export function CaesarLab() {
  const [plain, setPlain] = useState("CIAO");
  const [key, setKey] = useState(3);
  const [showAll, setShowAll] = useState(false);
  const [answer, setAnswer] = useState("");
  const [checked, setChecked] = useState(false);
  const found = checked && isCaesarKeyFound(answer);

  return (
    <LabFrame
      id="cesare"
      title="Cifrario di Cesare"
      objective="cifrare un messaggio con Cesare e poi romperne uno provando tutte le chiavi."
      intro="Scrivi un messaggio e scegli di quanto spostare le lettere. Poi ti passo un messaggio intercettato: trova la chiave senza che io te la dica."
      conclusion="Fatto! Venticinque tentativi e il segreto è tuo: ecco perché un cifrario con così poche chiavi non protegge niente."
      solved={found}
    >
      <div className="space-y-2">
        <label htmlFor="caesar-plain" className="font-medium">
          1. Cifra un messaggio
        </label>
        <Textarea id="caesar-plain" value={plain} onChange={(e) => setPlain(e.target.value)} />
        <div className="flex items-center gap-2">
          <span id="caesar-key" className="text-muted-foreground">
            Chiave (spostamento):
          </span>
          <Button
            size="icon-sm"
            variant="outline"
            aria-label="Chiave meno uno"
            disabled={key <= 1}
            onClick={() => setKey(key - 1)}
          >
            <MinusIcon />
          </Button>
          <output aria-labelledby="caesar-key" className="w-8 text-center font-mono text-base">
            {key}
          </output>
          <Button
            size="icon-sm"
            variant="outline"
            aria-label="Chiave più uno"
            disabled={key >= KEY_COUNT}
            onClick={() => setKey(key + 1)}
          >
            <PlusIcon />
          </Button>
        </div>
        <output
          htmlFor="caesar-plain"
          aria-label="Messaggio cifrato"
          className="bg-muted block min-h-9 rounded-lg px-3 py-2 font-mono break-all"
        >
          {plain.trim() === "" ? "…" : caesarShift(plain, key)}
        </output>
      </div>

      <div className="space-y-2">
        <p className="font-medium">2. Rompi il messaggio intercettato</p>
        <p>
          <code className="bg-muted rounded px-1.5 py-0.5 break-all">{caesarSecretCiphertext}</code>
        </p>
        <Button variant="outline" onClick={() => setShowAll(true)} disabled={showAll}>
          Prova tutte le 25 chiavi
        </Button>
        {showAll && (
          <ol aria-label="Tutte le decifrature possibili" className="bg-muted/40 space-y-0.5 rounded-lg p-3 font-mono text-xs">
            {allDecryptions(caesarSecretCiphertext).map((d) => (
              <li key={d.key}>
                <span className="text-muted-foreground inline-block w-16">chiave {d.key}</span> {d.text}
              </li>
            ))}
          </ol>
        )}
      </div>

      <form
        className="space-y-2"
        onSubmit={(e) => {
          e.preventDefault();
          setChecked(true);
        }}
      >
        <label htmlFor="caesar-answer" className="font-medium">
          3. Qual era la chiave?
        </label>
        <div className="flex gap-2">
          <Input
            id="caesar-answer"
            inputMode="numeric"
            className="w-24 font-mono"
            value={answer}
            autoComplete="off"
            disabled={found}
            onChange={(e) => {
              setAnswer(e.target.value);
              setChecked(false);
            }}
          />
          <Button type="submit" variant="outline" disabled={found || answer.trim() === ""}>
            Verifica
          </Button>
        </div>
        {checked && (
          <LabFeedback ok={found}>
            {found
              ? "Esatto, era quella la chiave."
              : "Non è questa. Cerca nell'elenco l'unica riga che si legge in italiano."}
          </LabFeedback>
        )}
      </form>
    </LabFrame>
  );
}
