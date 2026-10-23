// Logica del convertitore binario/decimale/esadecimale (lezione 3.2).

export const bases = { 2: "binario", 10: "decimale", 16: "esadecimale" } as const;
export type Base = keyof typeof bases;

const digitsByBase: Record<Base, RegExp> = {
  2: /^[01]+$/,
  10: /^[0-9]+$/,
  16: /^[0-9a-f]+$/i,
};

// Interpreta un numero intero non negativo scritto nella base data.
// Gli spazi sono ammessi (es. "1010 0101"); restituisce null se non è valido.
export function parseInBase(text: string, base: Base): number | null {
  const clean = text.replace(/\s+/g, "");
  if (!digitsByBase[base].test(clean)) return null;
  const value = Number.parseInt(clean, base);
  return Number.isSafeInteger(value) ? value : null;
}

export function formatInBase(value: number, base: Base): string {
  return value.toString(base).toUpperCase();
}

export type NumberChallenge = {
  id: string;
  prompt: string;
  answerBase: Base;
  value: number;
  explain: string;
};

export const numberChallenges: NumberChallenge[] = [
  {
    id: "tredici-binario",
    prompt: "Scrivi 13 in binario.",
    answerBase: 2,
    value: 13,
    explain: "13 = 8 + 4 + 1, quindi 1101.",
  },
  {
    id: "ff-decimale",
    prompt: "Quanto vale FF (esadecimale) in decimale?",
    answerBase: 10,
    value: 255,
    explain: "FF = 15 × 16 + 15 = 255: il valore più alto che sta in un byte.",
  },
  {
    id: "byte-esadecimale",
    prompt: "Scrivi il byte 10100101 (binario) in esadecimale.",
    answerBase: 16,
    value: 0b10100101,
    explain: "Ogni gruppo di 4 bit è una cifra esadecimale: 1010 = A e 0101 = 5, quindi A5.",
  },
];

export function isChallengeSolved(challenge: NumberChallenge, answer: string): boolean {
  return parseInBase(answer, challenge.answerBase) === challenge.value;
}
