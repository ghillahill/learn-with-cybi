// Classificazione degli incidenti per proprietà violata (FIPS 199),
// per il laboratorio della lezione 5.1. Gli incidenti sono esempi inventati.

export const ciaProperties = {
  R: "Riservatezza",
  I: "Integrità",
  D: "Disponibilità",
} as const;
export type CiaProperty = keyof typeof ciaProperties;

export type CiaIncident = {
  id: string;
  text: string;
  answer: CiaProperty;
  explain: string;
};

export const ciaIncidents: CiaIncident[] = [
  {
    id: "stipendi",
    text: "Un dipendente manda per errore a un fornitore il file con gli stipendi di tutti i colleghi.",
    answer: "R",
    explain: "Informazioni divulgate a chi non doveva vederle.",
  },
  {
    id: "iban",
    text: "Qualcuno cambia l'IBAN su una fattura prima che venga pagata.",
    answer: "I",
    explain: "Un dato modificato senza autorizzazione.",
  },
  {
    id: "ddos",
    text: "Il sito delle prenotazioni del comune è irraggiungibile per un attacco DDoS.",
    answer: "D",
    explain: "Il servizio c'è, ma nessuno riesce a usarlo.",
  },
  {
    id: "email",
    text: "Un estraneo indovina la password di un'amica e legge le sue email.",
    answer: "R",
    explain: "Le email restano intatte, ma qualcuno le ha lette senza permesso.",
  },
  {
    id: "voto",
    text: "Un intruso cambia un voto nel registro elettronico della scuola.",
    answer: "I",
    explain: "Il voto registrato non è più quello vero.",
  },
  {
    id: "blackout",
    text: "Un guasto elettrico spegne per un giorno il server della biblioteca.",
    answer: "D",
    explain: "Non serve un attaccante: anche un guasto interrompe l'accesso.",
  },
  {
    id: "database",
    text: "L'elenco dei clienti di un negozio online viene messo in vendita su un forum.",
    answer: "R",
    explain: "Dati personali divulgati a chiunque paghi.",
  },
  {
    id: "prezzo",
    text: "Un utente modifica il prezzo di un prodotto nella richiesta inviata al sito e paga 1 euro.",
    answer: "I",
    explain: "Il prezzo è stato alterato senza autorizzazione.",
  },
  {
    id: "cavo",
    text: "Una ruspa trancia un cavo e un ufficio resta senza Internet per ore.",
    answer: "D",
    explain: "Un'interruzione dell'accesso, anche se nessuno ha attaccato.",
  },
  {
    id: "foto-schermo",
    text: "Un visitatore fotografa un foglietto con le password attaccato al monitor.",
    answer: "R",
    explain: "Informazioni segrete viste da chi non doveva.",
  },
];

export type CiaAnswers = Partial<Record<string, CiaProperty>>;

export function isCiaAnswerCorrect(incident: CiaIncident, answers: CiaAnswers): boolean {
  return answers[incident.id] === incident.answer;
}

export function isCiaChallengeSolved(answers: CiaAnswers): boolean {
  return ciaIncidents.every((incident) => isCiaAnswerCorrect(incident, answers));
}
