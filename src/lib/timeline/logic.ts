import type { TimelineEvent } from "@/lib/content/schema";

const MONTHS = [
  "gennaio",
  "febbraio",
  "marzo",
  "aprile",
  "maggio",
  "giugno",
  "luglio",
  "agosto",
  "settembre",
  "ottobre",
  "novembre",
  "dicembre",
];

// "1932-12" → "dicembre 1932"; "1969-10-29" → "29 ottobre 1969";
// con `approximate` → "circa 1971".
export function formatEventDate(date: string, approximate = false): string {
  const [year, month, day] = date.split("-").map(Number);
  const parts = [day, month ? MONTHS[month - 1] : undefined, year].filter(Boolean);
  return `${approximate ? "circa " : ""}${parts.join(" ")}`;
}

export function eventYear(event: Pick<TimelineEvent, "date">): number {
  return Number(event.date.slice(0, 4));
}

// Decennio di un evento, per raggruppare la timeline: 1903 → 1900.
export function eventDecade(event: Pick<TimelineEvent, "date">): number {
  return Math.floor(eventYear(event) / 10) * 10;
}

// Mini-gioco "Metti in ordine" (§8.2): `count` eventi casuali con anni tutti
// diversi, così l'ordine giusto non è mai ambiguo. Esclude gli eventi con
// data approssimativa. Restituisce gli eventi in ordine cronologico.
export function pickOrderingRound<T extends Pick<TimelineEvent, "date" | "approximate">>(
  events: T[],
  count: number,
  random: () => number = Math.random,
): T[] {
  const pool = events.filter((e) => !e.approximate);
  const byYear = new Map<number, T[]>();
  for (const event of pool) {
    const year = eventYear(event);
    byYear.set(year, [...(byYear.get(year) ?? []), event]);
  }
  const years = [...byYear.keys()];
  for (let i = years.length - 1; i > 0; i--) {
    const j = Math.floor(random() * (i + 1));
    [years[i], years[j]] = [years[j], years[i]];
  }
  return years
    .slice(0, count)
    .sort((a, b) => a - b)
    .map((year) => {
      const options = byYear.get(year)!;
      return options[Math.floor(random() * options.length)];
    });
}
