"use client";

import { ArrowLeftIcon, ArrowRightIcon } from "lucide-react";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { actors, packetSteps, type Actor, type PacketMessage } from "@/lib/labs/packet";
import { cn } from "@/lib/utils";
import { LabFrame } from "./lab-frame";

const columns: Actor[] = ["browser", "dns", "server"];

// Un messaggio disegnato come freccia tra le colonne di mittente e destinatario.
function MessageRow({ message }: { message: PacketMessage }) {
  const from = columns.indexOf(message.from);
  const to = columns.indexOf(message.to);
  const rightward = to > from;
  return (
    <li
      className="grid grid-cols-3 gap-2"
      aria-label={`${actors[message.from]} → ${actors[message.to]}: ${message.label}`}
    >
      <div
        style={{ gridColumnStart: Math.min(from, to) + 1, gridColumnEnd: Math.max(from, to) + 2 }}
        className={cn(
          "border-cybi/40 bg-cybi/10 flex items-center gap-2 rounded-lg border px-3 py-2",
          !rightward && "flex-row-reverse text-right",
        )}
      >
        <span aria-hidden className="text-cybi shrink-0">
          {rightward ? <ArrowRightIcon className="size-4" /> : <ArrowLeftIcon className="size-4" />}
        </span>
        <span className="min-w-0 flex-1">
          <span className="block font-mono text-xs font-semibold break-words">{message.label}</span>
          {message.detail && (
            <span className="text-muted-foreground block text-xs">{message.detail}</span>
          )}
        </span>
      </div>
    </li>
  );
}

// Lab della lezione 4.6: cosa succede quando apri una pagina HTTPS.
export function PacketLab() {
  const [index, setIndex] = useState(0);
  const [reached, setReached] = useState(0);
  const step = packetSteps[index];
  const last = packetSteps.length - 1;

  function go(next: number) {
    setIndex(next);
    setReached((r) => Math.max(r, next));
  }

  return (
    <LabFrame
      id="viaggio-pacchetto"
      title="Il viaggio di un pacchetto"
      objective="seguire passo per passo cosa succede quando scrivi https://www.example.com nel browser."
      intro="Hai appena premuto Invio. In una frazione di secondo partono tanti messaggi: li rallentiamo e li guardiamo uno alla volta."
      conclusion="Ecco il viaggio completo: DNS, handshake TCP, TLS, richiesta e risposta HTTP. Ogni volta che apri un sito succede tutto questo, di solito in meno di un secondo."
      solved={reached === last}
    >
      <ol aria-label="Tappe" className="flex flex-wrap gap-1.5">
        {packetSteps.map((s, i) => (
          <li key={s.id}>
            <button
              type="button"
              onClick={() => go(i)}
              disabled={i > reached + 1}
              aria-current={i === index ? "step" : undefined}
              className={cn(
                "rounded-full border px-2.5 py-0.5 text-xs disabled:opacity-40",
                i === index ? "border-cybi bg-cybi/15 font-semibold" : "hover:bg-muted",
              )}
            >
              {i + 1}
            </button>
          </li>
        ))}
      </ol>

      <div className="rounded-lg border p-3">
        <div className="flex flex-wrap items-baseline justify-between gap-2">
          <h3 className="font-semibold">{step.title}</h3>
          <span className="text-muted-foreground text-xs">{step.layer}</span>
        </div>

        <div className="mt-3 grid grid-cols-3 gap-2 text-center text-xs font-medium">
          {columns.map((actor) => {
            const involved = step.messages.some((m) => m.from === actor || m.to === actor);
            return (
              <div
                key={actor}
                className={cn("rounded-md border px-1 py-1.5", involved ? "bg-muted" : "opacity-40")}
              >
                {actors[actor]}
              </div>
            );
          })}
        </div>

        <ol key={step.id} className="animate-in fade-in mt-2 space-y-2 duration-500">
          {step.messages.map((m, i) => (
            <MessageRow key={i} message={m} />
          ))}
        </ol>

        <p className="mt-3">{step.explain}</p>
      </div>

      <div className="flex justify-between gap-2">
        <Button variant="outline" onClick={() => go(index - 1)} disabled={index === 0}>
          <ArrowLeftIcon /> Indietro
        </Button>
        <Button onClick={() => go(index + 1)} disabled={index === last}>
          Avanti <ArrowRightIcon />
        </Button>
      </div>
    </LabFrame>
  );
}
