import type { TimelineCategory } from "@/lib/content/schema";

export const categoryLabel: Record<TimelineCategory, string> = {
  crittografia: "Crittografia",
  malware: "Malware",
  attacchi: "Attacchi",
  leggi: "Leggi",
  difesa: "Difesa",
  cultura: "Cultura",
};

// Colore del pallino di ogni categoria (sempre affiancato dall'etichetta).
export const categoryDot: Record<TimelineCategory, string> = {
  crittografia: "bg-cybi",
  malware: "bg-rose-500",
  attacchi: "bg-amber-500",
  leggi: "bg-violet-500",
  difesa: "bg-emerald-500",
  cultura: "bg-blue-500",
};
