"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { ipChallenge, isIpSelectionCorrect, privateBlockOf, privateBlocks } from "@/lib/labs/ip";
import { cn } from "@/lib/utils";
import { LabFeedback, LabFrame } from "./lab-frame";

// Lab della lezione 4.2: riconoscere gli indirizzi privati dell'RFC 1918.
export function IpLab() {
  const [selected, setSelected] = useState<string[]>([]);
  const [checked, setChecked] = useState(false);
  const solved = checked && isIpSelectionCorrect(selected);

  function toggle(address: string, on: boolean) {
    setSelected((prev) => (on ? [...prev, address] : prev.filter((a) => a !== address)));
    setChecked(false);
  }

  return (
    <LabFrame
      id="ip-privati"
      title="Trova gli IP privati"
      objective="riconoscere quali indirizzi IPv4 appartengono ai tre blocchi privati."
      intro="Ecco otto indirizzi IPv4. Seleziona tutti quelli privati: attento ai confini dei blocchi, alcuni sono trappole!"
      conclusion="Perfetto! Gli indirizzi privati si possono riusare in ogni rete di casa o d'ufficio, perché non viaggiano su Internet: ci pensa il NAT del router."
      solved={solved}
    >
      <div className="bg-muted/40 rounded-lg border p-3">
        <p className="font-medium">I tre blocchi privati</p>
        <ul className="mt-1 space-y-0.5 font-mono text-xs">
          {privateBlocks.map((b) => (
            <li key={b.cidr}>
              {b.cidr} — da {b.first} a {b.last}
            </li>
          ))}
        </ul>
      </div>

      <ul aria-label="Indirizzi da controllare" className="grid gap-2 sm:grid-cols-2">
        {ipChallenge.map((address) => {
          const isSelected = selected.includes(address);
          const block = privateBlockOf(address);
          const right = block !== null;
          return (
            <li key={address}>
              <label
                className={cn(
                  "flex cursor-pointer gap-3 rounded-lg border px-3 py-2",
                  checked && right && "border-success/60 bg-success/5",
                  checked && !right && isSelected && "border-destructive/60 bg-destructive/5",
                )}
              >
                <Checkbox
                  checked={isSelected}
                  disabled={solved}
                  onCheckedChange={(on) => toggle(address, on)}
                  className="mt-0.5"
                />
                <span>
                  <span className="font-mono">{address}</span>
                  {checked && (
                    <span className="text-muted-foreground block text-xs">
                      {block
                        ? `Privato: è nel blocco ${block.cidr}.`
                        : "Non è in nessuno dei tre blocchi privati."}
                    </span>
                  )}
                </span>
              </label>
            </li>
          );
        })}
      </ul>

      <div className="flex flex-wrap items-center gap-3">
        <Button variant="outline" onClick={() => setChecked(true)} disabled={solved || selected.length === 0}>
          Verifica
        </Button>
        {checked && !solved && (
          <LabFeedback ok={false}>
            Non ancora: leggi le spiegazioni sotto ogni indirizzo, correggi e riprova.
          </LabFeedback>
        )}
      </div>
    </LabFrame>
  );
}
