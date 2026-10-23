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
