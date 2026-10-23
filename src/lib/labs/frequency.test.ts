import { describe, expect, it } from "vitest";
import {
  applyGuesses,
  cipherLetters,
  correctPlainLetter,
  frequencyCiphertext,
  frequencyPlaintext,
  isFrequencyChallengeSolved,
  letterFrequencies,
  nextHint,
  substitutionKey,
  substitutionKeyCount,
  type Guesses,
} from "./frequency";

const solution: Guesses = Object.fromEntries(cipherLetters.map((c) => [c, correctPlainLetter(c)]));

describe("analisi di frequenza", () => {
  it("la chiave è una permutazione dell'alfabeto", () => {
    expect([...substitutionKey].sort().join("")).toBe("ABCDEFGHIJKLMNOPQRSTUVWXYZ");
  });

  it("conta le lettere ignorando accenti, spazi e punteggiatura", () => {
    expect(letterFrequencies("Più là, là!")).toEqual([
      { letter: "A", count: 2, share: 2 / 7 },
      { letter: "L", count: 2, share: 2 / 7 },
      { letter: "I", count: 1, share: 1 / 7 },
      { letter: "P", count: 1, share: 1 / 7 },
      { letter: "U", count: 1, share: 1 / 7 },
    ]);
  });

  it("la sostituzione non cambia la forma delle frequenze", () => {
    const plain = letterFrequencies(frequencyPlaintext).map((c) => c.count);
    const cipher = letterFrequencies(frequencyCiphertext).map((c) => c.count);
    expect(cipher).toEqual(plain);
  });

  it("con tutte le lettere giuste torna il messaggio", () => {
    expect(isFrequencyChallengeSolved(solution)).toBe(true);
    expect(applyGuesses(solution).map((c) => c.char).join("")).toBe(frequencyPlaintext);
    expect(isFrequencyChallengeSolved({ ...solution, [cipherLetters[0]]: "Z" })).toBe(false);
  });

  it("il suggerimento parte dalla lettera più frequente", () => {
    expect(nextHint({})).toBe(cipherLetters[0]);
    expect(nextHint(solution)).toBeUndefined();
  });

  it("le chiavi possibili sono 26!", () => {
    expect(substitutionKeyCount().toString()).toBe("403291461126605635584000000");
  });
});
