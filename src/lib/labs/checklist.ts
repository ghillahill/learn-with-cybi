// Checklist personale di sicurezza (lezione 8.5). Ogni voce riprende un
// consiglio delle lezioni del Modulo 8; le scelte si salvano nei progressi.

import type { ChecklistStatus } from "@/lib/progress/schema";

export type ChecklistItem = {
  id: string;
  text: string;
  // Lezione del Modulo 8 da cui viene il consiglio.
  lesson: string;
};

export const checklistItems: ChecklistItem[] = [
  {
    id: "password-manager",
    text: "Uso un password manager, con una password lunga e diversa per ogni account.",
    lesson: "8.1",
  },
  {
    id: "passkey",
    text: "Dove un servizio offre le passkey, le ho attivate.",
    lesson: "8.1",
  },
  {
    id: "mfa",
    text: "Ho attivato l'autenticazione a più fattori sugli account importanti, a partire dall'email.",
    lesson: "8.2",
  },
  {
    id: "mfa-forte",
    text: "Dove posso, uso una chiave di sicurezza, una passkey o un'app al posto degli SMS.",
    lesson: "8.2",
  },
  {
    id: "aggiornamenti",
    text: "Gli aggiornamenti automatici sono attivi su computer, telefono e app.",
    lesson: "8.3",
  },
  {
    id: "antivirus-firewall",
    text: "Antivirus e firewall del computer sono attivi.",
    lesson: "8.3",
  },
  {
    id: "backup",
    text: "Ho almeno un backup dei dati importanti tenuto scollegato dal computer.",
    lesson: "8.4",
  },
  {
    id: "ripristino",
    text: "Ho provato a ripristinare un file dal backup, per essere sicuro che funzioni.",
    lesson: "8.4",
  },
  {
    id: "https",
    text: "Prima di inserire dati personali controllo che il sito usi HTTPS, e ricordo che il lucchetto non garantisce l'onestà del sito.",
    lesson: "8.5",
  },
  {
    id: "permessi",
    text: "Controllo i permessi delle app e tolgo quelli che non servono.",
    lesson: "8.5",
  },
];

export type ChecklistAnswers = Partial<Record<string, ChecklistStatus>>;

export function checklistSummary(answers: ChecklistAnswers) {
  const done = checklistItems.filter((i) => answers[i.id] === "fatto").length;
  const todo = checklistItems.filter((i) => answers[i.id] === "da-fare").length;
  return { done, todo, missing: checklistItems.length - done - todo };
}

// Il laboratorio è completato quando ogni voce ha una risposta,
// anche "da fare": conta averci pensato, non avere già fatto tutto.
export function isChecklistReviewed(answers: ChecklistAnswers): boolean {
  return checklistSummary(answers).missing === 0;
}
