// Scambio di chiavi Diffie-Hellman (lezione 7.2): prima l'analogia dei colori,
// poi la versione con numeri piccolissimi. Solo didattica: con numeri così
// piccoli chiunque troverebbe i segreti in un attimo.

export type Paint = { id: string; name: string; rgb: [number, number, number] };

export const publicPaint: Paint = { id: "giallo", name: "giallo", rgb: [250, 204, 21] };

export const secretPaints: Paint[] = [
  { id: "rosso", name: "rosso", rgb: [220, 38, 38] },
  { id: "blu", name: "blu", rgb: [37, 99, 235] },
  { id: "verde", name: "verde", rgb: [22, 163, 74] },
  { id: "viola", name: "viola", rgb: [147, 51, 234] },
  { id: "rosa", name: "rosa", rgb: [236, 72, 153] },
];

// Una miscela è un insieme di colori in parti uguali: l'ordine non conta,
// per questo Alice e Bob arrivano allo stesso colore finale.
export function mix(paints: Paint[]): string {
  const channel = (i: number) => Math.round(paints.reduce((sum, p) => sum + p.rgb[i], 0) / paints.length);
  return `#${[0, 1, 2].map((i) => channel(i).toString(16).padStart(2, "0")).join("")}`;
}

// Tappe dell'analogia: chi fa cosa, e cosa vede Eva che ascolta.
export const paintSteps = [
  "Alice e Bob scelgono in pubblico un colore di partenza. Eva lo vede.",
  "Ognuno sceglie in segreto un colore suo e non lo dice a nessuno.",
  "Ognuno mescola il colore pubblico con il proprio segreto e spedisce la miscela. Eva vede passare le due miscele.",
  "Ognuno aggiunge il proprio segreto alla miscela ricevuta. Il colore finale è lo stesso per entrambi.",
] as const;

// Parametri pubblici della versione con i numeri.
export const DH_PRIME = 23;
export const DH_BASE = 5;
export const MIN_SECRET = 2;
export const MAX_SECRET = DH_PRIME - 2;

// base^exp mod m, moltiplicando un passo alla volta per restare tra numeri piccoli.
export function modPow(base: number, exp: number, m: number): number {
  let result = 1;
  for (let i = 0; i < exp; i++) result = (result * base) % m;
  return result;
}

export function publicValue(secret: number): number {
  return modPow(DH_BASE, secret, DH_PRIME);
}

export function sharedSecret(mySecret: number, otherPublic: number): number {
  return modPow(otherPublic, mySecret, DH_PRIME);
}

export function isValidSecret(n: number): boolean {
  return Number.isInteger(n) && n >= MIN_SECRET && n <= MAX_SECRET;
}
