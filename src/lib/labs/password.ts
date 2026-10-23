// Stima del tempo di un attacco a forza bruta (lezione 6.5).
// Vale solo per password scelte a caso: le velocità sono ipotesi didattiche,
// non misure di un attacco reale.

export const charsets = {
  minuscole: { label: "Minuscole (a–z)", size: 26 },
  maiuscole: { label: "Maiuscole (A–Z)", size: 26 },
  cifre: { label: "Cifre (0–9)", size: 10 },
  simboli: { label: "Simboli (!, ?, #…)", size: 32 },
} as const;
export type Charset = keyof typeof charsets;

export const speeds = {
  lenta: { label: "Mille tentativi al secondo", perSecond: 1e3 },
  media: { label: "Un miliardo al secondo", perSecond: 1e9 },
  veloce: { label: "Mille miliardi al secondo", perSecond: 1e12 },
} as const;
export type Speed = keyof typeof speeds;

export const MIN_LENGTH = 4;
export const MAX_LENGTH = 24;

const SECONDS_PER_YEAR = 365.25 * 24 * 3600;
export const TARGET_YEARS = 100;

export function alphabetSize(selected: Charset[]): number {
  return selected.reduce((sum, c) => sum + charsets[c].size, 0);
}

// Numero di password possibili: alfabeto elevato alla lunghezza.
export function combinations(selected: Charset[], length: number): number {
  return alphabetSize(selected) ** length;
}

// In media chi prova tutte le combinazioni trova quella giusta a metà strada.
export function averageSeconds(selected: Charset[], length: number, speed: Speed): number {
  return combinations(selected, length) / 2 / speeds[speed].perSecond;
}

export function averageYears(selected: Charset[], length: number, speed: Speed): number {
  return averageSeconds(selected, length, speed) / SECONDS_PER_YEAR;
}

const units: [number, string, string][] = [
  [SECONDS_PER_YEAR, "anno", "anni"],
  [24 * 3600, "giorno", "giorni"],
  [3600, "ora", "ore"],
  [60, "minuto", "minuti"],
  [1, "secondo", "secondi"],
];

const numberFormat = new Intl.NumberFormat("it-IT", { maximumFractionDigits: 0 });

const countUnits: [number, string][] = [
  [1e18, "miliardi di miliardi"],
  [1e15, "milioni di miliardi"],
  [1e12, "mila miliardi"],
  [1e9, "miliardi"],
  [1e6, "milioni"],
];
const decimalFormat = new Intl.NumberFormat("it-IT", { maximumFractionDigits: 1 });
const superscripts = "⁰¹²³⁴⁵⁶⁷⁸⁹";

// Un numero di combinazioni in parole: "circa 209 miliardi", "circa 4,4 × 10²²".
export function formatCount(n: number): string {
  if (n < 1e6) return numberFormat.format(n);
  if (n >= 1e21) {
    const exponent = Math.floor(Math.log10(n));
    const digits = [...String(exponent)].map((d) => superscripts[Number(d)]).join("");
    return `circa ${decimalFormat.format(n / 10 ** exponent)} × 10${digits}`;
  }
  const [size, name] = countUnits.find(([size]) => n >= size)!;
  return `circa ${decimalFormat.format(n / size)} ${name}`;
}

export function formatDuration(seconds: number): string {
  if (seconds < 1) return "meno di un secondo";
  const years = seconds / SECONDS_PER_YEAR;
  if (years >= 1e9) return `più di ${numberFormat.format(Math.floor(years / 1e9))} miliardi di anni`;
  if (years >= 1e6) return `più di ${numberFormat.format(Math.floor(years / 1e6))} milioni di anni`;
  for (const [size, one, many] of units) {
    if (seconds >= size) {
      const value = Math.floor(seconds / size);
      return `circa ${numberFormat.format(value)} ${value === 1 ? one : many}`;
    }
  }
  return "meno di un secondo";
}

// Le due sfide del laboratorio, sempre con la velocità più alta.
export type PasswordChallenge = {
  id: string;
  text: string;
  charsets: Charset[];
  // Lunghezza minima che supera TARGET_YEARS.
  answer: number;
};

export function minLengthFor(selected: Charset[], speed: Speed, years = TARGET_YEARS): number {
  for (let length = 1; length <= MAX_LENGTH; length++) {
    if (averageYears(selected, length, speed) >= years) return length;
  }
  return Infinity;
}

export const passwordChallenges: PasswordChallenge[] = [
  {
    id: "solo-minuscole",
    text: "Solo lettere minuscole: qual è la lunghezza minima che supera 100 anni?",
    charsets: ["minuscole"],
    answer: minLengthFor(["minuscole"], "veloce"),
  },
  {
    id: "tutti",
    text: "Tutti e quattro i tipi di carattere: qual è la lunghezza minima che supera 100 anni?",
    charsets: ["minuscole", "maiuscole", "cifre", "simboli"],
    answer: minLengthFor(["minuscole", "maiuscole", "cifre", "simboli"], "veloce"),
  },
];
