// Cifrario di Cesare (lezioni 1.1 e 7.1), con l'alfabeto inglese di 26 lettere.
// Le lettere accentate perdono l'accento; spazi e punteggiatura restano uguali.

export const ALPHABET = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";
export const KEY_COUNT = ALPHABET.length - 1;

export function normalize(text: string): string {
  return text.normalize("NFD").replace(/\p{M}/gu, "").toUpperCase();
}

// Sposta ogni lettera di `key` posizioni in avanti nell'alfabeto.
export function caesarShift(text: string, key: number): string {
  const k = ((key % 26) + 26) % 26;
  return [...normalize(text)]
    .map((ch) => {
      const i = ALPHABET.indexOf(ch);
      return i === -1 ? ch : ALPHABET[(i + k) % 26];
    })
    .join("");
}

export function caesarDecrypt(text: string, key: number): string {
  return caesarShift(text, -key);
}

// L'attacco a forza bruta: tutte le 25 chiavi possibili, una dopo l'altra.
export function allDecryptions(ciphertext: string): { key: number; text: string }[] {
  return Array.from({ length: KEY_COUNT }, (_, i) => ({
    key: i + 1,
    text: caesarDecrypt(ciphertext, i + 1),
  }));
}

// Il messaggio intercettato del laboratorio.
export const caesarSecret = {
  plaintext: "LA CHIAVE DEL MAGAZZINO E SOTTO IL VASO DI GERANI",
  key: 11,
};
export const caesarSecretCiphertext = caesarShift(caesarSecret.plaintext, caesarSecret.key);

export function isCaesarKeyFound(answer: string): boolean {
  return Number(answer.trim()) === caesarSecret.key;
}
