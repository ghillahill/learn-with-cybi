"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  DH_BASE,
  DH_PRIME,
  isValidSecret,
  MAX_SECRET,
  MIN_SECRET,
  mix,
  paintSteps,
  publicPaint,
  publicValue,
  secretPaints,
  sharedSecret,
  type Paint,
} from "@/lib/labs/key-exchange";
import { cn } from "@/lib/utils";
import { LabFeedback, LabFrame } from "./lab-frame";

function Swatch({ color, label }: { color: string; label: string }) {
  return (
    <span className="inline-flex items-center gap-2">
      <span aria-hidden className="size-6 shrink-0 rounded-full border" style={{ backgroundColor: color }} />
      <span>{label}</span>
    </span>
  );
}

function PaintPicker({
  who,
  value,
  disabled,
  onChange,
}: {
  who: string;
  value: Paint;
  disabled: boolean;
  onChange: (p: Paint) => void;
}) {
  return (
    <div role="group" aria-label={`Colore segreto di ${who}`} className="flex flex-wrap gap-1.5">
      {secretPaints.map((p) => (
        <button
          key={p.id}
          type="button"
          aria-label={p.name}
          aria-pressed={value.id === p.id}
          disabled={disabled}
          onClick={() => onChange(p)}
          className={cn(
            "size-7 rounded-full border-2 disabled:cursor-not-allowed disabled:opacity-50",
            value.id === p.id ? "border-foreground" : "border-transparent",
          )}
          style={{ backgroundColor: mix([p]) }}
        />
      ))}
    </div>
  );
}

function NumberInput({ id, label, value, onChange }: { id: string; label: string; value: string; onChange: (v: string) => void }) {
  return (
    <div className="flex items-center gap-2">
      <label htmlFor={id} className="w-48">
        {label}
      </label>
      <Input
        id={id}
        inputMode="numeric"
        autoComplete="off"
        className="w-20 font-mono"
        value={value}
        onChange={(e) => onChange(e.target.value)}
      />
    </div>
  );
}

