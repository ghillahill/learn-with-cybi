import type { LabId } from "@/lib/content/keys";
import { Base64Lab } from "./base64-lab";
import { IpLab } from "./ip-lab";
import { NumberConverterLab } from "./number-converter-lab";
import { PacketLab } from "./packet-lab";
import { TerminalLab } from "./terminal-lab";

// Registro dei laboratori per il blocco <Lab id> delle lezioni (§7.3).
// Gli id validi sono in LAB_IDS: content:check segnala quelli sconosciuti.
const labs: Record<LabId, React.ComponentType> = {
  "convertitore-numeri": NumberConverterLab,
  base64: Base64Lab,
  terminale: TerminalLab,
  "ip-privati": IpLab,
  "viaggio-pacchetto": PacketLab,
};

export function Lab({ id }: { id: string }) {
  const Component = labs[id as LabId];
  return Component ? <Component /> : null;
}
