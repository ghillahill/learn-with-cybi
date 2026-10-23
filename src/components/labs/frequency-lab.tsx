"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ALPHABET } from "@/lib/labs/caesar";
import {
  applyGuesses,
  cipherLetters,
  correctPlainLetter,
  frequencyCiphertext,
  isFrequencyChallengeSolved,
  isGuessCorrect,
  letterFrequencies,
  nextHint,
  referenceText,
  type Guesses,
  type LetterCount,
} from "@/lib/labs/frequency";
import { cn } from "@/lib/utils";
import { LabFeedback, LabFrame } from "./lab-frame";

const cipherCounts = letterFrequencies(frequencyCiphertext);
const referenceCounts = letterFrequencies(referenceText);
const referenceLetters = [...referenceText.normalize("NFD").replace(/\p{M}/gu, "").toUpperCase()].filter((ch) =>
  ALPHABET.includes(ch),
).length;
const percent = new Intl.NumberFormat("it-IT", { style: "percent", maximumFractionDigits: 1 });

function FrequencyBars({ label, counts }: { label: string; counts: LetterCount[] }) {
  const max = counts[0]?.share ?? 1;
  return (
    <figure className="min-w-0 flex-1 space-y-1">
      <figcaption className="font-medium">{label}</figcaption>
      <ol className="space-y-0.5 font-mono text-xs">
        {counts.slice(0, 10).map((c) => (
          <li key={c.letter} className="flex items-center gap-2">
            <span className="w-3">{c.letter}</span>
            <span aria-hidden className="bg-cybi/60 h-2.5 rounded-sm" style={{ width: `${(c.share / max) * 70}%` }} />
            <span className="text-muted-foreground">{percent.format(c.share)}</span>
          </li>
        ))}
      </ol>
    </figure>
  );
}

// Lab della lezione 7.1: rompere un cifrario a sostituzione contando le lettere.
export function FrequencyLab() {
  const [guesses, setGuesses] = useState<Guesses>({});
  const [checked, setChecked] = useState(false);
  const solved = checked && isFrequencyChallengeSolved(guesses);
  const right = cipherLetters.filter((c) => isGuessCorrect(c, guesses)).length;

  function guess(cipherLetter: string, value: string) {
    const letter = value.normalize("NFD").replace(/\p{M}/gu, "").toUpperCase().slice(-1);
    setGuesses((prev) => ({ ...prev, [cipherLetter]: ALPHABET.includes(letter) ? letter : undefined }));
    setChecked(false);
  }

  function hint() {
    const c = nextHint(guesses);
    if (!c) return;
    setGuesses((prev) => ({ ...prev, [c]: correctPlainLetter(c) }));
    setChecked(false);
  }

  return (
    <LabFrame
      id="analisi-frequenza"
      title="Analisi di frequenza"
      objective="decifrare un messaggio cifrato con una sostituzione semplice, senza conoscere la chiave."
      intro="Ogni lettera del messaggio è stata sostituita sempre con la stessa lettera. Confronta le lettere più frequenti del cifrato con quelle di un testo italiano normale e prova a indovinare. Le parole corte ti aiutano!"
      conclusion="Ce l'hai fatta! Le chiavi possibili erano più di 400 milioni di miliardi di miliardi, ma l'impronta della lingua ti ha portato dritto alla soluzione. È il trucco di al-Kindi, più di mille anni fa."
      solved={solved}
    >
      <div className="space-y-2">
        <p className="font-medium">Il messaggio, con le tue ipotesi</p>
        <p aria-label="Messaggio con le lettere indovinate" className="bg-muted/40 rounded-lg p-3 font-mono leading-relaxed break-words">
          {applyGuesses(guesses).map((c, i) => (
            <span key={i} className={cn(c.guessed ? "text-cybi font-semibold" : "text-muted-foreground")}>
              {c.char}
            </span>
          ))}
        </p>
        <p className="text-muted-foreground text-xs">
          In grigio le lettere ancora cifrate, a colori le tue ipotesi.
        </p>
      </div>

      <div className="flex flex-col gap-4 sm:flex-row">
        <FrequencyBars label="Lettere più frequenti nel cifrato" counts={cipherCounts} />
        <FrequencyBars label={`In un testo italiano di esempio (${referenceLetters} lettere)`} counts={referenceCounts} />
      </div>

      <div className="space-y-2">
        <p className="font-medium">Le tue ipotesi: lettera cifrata → lettera in chiaro</p>
        <ul aria-label="Ipotesi per ogni lettera cifrata" className="grid grid-cols-4 gap-2 sm:grid-cols-5">
          {cipherLetters.map((c) => (
            <li key={c} className="flex items-center gap-1.5">
              <label htmlFor={`freq-${c}`} className="font-mono">
                <span className="sr-only">Lettera cifrata </span>
                {c} →
              </label>
              <Input
                id={`freq-${c}`}
                value={guesses[c] ?? ""}
                autoComplete="off"
                maxLength={2}
                disabled={solved}
                aria-invalid={checked && guesses[c] && !isGuessCorrect(c, guesses) ? true : undefined}
                className="h-8 w-10 px-0 text-center font-mono uppercase"
                onChange={(e) => guess(c, e.target.value)}
              />
            </li>
          ))}
        </ul>
      </div>

      <div className="flex flex-wrap items-center gap-3">
        <Button variant="outline" onClick={() => setChecked(true)} disabled={solved}>
          Verifica
        </Button>
        <Button variant="ghost" onClick={hint} disabled={solved}>
          Suggeriscimi una lettera
        </Button>
        {checked && !solved && (
          <LabFeedback ok={false}>
            {`Hai indovinato ${right} lettere su ${cipherLetters.length}: quelle sbagliate sono segnate in rosso.`}
          </LabFeedback>
        )}
      </div>
    </LabFrame>
  );
}