// Lab della lezione 7.2: l'analogia dei colori di Diffie-Hellman, poi gli stessi
// passi con numeri piccoli.
export function KeyExchangeLab() {
  const [step, setStep] = useState(0);
  const [alice, setAlice] = useState(secretPaints[0]);
  const [bob, setBob] = useState(secretPaints[1]);
  const [aText, setAText] = useState("6");
  const [bText, setBText] = useState("15");
  const [answer, setAnswer] = useState("");
  const [checked, setChecked] = useState(false);

  const last = paintSteps.length - 1;
  const paintsDone = step === last;
  const a = Number(aText);
  const b = Number(bText);
  const valid = isValidSecret(a) && isValidSecret(b);
  const shared = valid ? sharedSecret(a, publicValue(b)) : null;
  const numberRight = checked && shared !== null && Number(answer.trim()) === shared;
  const solved = paintsDone && numberRight;

  const aliceMix = mix([publicPaint, alice]);
  const bobMix = mix([publicPaint, bob]);
  const finalColor = mix([publicPaint, alice, bob]);

  return (
    <LabFrame
      id="scambio-chiavi"
      title="Scambio di chiavi"
      objective="capire come due persone concordano un segreto parlando su un canale che tutti possono ascoltare."
      intro="Alice e Bob vogliono un colore segreto in comune, ma ogni messaggio che si scambiano lo vede anche Eva. Segui i passi con i colori, poi rifai tutto con i numeri."
      conclusion="Ecco Diffie-Hellman! Alice e Bob hanno lo stesso segreto e non se lo sono mai detto. Eva ha visto tutto quello che è passato, ma le manca un pezzo."
      solved={solved}
    >
      <div className="space-y-3 rounded-lg border p-3">
        <p className="font-medium">
          1. Con i colori: passo {step + 1} di {paintSteps.length}
        </p>
        <p aria-live="polite">{paintSteps[step]}</p>

        <div className="grid gap-3 sm:grid-cols-3">
          <div className="space-y-2">
            <p className="font-medium">Alice</p>
            {step >= 1 && <PaintPicker who="Alice" value={alice} disabled={step > 1} onChange={setAlice} />}
            {step >= 2 && <Swatch color={aliceMix} label="miscela spedita" />}
            {step >= 3 && <Swatch color={finalColor} label="colore finale" />}
          </div>
          <div className="space-y-2">
            <p className="font-medium">Eva vede</p>
            <Swatch color={mix([publicPaint])} label="colore pubblico" />
            {step >= 2 && <Swatch color={aliceMix} label="miscela di Alice" />}
            {step >= 2 && <Swatch color={bobMix} label="miscela di Bob" />}
          </div>
          <div className="space-y-2">
            <p className="font-medium">Bob</p>
            {step >= 1 && <PaintPicker who="Bob" value={bob} disabled={step > 1} onChange={setBob} />}
            {step >= 2 && <Swatch color={bobMix} label="miscela spedita" />}
            {step >= 3 && <Swatch color={finalColor} label="colore finale" />}
          </div>
        </div>

        <div className="flex gap-2">
          <Button variant="outline" disabled={step === 0} onClick={() => setStep(step - 1)}>
            Indietro
          </Button>
          <Button variant="outline" disabled={paintsDone} onClick={() => setStep(step + 1)}>
            Avanti
          </Button>
        </div>
        {paintsDone && (
          <p className="text-muted-foreground text-xs">
            Per Eva il problema è separare una miscela nei suoi colori: con la vernice è difficile. In crittografia lo
            stesso ruolo lo ha un calcolo facile in un verso e difficilissimo all&apos;indietro.
          </p>
        )}
      </div>

      <form
        className="space-y-3 rounded-lg border p-3"
        onSubmit={(e) => {
          e.preventDefault();
          setChecked(true);
        }}
      >
        <p className="font-medium">2. Con i numeri (piccolissimi, solo per giocare)</p>
        <p>
          Numeri pubblici: p = <span className="font-mono">{DH_PRIME}</span>, g = <span className="font-mono">{DH_BASE}</span>.
          Scegli i segreti tra {MIN_SECRET} e {MAX_SECRET}.
        </p>
        <NumberInput id="dh-a" label="Segreto di Alice (a)" value={aText} onChange={(v) => { setAText(v); setChecked(false); }} />
        <NumberInput id="dh-b" label="Segreto di Bob (b)" value={bText} onChange={(v) => { setBText(v); setChecked(false); }} />
        {valid ? (
          <ul aria-live="polite" className="bg-muted/40 space-y-1 rounded-lg p-3 font-mono text-xs">
            <li>
              Alice spedisce A = g^a mod p = {DH_BASE}^{a} mod {DH_PRIME} = {publicValue(a)}
            </li>
            <li>
              Bob spedisce B = g^b mod p = {DH_BASE}^{b} mod {DH_PRIME} = {publicValue(b)}
            </li>
            <li>Alice calcola B^a mod p, Bob calcola A^b mod p.</li>
          </ul>
        ) : (
          <LabFeedback ok={false}>{`I segreti devono essere numeri interi tra ${MIN_SECRET} e ${MAX_SECRET}.`}</LabFeedback>
        )}
        <p className="text-muted-foreground text-xs">
          “mod p” vuol dire “il resto della divisione per p”. Puoi farlo con la calcolatrice, oppure fidarti di Alice: il
          numero è uguale anche per Bob.
        </p>
        <label htmlFor="dh-answer" className="block font-medium">
          Qual è il segreto comune? (calcola {publicValue(valid ? b : 2)}^{valid ? a : 2} mod {DH_PRIME})
        </label>
        <div className="flex gap-2">
          <Input
            id="dh-answer"
            inputMode="numeric"
            autoComplete="off"
            className="w-24 font-mono"
            value={answer}
            disabled={solved}
            onChange={(e) => {
              setAnswer(e.target.value);
              setChecked(false);
            }}
          />
          <Button type="submit" variant="outline" disabled={solved || !valid || answer.trim() === ""}>
            Verifica
          </Button>
        </div>
        {checked && (
          <LabFeedback ok={numberRight}>
            {numberRight
              ? `Esatto: ${shared}, sia per Alice sia per Bob.${paintsDone ? "" : " Ora completa anche i passi con i colori."}`
              : "Non ancora: calcola la potenza e poi il resto della divisione per 23."}
          </LabFeedback>
        )}
      </form>
    </LabFrame>
  );
}
