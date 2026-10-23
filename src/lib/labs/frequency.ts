// Analisi di frequenza su un cifrario a sostituzione semplice (lezione 7.1).
// Il messaggio, la chiave e il testo di confronto sono scritti per il laboratorio.

import { ALPHABET } from "./caesar";

export const frequencyPlaintext =
  "IL CIFRARIO A SOSTITUZIONE SEMBRA SICURO PERCHE LE CHIAVI POSSIBILI SONO TANTISSIME. " +
  "MA OGNI LINGUA LASCIA UNA IMPRONTA: ALCUNE LETTERE COMPAIONO MOLTO PIU SPESSO DI ALTRE. " +
  "CONTANDO I SIMBOLI DEL MESSAGGIO CIFRATO E CONFRONTANDOLI CON UN TESTO NORMALE, " +
  "SI RIESCE A RICONOSCERE LE LETTERE UNA DOPO L'ALTRA. LA CHIAVE NON SERVE PIU.";

// Chiave: la lettera in chiaro in posizione i diventa substitutionKey[i].
export const substitutionKey = "QWERTYUIOPASDFGHJKLZXCVBNM";

// Testo italiano di confronto: le frequenze "tipiche" del laboratorio sono contate qui.
export const referenceText =
  "C'era una volta, in una piccola città di mare, una biblioteca aperta anche la notte. " +
  "Chi non riusciva a dormire entrava, sceglieva un libro dagli scaffali e si sedeva vicino " +
  "alla finestra, da cui si vedevano le barche dei pescatori tornare al porto. La bibliotecaria " +
  "conosceva tutti per nome e ricordava quali storie piacevano a ciascuno: avventure per i ragazzi, " +
  "romanzi lunghi per i nonni, poesie per chi aveva il cuore pesante. Una sera arrivò un viaggiatore " +
  "con una valigia piena di lettere mai spedite. Chiese se poteva lasciarle lì, perché qualcuno, " +
  "un giorno, le leggesse. La bibliotecaria le sistemò in una scatola di legno e da allora, ogni " +
  "notte, qualcuno ne apre una e la legge ad alta voce.";

export function encryptSubstitution(text: string, key = substitutionKey): string {
  return [...text]
    .map((ch) => {
      const i = ALPHABET.indexOf(ch);
      return i === -1 ? ch : key[i];
    })
    .join("");
}

export const frequencyCiphertext = encryptSubstitution(frequencyPlaintext);

export type LetterCount = { letter: string; count: number; share: number };

// Conta le lettere A–Z (senza accenti), dalla più frequente alla meno frequente.
export function letterFrequencies(text: string): LetterCount[] {
  const letters = [...text.normalize("NFD").replace(/\p{M}/gu, "").toUpperCase()].filter((ch) =>
    ALPHABET.includes(ch),
  );
  const counts = new Map<string, number>();
  for (const ch of letters) counts.set(ch, (counts.get(ch) ?? 0) + 1);
  return [...counts.entries()]
    .map(([letter, count]) => ({ letter, count, share: count / letters.length }))
    .sort((a, b) => b.count - a.count || a.letter.localeCompare(b.letter));
}

// Lettere del cifrato, in ordine di frequenza: sono quelle da indovinare.
export const cipherLetters = letterFrequencies(frequencyCiphertext).map((c) => c.letter);

// Ipotesi dello studente: lettera cifrata → lettera in chiaro.
export type Guesses = Partial<Record<string, string>>;

export function correctPlainLetter(cipherLetter: string): string {
  return ALPHABET[substitutionKey.indexOf(cipherLetter)];
}

// Il cifrato con le ipotesi applicate: null dove la lettera non è ancora indovinata.
export function applyGuesses(guesses: Guesses): { char: string; guessed: boolean }[] {
  return [...frequencyCiphertext].map((ch) => {
    if (!ALPHABET.includes(ch)) return { char: ch, guessed: true };
    const guess = guesses[ch];
    return guess ? { char: guess, guessed: true } : { char: ch, guessed: false };
  });
}

export function isGuessCorrect(cipherLetter: string, guesses: Guesses): boolean {
  return guesses[cipherLetter] === correctPlainLetter(cipherLetter);
}

export function isFrequencyChallengeSolved(guesses: Guesses): boolean {
  return cipherLetters.every((c) => isGuessCorrect(c, guesses));
}

// Suggerimento: la lettera cifrata più frequente non ancora indovinata.
export function nextHint(guesses: Guesses): string | undefined {
  return cipherLetters.find((c) => !isGuessCorrect(c, guesses));
}

// Numero di chiavi possibili di un cifrario a sostituzione: 26! (fattoriale).
export function substitutionKeyCount(): bigint {
  let n = BigInt(1);
  for (let i = 2; i <= 26; i++) n *= BigInt(i);
  return n;
}
