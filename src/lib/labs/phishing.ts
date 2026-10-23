// Email finte per il laboratorio "Detective del phishing" (lezione 6.4).
// Nomi, indirizzi e domini sono inventati: i domini usano il TLD riservato
// .example (RFC 2606), che non esiste su Internet.

export type PhishingVerdict = "phishing" | "legittima";

export type EmailPartKind = "mittente" | "oggetto" | "saluto" | "testo" | "link" | "allegato" | "firma";

export type EmailPart = {
  id: string;
  kind: EmailPartKind;
  text: string;
  // Solo per i link: la destinazione reale, quella che si vede passando sopra.
  href?: string;
  suspicious: boolean;
  explain: string;
};

export type LabEmail = {
  id: string;
  verdict: PhishingVerdict;
  parts: EmailPart[];
  summary: string;
};

export const phishingContext = {
  name: "Giulia Rossi",
  bank: "Banca Esempio",
  bankDomain: "bancaesempio.example",
  company: "Ditta Esempio",
  companyDomain: "dittaesempio.example",
};

export const phishingEmails: LabEmail[] = [
  {
    id: "banca-blocco",
    verdict: "phishing",
    summary: "Finta banca, minaccia di blocco e link verso un altro dominio: phishing da manuale.",
    parts: [
      {
        id: "mittente",
        kind: "mittente",
        text: "Banca Esempio <avvisi@banca-esempi0.example>",
        suspicious: true,
        explain: "Il dominio non è bancaesempio.example: c'è un trattino in più e uno zero al posto della o.",
      },
      {
        id: "oggetto",
        kind: "oggetto",
        text: "Avviso importante sul tuo conto",
        suspicious: false,
        explain: "L'oggetto da solo non dice niente: anche la tua vera banca potrebbe scriverlo.",
      },
      {
        id: "saluto",
        kind: "saluto",
        text: "Gentile cliente,",
        suspicious: true,
        explain: "Saluto generico: la tua banca conosce il tuo nome.",
      },
      {
        id: "urgenza",
        kind: "testo",
        text: "abbiamo rilevato un accesso anomalo. Se non confermi i tuoi dati entro 24 ore, il conto verrà bloccato.",
        suspicious: true,
        explain: "Urgenza e minaccia: servono a farti agire senza pensare.",
      },
      {
        id: "link",
        kind: "link",
        text: "Conferma i tuoi dati",
        href: "http://banca-esempi0.example/login",
        suspicious: true,
        explain: "Il link porta a banca-esempi0.example, non al sito della banca.",
      },
      {
        id: "firma",
        kind: "firma",
        text: "Servizio Clienti",
        suspicious: false,
        explain: "Una firma così è normale: non è questo il problema dell'email.",
      },
    ],
  },
  {
    id: "estratto-conto",
    verdict: "legittima",
    summary: "Dominio giusto, nessuna richiesta di dati, nessuna fretta: è un normale avviso.",
    parts: [
      {
        id: "mittente",
        kind: "mittente",
        text: "Banca Esempio <notifiche@bancaesempio.example>",
        suspicious: false,
        explain: "È il dominio della tua banca.",
      },
      {
        id: "oggetto",
        kind: "oggetto",
        text: "Il tuo estratto conto di settembre è disponibile",
        suspicious: false,
        explain: "Un avviso che ricevi ogni mese, senza fretta.",
      },
      {
        id: "saluto",
        kind: "saluto",
        text: "Ciao Giulia,",
        suspicious: false,
        explain: "Ti chiama per nome. Da solo non basta per fidarsi, ma qui tutto il resto torna.",
      },
      {
        id: "testo",
        kind: "testo",
        text: "puoi consultarlo nell'app o nell'area clienti del nostro sito. Ricorda: non ti chiederemo mai la password via email.",
        suspicious: false,
        explain: "Non chiede dati e non mette fretta.",
      },
      {
        id: "link",
        kind: "link",
        text: "www.bancaesempio.example",
        href: "https://www.bancaesempio.example/",
        suspicious: false,
        explain: "Il testo e la destinazione reale coincidono, ed è il sito della banca.",
      },
      {
        id: "firma",
        kind: "firma",
        text: "Banca Esempio",
        suspicious: false,
        explain: "Firma normale.",
      },
    ],
  },
  {
    id: "pacco",
    verdict: "phishing",
    summary: "Corriere sconosciuto, errori, un piccolo pagamento e un allegato eseguibile: tutto sbagliato.",
    parts: [
      {
        id: "mittente",
        kind: "mittente",
        text: "Consegne <info@consegne-pacchi24.example>",
        suspicious: true,
        explain: "Un corriere che non conosci, con un indirizzo generico. Non stai aspettando nessun pacco.",
      },
      {
        id: "oggetto",
        kind: "oggetto",
        text: "Il tuo pacco e in attesa",
        suspicious: true,
        explain: "Manca l'accento su \"è\": errori di ortografia e impaginazione sono un indizio.",
      },
      {
        id: "testo",
        kind: "testo",
        text: "La consegna non e stata possibile. Per riprogrammarla paga 1,99 € di spese di sdoganamento.",
        suspicious: true,
        explain: "Altri errori, e una piccola cifra che sembra innocua: serve a farti inserire i dati della carta.",
      },
      {
        id: "link",
        kind: "link",
        text: "Paga ora",
        href: "http://pagamenti-dogana.example/carta",
        suspicious: true,
        explain: "Il link porta a un sito di \"pagamenti\" che non c'entra con nessun corriere.",
      },
      {
        id: "allegato",
        kind: "allegato",
        text: "Ricevuta_spedizione.pdf.exe",
        suspicious: true,
        explain: "Finisce in .exe: non è un PDF ma un programma. Un allegato inatteso è una strada comune per il malware.",
      },
    ],
  },
  {
    id: "verbale",
    verdict: "legittima",
    summary: "Un collega del tuo dominio ti manda ciò che ti aveva promesso: nessun segnale d'allarme.",
    parts: [
      {
        id: "mittente",
        kind: "mittente",
        text: "Marco Bianchi <marco.bianchi@dittaesempio.example>",
        suspicious: false,
        explain: "È il dominio della tua azienda e Marco è un collega.",
      },
      {
        id: "oggetto",
        kind: "oggetto",
        text: "Verbale della riunione di oggi",
        suspicious: false,
        explain: "Riguarda una riunione a cui hai partecipato.",
      },
      {
        id: "testo",
        kind: "testo",
        text: "Ciao Giulia, come promesso ti mando il verbale. Ci vediamo giovedì per decidere i prossimi passi.",
        suspicious: false,
        explain: "Niente fretta e nessuna richiesta strana.",
      },
      {
        id: "allegato",
        kind: "allegato",
        text: "verbale-riunione.pdf",
        suspicious: false,
        explain: "Un allegato atteso, con un'estensione normale. Nel dubbio, puoi sempre chiedere a Marco a voce.",
      },
      {
        id: "firma",
        kind: "firma",
        text: "Marco",
        suspicious: false,
        explain: "Firma normale.",
      },
    ],
  },
  {
    id: "bonifico-ceo",
    verdict: "phishing",
    summary: "Finta amministratrice delegata, bonifico urgente e segreto: è una frode BEC.",
    parts: [
      {
        id: "mittente",
        kind: "mittente",
        text: "Laura Neri <laura.neri.ad@posta-gratis.example>",
        suspicious: true,
        explain: "La tua amministratrice delegata userebbe l'indirizzo aziendale, non una casella gratuita.",
      },
      {
        id: "oggetto",
        kind: "oggetto",
        text: "Richiesta riservata",
        suspicious: false,
        explain: "L'oggetto in sé è neutro: il problema è nel testo.",
      },
      {
        id: "autorita",
        kind: "testo",
        text: "Giulia, sono in riunione e non posso rispondere al telefono. Mi serve un bonifico di 9.800 € a un nuovo fornitore entro oggi.",
        suspicious: true,
        explain: "Autorità e urgenza insieme, e in più ti impedisce di verificare con una telefonata.",
      },
      {
        id: "segreto",
        kind: "testo",
        text: "Non parlarne con nessuno finché l'operazione non è chiusa.",
        suspicious: true,
        explain: "La richiesta di segreto serve a tagliare fuori chi potrebbe accorgersi della truffa.",
      },
      {
        id: "firma",
        kind: "firma",
        text: "Laura",
        suspicious: false,
        explain: "La firma da sola non prova niente, né in un senso né nell'altro.",
      },
    ],
  },
  {
    id: "casella-piena",
    verdict: "phishing",
    summary: "Mittente quasi identico e link che mostra un indirizzo ma ne apre un altro: spear phishing ben fatto.",
    parts: [
      {
        id: "mittente",
        kind: "mittente",
        text: "Supporto IT <supporto@ditta-esempio.example>",
        suspicious: true,
        explain: "Il dominio vero è dittaesempio.example, senza trattino: è un dominio sosia.",
      },
      {
        id: "oggetto",
        kind: "oggetto",
        text: "La tua casella è quasi piena",
        suspicious: false,
        explain: "Un oggetto plausibile: il trucco è altrove.",
      },
      {
        id: "saluto",
        kind: "saluto",
        text: "Ciao Giulia,",
        suspicious: false,
        explain: "Ti chiama per nome: gli attacchi mirati usano informazioni su di te. Non basta per fidarsi, ma da solo non è un indizio.",
      },
      {
        id: "urgenza",
        kind: "testo",
        text: "per non perdere le email in arrivo, accedi entro stasera e aumenta lo spazio disponibile.",
        suspicious: true,
        explain: "Scadenza ravvicinata e paura di perdere qualcosa: di nuovo l'urgenza.",
      },
      {
        id: "link",
        kind: "link",
        text: "https://posta.dittaesempio.example",
        href: "https://posta.dittaesempio.example.verifica-accesso.example/login",
        suspicious: true,
        explain: "Il testo mostra un indirizzo, ma la destinazione reale finisce in verifica-accesso.example: il dominio si legge da destra.",
      },
      {
        id: "firma",
        kind: "firma",
        text: "Il team IT",
        suspicious: false,
        explain: "Firma normale.",
      },
    ],
  },
];

export type EmailAnswer = {
  flagged: string[];
  verdict?: PhishingVerdict;
};

export type EmailCheck = {
  verdictOk: boolean;
  found: number;
  total: number;
  wrongFlags: string[];
  solved: boolean;
};

export function checkEmail(email: LabEmail, answer: EmailAnswer): EmailCheck {
  const clues = email.parts.filter((p) => p.suspicious).map((p) => p.id);
  const found = clues.filter((id) => answer.flagged.includes(id)).length;
  const wrongFlags = answer.flagged.filter((id) => !clues.includes(id));
  const verdictOk = answer.verdict === email.verdict;
  return {
    verdictOk,
    found,
    total: clues.length,
    wrongFlags,
    solved: verdictOk && found === clues.length && wrongFlags.length === 0,
  };
}
